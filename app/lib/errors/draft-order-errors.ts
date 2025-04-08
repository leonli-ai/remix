import { BaseError } from './base-error';

export enum DraftOrderErrorCodes {
  ALREADY_PAID = 'ALREADY_PAID',
  COMPLETION_FAILED = 'COMPLETION_FAILED',
  REJECTION_FAILED = 'REJECTION_FAILED',
  BULK_DELETE_FAILED = 'BULK_DELETE_FAILED',
  CREATION_FAILED = 'CREATION_FAILED'
}

export class DraftOrderError extends BaseError {
  constructor(message: string, code: DraftOrderErrorCodes) {
    super(message, 400, code);
    this.name = 'DraftOrderError';
  }
} 