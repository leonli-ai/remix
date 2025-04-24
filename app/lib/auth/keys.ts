import { loggerService } from '../logger';

/**
 * 密钥管理类
 * 用于生成和管理用于签名和验证token的公钥和私钥
 */
export class KeyManager {
  private static CLASS_NAME = 'KeyManager';

  // 直接在代码中定义一个固定的私钥（仅用于开发环境）
  // 在生产环境中，应该从环境变量或安全的密钥管理系统中获取
  private static privateKey: string = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu
NMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ
agLQnAHd2dQZQIqcnNVLCbhxq/wKLCxT0yL5HwMHcte1XLXgCnHl9tPaz9z7Ux1o
2eLOTw1m+jW+WcdXzt3ZWyPPZPwHCZNZgT4/ng+mwmKiM5ik6X8RCLxOuimj/sOA
nV8TGvUkttVJgUEHIojUWBiXXYJ4xHYxG93eTv/GbGc4A2zWlMPfcGLxAoGBAOVf
SKN9YBOWHrBzqFfM7+AXYQf2I4DPutFk9B4tjZuVw5ZV8ZGdwwSrz92/p2DAE8jW
Xh8M5UAyCILNkLYYYDAYU7TfGk0dHx/KWQa6NXCJPPsSPQIJk2hHZBiHOniIoDBl
NQ4JUHNYNICaG8g5AUjBdNfPdX9NIe8B8azO/yyDAoGBANDkJw9R6Bg3/9zQHwA4
s/jgGGnYbwE673KwgkEZJmjHDQlgHn2SY9drrE+SBQfCK6Sd5QtzLiGAeUvRdP9K
uf/9QZCEiUQcQMziL4CMXsqSAk2q8KRPOn8vWvHHVBxM4Y0T7RQpPGnMphYRjOlg
gYehqQ+QhQP0aUQQMLuPSdOtAoGAQA7JJQrQqPDOHhQJe/PxOD4Hy5Ae2be3Xc+L
FiKrLKH2qcT8WqvCpEMpqUZ9Okmx4A1jXE7jZS5wPTIVTpLwzrXfkM4+FDVKbhSK
j1W7c5++5XTxLqAVQkiL9oQUEcRzZzxZ1+1xAIylmCTJQjgh7p/lCQoYmfCHbVeL
fp/Ng9MCgYEAyUHqBEHo8VRbGkPGQzjOIpzCVBJmkbOUMbkPjDt+zln+Ozlb8PWA
RLUD2wXLqJDUXm5H7m+qQbGzYHEBPCULmQfBUCvMQGp9bUdyA+Qbj8qzzS0o+vWm
43pUr0YRoHS2AoHMp+A0gDdaqVxhcP48hO6xIJQPRpd/MdmLoy7NXAECgYEAveRB
Fvjl9+R7ayIYvGZQ/7WkWvgCQoG2ENM90+CFMKod1tjCW4uXElz4zRFk0tml3A1j
v8FLhfqg6YK3D5NVbKVJYKVU1fYL0mcEYdpHJHnPrXBm/PzCRyKCvRQCZGRqCdHd
K4CT+tEqAdDJZCZ3/QzXsQxXXu2yfzJLQEYz9/M=
-----END PRIVATE KEY-----`;

  // 对应的公钥
  private static publicKey: string = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWWoC0JwB
3dnUGUCKnJzVSwm4cav8CiwsU9Mi+R8DB3LXtVy14Apx5fbT2s/c+1MdaNnizk8N
Zvo1vlnHV87d2Vsjz2T8BwmTWYE+P54PpsJiojOYpOl/EQi8Tropo/7DgJ1fExr1
JLbVSYFBByKI1FgYl12CeMR2MRvd3k7/xmxnOANs1pTD33Bi8QIDAQAB
-----END PUBLIC KEY-----`;

  /**
   * 获取私钥
   */
  public static getPrivateKey(): string {
    return this.privateKey;
  }

  /**
   * 获取公钥
   */
  public static getPublicKey(): string {
    return this.publicKey;
  }
}
