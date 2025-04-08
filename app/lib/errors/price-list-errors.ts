import { BaseError } from './base-error';

export enum PriceListErrorCodes {
  NO_COMPANY_LOCATIONS = 'NO_COMPANY_LOCATIONS',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FETCH_ERROR = 'FETCH_ERROR',
  NO_PRICE_DATA = 'NO_PRICE_DATA',
  SYNC_ERROR = 'SYNC_ERROR',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND'
}

export class PriceListError extends Error {
  constructor(
    message: string,
    public code: PriceListErrorCodes,
    public cause?: Error
  ) {
    super(message);
    this.name = 'PriceListError';
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}