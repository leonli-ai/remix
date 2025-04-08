import { BaseError } from './base-error';

export enum CompanyLocationErrorCodes {
  FETCH_FAILED = 'FETCH_FAILED',
  INVALID_COMPANY_ID = 'INVALID_COMPANY_ID',
  LOCATION_NOT_FOUND = 'LOCATION_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN'
}

function getCompanyLocationErrorStatusCode(code: CompanyLocationErrorCodes): number {
  switch (code) {
    case CompanyLocationErrorCodes.VALIDATION_ERROR:
      return 400;
    case CompanyLocationErrorCodes.UNAUTHORIZED:
      return 401;
    case CompanyLocationErrorCodes.FORBIDDEN:
      return 403;
    case CompanyLocationErrorCodes.LOCATION_NOT_FOUND:
      return 404;
    case CompanyLocationErrorCodes.INVALID_COMPANY_ID:
      return 422;
    case CompanyLocationErrorCodes.FETCH_FAILED:
    default:
      return 500;
  }
}

export class CompanyLocationError extends BaseError {
  constructor(message: string, code: CompanyLocationErrorCodes) {
    const statusCode = getCompanyLocationErrorStatusCode(code);
    super(message, statusCode, code);
    this.name = 'CompanyLocationError';
  }
} 