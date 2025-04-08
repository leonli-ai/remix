import { BaseError, HttpStatusCode } from './base-error';

/**
 * Error codes for Vercel AI service
 */
export enum VercelAiErrorCode {
  COMPLETION_FAILED = 'VERCEL_AI_COMPLETION_FAILED',
  INVALID_MODEL = 'VERCEL_AI_INVALID_MODEL',
  INVALID_PARAMETERS = 'VERCEL_AI_INVALID_PARAMETERS',
}

/**
 * Error class for Vercel AI service errors
 */
export class VercelAiError extends BaseError {
  /**
   * Create an error for when AI completion fails
   * @param cause - The underlying error that caused the failure
   * @returns A new VercelAiError instance
   */
  public static completionFailed(cause: Error | unknown): VercelAiError {
    const message = 'Failed to generate AI completion';
    return new VercelAiError(
      message,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      VercelAiErrorCode.COMPLETION_FAILED,
      cause
    );
  }

  /**
   * Create an error for when an invalid model is specified
   * @param modelName - The invalid model name
   * @returns A new VercelAiError instance
   */
  public static invalidModel(modelName: string): VercelAiError {
    const message = `Invalid AI model: ${modelName}`;
    return new VercelAiError(
      message,
      HttpStatusCode.BAD_REQUEST,
      VercelAiErrorCode.INVALID_MODEL
    );
  }

  /**
   * Create an error for when invalid parameters are provided
   * @param details - Details about the invalid parameters
   * @returns A new VercelAiError instance
   */
  public static invalidParameters(details: string): VercelAiError {
    const message = `Invalid AI parameters: ${details}`;
    return new VercelAiError(
      message,
      HttpStatusCode.BAD_REQUEST,
      VercelAiErrorCode.INVALID_PARAMETERS
    );
  }

  public readonly cause?: Error | unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    cause?: Error | unknown
  ) {
    super(message, statusCode, errorCode);
    this.cause = cause;
  }
} 