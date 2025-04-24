import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useState } from "react";
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigation } from "@remix-run/react";

// 定义响应类型
type TokenData = {
  accessToken: string;
  refreshToken: string;
  customerId: string;
  shopId: string;
  expiresIn: number;
  tokenType: string;
};

type LoaderErrorResponse = {
  success: false;
  error: string;
};

type LoaderSuccessResponse = {
  success: true;
  tokens: TokenData;
};

type LoaderResponse = LoaderErrorResponse | LoaderSuccessResponse;

/**
 * 服务器端加载函数
 * 处理code验证并获取token
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // 如果没有code，返回错误信息
  if (!code) {
    return json<LoaderErrorResponse>({ 
      success: false, 
      error: '缺少认证码，请从Shopify Admin页面重新进入' 
    });
  }

  try {
    // 在服务器端验证code并获取token
    const response = await fetch(`${url.origin}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json<LoaderErrorResponse>({ 
        success: false, 
        error: errorData.error || '验证认证码失败' 
      });
    }

    const tokenData = await response.json();
    
    // 返回验证成功的token信息
    return json<LoaderSuccessResponse>({ 
      success: true, 
      tokens: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        customerId: tokenData.customerId,
        shopId: tokenData.shopId,
        expiresIn: tokenData.expiresIn,
        tokenType: tokenData.tokenType
      }
    });
  } catch (error) {
    console.error('Loader error:', error);
    return json<LoaderErrorResponse>({ 
      success: false, 
      error: error instanceof Error ? error.message : '验证认证码失败' 
    });
  }
}

/**
 * 自定义页面
 * 处理认证流程
 */
export default function CustomPage() {
  const loaderData = useLoaderData<typeof loader>() as LoaderResponse;
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    !loaderData.success ? loaderData.error : null
  );
  const [tokens, setTokens] = useState<TokenData | null>(
    loaderData.success ? loaderData.tokens : null
  );

  // 页面加载时，如果token获取成功，保存到localStorage
  if (loaderData.success && loaderData.tokens) {
    localStorage.setItem('accessToken', loaderData.tokens.accessToken);
    localStorage.setItem('refreshToken', loaderData.tokens.refreshToken);
    localStorage.setItem('customerId', loaderData.tokens.customerId);
    localStorage.setItem('shopId', loaderData.tokens.shopId);
  }

  // 刷新token
  const handleRefreshToken = async () => {
    try {
      setLoading(true);
      setError(null);

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
      setTokens(prev => prev ? {
        ...prev,
        accessToken: data.accessToken
      } : null);

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
      setError(null);

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

  // 导航过程中显示加载中
  const isLoading = navigation.state === "loading" || loading;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">自定义页面</h1>

        {isLoading && (
          <div className="mb-4">
            <p>加载中...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        {tokens && (
          <div className="mb-4">
            <p className="text-green-600 font-semibold mb-2">认证成功！</p>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Token信息:</h3>
              <p><strong>客户ID:</strong> {tokens.customerId}</p>
              <p><strong>商店ID:</strong> {tokens.shopId}</p>
              <p><strong>访问Token:</strong> {tokens.accessToken.substring(0, 20)}...</p>
              <p><strong>刷新Token:</strong> {tokens.refreshToken.substring(0, 20)}...</p>
              <p><strong>过期时间:</strong> {tokens.expiresIn}秒</p>
            </div>

            <div className="flex gap-4 mt-4">
              <Button onClick={handleRefreshToken} disabled={isLoading}>
                刷新Token
              </Button>
              <Button onClick={handleCallApi} disabled={isLoading}>
                调用API示例
              </Button>
            </div>
          </div>
        )}

        {!tokens && !isLoading && !error && (
          <p>未检测到有效的认证码，请从Shopify Admin页面重新进入。</p>
        )}
      </Card>
    </div>
  );
}
