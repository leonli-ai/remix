import { ActionFunctionArgs, json } from "@remix-run/node";
import { TokenManager, TokenType } from "~/lib/auth/token";
import { loggerService } from "~/lib/logger";
import { withCors } from "~/lib/middleware/cors";
import { z } from "zod";

// 请求验证模式
const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

/**
 * 刷新token的API
 * 不需要Shopify认证
 */
export const action = withCors(async ({ request }: ActionFunctionArgs) => {
  const METHOD = 'api.auth.refresh.action';

  try {
    // 只接受POST请求
    if (request.method !== 'POST') {
      return json({ error: '方法不允许' }, { status: 405 });
    }

    // 解析请求体
    const body = await request.json();

    // 验证请求参数
    const validationResult = refreshTokenSchema.safeParse(body);
    if (!validationResult.success) {
      loggerService.warn(`${METHOD}: 请求参数验证失败`, {
        errors: validationResult.error.errors
      });
      return json({ error: '无效的请求参数', details: validationResult.error.errors }, { status: 400 });
    }

    const { refreshToken } = validationResult.data;

    try {
      // 验证刷新token
      const payload = TokenManager.verifyToken(refreshToken);

      // 检查token类型
      if (payload.type !== TokenType.REFRESH) {
        loggerService.warn(`${METHOD}: token类型不正确`, {
          expectedType: TokenType.REFRESH,
          actualType: payload.type
        });
        return json({ error: '无效的token类型' }, { status: 400 });
      }

      // 生成新的访问token
      const newAccessToken = TokenManager.generateAccessToken({
        customerId: payload.customerId,
        shopId: payload.shopId
      });

      loggerService.info(`${METHOD}: 成功刷新token`, {
        customerId: payload.customerId,
        shopId: payload.shopId
      });

      // 返回新token
      return json({
        accessToken: newAccessToken,
        expiresIn: 3600, // 1小时，单位秒
        tokenType: 'Bearer',
        customerId: payload.customerId,
        shopId: payload.shopId
      });
    } catch (error) {
      loggerService.error(`${METHOD}: 验证token失败`, { error });
      return json({ error: '无效的token' }, { status: 400 });
    }
  } catch (error) {
    loggerService.error(`${METHOD}: 刷新token失败`, { error });
    return json({ error: '刷新token失败' }, { status: 500 });
  }
});
