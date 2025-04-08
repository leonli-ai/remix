import { loggerService } from '~/lib/logger';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { FETCH_SHOP_SETTINGS } from '~/lib/shopify/queries/shop';
import type { ShopSettingsRequest, Shop } from '~/types/shop/shop-settings.schema';

export class ShopSettingsService {
  private readonly CLASS_NAME = 'ShopSettingsService';

  /**
   * Fetch shop general settings including timezone information
   */
  public async fetchGeneralSettings(params: ShopSettingsRequest): Promise<Shop> {
    const METHOD = 'fetchGeneralSettings';
    const start = Date.now();

    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting fetch shop settings`, {
        storeName: params.storeName,
      });

      // Execute GraphQL query
      const response = await ShopifyClientManager.query(
        FETCH_SHOP_SETTINGS,
        params.storeName
      );

      // Handle GraphQL errors if any
      if (response.errors) {
        this.handleGraphQLErrors(response.errors);
      }

      const shop = response.data?.shop;

      const duration = Date.now() - start;
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Shop settings fetch completed`, {
        duration,
        shopId: shop?.id
      });

      return shop;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Shop settings fetch failed`, {
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

    loggerService.error(`${this.CLASS_NAME}.handleGraphQLErrors: GraphQL errors in shop settings fetch`, {
      errors: typeof errors === 'object' ? errors : { error: errors },
      errorDetails
    });
  }
}

export const shopSettingsService = new ShopSettingsService(); 