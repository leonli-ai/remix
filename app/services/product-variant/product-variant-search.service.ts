import { loggerService } from '~/lib/logger';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { SEARCH_PRODUCTS_WITH_VISIBILITY } from '~/lib/shopify/queries/product-variant';
import type { ProductVariantSearchRequest, Product, Variant } from '~/types/product-variant/product-variant-search.schema';
import type { CatalogEdge } from '~/lib/shopify/types/catalog';
import { storeCompanyMappingRepository } from '~/repositories/product-variant/store-company-mapping.repository';

export class ProductVariantSearchService {
  private readonly CLASS_NAME = 'ProductVariantSearchService';

  /**
   * Search for products and their variants with filtering based on company location
   * The search can handle both single and multiple queries, supporting both SKUs and customer partner numbers
   */
  public async searchProducts(params: ProductVariantSearchRequest): Promise<Product[]> {
    const METHOD = 'searchProducts';
    const start = Date.now();

    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting product search`, {
        query: params.query,
        queryLength: params.query.length,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId
      });

      // Get customer partner number mappings first
      const customerPartnerNumberMappings = await this.getCustomerPartnerNumberMappings(params);

      // Build search query based on input type (single/multiple) and mapping results
      const searchQuery = await this.buildSearchQuery(params, customerPartnerNumberMappings);

      // Execute search query and process results
      const products = await this.executeSearchAndProcessResults(searchQuery, params, customerPartnerNumberMappings);

      const duration = Date.now() - start;
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Product search completed`, {
        duration,
        searchedCount: products.searchedCount,
        visibleCount: products.visibleCount,
        filteredCount: products.filteredProducts.length,
        searchedProductIds: products.searchedProductIds,
        filteredProductIds: products.filteredProducts.map(p => p.id)
      });

