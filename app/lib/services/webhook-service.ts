import { authenticate } from "../../shopify.server";
import { loggerService } from "../logger";
import { ComplianceService } from "./compliance-service";
import type{ ComplianceType,Prisma } from "@prisma/client";
import type { z } from "zod";

/**
 * Base interface for all webhook payloads
 * Ensures minimum required fields are present
 */
interface BaseWebhookPayload {
  shop_id: number;
  shop_domain: string;
}

/**
 * Interface for webhook handler context
 * Provides type safety for webhook processing
 */
export interface WebhookHandlerContext<T extends BaseWebhookPayload> {
  shop: string;
  topic: string;
  payload: T;
  complianceRequestId: string;
}

/**
 * Parameters for webhook processing
 */
interface WebhookProcessParams<T extends BaseWebhookPayload> {
  request: Request;
  schema: z.ZodType<T>;
  requestType: ComplianceType;
  processPayload: (context: WebhookHandlerContext<T>) => Promise<void>;
}

export class WebhookService {
  /**
   * Process webhook request with async handling
   * 1. Quick validation and immediate 200 response
   * 2. Async processing for data and logging
   * 
   * @param request - The incoming webhook request
   * @param schema - Zod schema for payload validation
   * @param requestType - Type of compliance request
   * @param processPayload - Function to process the validated payload
   * @returns Promise<Response> - HTTP response
   */
  public static async processWebhook<T extends BaseWebhookPayload>({
    request,
    schema,
    requestType,
    processPayload,
  }: WebhookProcessParams<T>): Promise<Response> {
    const startTime = Date.now();
    let shop: string | undefined;
    let topic: string | undefined;
    let rawPayload: any = {};

    try {
      // Step 1: Quick validation of basic information
      loggerService.info("Starting webhook validation");
      const validatedRequest = await this.validateRequest(request);
      shop = validatedRequest.shop;
      topic = validatedRequest.topic;
      rawPayload = validatedRequest.payload;
      
      loggerService.info("Webhook request validated", {
        shop,
        topic,
        requestType
      });
      
      // Step 2: Validate content type
      const contentType = request.headers.get("content-type");
      if (contentType !== "application/json") {
        loggerService.warn("Invalid content type received", {
          shop,
          topic,
          contentType,
          expectedType: "application/json"
        });
        
        // Log the error but still return 200 to acknowledge receipt
        await this.logWebhookError(
          "INVALID_CONTENT_TYPE",
          {
            shop,
            topic,
            contentType,
            expectedType: "application/json"
          },
          requestType,
          rawPayload
        );
        
        return new Response("Success", { status: 200 });
      }

      // Step 3: Basic payload validation
      loggerService.info("Validating webhook payload", { shop, topic });
      
      // Use safeParse instead of parse to avoid throwing errors
      const validationResult = schema.safeParse(validatedRequest.payload);
      
      if (!validationResult.success) {
        const validationErrors = JSON.stringify(validationResult.error.errors);
        loggerService.warn("Webhook payload validation failed", {
          shop,
          topic,
          errors: validationErrors,
          payload: JSON.stringify(validatedRequest.payload)
        });
        
        // Log the validation error but still return 200
        await this.logWebhookError(
          "VALIDATION_ERROR",
          {
            shop,
            topic,
            errors: validationErrors,
            payload: JSON.stringify(validatedRequest.payload)
          },
          requestType,
          rawPayload
        );
        
        return new Response("Success", { status: 200 });
      }
      
      const validatedPayload = validationResult.data as T;
      loggerService.info("Webhook payload validated successfully", {
        shop,
        topic,
        hasCustomer: 'customer' in validatedPayload,
        hasOrders: this.calculateOrdersCount(validatedPayload) > 0
      });

      // Step 4: Create initial compliance request record
      loggerService.info("Creating compliance request", { shop, topic });
      const complianceRequest = await ComplianceService.createRequest({
        shop: validatedPayload.shop_domain,
        shopId: validatedPayload.shop_id,
        requestType,
        status: "PENDING",
        payload: JSON.parse(JSON.stringify(validatedPayload)) as Prisma.JsonValue,
        customerId: 'customer' in validatedPayload 
          ? Number((validatedPayload as any).customer?.id)
          : undefined,
        customerEmail: 'customer' in validatedPayload 
          ? (validatedPayload as any).customer?.email 
          : undefined,
        ordersCount: this.calculateOrdersCount(validatedPayload),
        requestId: 'data_request' in validatedPayload 
          ? (validatedPayload as any).data_request?.id?.toString() 
          : undefined
      });

      // Step 5: Start async processing
      loggerService.info("Starting async webhook processing", {
        shop,
        topic,
        complianceRequestId: complianceRequest.id
      });

      void this.processWebhookAsync({
        shop,
        topic,
        payload: validatedPayload,
        complianceRequestId: complianceRequest.id,
        processPayload,
      }).catch(error => {
        loggerService.error("Async webhook processing failed", {
          error: error instanceof Error ? error.message : "Unknown error",
          errorStack: error instanceof Error ? error.stack : undefined,
          complianceRequestId: complianceRequest.id,
          shop,
          topic
        });
        
        // Ensure errors during async processing are logged to the compliance system
        void ComplianceService.logAction(
          complianceRequest.id,
          "PROCESSING_ERROR",
          {
            error: error instanceof Error ? error.message : "Unknown error",
            shop,
            topic
          },
          false,
          error instanceof Error ? error.message : "Unknown error"
        );
      });

      const duration = Date.now() - startTime;
      loggerService.info("Webhook initial processing completed", {
        shop,
        topic,
        duration,
        complianceRequestId: complianceRequest.id
      });

      return new Response("Success", { status: 200 });
    } catch (error) {
      const duration = Date.now() - startTime;
      loggerService.error("Webhook processing failed", {
        shop,
        topic,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        payload: JSON.stringify(rawPayload)
      });

      // Log the error to the compliance system even for unexpected errors
      await this.logWebhookError(
        "UNEXPECTED_ERROR",
        {
          shop,
          topic,
          error: error instanceof Error ? error.message : "Unknown error",
          payload: JSON.stringify(rawPayload)
        },
        requestType,
        rawPayload
      );

      if (error instanceof Response) {
        // For authentication errors, we still return the error response
        return error;
      }

      // For all other errors, return 200 to acknowledge receipt
      return new Response("Success", { status: 200 });
    }
  }

