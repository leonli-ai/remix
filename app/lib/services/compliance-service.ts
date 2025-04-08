import db from "~/db.server";
import type { ComplianceRequest, ComplianceType, ComplianceStatus, Prisma } from "@prisma/client";
import { loggerService } from "../logger";

export interface ComplianceRequestOptions {
  shop: string;
  shopId: number | bigint;
  requestType: ComplianceType;
  status: ComplianceStatus;
  payload: unknown;
  customerId?: number | bigint;
  customerEmail?: string;
  ordersCount?: number;
  requestId?: string;
}

export class ComplianceService {
  private static ensureJsonValue(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  /**
   * Calculate the due date based on request type and Shopify requirements
   */
  private static calculateDueDate(requestType: ComplianceType): Date {
    const now = new Date();
    const dueDate = new Date(now);
    
    // Add 30 days for all request types as per Shopify's requirements
    dueDate.setDate(dueDate.getDate() + 30);
    
    return dueDate;
  }

  /**
   * Create a new compliance request record
   */
  public static async createRequest(options: ComplianceRequestOptions): Promise<ComplianceRequest> {
    const startTime = Date.now();
    
    try {
      loggerService.info("Creating compliance request", {
        shop: options.shop,
        requestType: options.requestType,
        customerId: options.customerId,
        requestId: options.requestId
      });

      const request = await db.complianceRequest.create({
        data: {
          shop: options.shop,
          shopId: options.shopId,
          requestType: options.requestType,
          status: options.status,
          customerId: options.customerId,
          customerEmail: options.customerEmail,
          ordersCount: options.ordersCount,
          requestPayload: this.ensureJsonValue(options.payload),
          requestId: options.requestId,
          dueAt: this.calculateDueDate(options.requestType)
        }
      });

      // Log the creation action
      await this.logAction(
        request.id,
        "REQUEST_CREATED",
        {
          shop: options.shop,
          requestType: options.requestType,
          customerId: options.customerId,
          dueAt: request.dueAt
        },
        true
      );

      const duration = Date.now() - startTime;
      loggerService.info("Compliance request created successfully", {
        requestId: request.id,
        shop: options.shop,
        requestType: options.requestType,
        duration
      });

      return request;
    } catch (error) {
      const duration = Date.now() - startTime;
      loggerService.error("Failed to create compliance request", {
        shop: options.shop,
        requestType: options.requestType,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Log a compliance action
   */
  public static async logAction(
    requestId: string,
    action: string,
    details: Record<string, unknown>,
    success: boolean = true,
    error?: Error | string
  ): Promise<void> {
    try {
      loggerService.info("Logging compliance action", {
        requestId,
        action,
        success
      });

      await db.complianceLog.create({
        data: {
          requestId,
          action,
          details,
          success,
          error: typeof error === 'string' ? error : error?.message
        }
      });

      loggerService.info("Compliance action logged successfully", {
        requestId,
        action
      });
    } catch (err) {
      loggerService.error("Failed to log compliance action", {
        requestId,
        action,
        error: err instanceof Error ? err.message : "Unknown error",
        errorStack: err instanceof Error ? err.stack : undefined
      });
    }
  }

  /**
   * Update request status and optionally set processedAt
   */
  public static async updateStatus(
    requestId: string,
    status: ComplianceStatus,
    processedAt?: Date
  ): Promise<ComplianceRequest> {
    const startTime = Date.now();
    
    try {
      loggerService.info("Updating compliance request status", {
        requestId,
        status,
        hasProcessedAt: !!processedAt
      });

      const request = await db.complianceRequest.update({
        where: { id: requestId },
        data: {
          status,
          processedAt
        }
      });

      await this.logAction(
        requestId,
        "STATUS_UPDATED",
        {
          oldStatus: request.status,
          newStatus: status,
          processedAt
        },
        true
      );

      const duration = Date.now() - startTime;
      loggerService.info("Compliance request status updated successfully", {
        requestId,
        status,
        duration
      });

      return request;
    } catch (error) {
      const duration = Date.now() - startTime;
      loggerService.error("Failed to update compliance request status", {
        requestId,
        status,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
} 