import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method Not Allowed" }, { status: 405 });
  }
  const requestBody = await request.json();
  console.log('[DEBUG] Account detail request start');

  

  console.log('[DEBUG] Account detail response:', res);
  
  // Generate HMAC signature
  const crypto = require('crypto');
  const secret = process.env.SHOPIFY_API_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(res));
  const signature = hmac.digest('hex');
  
  console.log('[DEBUG] Generated HMAC signature:', signature);


  const timestamp = new Date().getTime();
  
  if (res?.error) {
    return Response.redirect(`http://localhost:3000?token=${requestBody.token}&hmac=${signature}&timestamp=${timestamp}`, {
      status: 302
    });
  }

  return json(res);
};

async function fetchStaffDetails(sessionToken) {
  const response = await fetch('https://leon-env.myshopify.com/admin/api/2025-04/staff.json', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    }
  });

  const staffData = await response.json();
  console.log('Staff Information:', staffData);
  return staffData
}