  /**
   * Log webhook errors to the compliance system
   * 
   * @param errorType - Type of error
   * @param details - Error details
   * @param requestType - Type of compliance request
   * @param rawPayload - The raw payload received
   */
  private static async logWebhookError(
    errorType: string,
    details: any,
    requestType: ComplianceType,
    rawPayload: any
  ): Promise<void> {
    try {
      // Extract shop information from payload or details
      const shop = details.shop || rawPayload?.shop_domain || "unknown";
      const shopId = rawPayload?.shop_id || 0;
      
      // Create a compliance request record for the error
      const complianceRequest = await ComplianceService.createRequest({
        shop,
        shopId,
        requestType,
        status: "FAILED",
        payload: JSON.parse(JSON.stringify(rawPayload)) as Prisma.JsonValue,
        customerId: rawPayload?.customer?.id ? Number(rawPayload.customer.id) : undefined,
        customerEmail: rawPayload?.customer?.email,
        ordersCount: this.calculateOrdersCount(rawPayload),
        requestId: rawPayload?.data_request?.id?.toString()
      });
      
      // Log the error action
      await ComplianceService.logAction(
        complianceRequest.id,
        errorType,
        details,
        false,
        details.error || "Error processing webhook"
      );
      
      loggerService.info("Webhook error logged to compliance system", {
        errorType,
        complianceRequestId: complianceRequest.id,
        shop
      });
    } catch (loggingError) {
      // If we can't even log the error, just log to the logger service
      loggerService.error("Failed to log webhook error to compliance system", {
        originalError: details,
        loggingError: loggingError instanceof Error ? loggingError.message : "Unknown error"
      });
    }
  }

  /**
   * Asynchronously process webhook data
   * This method handles the actual business logic after the initial response
   * 
   * @param params - Parameters for async processing
   * @returns Promise<void>
   */
  private static async processWebhookAsync<T extends BaseWebhookPayload>({
    shop,
    topic,
    payload,
    complianceRequestId,
    processPayload,
  }: {
    shop: string;
    topic: string;
    payload: T;
    complianceRequestId: string;
    processPayload: (context: WebhookHandlerContext<T>) => Promise<void>;
  }): Promise<void> {
    const startTime = Date.now();
    
    try {
      loggerService.info("Starting async webhook processing", {
        shop,
        topic,
        complianceRequestId
      });

      // Step 1: Update status to in progress
      await ComplianceService.updateStatus(
        complianceRequestId, 
        "IN_PROGRESS"
      );

      // Step 2: Process business logic
      loggerService.info("Processing webhook payload", {
        shop,
        topic,
        complianceRequestId
      });

      await processPayload({
        shop,
        topic,
        payload,
        complianceRequestId,
      });

      // Step 3: Update status to completed
      await ComplianceService.updateStatus(
        complianceRequestId, 
        "COMPLETED",
        new Date()
      );

      const duration = Date.now() - startTime;
      loggerService.info("Async webhook processing completed", {
        shop,
        topic,
        complianceRequestId,
        duration
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      loggerService.error("Async webhook processing failed", {
        shop,
        topic,
        complianceRequestId,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined
      });

      // Step 4: Handle processing errors
      await ComplianceService.updateStatus(
        complianceRequestId, 
        "FAILED"
      );

      await ComplianceService.logAction(
        complianceRequestId,
        "PROCESSING_ERROR",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          shop,
          topic,
          duration
        },
        false,
        error instanceof Error ? error.message : "Unknown error"
      );

      throw error;
    }
  }

  /**
   * Validate webhook request HMAC
   * 
   * @param request - The incoming webhook request
   * @returns Promise with validated shop, topic, and payload
   * @throws Response with 401 status if HMAC is invalid
   */
  private static async validateRequest(request: Request) {
    return authenticate.webhook(request).catch(() => {
      throw new Response("Invalid HMAC", { status: 401 });
    });
  }

  /**
   * Calculate orders count from webhook payload
   * 
   * @param payload - The webhook payload
   * @returns number - The count of orders
   */
  private static calculateOrdersCount<T extends BaseWebhookPayload>(payload: T): number {
    if (!payload) return 0;
    
    if ('orders_to_redact' in payload) {
      return (payload as any).orders_to_redact?.length ?? 0;
    }
    if ('orders_requested' in payload) {
      return (payload as any).orders_requested?.length ?? 0;
    }
    return 0;
  }
}