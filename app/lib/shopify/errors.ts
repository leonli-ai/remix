export enum ShopifyErrorCodes {
  API_ERROR = 'SHOPIFY_API_ERROR',
  VALIDATION_ERROR = 'SHOPIFY_VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'SHOPIFY_RATE_LIMIT_ERROR',
  NETWORK_ERROR = 'SHOPIFY_NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'SHOPIFY_AUTHENTICATION_ERROR',
  QUERY_ERROR = 'SHOPIFY_QUERY_ERROR',
  MUTATION_ERROR = 'SHOPIFY_MUTATION_ERROR'
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    public code: ShopifyErrorCodes,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ShopifyError';
  }
} 