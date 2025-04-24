import { loggerService } from '../logger';
import crypto from 'crypto';

/**
 * 密钥管理类
 * 用于生成和管理用于签名和验证token的公钥和私钥
 */
export class KeyManager {
  private static CLASS_NAME = 'KeyManager';
  
  // 私钥 - 在生产环境中应该从环境变量或安全的密钥管理系统中获取
  private static privateKey: string = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCx7EkHjpybuZ3V
dxNNHNPA2ste8gRuMd8ZxFmwWGHtFfzYCGJxCOL6Eo2reBJDLblBXVIwVUJQ8QEK
IMUwfoi9yozMCd3zsrRy00L2sZHIQI1pH2L/x6E43nL1sbV1r3QhmRgNtr6qBNCG
FPYKuSgGwUmsV31SL/YNrr2sM6qoNIOYwCcyveD7UfFQcR9x1Eb0YD5t0AYzJZd8
4jVkvGmA8ltOKU04HaXYRHBmY835VPxE9H2PjOmj4Dp0KvIzst6CY+B4EUBGyIWf
wpT1eYe0Z6196cYbQHGWZf3FXQsNVkkCw6gcFhdPRmGKEqbqi8gqMoJwsHqh+y1K
eOnbn22rAgMBAAECggEAEWem4TlfMpCe0wH5/mIiiMweduQ/8LOqOnANwgVzVuj+
ufdgAeS3p3TnLO3rA21WoQFLB/VfLmHVEzOPdqX6JG7LBS616qABrPXjqBRIyYkf
DDiIy7Kwn8qK/mPq9185ggvi4XyN/D3KVEN6qiPguYBw/43zcXXFoSMF5PGM8TVA
B2gG3xKZUONzqF/zw4J7kIhzpP+fEQrW8Y3xOh/18AMwJLTlQjDZ22Iu9uryS73d
Nbj4Rv0Fds4uC6tcreGM6pPTW2AZGzs81G6oJDQuYA9nm6UBoNrdNc7t6YMORLgm
mJwK4IacFYu/NJI3Yaricu4yCAzQfaEqdmSnVSHNAQKBgQDl5CRbby/eBARzGX7b
yQ9V010YYaqMiwh7k1tGrKcge6P++u0ctxlZkUS+707xGaMeMsI5v1piEeW5o2Ft
uAf4u+gA+wE72x5ywpolmOCJvpF3Pgk2gw4IH9J33DicKByDz6pJBCvK7GqsELhJ
9BeZu1kjIG0gZMQ1iZhgm2sRKwKBgQDGITg8aANk8CoNVeiiozWBZn4CpnhzM4SS
X3Lvg9htZjbqKmI+1fyCajd2pGg7H9F0glEDFhC6xOe9y/qouyY2tgrero8t75+w
aAUSpYoTEwkOy5zJVz+03d+GDYVlM3lywDsiS5Elr7udLt04WawzT+Bm2cr6TmYf
gLPnYKnVgQKBgQCNkW6qN9A8YjDzSFIMusYMzjpYF1zVa5DvuJDO9ud8Y2dcT93Q
fxjHRWQWSHxOkMEYiZ19vk7Ecc0MAoau8FNIYz69y9S4rXkUpq4SVRCBAq/FxJgb
z5zGeAI9+YmK8FCPA0UT7dOiBPCzwSAbuosGCo8byI4rEqKZbYA+jbbjPQKBgEsd
5yNH0Bmh0F+z9XpL5IpF4HqCwOH0Y0vXck0KsLBxc1p+bTcjjBOpz5Nkq7vWyWOh
0LMZ14foBXB4+HSmV8ugYyigB9rDociQ93NlXZ7ztZhta+kN8jJReGBrmeqPhHkU
FpdfDQ27vabPUMH/hYECxLJZ2lHiDWfeNNcBWAKBAoGAUSDCrLNw5gj/hgoAxpJ1
xL0C30EKa7PA2iuePeoRqiLU+xkOcnIfg4Seu+4HUL9sySQRGElWiK/10BIHRgYu
veAbMq/8MzlM2gKDflPM9clhdG1ebVyi2UjKU5CpSjxoiMJ15r8Uq7nzu2uSW8Uz
JkpZti47pIAqLwe8C7ZhOAA=
-----END PRIVATE KEY-----`;

  /**
   * 获取私钥
   */
  public static getPrivateKey(): string {
    return this.privateKey;
  }

  /**
   * 从私钥动态生成公钥
   * 使用Node.js的crypto模块从私钥中生成对应的公钥
   */
  public static getPublicKey(): string {
    try {
      // 从PEM格式的私钥创建key对象
      const privateKey = crypto.createPrivateKey(this.privateKey);
      
      // 从私钥导出公钥
      const publicKey = crypto.createPublicKey(privateKey)
        .export({
          type: 'spki',
          format: 'pem'
        }) as string;
      
      return publicKey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      loggerService.error(`${this.CLASS_NAME}.getPublicKey: 从私钥生成公钥失败`, { error: errorMessage });
      throw new Error(`从私钥生成公钥失败: ${errorMessage}`);
    }
  }
  
  /**
   * 生成新的RSA密钥对 (仅用于开发/测试)
   * 在生产环境中不应该调用此方法
   */
  public static generateKeyPair(): { privateKey: string, publicKey: string } {
    try {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      
      return { privateKey, publicKey };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      loggerService.error(`${this.CLASS_NAME}.generateKeyPair: 生成RSA密钥对失败`, { error: errorMessage });
      throw new Error(`生成RSA密钥对失败: ${errorMessage}`);
    }
  }
}
