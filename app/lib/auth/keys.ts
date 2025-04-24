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
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC64nAbwIDnPFmd
qaIcJH/3azAJ5LGbu462xxt4Ey01KfUdHk1O9Usu+nc/R5Y3UHIVHtZMkSYALKso
yEPpugv4S2qF1kS2pcAVhWsEYu2lY8k/Jq5VZTyQNUw9FYgCd4f7roiHBiwXirEU
c9sECs9aIFwxMHi5DVaMbTtm3cx6wLgmOXUUXOJCtudpdbwZpaCerFEdh4Yte3oV
gep1m4AiMdHQgWyXAvliNNpmlZPlibL0OMipY9tsfXSCeWQFDwCIThsu9PFFoLuX
mFf8ipiZRN67E2up9OQfGf50FEwzatlBrl2AzHS9x+4XIrc39OqilWgDifGAmTAM
VEJ6kwYPAgMBAAECggEAOAuMX2Y9whsBLR0gNpxjnAmTIIRrFy8KP5o6jKoDlrv8
fD0IJjO91lraxCltzSzc6aST0+Z7pPXAZryYUVGwIUhMq9J0TOosTsfyLiCU8FKa
mcu54HY50W2KbY81eLfsGfhfjU62jmDTdjTAa9fqEzc9LqtAqQ5s9DQV6mV92xnJ
K6E3pbJtdvoXMdJMoM5CVaP6nIDBvX3N/699h73ua9Rq6thWjzGkuwe2doTnC6Ms
w2r3VIv83iRVaE0E+SBCPulX9TrKS91WUsx8bpbBVvhTarOFbvN5MiTR5y5uHvj/
iv8NPbFRGLhWr6FqUkRLr3Tyhsdzo1pbZ/lNKAzBsQKBgQDpAjb1Ut6hHnSBQ5Sp
QE6ommwC4FmPCDrTvlypMxwA0VY/DbgWa1v5vCbORFtcsthlGkNlkGRAtTNwDQb1
cSPQqCdOAwGY32sY6pJw0B0X6FK/JZUXrfuN9JxLHpA+/TSJQtCPN2Pq3msupzTz
Fgut44Q86URU6PWV2yoNYT6i4wKBgQDNUyFg5mFFXp5huHJnjSfut8MnptLCQmi/
lxSeZqMomKR3ZCdwfOAuS/CXNxot0A/WOA6e1pP/I7+dtOagnogFMHidhHywzoVt
HSkiMLyX7pYHeUSzxDa1xuYpwqnwOaLijoc11BhKzae6uPKPYkzhun/8+G6wLAYX
DHNDzMs75QKBgB04vOG5WdhE9IF9kzhCq1qzuxYFQtYQRyhk+EPz9/AWUMWpl8uf
/THtqcQ2iGqwtzi+uXMUT65ZyzCjQZsobEBvxjYfZGTiqBDA4kqpnuxvo2j7cp48
oI6l/a/iDl8H7D3GlldPsAU1jaWVLKvLuP0+ykfFTV+Es7/uc3CoIG3XAoGBAI3p
5EsmUJrywAOIycIaxTvw1Tkly8wqvF2X3c9x31mizyIaHkxYc1ZsdHj/w99gTGHi
0vAkHZyeJ8WoEDN5/0ee7e7pcIl/5Ka7HgAcsW1NoXK+9aZOewX+2HyKqIx6OcPf
gULKOpQROtoLFNPXvI3UKrw9NbwcYYUyvMRi2yGlAoGBAJ2wpuD6K1JXbQhYVjZp
VfqCgIlyLwFJO8zFvwpl4uDFKLTpEHxuXSwTAFferCsYvCP6LDlIBkAK7DmlCM/6
kcB3f16GzhzymKnerA4qy/hF3GTos+FN+OdSC7doMiES/PR1iz03gTskzLbK1pcH
8BonROjMhFKPOqYTIqjKx1uTJ
-----END PRIVATE KEY-----`;

  // 对应的公钥
  private static publicKey: string = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuuJwG8CA5zxZnamiHCR/
92swCeSxm7uOtscbeBMtNSn1HR5NTvVLLvp3P0eWN1ByFR7WTJEmACyrKMhD6boL
+EtqhdZEtqXAFYVrBGLtpWPJPyauVWU8kDVMPRWIAneH+66IhwYsF4qxFHPbBArP
WiBcMTB4uQ1WjG07Zt3MesC4Jjl1FFziQrbnaXW8GaWgnqxRHYeGLXt6FYHqdZuA
IjHR0IFslwL5YjTaZpWT5Ymy9DjIqWPbbH10gnlkBQ8AiE4bLvTxRaC7l5hX/IqY
mUTeuxNrqfTkHxn+dBRMM2rZQa5dgMx0vcfuFyK3N/TqopVoA4nxgJkwDFRCepMG
DwIDAQAB
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
