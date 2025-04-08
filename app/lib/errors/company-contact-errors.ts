import { BaseError } from './base-error';

export enum CompanyContactErrorCodes {
  FETCH_FAILED = 'FETCH_FAILED',
  INVALID_COMPANY_ID = 'INVALID_COMPANY_ID',
  CONTACT_NOT_FOUND = 'CONTACT_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN'
}

function getCompanyContactErrorStatusCode(code: CompanyContactErrorCodes): number {
  switch (code) {
    case CompanyContactErrorCodes.VALIDATION_ERROR:
      return 400;
    case CompanyContactErrorCodes.UNAUTHORIZED:
      return 401;
    case CompanyContactErrorCodes.FORBIDDEN:
      return 403;
    case CompanyContactErrorCodes.CONTACT_NOT_FOUND:
      return 404;
    case CompanyContactErrorCodes.INVALID_COMPANY_ID:
      return 422;
    case CompanyContactErrorCodes.FETCH_FAILED:
    default:
      return 500;
  }
}

export class CompanyContactError extends BaseError {
  constructor(message: string, code: CompanyContactErrorCodes) {
    const statusCode = getCompanyContactErrorStatusCode(code);
    super(message, statusCode, code);
    this.name = 'CompanyContactError';
  }
} 