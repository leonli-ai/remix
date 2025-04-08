import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ShopifyClientManager } from "../lib/shopify/client";
import { loggerService } from "../lib/logger";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  loggerService.info(`Received ${topic} webhook`, { shop });

  try {
    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already ran, the session may have been deleted previously.
    if (session) {
      // Delete sessions from database
      await db.session.deleteMany({ where: { shop } });
      loggerService.info('Database sessions deleted', { shop });

      // Clear memory cache
      await ShopifyClientManager.clearShopCache(shop);
      loggerService.info('Memory cache cleared', { shop });
    }

    return new Response("Success", { status: 200 });
  } catch (error) {
    loggerService.error("Failed to handle app uninstall", {
      shop,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return new Response("Internal Error", { status: 500 });
  }
};
