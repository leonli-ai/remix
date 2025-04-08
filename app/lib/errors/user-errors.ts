import { BaseError, HttpStatusCode } from './base-error';

export class UserCreationError extends BaseError {
  constructor(message: string, errorCode: string) {
    const statusCode = errorCode === UserErrorCodes.CUSTOMER_CREATE_ERROR 
      ? HttpStatusCode.CONFLICT 
      : HttpStatusCode.BAD_REQUEST;
    super(message, statusCode, errorCode);
  }
}

export const UserErrorCodes = {
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  CUSTOMER_CREATE_ERROR: 'CUSTOMER_CREATE_ERROR',
  INVALID_CUSTOMER_DATA: 'INVALID_CUSTOMER_DATA',
  MISSING_CUSTOMER: 'MISSING_CUSTOMER',
  CREATION_FAILED: 'CREATION_FAILED',
  ROLE_ASSIGNMENT_FAILED: 'ROLE_ASSIGNMENT_FAILED'
} as const; 