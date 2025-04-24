import { ActionFunctionArgs, json } from "@remix-run/node";
import { TokenManager, TokenType } from "~/lib/auth/token";
import { loggerService } from "~/lib/logger";
import { withCors } from "~/lib/middleware/cors";
import { z } from "zod";

// 请求验证模式
const verifyCodeSchema = z.object({
  code: z.string(),
});

/**
 * 验证认证码并生成token的API
 * 不需要Shopify认证
 */
export const action = withCors(async ({ request }: ActionFunctionArgs) => {
  const METHOD = 'api.auth.token.action';

  try {
    // 只接受POST请求
    if (request.method !== 'POST') {
      return json({ error: '方法不允许' }, { status: 405 });
    }

    // 解析请求体
    const body = await request.json();

    // 验证请求参数
    const validationResult = verifyCodeSchema.safeParse(body);
    if (!validationResult.success) {
      loggerService.warn(`${METHOD}: 请求参数验证失败`, {
        errors: validationResult.error.errors
      });
      return json({ error: '无效的请求参数', details: validationResult.error.errors }, { status: 400 });
    }

    const { code } = validationResult.data;

    try {
      // 验证认证码JWT
      const codePayload = TokenManager.verifyToken(code);

      // 检查token类型
      if (codePayload.type !== TokenType.CODE) {
        loggerService.warn(`${METHOD}: 认证码类型不正确`, {
          expectedType: TokenType.CODE,
          actualType: codePayload.type
        });
        return json({ error: '无效的认证码类型' }, { status: 400 });
      }

      // 生成token
      const accessToken = TokenManager.generateAccessToken({
        customerId: codePayload.customerId,
        shopId: codePayload.shopId
      });

      const refreshToken = TokenManager.generateRefreshToken({
        customerId: codePayload.customerId,
        shopId: codePayload.shopId
      });

      loggerService.info(`${METHOD}: 成功生成token`, {
        customerId: codePayload.customerId,
        shopId: codePayload.shopId
      });

      // 返回token
      return json({
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1小时，单位秒
        tokenType: 'Bearer',
        customerId: codePayload.customerId,
        shopId: codePayload.shopId
      });
    } catch (error) {
      loggerService.warn(`${METHOD}: 认证码验证失败`, {
        error,
        code: code.substring(0, 20) + '...'
      });
      return json({ error: '无效的认证码' }, { status: 400 });
    }
  } catch (error) {
    loggerService.error(`${METHOD}: 生成token失败`, { error });
    return json({ error: '生成token失败' }, { status: 500 });
  }
});
