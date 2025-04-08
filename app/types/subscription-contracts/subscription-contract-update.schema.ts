import { z } from 'zod';
import { VALID_INTERVAL_UNITS } from './subscription-contract-create.schema';

/**
 * Subscription contract line item validation schema
 */
export const subscriptionContractUpdateLineSchema = z.object({
  id: z.number().int().positive().optional(),
  variantId: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  customerPartnerNumber: z.string().optional(),
});

/**
 * Case-insensitive enum validation
 */
const caseInsensitiveEnum = <T extends readonly string[]>(values: T) => 
  z.string().refine(
    (value) => values.map(v => v.toLowerCase()).includes(value.toLowerCase()),
    (value) => ({ 
      message: `Invalid enum value. Expected ${values.map(v => `'${v}'`).join(' | ')}, received '${value}'` 
    })
  ).transform(value => {
    // Normalize to one of the valid values with correct casing
    const normalizedValue = values.find(v => v.toLowerCase() === value.toLowerCase());
    return normalizedValue as (typeof values)[number];
  });

/**
 * Subscription contract update data schema
 */
export const updateSubscriptionDataSchema = z.object({
  name: z.string().min(1),
  note: z.string().optional(),
  poNumber: z.string().optional(),
  
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Start date must be in YYYY-MM-DD format"
  }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "End date must be in YYYY-MM-DD format"
  }),
  intervalValue: z.number().int().positive(),
  intervalUnit: caseInsensitiveEnum(VALID_INTERVAL_UNITS),
  deliveryAnchor: z.number().int().min(1).max(31).optional(), // 1~7 for weekly, 1~31 for monthly
  
  shippingMethodId: z.string().optional(),
  shippingMethodName: z.string(),
  shippingCost: z.number().nonnegative(),
  
  discountType: z.enum(['percentage', 'amount', 'fixed_price']).nullable().optional(),
  discountValue: z.number().nonnegative().nullable().optional(),
  
  orderTotal: z.number().nonnegative().optional(),
  
  lines: z.array(subscriptionContractUpdateLineSchema).min(1),
});

/**
 * Update subscription contract request validation schema
 */
export const updateSubscriptionContractSchema = z.object({
  storeName: z.string().min(1),
  subscriptionContractId: z.number().int().positive(),
  companyLocationId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  data: updateSubscriptionDataSchema,
}).strict();

/**
 * Update subscription contract response validation schema
 */
export const updateSubscriptionContractResponseSchema = z.object({
  success: z.boolean(),
  subscriptionContractId: z.number(),
  message: z.string()
});

/**
 * Type definitions
 */
export type SubscriptionContractUpdateLine = z.infer<typeof subscriptionContractUpdateLineSchema>;
export type UpdateSubscriptionData = z.infer<typeof updateSubscriptionDataSchema>;
export type UpdateSubscriptionContractRequest = z.infer<typeof updateSubscriptionContractSchema>;
export type UpdateSubscriptionContractResponse = z.infer<typeof updateSubscriptionContractResponseSchema>; 