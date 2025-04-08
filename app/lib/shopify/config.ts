export const SHOPIFY_CONFIG = {
  API_KEY: process.env.SHOPIFY_BACKEND_API_KEY || '',
  API_SECRET: process.env.SHOPIFY_BACKEND_API_SECRET || '',
  SCOPES: (process.env.SCOPES || '').split(','),
  STORE_DOMAIN: process.env.SHOPIFY_BACKEND_STORE_DOMAIN || '',
  ACCESS_TOKEN: process.env.SHOPIFY_BACKEND_ACCESS_TOKEN || '',
  APP_URL: process.env.SHOPIFY_BACKEND_APP_URL || '',
  API_VERSION: process.env.SHOPIFY_BACKEND_API_VERSION || '2025-01' // Use the latest stable version
};
