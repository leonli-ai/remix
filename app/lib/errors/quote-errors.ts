import { BaseError, HttpStatusCode } from './base-error';

/**
 * Error codes specific to quote operations
 */
export enum QuoteErrorCodes {
  NOT_FOUND = 'QUOTE_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'QUOTE_UNAUTHORIZED_ACCESS',
  INVALID_STATUS_TRANSITION = 'QUOTE_INVALID_STATUS_TRANSITION',
  VALIDATION_ERROR = 'QUOTE_VALIDATION_ERROR',
  OPERATION_FAILED = 'QUOTE_OPERATION_FAILED',
  ITEMS_UPDATE_FAILED = 'QUOTE_ITEMS_UPDATE_FAILED',
  SUBMISSION_FAILED = 'QUOTE_SUBMISSION_FAILED',
  APPROVAL_FAILED = 'QUOTE_APPROVAL_FAILED',
  REJECTION_FAILED = 'QUOTE_REJECTION_FAILED',
  BULK_DELETE_FAILED = 'QUOTE_BULK_DELETE_FAILED',
  ORDER_CONVERSION_FAILED = 'QUOTE_ORDER_CONVERSION_FAILED',
  INVALID_STATUS_FOR_ORDER = 'QUOTE_INVALID_STATUS_FOR_ORDER'
}

/**
 * Custom error class for quote-related errors
 */
export class QuoteError extends BaseError {
  constructor(
    message: string,
    errorCode: QuoteErrorCodes,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode, errorCode);
    this.name = 'QuoteError';
  }

  /**
   * Factory method for creating a not found error
   */
  static notFound(id: number | number[]): QuoteError {
    const idStr = Array.isArray(id) ? id.join(', ') : id;
    return new QuoteError(
      `Quote with ID ${idStr} not found`,
      QuoteErrorCodes.NOT_FOUND,
      HttpStatusCode.NOT_FOUND
    );
  }

  /**
   * Factory method for creating a draft quote not found error
   */
  static draftNotFound(id: number | number[]): QuoteError {
    const idStr = Array.isArray(id) ? id.join(', ') : id;
    return new QuoteError(
      `Draft quote with ID ${idStr} not found`,
      QuoteErrorCodes.NOT_FOUND,
      HttpStatusCode.NOT_FOUND
    );
  }

  /**
   * Factory method for creating an unauthorized access error
   */
  static unauthorizedAccess(id: number | number[]): QuoteError {
    const idStr = Array.isArray(id) ? id.join(', ') : id;
    return new QuoteError(
      `Unauthorized to access quote with ID ${idStr}`,
      QuoteErrorCodes.UNAUTHORIZED_ACCESS,
      HttpStatusCode.FORBIDDEN
    );
  }

  /**
   * Factory method for creating an invalid status transition error
   */
  static invalidStatusTransition(currentStatus: string, newStatus: string): QuoteError {
    return new QuoteError(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
      QuoteErrorCodes.INVALID_STATUS_TRANSITION,
      HttpStatusCode.BAD_REQUEST
    );
  }

  /**
   * Factory method for creating an invalid status for order conversion error
   */
  static invalidStatusForOrder(status: string): QuoteError {
    return new QuoteError(
      `Cannot convert quote with status ${status} to order. Only APPROVED quotes can be converted.`,
      QuoteErrorCodes.INVALID_STATUS_FOR_ORDER,
      HttpStatusCode.BAD_REQUEST
    );
  }

  /**
   * Factory method for creating an order conversion failed error
   */
  static orderConversionFailed(id: number, reason?: string): QuoteError {
    return new QuoteError(
      `Failed to convert quote ${id} to order${reason ? `: ${reason}` : ''}`,
      QuoteErrorCodes.ORDER_CONVERSION_FAILED,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
} 