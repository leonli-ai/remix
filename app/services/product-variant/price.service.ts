import { loggerService } from '../../lib/logger';
import prisma from '../../db.server';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { GET_PRICE_AND_SKU_ID_BY_PRODUCT_ID_AND_COMPANY_LOCATION_ID } from '~/lib/shopify/queries/products';
import { GET_CUSTOMER_COMPANY_LOCATIONS } from '~/lib/shopify/queries/customer';
import { GET_CATALOGS_PRODUCTS, GET_PRODUCTS_AND_VARIANTS, GET_VARIANT_PRICES } from '~/lib/shopify/queries/product-variant';
import { PriceListError, PriceListErrorCodes } from '~/lib/errors/price-list-errors';
import type { 
  PriceListExportRequest,
  ProductVariant,
  CatalogProduct,
  Catalog,
  CatalogNode,
  ProductNode,
  CatalogWithProductIds
} from '~/types/product-variant/price-list-export.schema';
import type {
  ShopifyPrice,
  CompanyLocationEdge
} from '~/types/product-variant/price.schema';
import { ExportService } from '~/lib/export/export.service';
import type { ExportResult } from '~/lib/export/types';
import type { VariantPricesResponse } from '~/types/product-variant/variant-prices.schema';
import { storeCompanyMappingService } from './store-company-mapping.service';

