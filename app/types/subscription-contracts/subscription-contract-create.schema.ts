import { z } from 'zod';

/**
 * Subscription contract item validation schema
 */
export const subscriptionContractItemSchema = z.object({
  variantId: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  customerPartnerNumber: z.string().optional(),
});

/**
 * Valid interval units
 */
export const VALID_INTERVAL_UNITS = [
  'daily', 
  'weekly', 'weeks',
  'monthly', 'months',
  'quarterly',
  'biannual',
  'annually', 'yearly'
] as const;

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
 * Subscription validation schema
 */
export const subscriptionSchema = z.object({
  name: z.string().min(1),
  note: z.string().optional(),
  poNumber: z.string().optional(),
  currencyCode: z.string().min(3).max(3),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  intervalValue: z.number().int().positive()
    .refine(
      (value) => value > 0,
      {
        message: "Interval value must be greater than 0"
      }
    ),
  intervalUnit: caseInsensitiveEnum(VALID_INTERVAL_UNITS),
  deliveryAnchor: z.number().int().min(1).max(31).optional(), // 1~7 for weekly, 1~31 for monthly
  discountType: z.enum(['percentage', 'amount', 'fixed_price']).nullable().optional(),
  discountValue: z.number().nonnegative().nullable().optional(),
  shippingMethod: z.string().min(1),
  shippingCost: z.number().nonnegative(),
  shippingMethodId: z.string().optional(),
  createdById: z.string().optional(),
  contactId: z.string().optional(),
  items: z.array(subscriptionContractItemSchema).min(1),
});

/**
 * Create subscription contract request validation schema
 */
export const createSubscriptionContractSchema = z.object({
  storeName: z.string().min(1),
  companyId: z.string().min(1),
  companyLocationId: z.string().min(1),
  customerId: z.string().min(1),
  subscription: subscriptionSchema,
});

/**
 * Create subscription contract response validation schema
 */
export const createSubscriptionContractResponseSchema = z.object({
  success: z.boolean(),
  subscriptionContractId: z.number(),
  status: z.string()
});

/**
 * Subscription contract item type
 */
export type SubscriptionContractItem = z.infer<typeof subscriptionContractItemSchema>;

/**
 * Subscription type
 */
export type Subscription = z.infer<typeof subscriptionSchema>;

/**
 * Create subscription contract request type
 */
export type CreateSubscriptionContractRequest = z.infer<typeof createSubscriptionContractSchema>;

/**
 * Create subscription contract response type
 */
export type CreateSubscriptionContractResponse = z.infer<typeof createSubscriptionContractResponseSchema>; 