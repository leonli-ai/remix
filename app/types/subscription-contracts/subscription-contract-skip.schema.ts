import { z } from 'zod';

/**
 * Schema for subscription contract skip request
 */
export const subscriptionContractSkipSchema = z.object({
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
   * Subscription contract ID to skip
   */
  subscriptionContractId: z.number(),
});

/**
 * Type definition for subscription contract skip request
 */
export type SubscriptionContractSkipRequest = z.infer<typeof subscriptionContractSkipSchema>;

/**
 * Schema for subscription contract skip response
 */
export const subscriptionContractSkipResponseSchema = z.object({
  /**
   * Whether the skip operation was successful
   */
  success: z.boolean(),
  
  /**
   * Message describing the result of the operation
   */
  message: z.string(),
  
  /**
   * New next order creation date after skipping
   */
  nextOrderCreationDate: z.string().datetime(),
});

/**
 * Type definition for subscription contract skip response
 */
export type SubscriptionContractSkipResponse = z.infer<typeof subscriptionContractSkipResponseSchema>; 