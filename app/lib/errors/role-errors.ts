import { BaseError, HttpStatusCode } from './base-error';

export class RoleError extends BaseError {
  constructor(message: string, errorCode: RoleErrorCodes) {
    const statusCode = getRoleErrorStatusCode(errorCode);
    super(message, statusCode, errorCode);
  }
}

export enum RoleErrorCodes {
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  ROLE_FETCH_ERROR = 'ROLE_FETCH_ERROR',
  INVALID_ROLE_DATA = 'INVALID_ROLE_DATA',
  ROLE_CREATE_ERROR = 'ROLE_CREATE_ERROR',
  ROLE_DELETE_ERROR = 'ROLE_DELETE_ERROR'
}

function getRoleErrorStatusCode(errorCode: RoleErrorCodes): HttpStatusCode {
  switch (errorCode) {
    case RoleErrorCodes.ROLE_NOT_FOUND:
      return HttpStatusCode.NOT_FOUND;
    case RoleErrorCodes.INVALID_ROLE_DATA:
      return HttpStatusCode.BAD_REQUEST;
    default:
      return HttpStatusCode.INTERNAL_SERVER_ERROR;
  }
} 