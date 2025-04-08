import { loggerService } from '../logger';
import { BaseError, HttpStatusCode } from './base-error';
import { DatabaseError, DatabaseErrorCodes } from './database-error';
import { ShopifyError, ShopifyErrorCodes } from './shopify-error';
import { ValidationError } from './validation-error';

export class ErrorHandler {
  static formatErrorResponse(error: unknown, includeDetails = false) {
    if (error instanceof ValidationError) {
      const response = {
        message: error.message,
        code: error.statusCode,
        error: error.code,
        ...(includeDetails && { details: error.details }),
        ...(includeDetails && process.env.NODE_ENV === 'development' && { stack: error.stack })
      };
      loggerService.debug('Formatted validation error response', { response });
      return response;
    }

    if (error instanceof BaseError) {
      const response = {
        message: error.message,
        code: error.statusCode,
        error: error.errorCode,
        ...(includeDetails && error instanceof ShopifyError && { details: error.graphqlErrors }),
        ...(includeDetails && process.env.NODE_ENV === 'development' && { stack: error.stack })
      };
      loggerService.debug('Formatted base error response', { response });
      return response;
    }

    const unknownError = error instanceof Error ? error : new Error('Unknown error occurred');
    const response = {
      message: unknownError.message,
      code: HttpStatusCode.INTERNAL_SERVER_ERROR,
      error: 'UNKNOWN_ERROR',
      ...(includeDetails && process.env.NODE_ENV === 'development' && { stack: unknownError.stack }),
      ...(includeDetails && { type: error instanceof Error ? error.constructor.name : typeof error })
    };
    loggerService.warn('Formatted unknown error response', { response });
    return response;
  }

  static createErrorResponse(error: unknown, includeDetails = false): Response {
    loggerService.error('Error occurred', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      context: error instanceof BaseError ? error.errorCode : 'UNKNOWN'
    });
    
    const formattedError = this.formatErrorResponse(error, includeDetails);

    return new Response(
      JSON.stringify(formattedError),
      {
        status: formattedError.code,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  static handleDatabaseError(error: any): never {
    loggerService.error('Database error occurred', {
      error,
      code: error.code,
      meta: error.meta
    });

    if (error.code === 'P2025') {
      throw new DatabaseError('Record not found', DatabaseErrorCodes.NOT_FOUND);
    }
    throw new DatabaseError(
      error.message || 'Database operation failed',
      DatabaseErrorCodes.QUERY_ERROR
    );
  }

  static handleShopifyError(error: any): never {
    loggerService.error('Shopify error occurred', {
      error,
      response: error.response,
      graphqlErrors: error.response?.errors
    });

    if (error.response?.errors) {
      throw new ShopifyError(
        'GraphQL operation failed',
        ShopifyErrorCodes.GRAPHQL_ERROR,
        error.response.errors
      );
    }
    throw new ShopifyError(
      error.message || 'Shopify operation failed',
      ShopifyErrorCodes.API_ERROR
    );
  }

  static createMethodNotAllowedResponse(): Response {
    const response = {
      message: 'Method not allowed',
      code: HttpStatusCode.METHOD_NOT_ALLOWED,
      error: 'METHOD_NOT_ALLOWED'
    };
    loggerService.warn('Method not allowed', { response });
    return new Response(
      JSON.stringify(response),
      {
        status: HttpStatusCode.METHOD_NOT_ALLOWED,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  static createValidationErrorResponse(error: any): Response {
    return new Response(
      JSON.stringify({
        message: 'Invalid parameters',
        code: HttpStatusCode.BAD_REQUEST,
        error: 'VALIDATION_ERROR',
        errors: error.errors
      }),
      {
        status: HttpStatusCode.BAD_REQUEST,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 