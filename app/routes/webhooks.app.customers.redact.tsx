import type { ActionFunctionArgs } from "@remix-run/node";
import { ComplianceType } from "@prisma/client";
import { z } from "zod";
import { ComplianceService } from "../lib/services/compliance-service";
import { WebhookService } from "../lib/services/webhook-service";
import { loggerService } from "../lib/logger";

// Define the webhook payload schema using Zod - using flexible validation to handle Shopify's actual payloads
const CustomerRedactSchema = z.object({
  shop_id: z.number(),
  shop_domain: z.string(),
  customer: z.object({
    id: z.number(),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
  }),
  orders_to_redact: z.array(z.number()).default([]),
});

// Create a type conversion function to ensure compatibility with WebhookService
const asWebhookPayload = (data: z.infer<typeof CustomerRedactSchema>) => {
  return {
    shop_id: data.shop_id,
    shop_domain: data.shop_domain,
    customer: {
      id: data.customer.id,
      email: data.customer.email,
      phone: data.customer.phone || undefined
    },
    orders_to_redact: data.orders_to_redact || []
  };
};


export const action = async ({ request }: ActionFunctionArgs) => {
  loggerService.info("Received customer redact webhook", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries([...request.headers.entries()])
  });
  
  return WebhookService.processWebhook({
    request,
    schema: CustomerRedactSchema,
    requestType: ComplianceType.CUSTOMER_REDACT,
    processPayload: async ({ payload, shop, complianceRequestId }) => {
      loggerService.info("Processing customer redact payload", {
        payload: JSON.stringify(payload),
        shop,
        complianceRequestId
      });
      // Use type conversion function to ensure type compatibility
      const safePayload = asWebhookPayload(payload);
      await processDataRedaction(safePayload, shop, complianceRequestId);
    },
  });
};

async function processDataRedaction(
  request: ReturnType<typeof asWebhookPayload>,
  shop: string,
  complianceRequestId: string
): Promise<void> {
  loggerService.info("Starting customer data redaction process", {
    shop,
    customerId: request.customer.id,
    customerEmail: request.customer.email,
    ordersCount: request.orders_to_redact.length,
    complianceRequestId
  });
  
  try {
    // Log customer data redaction
    await ComplianceService.logAction(
      complianceRequestId,
      "REDACT_REQUEST_RECEIVED",
      {
        shop,
        customerId: request.customer.id,
        customerEmail: request.customer.email,
        ordersCount: request.orders_to_redact.length
      }
    );

    loggerService.info("Processing customer data deletion", {
      shop,
      customerId: request.customer.id
    });
    
    // Log customer data deletion
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_DELETE_CUSTOMER_DATA",
      {
        shop,
        customerId: request.customer.id,
        customerEmail: request.customer.email
      }
    );

    // Log order data deletion if any
    if (request.orders_to_redact.length > 0) {
      loggerService.info("Processing order data deletion", {
        shop,
        customerId: request.customer.id,
        orderCount: request.orders_to_redact.length
      });
      
      await ComplianceService.logAction(
        complianceRequestId,
        "WOULD_DELETE_ORDER_DATA",
        {
          shop,
          customerId: request.customer.id,
          orderIds: request.orders_to_redact
        }
      );
    }

    loggerService.info("Processing metadata cleanup", {
      shop,
      customerId: request.customer.id
    });
    
    // Log metadata cleanup
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_CLEAR_METADATA",
      {
        shop,
        customerId: request.customer.id
      }
    );

    loggerService.info("Customer redact process completed successfully", {
      shop,
      customerId: request.customer.id,
      ordersRedacted: request.orders_to_redact.length,
      complianceRequestId
    });
    
    await ComplianceService.logAction(
      complianceRequestId,
      "REDACT_REQUEST_COMPLETED",
      {
        shop,
        customerId: request.customer.id,
        ordersRedacted: request.orders_to_redact.length
      }
    );
  } catch (error) {
    loggerService.error("Customer redact process failed", {
      shop,
      customerId: request.customer.id,
      complianceRequestId,
      error: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    await ComplianceService.logAction(
      complianceRequestId,
      "REDACT_REQUEST_ERROR",
      {
        shop,
        customerId: request.customer.id,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      false,
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}
