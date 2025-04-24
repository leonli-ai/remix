import { loggerService } from '../logger';
import { KeyManager } from './keys';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Token类型
 */
export enum TokenType {
  CODE = 'code',
  ACCESS = 'access',
  REFRESH = 'refresh'
}

/**
 * Token信息接口
 */
export interface TokenPayload {
  customerId: string;
  shopId: string;
  type: TokenType;
  [key: string]: any;
}

/**
 * Token管理类
 * 用于生成和验证token
 */
export class TokenManager {
  private static CLASS_NAME = 'TokenManager';

  // Token过期时间（秒）
  private static CODE_TOKEN_EXPIRY = 60 * 10; // 10分钟
  private static ACCESS_TOKEN_EXPIRY = 60 * 60; // 1小时
  private static REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7天

  /**
   * 生成认证码
   * @param customerId 客户ID
   * @param shopId 商店ID
   * @returns 认证码JWT
   */
  public static generateCode(customerId: string, shopId: string): string {
    const METHOD = 'generateCode';
    try {
      // 生成随机字符串作为nonce，增加安全性
      const randomBytes = crypto.randomBytes(16);
      const nonce = randomBytes.toString('hex');

      // 使用JWT作为认证码，包含用户信息
      const code = this.generateToken({
        customerId,
        shopId,
        nonce,
        type: TokenType.CODE
      }, this.CODE_TOKEN_EXPIRY);

      // 记录日志
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: 生成认证码成功`, {
        customerId,
        shopId
      });

      return code;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: 生成认证码失败`, {
        error,
        customerId,
        shopId
      });
      throw new Error('生成认证码失败');
    }
  }

  /**
   * 生成访问令牌
   * @param payload Token载荷
   * @returns 访问令牌
   */
  public static generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
    return this.generateToken({
      ...payload,
      type: TokenType.ACCESS
    }, this.ACCESS_TOKEN_EXPIRY);
  }

  /**
   * 生成刷新令牌
   * @param payload Token载荷
   * @returns 刷新令牌
   */
  public static generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
    return this.generateToken({
      ...payload,
      type: TokenType.REFRESH
    }, this.REFRESH_TOKEN_EXPIRY);
  }

  /**
   * 生成Token
   * @param payload Token载荷
   * @param expiresIn 过期时间（秒）
   * @returns 生成的Token
   */
  private static generateToken(payload: TokenPayload, expiresIn: number): string {
    const METHOD = 'generateToken';
    try {
      const privateKey = KeyManager.getPrivateKey();

      const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: 生成Token成功`, {
        type: payload.type,
        customerId: payload.customerId,
        shopId: payload.shopId
      });

      return token;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: 生成Token失败`, {
        error,
        type: payload.type,
        customerId: payload.customerId,
        shopId: payload.shopId
      });
      throw new Error(`生成${payload.type} token失败`);
    }
  }

  /**
   * 验证Token
   * @param token 要验证的Token
   * @returns 验证结果，包含Token载荷
   */
  public static verifyToken(token: string): TokenPayload {
    const METHOD = 'verifyToken';
    try {
      const publicKey = KeyManager.getPublicKey();

      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256']
      }) as TokenPayload;

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: 验证Token成功`, {
        type: decoded.type,
        customerId: decoded.customerId,
        shopId: decoded.shopId
      });

      return decoded;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: 验证Token失败`, {
        error,
        token: token.substring(0, 10) + '...'
      });
      throw new Error('无效的Token');
    }
  }
}
