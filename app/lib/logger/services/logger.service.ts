import winston from 'winston';
import { loggerConfig } from '../config/logger.config';
import { trace, context } from '@opentelemetry/api';

/**
 * Service for handling application logging
 * @class LoggerService
 */
class LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger(loggerConfig);
  }

  /**
   * Get current trace ID from OpenTelemetry context
   */
  private getTraceId(): string | undefined {
    try {
      const activeSpan = trace.getSpan(context.active());
      if (!activeSpan) {
        return undefined;
      }
      return activeSpan.spanContext().traceId;
    } catch {
      return undefined;
    }
  }

  /**
   * Add trace context to metadata
   */
  private addTraceContext(meta?: Record<string, unknown>): Record<string, unknown> {
    const traceId = this.getTraceId();
    if (!traceId) {
      return meta || {};
    }
    return {
      ...meta,
      traceId,
    };
  }

  /**
   * Log information message
   * @param message - Message to log
   * @param meta - Additional metadata to log
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, this.addTraceContext(meta));
  }

  /**
   * Log error message
   * @param message - Error message to log
   * @param error - Error object or unknown error to log
   */
  public error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.logger.error(message, this.addTraceContext({
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }));
    } else {
      this.logger.error(message, this.addTraceContext({ error }));
    }
  }

  /**
   * Log warning message
   * @param message - Warning message to log
   * @param meta - Additional metadata to log
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, this.addTraceContext(meta));
  }

  /**
   * Log debug message
   * @param message - Debug message to log
   * @param meta - Additional metadata to log
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, this.addTraceContext(meta));
  }
}

export const loggerService = new LoggerService(); 