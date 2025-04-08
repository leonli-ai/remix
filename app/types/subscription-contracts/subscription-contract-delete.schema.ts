import { z } from 'zod';

/**
 * Schema for subscription contract delete request
 */
export const subscriptionContractDeleteSchema = z.object({
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
   * Subscription contract ID to delete
   */
  subscriptionContractId: z.number(),
});

/**
 * Type definition for subscription contract delete request
 */
export type SubscriptionContractDeleteRequest = z.infer<typeof subscriptionContractDeleteSchema>;

/**
 * Schema for subscription contract delete response
 */
export const subscriptionContractDeleteResponseSchema = z.object({
  /**
   * Whether the delete operation was successful
   */
  success: z.boolean(),
  
  /**
   * Message describing the result of the operation
   */
  message: z.string(),
  
  /**
   * ID of deleted subscription contract
   */
  deletedId: z.number(),
});

/**
 * Type definition for subscription contract delete response
 */
export type SubscriptionContractDeleteResponse = z.infer<typeof subscriptionContractDeleteResponseSchema>; 