import crypto from 'crypto';

// Replace this with your actual public key (PEM format)
const publicKey = `-----BEGIN PUBLIC KEY-----
${process.env.ENCRYPTED_PUBLIC_KEY}
-----END PUBLIC KEY-----`;

// Encrypt data with the public key
export function encryptWithPublicKey(cardNumber) {
  const buffer = Buffer.from(cardNumber, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  );
  return encrypted.toString('base64');
}
