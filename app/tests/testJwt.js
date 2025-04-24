import { KeyManager } from '../lib/auth/keys.js';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';

// 用于导入 CommonJS 模块
const require = createRequire(import.meta.url);

// 测试JWT签名和验证
try {
  // 获取密钥
  const privateKey = KeyManager.getPrivateKey();
  const publicKey = KeyManager.getPublicKey();
  
  console.log('Private key retrieved successfully');
  console.log('Public key generated successfully');
  
  // 测试数据
  const payload = {
    customerId: 'test123',
    shopId: 'shop123',
    type: 'code'
  };
  
  // 使用私钥签名
  console.log('Signing JWT with RS256...');
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: 600 // 10分钟
  });
  
  console.log('JWT 生成成功:', token.substring(0, 20) + '...');
  
  // 使用公钥验证
  console.log('验证JWT...');
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ['RS256']
  });
  
  console.log('JWT 验证成功:', JSON.stringify(decoded));
  
  // 结果
  console.log('测试结果: 成功! ✅');
} catch (error) {
  console.error('测试失败:', error instanceof Error ? error.message : error);
} 