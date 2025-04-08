import { BaseError, HttpStatusCode } from './base-error';

/**
 * Error codes for shopping list operations
 */
export enum ShoppingListErrorCodes {
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DEFAULT_REQUIRED = 'DEFAULT_REQUIRED',
  OPERATION_FAILED = 'OPERATION_FAILED'
}

/**
 * Shopping list error class
 */
export class ShoppingListError extends BaseError {
  constructor(message: string, errorCode: ShoppingListErrorCodes, statusCode = HttpStatusCode.BAD_REQUEST) {
    super(message, statusCode, errorCode);
  }

  /**
   * Create an error for a shopping list that already exists
   */
  static alreadyExists(name: string, companyLocationId: string): ShoppingListError {
    return new ShoppingListError(
      `Shopping list with name "${name}" already exists for this location`,
      ShoppingListErrorCodes.ALREADY_EXISTS,
      HttpStatusCode.CONFLICT
    );
  }

  /**
   * Create an error for a shopping list that cannot be found
   */
  static notFound(id: number | string): ShoppingListError {
    return new ShoppingListError(
      `Shopping list with ID ${id} not found`,
      ShoppingListErrorCodes.NOT_FOUND,
      HttpStatusCode.NOT_FOUND
    );
  }

  /**
   * Create an error for unauthorized access to a shopping list
   */
  static notAuthorized(): ShoppingListError {
    return new ShoppingListError(
      'Not authorized to access this shopping list',
      ShoppingListErrorCodes.NOT_AUTHORIZED,
      HttpStatusCode.FORBIDDEN
    );
  }

  /**
   * Create an error for validation issues with shopping list data
   */
  static validationError(message: string): ShoppingListError {
    return new ShoppingListError(
      message,
      ShoppingListErrorCodes.VALIDATION_ERROR,
      HttpStatusCode.BAD_REQUEST
    );
  }

  /**
   * Create an error for when a default shopping list is required
   */
  static defaultRequired(): ShoppingListError {
    return new ShoppingListError(
      'Cannot remove default status: at least one shopping list must be set as default',
      ShoppingListErrorCodes.DEFAULT_REQUIRED,
      HttpStatusCode.BAD_REQUEST
    );
  }

  /**
   * Create an error for failed shopping list operations
   */
  static operationFailed(operation: string): ShoppingListError {
    return new ShoppingListError(
      `Failed to ${operation} shopping list`,
      ShoppingListErrorCodes.OPERATION_FAILED,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
} 