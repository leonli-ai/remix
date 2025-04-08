import { z } from 'zod';

/**
 * Schema for subscription contract approval request
 */
export const subscriptionContractApproveSchema = z.object({
  /**
   * Store name in format "store-name.myshopify.com"
   */
  storeName: z.string().min(1),
  
  /**
   * Shopify customer ID
   */
  customerId: z.string().min(1),
  
  /**
   * Company location ID associated with the subscription
   */
  companyLocationId: z.string().min(1),

  /**
   * Subscription contract ID to approve
   */
  subscriptionContractId: z.number(),

  /**
   * ID of the approver (company contact ID)
   */
  approverId: z.string().min(1),

  /**
   * Name of the approver
   */
  approverName: z.string().min(1),
});

/**
 * Type definition for subscription contract approve request
 */
export type SubscriptionContractApproveRequest = z.infer<typeof subscriptionContractApproveSchema>;

/**
 * Schema for subscription contract approve response
 */
export const subscriptionContractApproveResponseSchema = z.object({
  /**
   * Whether the approval operation was successful
   */
  success: z.boolean(),
  
  /**
   * Message describing the result of the operation
   */
  message: z.string(),
  
  /**
   * Next order creation date after approval
   */
  nextOrderDate: z.string(),
});

/**
 * Type definition for subscription contract approve response
 */
export type SubscriptionContractApproveResponse = z.infer<typeof subscriptionContractApproveResponseSchema>; 