import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useState, useEffect } from "react";
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

// 客户端专用的存储助手
const clientStorage = {
  // 检查是否在客户端环境
  isClient: () => typeof window !== 'undefined' && typeof localStorage !== 'undefined',
  
  // 从 localStorage 获取数据
  getItem: (key: string): string | null => {
    if (!clientStorage.isClient()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return null;
    }
  },
  
  // 保存数据到 localStorage
  setItem: (key: string, value: string): boolean => {
    if (!clientStorage.isClient()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  },
  
  // 保存token信息到localStorage
  saveTokens: (tokens: TokenData): void => {
    if (!clientStorage.isClient()) return;
    try {
      clientStorage.setItem('accessToken', tokens.accessToken);
      clientStorage.setItem('refreshToken', tokens.refreshToken);
      clientStorage.setItem('customerId', tokens.customerId);
      clientStorage.setItem('shopId', tokens.shopId);
    } catch (error) {
      console.error('Failed to save tokens to localStorage:', error);
    }
  }
};

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
  
  // 标记组件是否已挂载（客户端）
  const [isMounted, setIsMounted] = useState(false);
  
  // 组件挂载时设置标记并保存token
  useEffect(() => {
    setIsMounted(true);
    
    // 如果有token数据，保存到localStorage
    if (loaderData.success && loaderData.tokens) {
      clientStorage.saveTokens(loaderData.tokens);
    }
  }, [loaderData]);

  // 刷新token
  const handleRefreshToken = async () => {
    if (!clientStorage.isClient()) return; // 确保只在客户端执行
    
    try {
      setLoading(true);
      setError(null);

      // 从localStorage获取刷新token
      const refreshToken = clientStorage.getItem('refreshToken');

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
      clientStorage.setItem('accessToken', data.accessToken);

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
    if (!clientStorage.isClient()) return; // 确保只在客户端执行
    
    try {
      setLoading(true);
      setError(null);

      // 从localStorage获取访问token
      const accessToken = clientStorage.getItem('accessToken');

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

  // 只在客户端渲染按钮
  const renderClientButtons = () => {
    if (!isMounted) return null;
    
    return (
      <div className="flex gap-4 mt-4">
        <Button onClick={handleRefreshToken} disabled={isLoading}>
          刷新Token
        </Button>
        <Button onClick={handleCallApi} disabled={isLoading}>
          调用API示例
        </Button>
      </div>
    );
  };

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

            {renderClientButtons()}
          </div>
        )}

        {!tokens && !isLoading && !error && (
          <p>未检测到有效的认证码，请从Shopify Admin页面重新进入。</p>
        )}
      </Card>
    </div>
  );
}
