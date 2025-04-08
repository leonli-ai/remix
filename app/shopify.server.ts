import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { METAFIELD_DEFINITIONS } from "./config/metafields";
import {
  checkMetafieldDefinition,
  createMetafieldDefinition,
  setMetafieldValue,
} from './api/operations/metafield/metafields';
import { loggerService } from "./lib/logger";
import {getShop} from './api/operations/shop/shop';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: process.env.SHOPIFY_API_VERSION as ApiVersion || '2025-01',
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks/app/uninstalled',
    },
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks/app/customers/data_request',
    },
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks/app/customers/redact',
    },
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks/app/shop/redact',
    },
    // APP_SUBSCRIPTIONS_UPDATE: {
    // APP_SUBSCRIPTIONS_UPDATE: {
    //   deliveryMethod: DeliveryMethod.Http,
    //   callbackUrl: '/webhooks/app/subscriptions/update',
    // }
  },
  hooks: {
    afterAuth: async ({ admin, session }) => {
      console.log("afterAuth triggered", { shop: session.shop });
      loggerService.info("afterAuth triggered", { shop: session.shop });

      // Register webhooks
      shopify.registerWebhooks({ session });

      // Register metafield definitions
      for (const definition of METAFIELD_DEFINITIONS) {
        try {
          const existingDefinitions = await checkMetafieldDefinition(admin, definition);

          if (existingDefinitions.length === 0) {
            console.log(`Creating metafield definition: ${definition.namespace}.${definition.key}`);
            loggerService.info(`Creating metafield definition: ${definition.namespace}.${definition.key}`);
            const result = await createMetafieldDefinition(admin, definition);

            if (result.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
              console.error("Failed to create metafield definition:", result.data.metafieldDefinitionCreate.userErrors);
              loggerService.error("Failed to create metafield definition:", result.data.metafieldDefinitionCreate.userErrors);

            } else {
              console.log("Successfully created metafield definition:", result.data.metafieldDefinitionCreate.createdDefinition);
              loggerService.info("Successfully created metafield definition:", result.data.metafieldDefinitionCreate.createdDefinition);
            }
          } else {
            console.warn(`Metafield definition already exists: ${definition.namespace}.${definition.key}`);
            loggerService.warn(`Metafield definition already exists: ${definition.namespace}.${definition.key}`);
          }
        } catch (error) {
          console.error(`Error managing metafield definition ${definition.namespace}.${definition.key}:`, error);
          loggerService.error(`Error managing metafield definition ${definition.namespace}.${definition.key}:`, error);
        }
      }

      try {
        const shop = await getShop(admin);
        if(shop) {
          await setMetafieldValue(admin, {
            value: process.env.SHOPIFY_APP_URL as string,
            key: 'aaxis_streamline_appUrl',
            namespace: 'aaxis_streamline',
            type: 'single_line_text_field',
            ownerId: shop.id
          })
        }else{
          console.error('Error can not get shop:', shop);
          loggerService.error('Error can not get shop:', shop);
        }
      }catch (error) {
        console.error('Error set metafield appUrl value:', error);
        loggerService.error('Error set metafield appUrl value:', error);
      }
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