      return products.filteredProducts;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Product search failed`, {
        error,
        errorDetails: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : 'Unknown error',
        duration,
        params
      });
      throw error;
    }
  }

  /**
   * Get customer partner number mappings for all queries
   */
  private async getCustomerPartnerNumberMappings(params: ProductVariantSearchRequest): Promise<Map<string, string>> {
    const mappings = new Map<string, string>();
    
    if (params.query.length === 1) {
      const results = await storeCompanyMappingRepository.searchByCustomerPartnerNumber({
        storeName: params.storeName,
        query: params.query[0],
        companyId: params.companyId
      });
      
      results.forEach(result => {
        if (result.skuId) {
          mappings.set(result.skuId, result.customerPartnerNumber);
        }
      });
    } else {
      const results = await storeCompanyMappingRepository.searchByExactCustomerPartnerNumbers({
        storeName: params.storeName,
        customerPartnerNumbers: params.query,
        companyId: params.companyId
      });
      
      results.forEach(result => {
        if (result.skuId) {
          mappings.set(result.skuId, result.customerPartnerNumber);
        }
      });
    }

    return mappings;
  }

  /**
   * Build search query based on input parameters
   * Handles both single and multiple query cases
   */
  private async buildSearchQuery(
    params: ProductVariantSearchRequest, 
    mappings: Map<string, string>
  ): Promise<string> {
    // Case 1: Single Query Processing
    if (params.query.length === 1) {
      return this.processSingleQuery(params, mappings);
    }
    // Case 2: Multiple Queries Processing
    return this.processMultipleQueries(params, mappings);
  }

  /**
   * Process single query case
   */
  private async processSingleQuery(
    params: ProductVariantSearchRequest,
    mappings: Map<string, string>
  ): Promise<string> {
    if (mappings.size > 0) {
      const skus = Array.from(mappings.keys());
      return skus.join(' OR ');
    }
    return params.query[0];
  }

  /**
   * Process multiple queries case
   */
  private async processMultipleQueries(
    params: ProductVariantSearchRequest,
    mappings: Map<string, string>
  ): Promise<string> {
    if (mappings.size > 0) {
      const skus = Array.from(mappings.keys());
      return skus.join(' OR ');
    }
    return params.query.join(' OR ');
  }

  /**
   * Filter and process products based on visibility
   */
  private filterAndProcessProducts(
    searchedProducts: Product[],
    visibleProductIds: Set<string>,
    customerPartnerNumberMappings: Map<string, string>
  ): Product[] {
    return searchedProducts
      .filter((product: Product) => {
        const isVisible = visibleProductIds.has(product.id);
        if (!isVisible) {
          loggerService.debug(`${this.CLASS_NAME}.filterAndProcessProducts: Product not visible`, {
            productId: product.id,
            productTitle: product.title
          });
        }
        return isVisible;
      })
      .map((product: Product) => ({
        ...product,
        variants: {
          nodes: product.variants.nodes.map((variant: Variant) => ({
            ...variant,
            contextualPricing: variant.contextualPricing || null,
            customerPartnerNumber: customerPartnerNumberMappings.get(variant.sku) || null
          }))
        }
      }));
  }

  /**
   * Execute search query and process results
   */
  private async executeSearchAndProcessResults(
    searchQuery: string,
    params: ProductVariantSearchRequest,
    customerPartnerNumberMappings: Map<string, string>
  ): Promise<{
    filteredProducts: Product[];
    searchedCount: number;
    visibleCount: number;
    searchedProductIds: string[];
  }> {
    // Execute GraphQL query
    const response = await ShopifyClientManager.query(
      SEARCH_PRODUCTS_WITH_VISIBILITY,
      params.storeName,
      { 
        variables: { 
          query: searchQuery,
          companyLocationId: params.companyLocationId
        } 
      }
    );

    // Handle GraphQL errors if any
    if (response.errors) {
      this.handleGraphQLErrors(response.errors);
    }

    // Process search results
    const searchedProducts = response.data?.products?.nodes || [];
    const searchedProductIds = searchedProducts.map((p: Product) => p.id);

    loggerService.info(`${this.CLASS_NAME}.executeSearchAndProcessResults: Found products`, {
      count: searchedProducts.length,
      hasErrors: !!response.errors,
      searchedProductIds,
      mappingsCount: customerPartnerNumberMappings.size
    });

    // Extract visible products
    const visibleProductIds = this.extractVisibleProductIds(response);

    // Filter and process products
    const filteredProducts = this.filterAndProcessProducts(
      searchedProducts, 
      visibleProductIds,
      customerPartnerNumberMappings
    );

    return {
      filteredProducts,
      searchedCount: searchedProducts.length,
      visibleCount: visibleProductIds.size,
      searchedProductIds
    };
  }

  /**
   * Extract visible product IDs from catalogs
   */
  private extractVisibleProductIds(response: any): Set<string> {
    const visibleProductIds = new Set<string>();
    const catalogs = response.data?.companyLocation?.catalogs?.edges || [];
    
    catalogs.forEach((catalog: CatalogEdge) => {
      const products = catalog.node.publication?.products?.edges || [];
      products.forEach((product) => {
        visibleProductIds.add(product.node.id);
      });
    });

    loggerService.info(`${this.CLASS_NAME}.extractVisibleProductIds: Found visible products`, {
      catalogCount: catalogs.length,
      visibleProductCount: visibleProductIds.size
    });

    return visibleProductIds;
  }

  /**
   * Handle GraphQL errors
   */
  private handleGraphQLErrors(errors: any): void {
    const errorDetails = Array.isArray(errors) 
      ? errors.map((e: any) => ({
          message: e?.message || 'Unknown error',
          path: e?.path,
          extensions: e?.extensions
        }))
      : [{ message: String(errors) }];

    loggerService.error(`${this.CLASS_NAME}.handleGraphQLErrors: GraphQL errors in product search`, {
      errors: typeof errors === 'object' ? errors : { error: errors },
      errorDetails
    });
  }
}

export const productVariantSearchService = new ProductVariantSearchService();