export class PriceService {
  /**
   * Strategy 1: Fetch prices from database
   */
  public async getPriceForFetch(
    productVariantIds: string[], 
    companyLocationId: string,
    storeName?: string
  ): Promise<Map<string, { price: number; currencyCode: string }>> {
    const start = Date.now();
    const prices = new Map<string, { price: number; currencyCode: string }>();

    try {
      loggerService.info('Starting price fetch from DB', {
        productVariantIds,
        companyLocationId,
        storeName,
        operation: 'getPriceForFetch'
      });

      const dbPrices = await prisma.skuPriceByLocation.findMany({
        where: { 
          skuId: { in: productVariantIds },
          companyLocationId,
          ...(storeName ? { storeName } : {})
        },
        select: {
          skuId: true,
          price: true,
          currencyCode: true
        }
      });

      loggerService.info('DB fetch completed', {
        queriedIds: productVariantIds,
        foundPrices: dbPrices.map(p => ({
          skuId: p.skuId,
          price: p.price.toString()
        })),
        operation: 'getPriceForFetch'
      });

      // Process database results
      for (const dbPrice of dbPrices) {
        prices.set(dbPrice.skuId, {
          price: Number(dbPrice.price),
          currencyCode: dbPrice.currencyCode
        });
      }

      const duration = Date.now() - start;
      loggerService.info('Price fetch operation completed', {
        totalItems: productVariantIds.length,
        pricesFound: prices.size,
        duration,
        operation: 'getPriceForFetch'
      });

      return prices;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Failed to fetch prices from DB', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        itemCount: productVariantIds.length,
        companyLocationId,
        storeName,
        duration,
        operation: 'getPriceForFetch'
      });
      throw new PriceListError(
        'Failed to fetch prices from database',
        PriceListErrorCodes.FETCH_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Strategy 2: Get price from Shopify and update database
   */
  public async getPriceForUpdate(
    productVariantId: string, 
    companyLocationId: string, 
    storeName: string
  ): Promise<{ price: number; currencyCode: string }> {
    const start = Date.now();
    try {
      loggerService.info('Starting price update', {
        productVariantId,
        companyLocationId,
        storeName,
        operation: 'getPriceForUpdate'
      });

      // Get latest price from Shopify
      const shopifyPrice = await this.fetchShopifyPrice(productVariantId, companyLocationId, storeName);
      if (!shopifyPrice) {
        throw new PriceListError(
          'No price found for product variant',
          PriceListErrorCodes.NO_PRICE_DATA
        );
      }

      // Update database with new price
      await this.syncPrice(productVariantId, shopifyPrice, companyLocationId, storeName);

      const result = {
        price: Number(shopifyPrice.amount),
        currencyCode: shopifyPrice.currencyCode
      };

      const duration = Date.now() - start;
      loggerService.info('Price update completed', {
        productVariantId,
        price: result,
        duration,
        operation: 'getPriceForUpdate'
      });

      return result;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Failed to update price', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        productVariantId,
        companyLocationId,
        storeName,
        duration,
        operation: 'getPriceForUpdate'
      });
      if (error instanceof PriceListError) {
        throw error;
      }
      throw new PriceListError(
        'Failed to update price',
        PriceListErrorCodes.FETCH_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async fetchShopifyPrice(
    productVariantId: string, 
    companyLocationId: string, 
    storeName: string
  ): Promise<ShopifyPrice | null> {
    try {
      loggerService.info('Fetching price from Shopify', {
        productVariantId,
        companyLocationId,
        storeName,
        operation: 'fetchShopifyPrice'
      });

      const response = await ShopifyClientManager.query<{
        data: {
          productVariant?: {
            contextualPricing?: {
              price?: {
                amount: string;
                currencyCode: string;
              };
            };
          };
        };
      }>(
        GET_PRICE_AND_SKU_ID_BY_PRODUCT_ID_AND_COMPANY_LOCATION_ID,
        storeName,
        {
          variables: {
            productId: productVariantId,
            companyLocationId
          }
        }
      );

      const price = response.data?.productVariant?.contextualPricing?.price;
      if (!price) {
        loggerService.warn('No price data found in Shopify response', { 
          productVariantId,
          response,
          operation: 'fetchShopifyPrice'
        });
        return null;
      }

      loggerService.info('Successfully fetched price from Shopify', {
        productVariantId,
        price,
        operation: 'fetchShopifyPrice'
      });

      return {
        amount: price.amount,
        currencyCode: price.currencyCode
      };

    } catch (error) {
      loggerService.error('Failed to fetch price from Shopify', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        productVariantId,
        companyLocationId,
        storeName,
        operation: 'fetchShopifyPrice'
      });
      throw new PriceListError(
        'Failed to fetch price from Shopify',
        PriceListErrorCodes.FETCH_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async syncPrice(
    productVariantId: string, 
    shopifyPrice: ShopifyPrice, 
    companyLocationId: string,
    storeName: string
  ): Promise<void> {
    try {
      loggerService.info('Starting price sync to DB', {
        productVariantId,
        companyLocationId,
        price: shopifyPrice,
        storeName,
        operation: 'syncPrice'
      });

      const now = new Date();

      // Find existing price record
      const existingPrice = await prisma.skuPriceByLocation.findFirst({
        where: {
          AND: [
            { skuId: productVariantId },
            { companyLocationId: companyLocationId },
            ...(storeName ? [{ storeName }] : [])
          ]
        }
      });

      if (existingPrice) {
        // Update if price or currency code has changed
        if (existingPrice.price.toString() !== shopifyPrice.amount || 
            existingPrice.currencyCode !== shopifyPrice.currencyCode) {
          await prisma.skuPriceByLocation.update({
            where: { id: existingPrice.id },
            data: {
              price: shopifyPrice.amount,
              currencyCode: shopifyPrice.currencyCode,
              updatedAt: now,
              ...(storeName && !existingPrice.storeName ? { storeName } : {})
            }
          });
          loggerService.info('Updated existing price record', {
            productVariantId,
            oldPrice: existingPrice.price.toString(),
            newPrice: shopifyPrice.amount,
            operation: 'syncPrice'
          });
        } else {
          loggerService.info('Price unchanged, skipping update', {
            productVariantId,
            price: shopifyPrice.amount,
            operation: 'syncPrice'
          });
        }
      } else {
        // Create new price record
        await prisma.skuPriceByLocation.create({
          data: {
            skuId: productVariantId,
            price: shopifyPrice.amount,
            currencyCode: shopifyPrice.currencyCode,
            companyLocationId,
            updatedAt: now,
            ...(storeName ? { storeName } : {})
          }
        });
        loggerService.info('Created new price record', {
          productVariantId,
          price: shopifyPrice.amount,
          operation: 'syncPrice'
        });
      }

    } catch (error) {
      loggerService.error('Failed to sync price to DB', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        productVariantId,
        companyLocationId,
        price: shopifyPrice,
        storeName,
        operation: 'syncPrice'
      });
      throw new PriceListError(
        'Failed to sync price to database',
        PriceListErrorCodes.SYNC_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  public async getPricesForItems(
    items: Array<{ productVariantId: string }>, 
    companyLocationId: string, 
    storeName: string
  ): Promise<Map<string, { price: number; currencyCode: string }>> {
    const start = Date.now();
    const prices = new Map<string, { price: number; currencyCode: string }>();
    
    try {
      loggerService.info('Starting batch price fetch', {
        itemCount: items.length,
        companyLocationId,
        storeName,
        operation: 'getPricesForItems'
      });

      // Process items in parallel with a limit
      const batchSize = 10;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        loggerService.info('Processing batch', {
          batchNumber: Math.floor(i / batchSize) + 1,
          batchSize: batch.length,
          totalBatches: Math.ceil(items.length / batchSize),
          operation: 'getPricesForItems'
        });

        const results = await Promise.all(
          batch.map(async item => {
            try {
              const price = await this.getPriceForUpdate(
                item.productVariantId,
                companyLocationId,
                storeName
              );
              return { productVariantId: item.productVariantId, price, success: true };
            } catch (error) {
              loggerService.error('Failed to fetch price for item in batch', {
                error: error instanceof Error ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name
                } : 'Unknown error',
                productVariantId: item.productVariantId,
                operation: 'getPricesForItems'
              });
              return { productVariantId: item.productVariantId, success: false };
            }
          })
        );

        const successfulResults = results.filter((result): result is { productVariantId: string; price: { price: number; currencyCode: string }; success: true } => 
          result.success && 'price' in result
        );

        successfulResults.forEach(({ productVariantId, price }) => {
          prices.set(productVariantId, price);
        });

        const failedItems = results.filter(result => !result.success);
        if (failedItems.length > 0) {
          loggerService.warn('Some items failed to fetch prices', {
            failedItems: failedItems.map(item => item.productVariantId),
            batchNumber: Math.floor(i / batchSize) + 1,
            operation: 'getPricesForItems'
          });
        }
      }

      const duration = Date.now() - start;
      loggerService.info('Batch price fetch completed', {
        totalItems: items.length,
        successfulFetches: prices.size,
        failedFetches: items.length - prices.size,
        duration,
        operation: 'getPricesForItems'
      });

      if (prices.size === 0) {
        throw new PriceListError(
          'Failed to fetch any prices',
          PriceListErrorCodes.NO_PRICE_DATA
        );
      }

      return prices;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Failed to fetch prices in batch', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        itemCount: items.length,
        companyLocationId,
        storeName,
        duration,
        operation: 'getPricesForItems'
      });
      
      if (error instanceof PriceListError) {
        throw error;
      }
      throw new PriceListError(
        'Failed to fetch prices in batch',
        PriceListErrorCodes.FETCH_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  private formatCompanyLocationQuery(companyLocationId: string): string {
    const locationId = companyLocationId.split('/').pop();
    loggerService.info('Formatting company location query', {
      originalId: companyLocationId,
      formattedId: locationId,
      operation: 'formatCompanyLocationQuery'
    });
    return `company_location_id:${locationId}`;
  }

  private async validateCustomerAccess(customerId: string, companyLocationId: string, storeName: string): Promise<{
    companyId:string,
    companyLocationName: string
  }> {
    try {
      loggerService.info('Starting customer access validation', { 
        customerId, 
        companyLocationId,
        operation: 'validateCustomerAccess'
      });
      
      const response = await ShopifyClientManager.query(
        GET_CUSTOMER_COMPANY_LOCATIONS,
        storeName,
        {
          variables: { customerId }
        }
      );

      const locations = response.data.customer?.companyContactProfiles?.[0]?.company?.locations?.edges;
      const companyId = response.data.customer?.companyContactProfiles?.[0]?.company?.id;
      
      if (!locations?.length) {
        loggerService.error('No locations found for customer', { 
          customerId,
          operation: 'validateCustomerAccess'
        });
        throw new PriceListError(
          'Customer has no associated company locations',
          PriceListErrorCodes.NO_COMPANY_LOCATIONS
        );
      }

      const locationMatch = locations.find((edge: CompanyLocationEdge) => edge.node.id === companyLocationId);
      
      if (!locationMatch) {
        loggerService.error('Customer access validation failed', { 
          customerId, 
          companyLocationId,
          availableLocations: locations.map((edge: CompanyLocationEdge) => ({
            id: edge.node.id,
            name: edge.node.name
          })),
          operation: 'validateCustomerAccess'
        });
        throw new PriceListError(
          'Customer does not have access to this location',
          PriceListErrorCodes.UNAUTHORIZED_ACCESS
        );
      }

      const companyLocationName = locationMatch.node.name;

      loggerService.info('Customer access validation successful', {
        customerId,
        companyId,
        companyLocationId,
        companyLocationName,
        operation: 'validateCustomerAccess'
      });

      return {
        companyId,
        companyLocationName
      }

    } catch (error) {
      loggerService.error('Customer access validation failed', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        customerId,
        companyLocationId,
        operation: 'validateCustomerAccess'
      });
      
      if (error instanceof PriceListError) {
        throw error;
      }
      throw new PriceListError(
        'Failed to validate customer access',
        PriceListErrorCodes.FETCH_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async fetchCatalogsWithProducts(storeName: string, locationQuery: string, companyLocationId: string): Promise<Catalog[]> {
    loggerService.info('Starting fetchCatalogsWithProducts', { storeName, locationQuery, companyLocationId });
    const response = await ShopifyClientManager.query(
      GET_CATALOGS_PRODUCTS,
      storeName,
      {
        variables: {
          first: 250,
          query: locationQuery
        }
      }
    );

    loggerService.info('Fetched catalogs data', { response });
    if (!response.data?.catalogs?.nodes) {
      throw new PriceListError(
        'Failed to fetch catalogs data',
        PriceListErrorCodes.FETCH_ERROR
      );
    }

    // First collect all product IDs from catalogs
    const catalogsWithProducts = response.data.catalogs.nodes.reduce((acc: CatalogWithProductIds[], catalog: CatalogNode) => {
      if (!catalog.publication?.products?.edges) {
        loggerService.warn('Skipping catalog without products', { catalogId: catalog.id });
        return acc;
      }

      const productIds = catalog.publication.products.edges
        .map((edge) => edge.node?.id)
        .filter((id): id is string => !!id);

      if (productIds.length > 0) {
        acc.push({
          id: catalog.id,
          title: catalog.title || `Catalog ${catalog.id}`,
          productIds
        });
      } else {
        loggerService.warn('No valid products found for catalog', {
          catalogId: catalog.id,
          title: catalog.title
        });
      }

      return acc;
    }, []);

    if (catalogsWithProducts.length === 0) {
      loggerService.warn('No catalogs with products found');
      return [];
    }

    // Get all unique product IDs
    const allProductIds = [...new Set(catalogsWithProducts.flatMap((c: CatalogWithProductIds) => c.productIds))];
    loggerService.info('Fetching variants for products', { 
      productCount: allProductIds.length,
      catalogCount: catalogsWithProducts.length 
    });

    // Fetch variants and prices for all products
    const variantsResponse = await ShopifyClientManager.query(
      GET_PRODUCTS_AND_VARIANTS,
      storeName,
      {
        variables: {
          ids: allProductIds,
          companyLocationId
        }
      }
    );

    if (!variantsResponse.data?.nodes) {
      throw new PriceListError(
        'Failed to fetch product variants',
        PriceListErrorCodes.FETCH_ERROR
      );
    }

    // Create a map of product ID to its variants
    const productVariantsMap = new Map<string, CatalogProduct>(
      variantsResponse.data.nodes.map((product: ProductNode) => {
        const variants: ProductVariant[] = [];
        
        product.variants?.edges?.forEach((edge) => {
          const variant = edge.node;
          const price = variant.contextualPricing?.price;

          if (!price) {
            loggerService.warn('Skipping variant without price', {
              variantId: variant.id,
              sku: variant.sku,
              productId: product.id
            });
            return;
          }

          if (!variant.sku) {
            loggerService.warn('Skipping variant without SKU', {
              variantId: variant.id,
              productId: product.id
            });
            return;
          }

          variants.push({
            sku: variant.sku,
            title: variant.title,
            price: {
              amount: price.amount,
              currencyCode: price.currencyCode
            }
          });
        });

        return [product.id, {
          id: product.id,
          title: product.title,
          variants
        }];
      })
    );

    // Build final catalogs structure
    const catalogs = catalogsWithProducts.map((catalog: CatalogWithProductIds) => {
      const products = catalog.productIds
        .map((id: string) => productVariantsMap.get(id))
        .filter((product): product is CatalogProduct => 
          !!product && product.variants.length > 0
        );

      return {
        id: catalog.id,
        title: catalog.title,
        products
      };
    }).filter((catalog: Catalog) => catalog.products.length > 0);

    loggerService.info('Processed catalogs data', { 
      catalogCount: catalogs.length,
      catalogDetails: catalogs.map((c: Catalog) => ({
        id: c.id,
        title: c.title,
        productCount: c.products.length,
        totalVariants: c.products.reduce((sum: number, p: CatalogProduct) => sum + p.variants.length, 0)
      }))
    });

    return catalogs;
  }

  public async exportCatalogPrices({ companyLocationId, storeName, customerId, format = 'xlsx' }: PriceListExportRequest): Promise<ExportResult> {
    const start = Date.now();
    try {
      loggerService.info('Starting catalog prices export', { companyLocationId, storeName, customerId });
      
      // Validate customer access and get location name
      const {companyId, companyLocationName} = await this.validateCustomerAccess(customerId, companyLocationId, storeName);
      
      // Format query for company location
      const locationQuery = this.formatCompanyLocationQuery(companyLocationId);
      loggerService.debug('Formatted location query', { 
        originalId: companyLocationId,
        query: locationQuery 
      });

      // Fetch catalogs with their products and prices
      const catalogs = await this.fetchCatalogsWithProducts(storeName, locationQuery, companyLocationId);
      
      if (catalogs.length === 0) {
        throw new PriceListError(
          'No catalogs found with price data',
          PriceListErrorCodes.NO_PRICE_DATA
        );
      }

      // Collect all SKU IDs
      const allSkuIds = new Set<string>();
      let totalVariants = 0;
      let totalProducts = 0;
      
      catalogs.forEach(catalog => {
        catalog.products.forEach(product => {
          totalProducts++;
          product.variants.forEach(variant => {
            totalVariants++;
            if (variant.sku) {
              allSkuIds.add(variant.sku);
            }
          });
        });
      });

      loggerService.info('Collected SKU IDs for partner number lookup', {
        totalCatalogs: catalogs.length,
        totalProducts,
        totalVariants,
        uniqueSkuCount: allSkuIds.size
      });

      // Batch fetch customer partner numbers
      const skuIdsArray = Array.from(allSkuIds);
      loggerService.debug('Fetching customer partner numbers', {
        storeName,
        companyId,
        skuCount: skuIdsArray.length,
        sampleSkus: skuIdsArray.slice(0, 5) // Log first 5 SKUs as sample
      });

      const customerPartnerNumbers = await storeCompanyMappingService.batchFetchCustomerNumberDetails({
        storeName,
        companyId,
        skuIds: skuIdsArray
      });

      loggerService.info('Received customer partner numbers', {
        totalPartnerNumbers: customerPartnerNumbers.length,
        matchedSkus: customerPartnerNumbers.filter(item => item.customerPartnerNumber).length,
        unmatchedSkus: customerPartnerNumbers.filter(item => !item.customerPartnerNumber).length
      });

      // Create mapping from SKU to customer partner number
      const skuToCustomerPartnerNumber = new Map(
        customerPartnerNumbers.map(item => [item.skuId, item.customerPartnerNumber || ''])
      );

      loggerService.debug('Created SKU to partner number mapping', {
        mappingSize: skuToCustomerPartnerNumber.size,
        sampleMappings: Array.from(skuToCustomerPartnerNumber.entries()).slice(0, 5) // Log first 5 mappings as sample
      });

      // Format company location name for filename
      const formattedLocationName = companyLocationName.replace(/\s+/g, '_');
      const baseFilename = `Price_List_${formattedLocationName}`;

      // For CSV format, we'll combine all data into a single sheet with a Catalog column
      if (format === 'csv') {
        const allData = catalogs.flatMap(catalog => 
          catalog.products.flatMap(product => 
            product.variants.map(variant => ({
              'Catalog': catalog.title,
              'Customer Partner Number': skuToCustomerPartnerNumber.get(variant.sku) || '',
              'Product SKU': variant.sku,
              'Product Name': product.title,
              'SKU Name': variant.title,
              'Unit Price': variant.price.amount,
            }))
          )
        );

        const result = await ExportService.generateExport({
          filename: baseFilename,
          format: 'csv',
          columns: [
            { key: 'Catalog', header: 'Catalog' },
            { key: 'Product SKU', header: 'Product SKU' },
            { key: 'Product Name', header: 'Product Name' },
            { key: 'SKU Name', header: 'SKU Name' },
            { key: 'Unit Price', header: 'Unit Price' },
            { key: 'Customer Partner Number', header: 'Customer Partner Number' }
          ],
          data: allData
        });

        return result;
      }

      // For XLSX format, create multiple sheets
      const sheets = catalogs.map(catalog => ({
        name: catalog.title.slice(0, 31), // Excel sheet names are limited to 31 characters
        columns: [
          { key: 'Product SKU', header: 'Product SKU' },
          { key: 'Customer Partner Number', header: 'Customer Partner Number' },
          { key: 'Product Name', header: 'Product Name' },
          { key: 'SKU Name', header: 'SKU Name' },
          { key: 'Unit Price', header: 'Unit Price' },
        ],
        data: catalog.products.flatMap(product => 
          product.variants.map(variant => ({
            'Product SKU': variant.sku,
            'Customer Partner Number': skuToCustomerPartnerNumber.get(variant.sku) || '',
            'Product Name': product.title,
            'SKU Name': variant.title,
            'Unit Price': variant.price.amount,
          }))
        )
      }));

      const result = await ExportService.generateExport({
        filename: baseFilename,
        format: format.toLowerCase() as 'xlsx' | 'csv',
        sheets
      });

      const duration = Date.now() - start;
      loggerService.info('Catalog prices export completed successfully', {
        catalogCount: catalogs.length,
        skuCount: allSkuIds.size,
        customerPartnerNumberCount: customerPartnerNumbers.length,
        duration,
        format,
        companyLocationName,
        filename: baseFilename
      });

      return result;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Error exporting catalog prices', { 
        error,
        stack: error instanceof Error ? error.stack : undefined,
        duration
      });
      throw error;
    }
  }

  /**
   * Get prices for multiple variants by their IDs
   */
  public async getVariantPricesByIds(
    variantIds: string[],
    companyLocationId: string,
    storeName: string
  ): Promise<VariantPricesResponse> {
    const start = Date.now();
    try {
      loggerService.info('Starting variant prices fetch', {
        variantCount: variantIds.length,
        companyLocationId,
        storeName,
        operation: 'getVariantPricesByIds'
      });

      const response = await ShopifyClientManager.query(
        GET_VARIANT_PRICES,
        storeName,
        {
          variables: {
            variantIds,
            companyLocationId
          }
        }
      );

      loggerService.info('Fetched variant prices', { response });
      if (!response.data?.nodes) {
        throw new PriceListError(
          'Failed to fetch variant prices',
          PriceListErrorCodes.FETCH_ERROR
        );
      }

      const variantPrices = response.data.nodes.map((node: any) => ({
        id: node?.id,
        title: node?.title,
        sku: node?.sku,
        price: node?.contextualPricing?.price,
        quantityRule: node?.contextualPricing?.quantityRule
      }));

      const duration = Date.now() - start;
      loggerService.info('Successfully fetched variant prices', {
        variantCount: variantPrices.length,
        duration,
        operation: 'getVariantPricesByIds'
      });

      return { variantPrices };

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Failed to fetch variant prices', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        variantCount: variantIds.length,
        companyLocationId,
        storeName,
        duration,
        operation: 'getVariantPricesByIds'
      });

      if (error instanceof PriceListError) {
        throw error;
      }
      throw new PriceListError(
        'Failed to fetch variant prices',
        PriceListErrorCodes.FETCH_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate if product variants exist in Shopify
   * @throws PriceListError if variants don't exist or can't be fetched
   */
  public async validateProductVariants(
    productVariantIds: string[],
    companyLocationId: string,
    storeName: string
  ): Promise<Map<string, boolean>> {
    const start = Date.now();
    try {
      loggerService.info('Starting product variants validation', {
        variantCount: productVariantIds.length,
        companyLocationId,
        storeName,
        operation: 'validateProductVariants'
      });

      const response = await ShopifyClientManager.query(
        GET_VARIANT_PRICES,
        storeName,
        {
          variables: {
            variantIds: productVariantIds,
            companyLocationId
          }
        }
      );

      if (!response.data?.nodes) {
        throw new PriceListError(
          'Failed to validate product variants',
          PriceListErrorCodes.FETCH_ERROR
        );
      }

      const existenceMap = new Map<string, boolean>();
      const nonExistentVariants: string[] = [];

      productVariantIds.forEach(variantId => {
        const exists = response.data.nodes.some(
          (node: any) => node?.id === variantId && node?.sku
        );
        existenceMap.set(variantId, exists);
        if (!exists) {
          nonExistentVariants.push(variantId);
        }
      });

      if (nonExistentVariants.length > 0) {
        throw new PriceListError(
          'Some product variants do not exist or have been deleted',
          PriceListErrorCodes.PRODUCT_NOT_FOUND,
          new Error(JSON.stringify({
            nonExistentVariants,
            message: 'These product variants are no longer available'
          }))
        );
      }

      const duration = Date.now() - start;
      loggerService.info('Product variants validation completed', {
        validatedCount: productVariantIds.length,
        existingCount: productVariantIds.length - nonExistentVariants.length,
        duration,
        operation: 'validateProductVariants'
      });

      return existenceMap;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Failed to validate product variants', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        variantCount: productVariantIds.length,
        companyLocationId,
        storeName,
        duration,
        operation: 'validateProductVariants'
      });

      if (error instanceof PriceListError) {
        throw error;
      }
      throw new PriceListError(
        'Failed to validate product variants',
        PriceListErrorCodes.FETCH_ERROR,
        error instanceof Error ? error : undefined
      );
    }
  }
}

export const priceService = new PriceService(); 