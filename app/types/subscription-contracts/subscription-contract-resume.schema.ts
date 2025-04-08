import { z } from 'zod';

/**
 * Schema for subscription contract resume request
 */
export const subscriptionContractResumeSchema = z.object({
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
   * Subscription contract ID to resume
   */
  subscriptionContractId: z.number(),
});

/**
 * Type definition for subscription contract resume request
 */
export type SubscriptionContractResumeRequest = z.infer<typeof subscriptionContractResumeSchema>;

/**
 * Schema for subscription contract resume response
 */
export const subscriptionContractResumeResponseSchema = z.object({
  /**
   * Whether the resume operation was successful
   */
  success: z.boolean(),
  
  /**
   * Message describing the result of the operation
   */
  message: z.string(),
  
  /**
   * The ID of the subscription contract that was resumed
   */
  subscriptionContractId: z.number(),
  
  /**
   * The status of the subscription contract after the operation
   */
  status: z.string(),
  
  /**
   * The next scheduled order creation date
   */
  nextOrderCreationDate: z.string(),
  
  /**
   * Whether the next order creation date was rescheduled
   */
  rescheduled: z.boolean()
});

/**
 * Type definition for subscription contract resume response
 */
export type SubscriptionContractResumeResponse = z.infer<typeof subscriptionContractResumeResponseSchema>; 