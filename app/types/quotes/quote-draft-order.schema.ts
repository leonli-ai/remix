import { string, z } from 'zod';

/**
 * Schema for draft order line item price override
 */
const priceOverrideSchema = z.object({
  amount: z.number(),
  currencyCode: z.string()
}).strict();

/**
 * Schema for draft order line item
 */
const draftOrderLineItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number(),
  priceOverride: priceOverrideSchema
}).strict();

/**
 * Schema for draft order address
 */
const draftOrderAddressSchema = z.object({
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  zip: z.string(),
  phone: z.string().optional(),
  company: z.string().optional()
}).strict();

/**
 * Schema for purchasing company
 */
const purchasingCompanySchema = z.object({
  companyContactId: z.string(),
  companyId: z.string(),
  companyLocationId: z.string()
}).strict();

/**
 * Schema for purchasing entity
 */
const purchasingEntitySchema = z.object({
  customerId: z.string().optional(),
  purchasingCompany: purchasingCompanySchema.optional()
}).strict();

/**
 * Schema for draft order metafield
 */
const draftOrderMetafieldSchema = z.object({
  namespace: z.string(),
  key: z.string(),
  type: z.string(),
  value: z.string()
}).strict();

/**
 * Schema for draft order input
 */
export const createDraftOrderInputSchema = z.object({
  note: z.string(),
  email: z.string().email(),
  poNumber: z.string().optional(),
  purchasingEntity: purchasingEntitySchema,
  shippingAddress: draftOrderAddressSchema,
  billingAddress: draftOrderAddressSchema,
  lineItems: z.array(draftOrderLineItemSchema),
  metafields: z.array(draftOrderMetafieldSchema).optional(),
  tags: z.array(z.string()).optional()
}).strict();

/**
 * Schema for draft order response
 */
export const createDraftOrderResponseSchema = z.object({
  draftOrder: z.object({
    id: z.string()
  })
}).strict();

export type CreateDraftOrderInput = z.infer<typeof createDraftOrderInputSchema>;
export type CreateDraftOrderResponse = z.infer<typeof createDraftOrderResponseSchema>; 