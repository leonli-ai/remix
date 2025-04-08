import { type ActionFunctionArgs } from "@remix-run/node";
import { LOCAL_LANGUAGE_HEADER_KEY } from "~/constant/common";

/**
 * CORS headers configuration
 */
export function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": `Content-Type, Accept, Authorization, ${LOCAL_LANGUAGE_HEADER_KEY}`,
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers": "Content-Disposition, x-request-id",
  };
}

/**
 * Handle CORS preflight requests
 */
export async function handleCors(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(),
    });
  }
  return null;
}

/**
 * Add CORS headers to response
 */
export function withCors(
  handler: (args: ActionFunctionArgs) => Promise<Response>,
) {
  return async (args: ActionFunctionArgs) => {
    const corsResponse = await handleCors(args.request);
    if (corsResponse) return corsResponse;

    const response = await handler(args);
    const newHeaders = new Headers(response.headers);

    Object.entries(getCorsHeaders()).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}
