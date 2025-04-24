import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Button,
  Box,
  Card,
  Page,
  Layout,
  Text,
  BlockStack,
  InlineStack
} from "@shopify/polaris";
import { getSessionToken } from '@shopify/app-bridge/utilities';
import { authenticate } from "../shopify.server";
import { useAppBridge, useNavigate } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import createApp, { ClientApplication } from "@shopify/app-bridge";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    return { shop: session.shop };
  } catch (error) {
    console.error("Error authenticating admin:", error.message);
    // Additional error details might be available in the error object
  }
};

export default function Index() {
  const { shop } = useLoaderData<typeof loader>();
  const app = useAppBridge();
  const [generatingCode, setGeneratingCode] = useState(false);

  // 生成认证码并跳转到自定义页面
  const handleRedirect = async () => {
    try {
      setGeneratingCode(true);

      // 获取Shopify会话token
      // const sessionToken = await getSessionToken(app);

      // 调用生成认证码的API
      const response = await fetch('/api/auth/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          customerId: 'customer123', // 这里应该是实际的客户ID
          shopId: shop
        })
      });

      if (!response.ok) {
        throw new Error('生成认证码失败');
      }

      const data = await response.json();

      // 跳转到自定义页面，带上认证码
      window.location.href = `/apps/test?code=${data.code}`;
    } catch (error) {
      console.error('跳转失败:', error);
      alert('跳转失败，请重试');
    } finally {
      setGeneratingCode(false);
    }
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">欢迎使用Shopify Admin集成</Text>
              <Text>点击下方按钮跳转到自定义页面，将自动生成认证码用于后续的权限验证。</Text>
              <InlineStack gap="300">
                <Button
                  primary
                  onClick={handleRedirect}
                  loading={generatingCode}
                >
                  跳转到自定义页面
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
