import { BaseError, HttpStatusCode } from './base-error';

/**
 * Error codes for subscription contract operations
 */
export enum SubscriptionContractErrorCodes {
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_FREQUENCY = 'INVALID_FREQUENCY',
  CREATION_FAILED = 'CREATION_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  UPDATE_FAILED = 'UPDATE_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

/**
 * Error class for subscription contract related errors
 */
export class SubscriptionContractError extends BaseError {
  constructor(message: string, errorCode: SubscriptionContractErrorCodes, statusCode = HttpStatusCode.BAD_REQUEST) {
    super(message, statusCode, errorCode);
  }

  /**
   * Create an error for invalid date range in subscription contract
   */
  static invalidDateRange(message: string): SubscriptionContractError {
    return new SubscriptionContractError(
      message || 'Invalid date range for subscription contract',
      SubscriptionContractErrorCodes.INVALID_DATE_RANGE
    );
  }

  /**
   * Create an error for invalid frequency settings in subscription contract
   */
  static invalidFrequency(intervalUnit: string): SubscriptionContractError {
    return new SubscriptionContractError(
      `Invalid frequency unit: ${intervalUnit}. Supported values are: daily, weekly, monthly, quarterly, biannual, annually, yearly.`,
      SubscriptionContractErrorCodes.INVALID_FREQUENCY
    );
  }

  /**
   * Create an error for failed subscription contract creation
   */
  static creationFailed(message?: string): SubscriptionContractError {
    return new SubscriptionContractError(
      message || 'Failed to create subscription contract',
      SubscriptionContractErrorCodes.CREATION_FAILED,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  /**
   * Create an error for subscription contract not found
   */
  static notFound(message: string | number): SubscriptionContractError {
    return new SubscriptionContractError(
      typeof message === 'string' ? message : `Subscription contract with ID ${message} not found`,
      SubscriptionContractErrorCodes.NOT_FOUND,
      HttpStatusCode.NOT_FOUND
    );
  }

  /**
   * Create an error for failed subscription contract update
   */
  static updateFailed(message?: string): SubscriptionContractError {
    return new SubscriptionContractError(
      message || 'Failed to update subscription contract',
      SubscriptionContractErrorCodes.UPDATE_FAILED,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  /**
   * Create an error for validation errors
   */
  static validationError(message: string): SubscriptionContractError {
    return new SubscriptionContractError(
      message,
      SubscriptionContractErrorCodes.VALIDATION_ERROR
    );
  }

  /**
   * Create a generic bad request error
   */
  static badRequest(message: string): SubscriptionContractError {
    return new SubscriptionContractError(
      message,
      SubscriptionContractErrorCodes.BAD_REQUEST,
      HttpStatusCode.BAD_REQUEST
    );
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(message: string): SubscriptionContractError {
    return new SubscriptionContractError(
      message,
      SubscriptionContractErrorCodes.UNAUTHORIZED,
      HttpStatusCode.UNAUTHORIZED
    );
  }

  /**
   * Create an internal server error
   */
  static internalServerError(message: string): SubscriptionContractError {
    return new SubscriptionContractError(
      message,
      SubscriptionContractErrorCodes.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
} 