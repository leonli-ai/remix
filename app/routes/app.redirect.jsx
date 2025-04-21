import { json } from "@remix-run/node";
import crypto from 'crypto';
import { redirect } from "@remix-run/node";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method Not Allowed" }, { status: 405 });
  }
  const requestBody = await request.json();
  console.log('[DEBUG] Account detail request start');


  // Generate HMAC signature
  const secret = process.env.SHOPIFY_API_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(requestBody));
  const signature = hmac.digest('hex');

  console.log('[DEBUG] Generated HMAC signature:', signature);

  const timestamp = new Date().getTime();
  return `/app/test?shop=leon-env.myshopify.com&embedded=1&session=${requestBody.token}&id_token=${requestBody.idToken}&host=${requestBody.host}&hmac=${signature}&timestamp=${timestamp}`
};

