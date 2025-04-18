import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Button,
  Box
} from "@shopify/polaris";
import { getSessionToken } from '@shopify/app-bridge/utilities';
import { authenticate } from "../shopify.server";
import { SetupGuide } from "../components/admin-portal/SetupGuide";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import createApp, { ClientApplication } from "@shopify/app-bridge";
import { useShopTheme } from "~/hooks/use-customers";
// import { BILLING_CONFIG } from "~/config/billing";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    return { shop: session.shop };
  }catch (e){
    console.log("app-error", JSON.stringify(e))
  }
};

export default function Index() {

  const shopify = useAppBridge();

  async function fetchStaffDetails(sessionToken: string) {
    const response = await fetch('/app/redirect', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        token: sessionToken
      })
    });
    debugger
    const staffData = await response.json();
    console.log('Staff Information:', staffData);
  }



  const redirect = async ()=>{
    if(!shopify.config) {
      return
    }
    const app = createApp({
      apiKey: shopify.config.apiKey, // API key from the Partner Dashboard
      host: shopify.config.host as string, // host from URL search parameter
    });
    try {
      const sessionToken = await getSessionToken(app);
      await fetchStaffDetails(sessionToken)
      console.log('Session Token:', sessionToken);
      // 你可以在这里将 sessionToken 发送到你的后端
    } catch (error) {
      console.error('Error fetching session token:', error);
    }
  }


  return (
    <Box>
      <Link target={'_blank'} url={'/app/test'} >redirect</Link>
      <Button onClick={redirect}>get redirect url</Button>
    </Box>
  );
}
