import { BaseError, HttpStatusCode } from './base-error';

export enum ShopifyErrorCodes {
  API_ERROR = 'SHOPIFY_API_ERROR',
  GRAPHQL_ERROR = 'SHOPIFY_GRAPHQL_ERROR',
  RATE_LIMIT_ERROR = 'SHOPIFY_RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'SHOPIFY_AUTH_ERROR',
  RESOURCE_NOT_FOUND = 'SHOPIFY_NOT_FOUND'
}

export class ShopifyError extends BaseError {
  public readonly graphqlErrors?: any[];
  
  constructor(
    message: string, 
    code: ShopifyErrorCodes,
    graphqlErrors?: any[]
  ) {
    const statusCode = code === ShopifyErrorCodes.RESOURCE_NOT_FOUND 
      ? HttpStatusCode.NOT_FOUND 
      : HttpStatusCode.INTERNAL_SERVER;
    super(message, statusCode, code);
    this.name = 'ShopifyError';
    this.graphqlErrors = graphqlErrors;
  }
} 