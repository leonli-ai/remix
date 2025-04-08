import { GET_CATALOGS } from '../lib/shopify/queries/catalog';
import { ShopifyClientManager } from '../lib/shopify/client';
import { loggerService } from '../lib/logger';

export class CatalogService {
  /**
   * Search for catalogs using a query string
   * @param storeName - The name of the store
   * @param query - The search query string
   * @returns Array of catalogs matching the query
   */
  public async searchCatalogs(storeName: string, query: string): Promise<Array<{ id: string; title: string }>> {
    try {
      loggerService.info('Searching catalogs', { storeName, query });

      const response = await ShopifyClientManager.query(
        GET_CATALOGS,
        storeName,
        {
          variables: { query }
        }
      );
      
      if (!response?.data?.catalogs?.edges) {
        loggerService.warn('No catalogs found', { storeName, query });
        return [];
      }

      const catalogs = response.data.catalogs.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title
      }));

      loggerService.info('Catalogs search completed', { 
        storeName, 
        query,
        count: catalogs.length 
      });

      return catalogs;
    } catch (error) {
      loggerService.error('Error searching catalogs', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        storeName,
        query
      });
      throw error;
    }
  }
} 