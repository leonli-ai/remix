// 独立的JWT测试脚本
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// 生成一个新的RSA密钥对
try {
  console.log('生成新的RSA密钥对...');
  
  // 生成RSA密钥对
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
  
  console.log('私钥和公钥生成成功');
  
  // 测试数据
  const payload = {
    customerId: 'test123',
    shopId: 'shop123',
    type: 'code'
  };
  
  // 使用私钥签名
  console.log('使用RS256算法签名JWT...');
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: 600 // 10分钟
  });
  
  console.log('JWT生成成功:', token.substring(0, 20) + '...');
  
  // 使用公钥验证
  console.log('验证JWT...');
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ['RS256']
  });
  
  console.log('JWT验证成功:', JSON.stringify(decoded, null, 2));
  
  // 显示密钥（仅用于测试）
  console.log('\n私钥前30个字符:');
  console.log(privateKey.substring(0, 30) + '...');
  
  console.log('\n公钥前30个字符:');
  console.log(publicKey.substring(0, 30) + '...');
  
  // 结果
  console.log('\n测试结果: 成功! ✅');
  console.log('你可以使用这个新生成的私钥替换app/lib/auth/keys.ts中的privateKey');
} catch (error) {
  console.error('测试失败:', error instanceof Error ? error.message : error);
} 