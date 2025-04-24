import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Button,
  Card,
  Page,
  Layout,
  Text,
  BlockStack,
  InlineStack
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    return { shop: session.shop };
  } catch (error) {
    console.error("Error authenticating admin:", error instanceof Error ? error.message : 'Unknown error');
    // Additional error details might be available in the error object
    throw error;
  }
};

export default function Index() {
  const { shop } = useLoaderData<typeof loader>();
  const [generatingCode, setGeneratingCode] = useState(false);

  // 生成认证码并跳转到自定义页面
  const handleRedirect = async () => {
    try {
      setGeneratingCode(true);

      console.log('Generating code for shop:', shop);

      // 调用生成认证码的API
      const response = await fetch('/api/auth/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: 'customer123', // 这里应该是实际的客户ID
          shopId: shop || 'default-shop.myshopify.com' // 提供默认值，以防shop为空
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`生成认证码失败: ${errorData.error || '未知错误'}`);
      }

      const data = await response.json();

      // 使用Link组件的方式跳转
      if (window.top) {
        window.top.location.href = `/apps/test?code=${data.code}`;
      } else {
        window.location.href = `/apps/test?code=${data.code}`;
      }
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
              <Text as="p">点击下方按钮跳转到自定义页面，将自动生成认证码用于后续的权限验证。</Text>
              <InlineStack gap="300">
                <Button
                  variant="primary"
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
