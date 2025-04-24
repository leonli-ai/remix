import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useSearchParams } from "@remix-run/react";

/**
 * 自定义页面
 * 处理认证流程
 */
export default function CustomPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
    customerId: string;
    shopId: string;
  } | null>(null);

  // 从URL中获取认证码并验证
  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('缺少认证码，请从Shopify Admin页面重新进入');
      return;
    }

    // 验证认证码并获取token
    const verifyCode = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '验证认证码失败');
        }

        const data = await response.json();

        // 保存token到状态
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          customerId: data.customerId,
          shopId: data.shopId
        });

        // 保存token到localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('customerId', data.customerId);
        localStorage.setItem('shopId', data.shopId);

        setAuthenticated(true);
      } catch (error) {
        console.error('验证认证码失败:', error);
        setError(error instanceof Error ? error.message : '验证认证码失败');
      } finally {
        setLoading(false);
      }
    };

    verifyCode();
  }, [searchParams]);

  // 刷新token
  const handleRefreshToken = async () => {
    try {
      setLoading(true);

      // 从localStorage获取刷新token
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('刷新token不存在，请重新登录');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '刷新token失败');
      }

      const data = await response.json();

      // 更新token
      setTokens(prev => ({
        ...prev!,
        accessToken: data.accessToken
      }));

      // 更新localStorage
      localStorage.setItem('accessToken', data.accessToken);

      alert('刷新token成功');
    } catch (error) {
      console.error('刷新token失败:', error);
      setError(error instanceof Error ? error.message : '刷新token失败');
    } finally {
      setLoading(false);
    }
  };

  // 调用API示例
  const handleCallApi = async () => {
    try {
      setLoading(true);

      // 从localStorage获取访问token
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('访问token不存在，请重新登录');
      }

      // 调用测试API
      const response = await fetch('/api/auth/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || '调用API失败');
      }

      const data = await response.json();

      // 显示API调用结果
      alert(`API调用成功！\n\n客户ID: ${data.customerId}\n商店ID: ${data.shopId}\n时间戳: ${data.timestamp}`);
    } catch (error) {
      console.error('API调用失败:', error);
      setError(error instanceof Error ? error.message : 'API调用失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">自定义页面</h1>

        {loading && (
          <div className="mb-4">
            <p>加载中...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        {authenticated && (
          <div className="mb-4">
            <p className="text-green-600 font-semibold mb-2">认证成功！</p>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Token信息:</h3>
              <p><strong>客户ID:</strong> {tokens?.customerId}</p>
              <p><strong>商店ID:</strong> {tokens?.shopId}</p>
              <p><strong>访问Token:</strong> {tokens?.accessToken.substring(0, 20)}...</p>
              <p><strong>刷新Token:</strong> {tokens?.refreshToken.substring(0, 20)}...</p>
            </div>

            <div className="flex gap-4 mt-4">
              <Button onClick={handleRefreshToken} disabled={loading}>
                刷新Token
              </Button>
              <Button onClick={handleCallApi} disabled={loading}>
                调用API示例
              </Button>
            </div>
          </div>
        )}

        {!authenticated && !loading && !error && (
          <p>正在验证认证码...</p>
        )}
      </Card>
    </div>
  );
}
