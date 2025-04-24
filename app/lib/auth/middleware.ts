import { loggerService } from '../logger';
import { TokenManager, TokenType } from './token';
import { json } from '@remix-run/node';

/**
 * 验证访问令牌的中间件
 * @param request 请求对象
 * @returns 验证结果，包含Token载荷
 */
export async function verifyAccessToken(request: Request) {
  const METHOD = 'verifyAccessToken';
  try {
    // 从请求头中获取Authorization
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      loggerService.warn(`${METHOD}: 缺少Authorization头或格式不正确`, {
        authHeader: authHeader || 'null'
      });
      throw json({ message: '未授权访问' }, { status: 401 });
    }
    
    // 提取token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      loggerService.warn(`${METHOD}: Token为空`);
      throw json({ message: '未授权访问' }, { status: 401 });
    }
    
    // 验证token
    const payload = TokenManager.verifyToken(token);
    
    // 检查token类型
    if (payload.type !== TokenType.ACCESS) {
      loggerService.warn(`${METHOD}: Token类型不正确`, {
        expectedType: TokenType.ACCESS,
        actualType: payload.type
      });
      throw json({ message: '无效的Token类型' }, { status: 401 });
    }
    
    return payload;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    loggerService.error(`${METHOD}: 验证访问令牌失败`, { error });
    throw json({ message: '未授权访问' }, { status: 401 });
  }
}
