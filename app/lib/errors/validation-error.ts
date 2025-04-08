/**
 * Error codes for validation errors
 */
export enum ValidationErrorCodes {
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  NO_DATA_FOUND = 'NO_DATA_FOUND',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION'
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public readonly code: ValidationErrorCodes;
  public readonly details?: Record<string, unknown>;
  public readonly statusCode: number;

  constructor(
    message: string,
    code: ValidationErrorCodes,
    details?: Record<string, unknown>,
    statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    // Only set details if provided
    if (details && Object.keys(details).length > 0) {
      this.details = details;
    }
    this.statusCode = statusCode;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    const response: {
      code: number;
      error: ValidationErrorCodes;
      message: string;
      details?: Record<string, unknown>;
    } = {
      code: this.statusCode,
      error: this.code,
      message: this.message,
    };
    
    // Only include details if they exist
    if (this.details) {
      response.details = this.details;
    }
    
    return response;
  }
} 