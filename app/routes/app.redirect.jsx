import { json } from "@remix-run/node";
import crypto from 'crypto';
import { redirect } from "@remix-run/node";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method Not Allowed" }, { status: 405 });
  }

  // 获取请求的headers
  const headers = request.headers;
  // 从headers中获取token
  const idToken = headers.get("Authorization");

  const requestBody = await request.json();
  console.log('[DEBUG] Account detail request start');


  // Generate HMAC signature
  const secret = process.env.SHOPIFY_API_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(requestBody));
  const signature = hmac.digest('hex');

  console.log('[DEBUG] Generated HMAC signature:', signature);

  const timestamp = new Date().getTime();
  return `/app/test?locale=en&shop=leon-env.myshopify.com&embedded=1&session=a5eaa6c9486ce7cbbb67d670c86bfc347a9f5d2c7ff1c24673669897b13bd5dc&id_token=${idToken}&host=${requestBody.host}&hmac=${signature}&timestamp=${timestamp}`
};

