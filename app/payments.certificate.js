import { X509Certificate } from 'crypto';
import fs from 'fs';

export const checkCert = (request) => {
  const header = request.headers.get('X-ARR-ClientCert');

// Prepare the client certificate in PEM format
  const clientCertPem = `-----BEGIN CERTIFICATE-----\n${header}\n-----END CERTIFICATE-----`;

// Get the current path
  const currentPath = process.cwd();

// Get the root.pem file
  const rootPem = fs.readFileSync(`${currentPath}/root.pem`, 'utf8');

  const clientCert = new X509Certificate(clientCertPem);
  const caCert = new X509Certificate(rootPem);

// console.log(clientCert);

  return clientCert.checkIssued(caCert)
}
