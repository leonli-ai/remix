import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { TokenManager } from "~/lib/auth/token";
import { loggerService } from "~/lib/logger";
import { withCors } from "~/lib/middleware/cors";
import { z } from "zod";

// 请求验证模式
const generateCodeSchema = z.object({
  customerId: z.string(),
  shopId: z.string(),
});

/**
 * 生成认证码的API
 * 需要Shopify认证
 */
export const action = withCors(async ({ request }: ActionFunctionArgs) => {
  const METHOD = 'api.auth.code.action';

  try {
    // 验证Shopify认证
    const { session } = await authenticate.admin(request);

    // 只接受POST请求
    if (request.method !== 'POST') {
      return json({ error: '方法不允许' }, { status: 405 });
    }

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
  } catch (error) {
    loggerService.error(`${METHOD}: 生成认证码失败`, { error });
    return json({ error: '生成认证码失败' }, { status: 500 });
  }
});
