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

  const goToThemeEditorApp = () => {
    if (isLoading || !themeId) return;

    const redirect = Redirect.create(shopify as unknown as ClientApplication<any>);
    redirect.dispatch(Redirect.Action.ADMIN_PATH, {
      path: `/themes/${themeId}/editor?context=apps`,
      newContext: false,
    });
  }


  const ITEMS = [
    {
      id: 1,
      title: "Download AAXIS Streamline Theme",
      description: () => {
        return (
          <div>
            <Text as='p' variant='bodyMd'>
              Download our optimized theme, crafted specifically for enhancing B2B commerce experiences. To get the latest theme updates, please contact us at {' '}
              <a className="text-blue-500" href="mailto:streamlines-support@aaxis.io">
                streamlines-support@aaxis.io
              </a>.
            </Text>
          </div>
        )
      },
    },
    {
      id: 2,
      title: "Install AAXIS Streamline Theme",
      description:
        "Upload and install the downloaded theme to your Shopify store.",
      complete: false,
      // primaryButton: {
      //   content: "Update Theme",
      //   props: {
      //     onClick: () => {
      //       console.log("Updating theme");
      //       const url = `${window.location.origin}${window.location.pathname.split('/').slice(0, -3).join('/')}/themes`;
      //       window.location.href = url;
      //     },
      //   },
      // },
    },
    {
      id: 3,
      title: "Configure App Features",
      description:
        "Set up the essential app features, including embeds, required blocks, and B2B functionality:",
      complete: false,
      listAndButton: [
        {
          title: '1. Enable app embeds.',
          // props: {
          //   content: 'Enable App Embeds',
          //   onClick: goToThemeEditor,
          // },
        },
        {
          title: '2. Set up B2B blocks and links in the Announcement Bar.',
          // props: {
          //   content: 'Add Required Blocks',
          //   onClick: goToThemeEditorApp,
          // },
        },
        {
          title: '3. Set up the B2B blocks and links in the Header.',
        },
      ],
    },
    {
      id: 4,
      title: "Configure Test Data",
      description:
        "Create test company, location, and customer data to verify your B2B commerce setup works correctly.",
      complete: false,
      // primaryButton: {
      //   content: "Configure Test Data",
      //   props: {
      //     onClick: () => {
      //       const url = `${window.location.origin}${window.location.pathname.split('/').slice(0, -3).join('/')}/customers`;
      //       window.location.href = url;
      //     },
      //   },
      // },
    },
    {
      id: 5,
      title: "Log in to Your Store",
      description:
        "Log in to your store with the customer account you configured.",
      complete: false,
    },
    {
      id: 6,
      title: "Verify All Features",
      description:
        "Log in to your store and verify all B2B features are working as expected, including location switching and app embeds.",
      complete: false,
      // primaryButton: {
      //   content: "Verify Features",
      //   props: {
      //     onClick: () => {
      //       const url = `${window.location.origin}${window.location.pathname.split('/').slice(0, -3).join('/')}/themes`;
      //       window.location.href = url;
      //     },
      //   },
      // },
    },
  ];
  const [showGuide, setShowGuide] = useState(true);
  const [items, setItems] = useState(ITEMS);

  const onStepComplete = async (id: number) => {
    try {
      // API call to update completion state in DB, etc.
      await new Promise<void>((res) =>
        setTimeout(() => {
          res();
        }, 1000)
      );

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, complete: !item.complete } : item)));
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchStaffDetails(sessionToken) {
    const response = await fetch('/app/staff/detail', {
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

  useEffect(() => {
    console.log('Session Token: start', shopify.config);
    if(!shopify.config) {
      return
    }
    const app = createApp({
      apiKey: shopify.config.apiKey, // API key from the Partner Dashboard
      host: shopify.config.host as string, // host from URL search parameter
    });
    const getSessionTokenAsync = async () => {
      try {
        const sessionToken = await getSessionToken(app);
        await fetchStaffDetails(sessionToken)
        console.log('Session Token:', sessionToken);
        // 你可以在这里将 sessionToken 发送到你的后端
      } catch (error) {
        console.error('Error fetching session token:', error);
      }
    };

    getSessionTokenAsync();
  }, [shopify]);


  if (!showGuide) return <Button onClick={() => setShowGuide(true)}>Show Setup Guide</Button>;

  return (
    <Page title="Get started with Aaxis-Streamline">
      <SetupGuide
        onDismiss={() => {
          setShowGuide(false);
          setItems(ITEMS);
        }}
        onStepComplete={onStepComplete}
        items={items}
      />
    </Page>
  );
}
