import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Button,
  Text
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
  console.log("/app._index:loader");
  const apiKey = process.env.SHOPIFY_API_KEY;
  try {
    const { session } = await authenticate.admin(request);
    const text = { shopDomain: session.shop, apiKey: apiKey };
    return text;
  } catch (error) {
    console.log("app loader error", error);
    return null
  }
};

export default function Index() {
  const { themeId, isLoading, fetchShopTheme } = useShopTheme();

  const shopify = useAppBridge();

  useEffect(() => {
    fetchShopTheme();
  }, []);


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

    const staffData = await response.json();
    console.log('Staff Information:', staffData);
  }


  
  const redirect = async ()=>{
    window.parent.open('https://localhost:3000')
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
    <Button onClick={redirect}>Show Setup Guide</Button>
  );
}
