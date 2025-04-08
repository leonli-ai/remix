import { z } from 'zod';

/**
 * Schema for subscription contract decline request
 */
export const subscriptionContractDeclineSchema = z.object({
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
   * Subscription contract ID to decline
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
 * Type definition for subscription contract decline request
 */
export type SubscriptionContractDeclineRequest = z.infer<typeof subscriptionContractDeclineSchema>;

/**
 * Schema for subscription contract decline response
 */
export const subscriptionContractDeclineResponseSchema = z.object({
  /**
   * Whether the decline operation was successful
   */
  success: z.boolean(),
  
  /**
   * Message describing the result of the operation
   */
  message: z.string(),
});

/**
 * Type definition for subscription contract decline response
 */
export type SubscriptionContractDeclineResponse = z.infer<typeof subscriptionContractDeclineResponseSchema>; 