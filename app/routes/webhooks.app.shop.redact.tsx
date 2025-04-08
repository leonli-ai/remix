import type { ActionFunctionArgs } from "@remix-run/node";
import { ComplianceType } from "@prisma/client";
import { z } from "zod";
import { ComplianceService } from "../lib/services/compliance-service";
import { WebhookService } from "../lib/services/webhook-service";
import { loggerService } from "../lib/logger";

// Define the webhook payload schema using Zod - using flexible validation to handle Shopify's actual payloads
const ShopRedactSchema = z.object({
  shop_id: z.number(),
  shop_domain: z.string(),
});

// Create a type conversion function to ensure compatibility with WebhookService
const asWebhookPayload = (data: z.infer<typeof ShopRedactSchema>) => {
  return {
    shop_id: data.shop_id,
    shop_domain: data.shop_domain
  };
};

type ShopRedactRequest = z.infer<typeof ShopRedactSchema>;

export const action = async ({ request }: ActionFunctionArgs) => {
  loggerService.info("Received shop redact webhook", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries([...request.headers.entries()])
  });
  
  return WebhookService.processWebhook({
    request,
    schema: ShopRedactSchema,
    requestType: ComplianceType.SHOP_REDACT,
    processPayload: async ({ payload, complianceRequestId }) => {
      loggerService.info("Processing shop redact payload", { 
        payload: JSON.stringify(payload),
        complianceRequestId 
      });
      // Use type conversion function to ensure type compatibility
      const safePayload = asWebhookPayload(payload);
      await processShopDataRedaction(safePayload, complianceRequestId);
    },
  });
};

async function processShopDataRedaction(
  request: ReturnType<typeof asWebhookPayload>,
  complianceRequestId: string
): Promise<void> {
  const shop = request.shop_domain;
  
  loggerService.info("Starting shop data redaction process", {
    shop,
    shopId: request.shop_id,
    complianceRequestId
  });
  
  try {
    // Log initial redaction request
    await ComplianceService.logAction(
      complianceRequestId,
      "SHOP_REDACT_RECEIVED",
      {
        shop,
        shopId: request.shop_id
      }
    );

    loggerService.info("Processing shop session deletion", { shop });
    // Log session data deletion
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_DELETE_SESSIONS",
      {
        shop
      }
    );

    loggerService.info("Processing all customer data deletion", { shop });
    // Log customer data deletion
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_DELETE_ALL_CUSTOMER_DATA",
      {
        shop
      }
    );

    loggerService.info("Processing all order data deletion", { shop });
    // Log order data deletion
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_DELETE_ALL_ORDER_DATA",
      {
        shop
      }
    );

    loggerService.info("Processing company mappings deletion", { shop });
    // Log company mapping data deletion
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_DELETE_COMPANY_MAPPINGS",
      {
        shop
      }
    );

    loggerService.info("Processing shopping lists deletion", { shop });
    // Log shopping list data deletion
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_DELETE_SHOPPING_LISTS",
      {
        shop
      }
    );

    loggerService.info("Processing role assignments deletion", { shop });
    // Log role assignments deletion
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_DELETE_ROLE_ASSIGNMENTS",
      {
        shop
      }
    );

    loggerService.info("Processing cache cleanup", { shop });
    // Log cache cleanup
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_CLEAR_CACHE",
      {
        shop
      }
    );

    loggerService.info("Shop redact process completed successfully", {
      shop,
      shopId: request.shop_id,
      complianceRequestId
    });
    
    await ComplianceService.logAction(
      complianceRequestId,
      "SHOP_REDACT_COMPLETED",
      {
        shop,
        shopId: request.shop_id
      }
    );
  } catch (error) {
    loggerService.error("Shop redact process failed", {
      shop,
      shopId: request.shop_id,
      complianceRequestId,
      error: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    await ComplianceService.logAction(
      complianceRequestId,
      "SHOP_REDACT_ERROR",
      {
        shop,
        shopId: request.shop_id,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      false,
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}
