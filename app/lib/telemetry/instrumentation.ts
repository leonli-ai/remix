import { NodeSDK } from '@opentelemetry/sdk-node';
import type { SpanProcessor, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import prismaInstrumentation from '@prisma/instrumentation';
import { createTelemetryResource } from './config';
import type { Span, Context } from '@opentelemetry/api';
import { trace, context, diag, DiagLogLevel } from '@opentelemetry/api';
import { loggerService } from '../logger';

const { PrismaInstrumentation } = prismaInstrumentation;

class DiagConsoleLogger {
  verbose(...args: unknown[]) { console.debug(...args); }
  debug(...args: unknown[]) { console.debug(...args); }
  info(...args: unknown[]) { console.info(...args); }
  warn(...args: unknown[]) { console.warn(...args); }
  error(...args: unknown[]) { console.error(...args); }
}

// Enable OpenTelemetry debug logging only in development
if (process.env.NODE_ENV === 'development') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

let sdk: NodeSDK | undefined;

/**
 * Format nanoseconds duration to a human readable string
 */
function formatDuration(duration: [number, number]): string {
  const totalNanos = duration[0] * 1e9 + duration[1];
  const ms = totalNanos / 1e6;
  return `${ms.toFixed(2)}ms`;
}

/**
 * Format hrtime timestamp to ISO string
 */
function formatTimestamp(hrtime: [number, number]): string {
  const totalNanos = hrtime[0] * 1e9 + hrtime[1];
  const date = new Date(totalNanos / 1e6);
  return date.toISOString();
}

/**
 * Format GraphQL operation name to be more concise
 */
function formatGraphQLOperation(operation: string): string {
  // First try to extract the operation name from the query definition
  const match = operation.match(/(?:query|mutation)\s+(\w+)|(\w+)$/);
  return match ? (match[1] || match[2]) : 'Unknown';
}

/**
 * Format GraphQL variables to be more concise
 */
function formatGraphQLVariables(variables: string): any {
  try {
    const parsed = JSON.parse(variables);
    // For customerIds array, just show the count
    if (parsed.customerIds) {
      return { ...parsed, customerIds: `${parsed.customerIds.length} customers` };
    }
    return parsed;
  } catch {
    return variables;
  }
}

/**
 * Custom console exporter that only logs essential span information
 */
class CustomConsoleExporter extends ConsoleSpanExporter {
  override export(spans: any[], resultCallback: (result: any) => void): void {
    spans.forEach(span => {
      const { spanId, parentSpanId, name, kind, startTime, duration, attributes, status } = span;
      
      // Get traceId from span context
      const spanContext = span.spanContext();
      const traceId = spanContext?.traceId;
      
      // Format GraphQL specific attributes
      const formattedAttributes = { ...attributes };
      if (formattedAttributes['graphql.operation_name']) {
        formattedAttributes['graphql.operation_name'] = formatGraphQLOperation(formattedAttributes['graphql.operation_name']);
      }
      if (formattedAttributes['graphql.variables']) {
        formattedAttributes['graphql.variables'] = formatGraphQLVariables(formattedAttributes['graphql.variables']);
      }

      loggerService.info('Telemetry Data', {
        trace: {
          traceId,
          spanId,
          parentSpanId,
        },
        operation: {
          name,
          kind,
          startTime: formatTimestamp(startTime),
          duration: formatDuration(duration),
          status: status.code === 1 ? 'SUCCESS' : 'ERROR',
        },
        attributes: formattedAttributes
      });
    });
    resultCallback({ code: 0 });
  }
}

export function initializeTracing(): void {
  if (sdk) {
    loggerService.info('OpenTelemetry already initialized');
    return;
  }

  try {
    loggerService.info('Initializing OpenTelemetry tracing');

    sdk = new NodeSDK({
      resource: createTelemetryResource(),
      spanProcessor: new SimpleSpanProcessor(new CustomConsoleExporter()),
      instrumentations: [
        new HttpInstrumentation({
          requestHook: (span) => {
            span.setAttribute('service.name', 'shopify-b2b-customer-account');
          },
        }),
        new GraphQLInstrumentation({
          allowValues: true,
          depth: 3,
          mergeItems: false
        }),
        new PrismaInstrumentation(),
      ],
    });

    sdk.start();
    loggerService.info('OpenTelemetry tracing initialized successfully');
  } catch (error) {
    loggerService.error('Failed to initialize OpenTelemetry', { error });
    sdk = undefined;
  }
}

export function shutdownTracing(): Promise<void> {
  if (!sdk) {
    return Promise.resolve();
  }

  return sdk.shutdown()
    .then(() => {
      loggerService.info('OpenTelemetry tracing shutdown successfully');
      sdk = undefined;
    })
    .catch((error) => {
      loggerService.error('Error shutting down OpenTelemetry', { error });
      throw error;
    });
}

export function getTraceId(): string | undefined {
  try {
    const activeSpan = trace.getSpan(context.active());
    if (!activeSpan) {
      return undefined;
    }
    const spanContext = activeSpan.spanContext();
    return spanContext.traceId;
  } catch (error) {
    loggerService.error('Error getting trace ID', { error });
    return undefined;
  }
}

// Handle process termination
process.on('SIGTERM', () => {
  shutdownTracing()
    .catch((error: Error) => loggerService.error('Error terminating tracing', { error }))
    .finally(() => process.exit(0));
});

export function createSpanProcessor(): SpanProcessor {
  return {
    onStart(_span: Span, _parentContext: Context): void {},
    onEnd(span: ReadableSpan): void {
      const { name, kind, startTime, duration, status, attributes } = span;
      const { traceId, spanId } = span.spanContext();

      // Format GraphQL specific attributes
      const formattedAttributes = { ...attributes };
      if (formattedAttributes['graphql.operation_name']) {
        formattedAttributes['graphql.operation_name'] = formatGraphQLOperation(String(formattedAttributes['graphql.operation_name']));
      }
      if (formattedAttributes['graphql.variables']) {
        formattedAttributes['graphql.variables'] = formatGraphQLVariables(String(formattedAttributes['graphql.variables']));
      }

      loggerService.info('Telemetry Data', {
        trace: {
          traceId,
          spanId
        },
        operation: {
          name,
          kind,
          startTime: formatTimestamp(startTime),
          duration: formatDuration(duration),
          status: status.code === 1 ? 'SUCCESS' : 'ERROR',
        },
        attributes: formattedAttributes
      });
    },
    forceFlush(): Promise<void> {
      return Promise.resolve();
    },
    shutdown(): Promise<void> {
      return Promise.resolve();
    }
  };
} 