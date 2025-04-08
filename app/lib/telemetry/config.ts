import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { Resource } from '@opentelemetry/resources';

export const TELEMETRY_CONFIG = {
  serviceName: 'shopify-b2b-customer-account',
  serviceVersion: '1.0.0',
};

/**
 * Create a minimal telemetry resource with only essential attributes
 * @returns Resource with minimal set of attributes
 */
export function createTelemetryResource(): Resource {
  return new Resource({
    [ATTR_SERVICE_NAME]: TELEMETRY_CONFIG.serviceName,
    [ATTR_SERVICE_VERSION]: TELEMETRY_CONFIG.serviceVersion,
    environment: process.env.NODE_ENV || 'development',
  });
}

/**
 * Configuration for console span exporter
 */
export const CONSOLE_EXPORTER_CONFIG = {
  // Only export the span data without resource attributes
  printResourceAttributes: false,
  // Customize the log format to be more concise
  logFormat: {
    timestampFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
    includeTraceId: true,
    includeSpanId: true,
    includeServiceName: true,
  }
}; 