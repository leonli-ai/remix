import type { ActionFunctionArgs } from "@remix-run/node";
import { ComplianceType } from "@prisma/client";
import { z } from "zod";
import { ComplianceService } from "../lib/services/compliance-service";
import { WebhookService } from "../lib/services/webhook-service";
import { loggerService } from "../lib/logger";

/**
 * Define the webhook payload schema using Zod - using flexible validation to handle Shopify's actual payloads
 */
const CustomerDataRequestSchema = z.object({
  shop_id: z.number(),
  shop_domain: z.string(),
  orders_requested: z.array(z.number()).default([]),
  customer: z.object({
    id: z.number(),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
  }),
  data_request: z.object({
    id: z.number(),
  }).optional().default({ id: 0 }),
});

// Create a type conversion function to ensure compatibility with WebhookService
const asWebhookPayload = (data: z.infer<typeof CustomerDataRequestSchema>) => {
  return {
    shop_id: data.shop_id,
    shop_domain: data.shop_domain,
    orders_requested: data.orders_requested || [],
    customer: {
      id: data.customer.id,
      email: data.customer.email,
      phone: data.customer.phone || undefined
    },
    data_request: {
      id: data.data_request?.id || 0
    }
  };
};

type CustomerDataRequest = z.infer<typeof CustomerDataRequestSchema>;

/**
 * Process customer data request webhook
 * This webhook is triggered when a customer requests their data
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  loggerService.info("Received customer data request webhook", {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries([...request.headers.entries()])
  });
  
  return WebhookService.processWebhook({
    request,
    schema: CustomerDataRequestSchema,
    requestType: ComplianceType.CUSTOMER_DATA_REQUEST,
    processPayload: async ({ payload, shop, complianceRequestId }) => {
      loggerService.info("Processing customer data request payload", {
        payload: JSON.stringify(payload),
        shop,
        complianceRequestId
      });
      // Use type conversion function to ensure type compatibility
      const safePayload = asWebhookPayload(payload);
      await processDataRequest(safePayload, shop, complianceRequestId);
    },
  });
};

/**
 * Process the customer data request
 * Logs all actions that would be taken to fulfill the request
 */
async function processDataRequest(
  request: ReturnType<typeof asWebhookPayload>,
  shop: string,
  complianceRequestId: string,
): Promise<void> {
  loggerService.info("Starting customer data request process", {
    shop,
    customerId: request.customer.id,
    customerEmail: request.customer.email,
    ordersRequested: request.orders_requested.length,
    complianceRequestId
  });
  
  try {
    // Log initial data request
    await ComplianceService.logAction(
      complianceRequestId,
      "DATA_REQUEST_RECEIVED",
      {
        shop,
        customerId: request.customer.id,
        customerEmail: request.customer.email,
        ordersRequested: request.orders_requested.length,
      },
    );

    loggerService.info("Processing customer data collection", {
      shop,
      customerId: request.customer.id
    });
    
    // Log customer data collection
    await ComplianceService.logAction(
      complianceRequestId,
      "WOULD_COLLECT_CUSTOMER_DATA",
      {
        shop,
        customerId: request.customer.id,
        customerEmail: request.customer.email,
        phone: request.customer.phone,
      },
    );

    // Log order data collection if any
    if (request.orders_requested.length > 0) {
      loggerService.info("Processing order data collection", {
        shop,
        customerId: request.customer.id,
        orderCount: request.orders_requested.length
      });
      
      await ComplianceService.logAction(
        complianceRequestId,
        "WOULD_COLLECT_ORDER_DATA",
        {
          shop,
          customerId: request.customer.id,
          orderIds: request.orders_requested,
        },
      );
    }

    loggerService.info("Customer data request process completed successfully", {
      shop,
      customerId: request.customer.id,
      requestId: request.data_request.id,
      ordersCollected: request.orders_requested.length,
      complianceRequestId
    });
    
    await ComplianceService.logAction(
      complianceRequestId,
      "DATA_REQUEST_COMPLETED",
      {
        shop,
        customerId: request.customer.id,
        requestId: request.data_request.id,
        ordersCollected: request.orders_requested.length,
      },
    );
  } catch (error) {
    loggerService.error("Customer data request process failed", {
      shop,
      customerId: request.customer.id,
      complianceRequestId,
      error: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    await ComplianceService.logAction(
      complianceRequestId,
      "DATA_REQUEST_ERROR",
      {
        shop,
        customerId: request.customer.id,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      false,
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
}
