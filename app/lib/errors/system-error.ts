import { BaseError, HttpStatusCode } from './base-error';

export enum SystemErrorCodes {
  INTERNAL_ERROR = 'SYSTEM_INTERNAL_ERROR',
  CONFIG_ERROR = 'SYSTEM_CONFIG_ERROR',
  NETWORK_ERROR = 'SYSTEM_NETWORK_ERROR',
  VALIDATION_ERROR = 'SYSTEM_VALIDATION_ERROR'
}

export class SystemError extends BaseError {
  constructor(message: string, code: SystemErrorCodes) {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR, code);
    this.name = 'SystemError';
  }
} 