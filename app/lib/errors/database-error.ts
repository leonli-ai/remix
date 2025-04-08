import { BaseError, HttpStatusCode } from './base-error';

export enum DatabaseErrorCodes {
  CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  QUERY_ERROR = 'DB_QUERY_ERROR',
  TRANSACTION_ERROR = 'DB_TRANSACTION_ERROR',
  CONSTRAINT_ERROR = 'DB_CONSTRAINT_ERROR',
  NOT_FOUND = 'DB_NOT_FOUND'
}

export class DatabaseError extends BaseError {
  constructor(message: string, code: DatabaseErrorCodes) {
    const statusCode = code === DatabaseErrorCodes.NOT_FOUND 
      ? HttpStatusCode.NOT_FOUND 
      : HttpStatusCode.INTERNAL_SERVER_ERROR;
    super(message, statusCode, code);
    this.name = 'DatabaseError';
  }
} 