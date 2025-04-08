import { z } from 'zod';

// Request Schema
export const draftOrderListRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  pagination: z.object({
    first: z.number().min(1).max(100).default(10),
    after: z.string().optional(),
    query: z.string().optional(),
    sortKey: z.enum(['CUSTOMER_NAME', 'ID', 'NUMBER', 'RELEVANCE', 'STATUS', 'TOTAL_PRICE', 'UPDATED_AT']).optional(),
    reverse: z.boolean().optional()
  }).optional()
}).strict();

// Money Schema
const moneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
}).strict();

// Price Set Schema
const priceSetSchema = z.object({
  shopMoney: moneySchema,
  presentmentMoney: moneySchema
}).strict();

// Address Schema
const addressSchema = z.object({
  formattedArea: z.string().optional(),
  id: z.string(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().optional(),
  province: z.string().optional()
}).strict();

// Customer Schema
const customerSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string().optional(),
  numberOfOrders: z.number(),
  phone: z.string().optional(),
  defaultAddress: addressSchema.optional()
}).strict();

// Company Schema
const companySchema = z.object({
  id: z.string(),
  name: z.string()
}).strict();

// Location Schema
const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  shippingAddress: addressSchema,
  externalId: z.string().optional().nullable(),

}).strict();

// Purchasing Entity Schema
const purchasingEntitySchema = z.discriminatedUnion('__typename', [
  z.object({
    __typename: z.literal('Customer'),
    ...customerSchema.shape
  }),
  z.object({
    __typename: z.literal('PurchasingCompany'),
    company: companySchema,
    contact: z.object({
      id: z.string(),
      customer: customerSchema
    }),
    location: locationSchema
  })
]);

// Draft Order Schema
const draftOrderSchema = z.object({
  id: z.string(),
  name: z.string(),
  tags: z.array(z.string()).optional(),
  rejectedBy: customerSchema.optional(),
  approvedBy: customerSchema.optional(),
  customer: customerSchema.optional(),
  poNumber: z.string().nullable(),
  purchasingEntity: purchasingEntitySchema,
  hasTimelineComment: z.boolean(),
  note2: z.string().nullable(),
  status: z.string(),
  totalPriceSet: priceSetSchema,
  updatedAt: z.string(),
  cursor: z.string()
}).strict();

// Response Schema
export const draftOrderListResponseSchema = z.object({
  draftOrders: z.array(draftOrderSchema),
  pagination: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    endCursor: z.string().optional(),
    cursor: z.string().optional(),
    startCursor: z.string().optional(),
    totalCount: z.number()
  })
}).strict();

export type DraftOrderListRequest = z.infer<typeof draftOrderListRequestSchema>;
export type DraftOrderListResponse = z.infer<typeof draftOrderListResponseSchema>; 