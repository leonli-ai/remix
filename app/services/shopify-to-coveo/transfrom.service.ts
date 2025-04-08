import { DocumentBuilder, PushSource } from '@coveo/push-api-client';
import { loggerService } from '~/lib/logger';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { storeCompanyMappingRepository } from '~/repositories/product-variant/store-company-mapping.repository';
import { GET_PRODUCTS } from '~/request/coveo';

export class TransformService {
  private readonly CLASS_NAME = 'TransformService';
  private coveoProducts: any[] = [];
  private pushSource: PushSource;

  constructor(
    private storeName: string,
    private first: number,
  ) {
    this.pushSource = new PushSource(process.env.COVEO_PUSH_RDS_API_KEY!, process.env.COVEO_ORGANIZATION_ID!);
  }

  public async transformProducts(): Promise<any> {
    const METHOD = 'transformProducts';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting products transformation`, {
        storeName: this.storeName,
        first: this.first,
      });

      const coveoProducts: any = await ShopifyClientManager.query(GET_PRODUCTS, this.storeName, {
        variables: {
          first: this.first,
        },
      });

      
      const products = coveoProducts?.data?.products?.nodes || [];

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Found ${products.length} products to transform`);

      this.coveoProducts = [];

      for (const product of products) {
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Processing product`, {
          productId: product.id,
          title: product.title,
        });

        // Transform product
        const productRecord: any = {
          documentId: `product://${product.id.split('/').pop()}`,
          ec_name: product.title,
          title: product.title,
          ec_product_id: product.id.split('/').pop(),
          objecttype: 'Product',
          ec_brand: product.vendor,
          ec_catalog_id: product.resourcePublicationsV2.nodes.map((publication: any) => `catalog_${publication.publication.catalog.id.split('/').pop()}`),
          ec_catalog_name: product.resourcePublicationsV2.nodes.map((publication: any) => publication.publication.catalog.title),
          ec_images: product.images.nodes.map((image: any) => image.url),
          ec_description: product.description,
          ec_category: product?.category?.fullName?.replaceAll(' > ', ' ; '),
          ec_pdp_url: product.handle,
          ec_size: product.options.find((option: any) => option.name === 'Size')?.optionValues.map((value: any) => value.name),
        };

        // Transform variants
        const variantRecords = product.variants.nodes?.map((variant: any) => {
          loggerService.info(`${this.CLASS_NAME}.${METHOD}: Processing variant`, {
            variantId: variant.id,
            title: variant.title,
          });

          const originalPrice =
            Number(variant.metafields?.nodes?.find((metafield: any) => metafield.key === 'custom_original_price')?.value) / 100 || variant.price;

          return {
            documentId: `variant://${variant.id.split('/').pop()}`,
            ec_name: variant.title,
            title: variant.title,
            ec_product_id: product.id.split('/').pop(),
            objecttype: 'Variant',
            ec_variant_id: variant.id.split('/').pop(),
            ec_price: originalPrice,
            ec_price_dict: {
              '': variant.price,
              ...Object.fromEntries(
                product?.resourcePublicationsV2?.nodes?.map(({ publication }: any) => {
                  const catalogId = publication.catalog?.id.split('/').pop();
                  const price = (
                    publication.catalog?.priceList?.parent?.adjustment?.type?.includes('DECREASE')
                      ? ((100 - publication.catalog?.priceList?.parent?.adjustment?.value) / 100) * originalPrice
                      : ((100 + publication.catalog?.priceList?.parent?.adjustment?.value) / 100) * originalPrice
                  ).toFixed(2);

                  loggerService.debug(`${this.CLASS_NAME}.${METHOD}: Calculated catalog price`, {
                    catalogId,
                    originalPrice: variant.price,
                    calculatedPrice: price,
                  });

                  return [catalogId, Number(price)];
                }),
              ),
            },
            ec_sku: variant.sku,
            ec_uom: variant.metafields?.nodes?.find((metafield: any) => metafield.key === 'custom_uom')?.value,
            ec_availabilities:{
              '': variant?.inventoryQuantity,
              ...Object.fromEntries(
                variant?.inventoryItem?.inventoryLevels?.edges?.map(({ node }: any) => [node?.location?.id.split('/').pop(), node?.quantities?.find(({ name }: any) => name === 'available')?.quantity]),
              ),
            },
          };
        });

        this.coveoProducts.push(productRecord, ...variantRecords);
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully transformed ${this.coveoProducts.length} records`, {
        productsCount: products.length,
        totalRecordsCount: this.coveoProducts.length,
      });

      return this.coveoProducts;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Error transforming products`, {
        storeName: this.storeName,
        first: this.first,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
      });
      throw error;
    }
  }

  public async pushProductsToCoveo() {
    await this.transformProducts();
    const METHOD = 'pushProductsToCoveo';
    const allVariants = this.coveoProducts.filter((item) => item.objecttype === 'Variant');
    const allSkus = allVariants.map((item) => item.ec_sku);
    const companyMappings = await storeCompanyMappingRepository.findCompanyMappingsBySkuIds({
      storeName: this.storeName,
      skuIds: allSkus,
    });

    this.coveoProducts.forEach((product, index) => {
      if (product.objecttype === 'Variant') {
        const mapping = companyMappings.filter((m) => m.skuId === product.ec_sku);
        if (mapping.length) {
          product.ec_customer_part_number_dict = {
            '': '',
            ...Object.fromEntries(mapping.map((m) => [m.companyId, m.customerPartnerNumber])),
          };
        }
        if (product.ec_availabilities) {
          const availablelocations = Object.entries(product.ec_availabilities)
            .filter(([key]) => key !== '' && !isNaN(Number(key)))
            .map(([key]) => key)
            .join(';');
          
          if (availablelocations && this.coveoProducts[index - 1]?.objecttype === 'Product') {
              this.coveoProducts[index - 1].availablelocations = availablelocations;
          }
        }
        if (this.coveoProducts[index - 1]?.objecttype === 'Product') {
          this.coveoProducts[index - 1] = {
            ...this.coveoProducts[index - 1],
            ec_price_dict: product.ec_price_dict,
            ec_price: product.ec_price,
            ec_sku: product.ec_sku,
            ec_uom: product.ec_uom,
            ec_variant_id: product.ec_variant_id,
            ec_customer_part_number_dict: product.ec_customer_part_number_dict,
          };
        }
      }
    });
 
    try {
      const documents: any = this.coveoProducts.map((product) => {
        const metaData = { ...product };
        delete metaData.documentId;

        return new DocumentBuilder(product.documentId, product.title).withMetadata(metaData);
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting batch update`, {
        documentsCount: documents.length,
      });

      await this.pushSource.batchUpdateDocuments(process.env.COVEO_PUSH_SOURCE_ID!, {
        addOrUpdate: documents,
        delete: [],
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully pushed all documents`);
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Error in batch update`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                code: (error as any).code,
                syscall: (error as any).syscall,
                hostname: (error as any).hostname,
              }
            : 'Unknown error',
      });
      throw error;
    }
  }

  public async deleteAllProducts() {
    await this.transformProducts();
    const METHOD = 'deleteAllProducts';
    try {
      await this.pushSource.batchUpdateDocuments(process.env.COVEO_PUSH_SOURCE_ID!, {
        addOrUpdate: [],
        delete: this.coveoProducts.map((document: any) => ({
          documentId: document.documentId,
          deleteChildren: true,
        })),
      });
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully deleted all products`);
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Error in delete operation`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                code: (error as any).code,
                syscall: (error as any).syscall,
                hostname: (error as any).hostname,
              }
            : 'Unknown error',
      });
      throw error;
    }
  }
}
