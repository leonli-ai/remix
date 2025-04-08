import type { LoaderFunction } from '@remix-run/node';
import { trace, SpanStatusCode, SpanKind, context } from '@opentelemetry/api';
import { loggerService } from '../logger';

export function withTracing(loader: LoaderFunction): LoaderFunction {
  return async (...args) => {
    const [{ request }] = args;
    const url = new URL(request.url);
    const tracer = trace.getTracer('remix-app');
    
    return await tracer.startActiveSpan(
      `${request.method} ${url.pathname}`,
      {
        kind: SpanKind.SERVER,
        attributes: {
          'http.method': request.method,
          'http.url': request.url,
          'http.path': url.pathname,
          'http.query': url.search,
        },
      },
      async (span) => {
        try {
          const response = await loader(...args);

          if (response instanceof Response) {
            // Get traceId from current context
            const currentSpan = trace.getSpan(context.active());
            const traceId = currentSpan?.spanContext().traceId;
            
            if (traceId) {
              response.headers.set('X-Trace-Id', traceId);
              span.setAttribute('trace.id', traceId);
            }

            // Add response attributes to span
            span.setAttribute('http.status_code', response.status);
            
            if (response.status >= 400) {
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: `HTTP ${response.status}`,
              });
            }
          }

          span.setStatus({ code: SpanStatusCode.OK });
          return response;
        } catch (error) {
          loggerService.error('Error in traced route', { error });
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      }
    );
  };
} 