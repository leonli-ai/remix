import { ActionFunctionArgs, json } from "@remix-run/node";
import { verifyAccessToken } from "~/lib/auth/middleware";
import { loggerService } from "~/lib/logger";
import { withCors } from "~/lib/middleware/cors";

/**
 * 测试API
 * 需要访问token认证
 */
export const action = withCors(async ({ request }: ActionFunctionArgs) => {
  const METHOD = 'api.auth.test.action';
  
  try {
    // 验证访问token
    const payload = await verifyAccessToken(request);
    
    // 只接受GET请求
    if (request.method !== 'GET') {
      return json({ error: '方法不允许' }, { status: 405 });
    }
    
    loggerService.info(`${METHOD}: 成功访问测试API`, {
      customerId: payload.customerId,
      shopId: payload.shopId
    });
    
    // 返回成功信息
    return json({
      message: '认证成功',
      customerId: payload.customerId,
      shopId: payload.shopId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    
    loggerService.error(`${METHOD}: 访问测试API失败`, { error });
    return json({ error: '访问测试API失败' }, { status: 500 });
  }
});

/**
 * 处理GET请求
 */
export const loader = withCors(async ({ request }: ActionFunctionArgs) => {
  return action({ request, params: {}, context: {} });
});
