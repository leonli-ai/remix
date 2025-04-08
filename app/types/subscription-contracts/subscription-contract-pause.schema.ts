import { z } from 'zod';

/**
 * Schema for subscription contract pause request
 */
export const subscriptionContractPauseSchema = z.object({
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
   * Subscription contract ID to pause
   */
  subscriptionContractId: z.number(),
});

/**
 * Type definition for subscription contract pause request
 */
export type SubscriptionContractPauseRequest = z.infer<typeof subscriptionContractPauseSchema>;

/**
 * Schema for subscription contract pause response
 */
export const subscriptionContractPauseResponseSchema = z.object({
  /**
   * Whether the pause operation was successful
   */
  success: z.boolean(),
  
  /**
   * Message describing the result of the operation
   */
  message: z.string(),
  
  /**
   * The ID of the subscription contract that was paused
   */
  subscriptionContractId: z.number(),
  
  /**
   * The status of the subscription contract after the operation
   */
  status: z.string(),
});

/**
 * Type definition for subscription contract pause response
 */
export type SubscriptionContractPauseResponse = z.infer<typeof subscriptionContractPauseResponseSchema>; 