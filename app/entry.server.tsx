import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import {
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";
import { loggerService } from "./lib/logger";
import { initializeTracing } from "./lib/telemetry/instrumentation";

// Initialize OpenTelemetry
initializeTracing();

export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? '')
    ? "onAllReady"
    : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
      />,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          const isLocal = import.meta.env.MODE === "development";

          const url = new URL(request.url);
          loggerService.info('Rendering URL', {
            pathname: url.pathname
          });
          const pattern = /^\/([a-z]{2})?\/?apps\/customer-account/
          if ( pattern.test(url.pathname) && !url.pathname.includes('test') && !isLocal) {
            responseHeaders.set("Content-Type", "application/liquid");
          } else {
            responseHeaders.set("Content-Type", "text/html");
          }

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        },
      }
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}
