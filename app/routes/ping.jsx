import { json } from "@remix-run/node"; // or "@remix-run/server-runtime"

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method Not Allowed" }, { status: 405 });
  }

  // Extract headers to log the origin, referer, etc.
  const headers = request.headers;
  const referer = headers.get("referer") || "No referer";
  const origin = headers.get("origin") || "No origin";

  // Log where the request is coming from
  console.log("Ping request received!");
  console.log(`Referer: ${referer}`);
  console.log(`Origin: ${origin}`);

  // If you want to log the request body
  // const body = await request.json(); // assuming it's a JSON payload
  // console.log("Request body:", body);

  // You could also log the client's IP address (optional)
  const clientIP = headers.get("x-forwarded-for") || request.headers.get("remote-addr") || "IP not available";
  console.log(`Client IP: ${clientIP}`);

  // Respond to the ping request
  return json({ message: "Pong", referer, origin, clientIP });
};

// Optional: Add a component if you want to show something in the UI
export default function PingRoute() {
  return <div>Ping Route is Active</div>;
}
