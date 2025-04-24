import { ActionFunctionArgs, json } from "@remix-run/node";
import { TokenManager } from "~/lib/auth/token";
import { loggerService } from "~/lib/logger";
import { withCors } from "~/lib/middleware/cors";
import { z } from "zod";
import { authenticate } from "~/shopify.server";

// 请求验证模式
const generateCodeSchema = z.object({
  customerId: z.string(),
  shopId: z.string(),
});

/**
 * 提取请求中的所有可用信息
 */
async function extractRequestDetails(request: Request): Promise<Record<string, any>> {
  // 克隆请求以避免影响原始请求
  const clonedRequest = request.clone();
  
  // 提取基本信息
  const details: Record<string, any> = {
    method: request.method,
    url: request.url,
    headers: {},
    parsedUrl: {
      pathname: new URL(request.url).pathname,
      searchParams: {},
    },
    cookies: {},
    bodyUsed: request.bodyUsed,
    cache: request.cache,
    credentials: request.credentials,
    destination: request.destination,
    integrity: request.integrity,
    keepalive: request.keepalive,
    mode: request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
  };
  
  // 提取所有请求头
  request.headers.forEach((value, key) => {
    details.headers[key] = value;
  });
  
  // 提取所有URL参数
  const url = new URL(request.url);
  url.searchParams.forEach((value, key) => {
    details.parsedUrl.searchParams[key] = value;
  });
  
  // 提取所有cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        details.cookies[name] = value;
      }
    });
  }
  
  // 如果body未被使用，尝试获取body内容（用于调试）
  if (!clonedRequest.bodyUsed) {
    try {
      if (clonedRequest.headers.get('content-type')?.includes('application/json')) {
        details.parsedBody = await clonedRequest.json();
      } else if (clonedRequest.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
        const formData: Record<string, string> = {};
        const form = await clonedRequest.formData();
        form.forEach((value, key) => {
          formData[key] = value.toString();
        });
        details.parsedBody = formData;
      } else if (clonedRequest.headers.get('content-type')?.includes('multipart/form-data')) {
        const formData: Record<string, string> = {};
        const form = await clonedRequest.formData();
        form.forEach((value, key) => {
          formData[key] = value.toString();
        });
        details.parsedBody = formData;
      } else {
        details.parsedBody = await clonedRequest.text();
      }
    } catch (e) {
      details.bodyParseError = e instanceof Error ? e.message : 'Unknown error parsing body';
    }
  } else {
    details.bodyNote = 'Body already used and cannot be read (stream already consumed)';
  }
  
  return details;
}

/**
 * 生成认证码的API
 * 需要Shopify认证
 */
export const action = withCors(async ({ request }: ActionFunctionArgs) => {
  const METHOD = 'api.auth.code.action';

  try {
    // 记录请求的详细信息（在Shopify认证之前）
    console.log('====== DETAILED REQUEST INFO (BEFORE SHOPIFY AUTH) ======');
    const requestDetails = await extractRequestDetails(request);
    console.log('1111111111', JSON.stringify(requestDetails, null, 2));

    // 验证Shopify认证
    const { session } = await authenticate.admin(request);
    
    // 记录Shopify验证后的会话信息
    console.log('====== SHOPIFY AUTH DETAILS ======');
    console.log('Shopify Session:', JSON.stringify({
      shop: session.shop,
      accessToken: session.accessToken ? '******' : undefined,
      scope: session.scope,
      isActive: session.isActive,
      // 只记录session对象上实际存在的属性
      ...(session.id && { id: session.id }),
      ...(session.state && { state: session.state }),
      ...(session.isOnline && { isOnline: session.isOnline }),
    }, null, 2));

    // 记录session的完整属性列表
    console.log('All session properties:', Object.keys(session));
    
    // 记录所有session信息（敏感信息会被隐藏）
    const sessionDetails: Record<string, any> = {};
    // 使用类型安全的方式记录session属性
    Object.entries(session as unknown as Record<string, unknown>).forEach(([key, value]) => {
      if (key === 'accessToken') {
        sessionDetails[key] = value ? '******' : undefined;
      } else {
        sessionDetails[key] = value;
      }
    });
    console.log('Complete session details:', JSON.stringify(sessionDetails, null, 2));

    // 只接受POST请求
    if (request.method !== 'POST') {
      return json({ error: '方法不允许' }, { status: 405 });
    }

    // 记录请求信息
    console.log('Received request to generate code');

    // 解析请求体
    const body = await request.json();

    // 验证请求参数
    const validationResult = generateCodeSchema.safeParse(body);
    if (!validationResult.success) {
      loggerService.warn(`${METHOD}: 请求参数验证失败`, {
        errors: validationResult.error.errors
      });
      return json({ error: '无效的请求参数', details: validationResult.error.errors }, { status: 400 });
    }

    const { customerId, shopId } = validationResult.data;

    // 生成认证码（JWT格式，包含用户信息）
    const code = TokenManager.generateCode(customerId, shopId);

    loggerService.info(`${METHOD}: 成功生成认证码`, {
      customerId,
      shopId
    });

    // 返回认证码
    return json({ code });
  } catch (error: unknown) {
    console.error('====== SHOPIFY AUTH ERROR ======');
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    
    loggerService.error(`${METHOD}: 生成认证码失败`, { error });
    return json({ error: '生成认证码失败' }, { status: 500 });
  }
});
