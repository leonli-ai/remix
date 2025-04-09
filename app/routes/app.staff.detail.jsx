import { json } from "@remix-run/node";
import BreadPayAppsClient from '~/breadPay-apps'; // or "@remix-run/server-runtime"

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method Not Allowed" }, { status: 405 });
  }
  const requestBody = await request.json();
  console.log('[DEBUG] Account detail request start');

  let res = null;
  try {
    res = fetchStaffDetails(requestBody.token)
  }catch (e) {
    res = e
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

