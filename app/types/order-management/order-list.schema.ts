import { z } from 'zod';

// Request Schema
export const orderListRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  pagination: z.object({
    first: z.number().min(1).max(100).default(10).optional(),
    after: z.string().optional(),
    last: z.number().min(1).optional(),
    before: z.string().optional(),
    query: z.string().optional(),
    reverse: z.boolean().optional(),
    sortKey: z.enum(['CREATED_AT', 'CUSTOMER_NAME', 'DESTINATION', 'FINANCIAL_STATUS', 'FULFILLMENT_STATUS', 'ID', 'ORDER_NUMBER', 'PO_NUMBER', 'PROCESSED_AT', 'RELEVANCE', 'TOTAL_ITEMS_QUANTITY', 'TOTAL_PRICE', 'UPDATED_AT']).optional()
  }).refine(
    (data) => {
      const hasBefore = data.before !== undefined;
      const hasLast = data.last !== undefined;
      return (hasBefore && hasLast) || (!hasBefore && !hasLast);
    },
    {
      message: "before and last must be used together"
    }
  ).refine(
    (data) => {
      const hasForward = data.first !== undefined || data.after !== undefined;
      const hasBackward = data.last !== undefined || data.before !== undefined;
      return !hasForward || !hasBackward;
    },
    {
      message: "Cannot use forward and backward pagination together"
    }
  )
}).strict();

// Money Schema
const moneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
}).strict();

// Customer Schema
const customerSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  state: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  phone: z.string().nullable().optional()
}).strict();

// Metafield Schema
const metafieldSchema = z.object({
  namespace: z.string(),
  key: z.string(),
  value: z.string()
}).strict();

// Company Schema
const companySchema = z.object({
  id: z.string(),
  name: z.string()
}).strict();

// Address Schema
const addressSchema = z.object({
  address1: z.string(),
  address2: z.string().nullable(),
  city: z.string(),
  countryCode: z.string(),
  formattedArea: z.string(),
  id: z.string(),
  province: z.string()
}).strict();

// Location Schema
const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  shippingAddress: addressSchema
}).strict();

// Contact Schema
const contactSchema = z.object({
  id: z.string(),
  customer: z.object({
    displayName: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    numberOfOrders: z.string(),
    phone: z.string().nullable()
  })
}).strict();

// Purchasing Entity Schema
const purchasingEntitySchema = z.object({
  company: companySchema,
  contact: contactSchema,
  location: locationSchema
}).nullable();

// Add Payment Terms Schema
const paymentScheduleSchema = z.object({
  dueAt: z.string(),
  issuedAt: z.string()
}).strict();

const paymentTermsSchema = z.object({
  id: z.string(),
  paymentTermsName: z.string(),
  paymentTermsType: z.string(),
  dueInDays: z.number(),
  overdue: z.boolean(),
  paymentSchedules: z.object({
    edges: z.array(z.object({
      node: paymentScheduleSchema
    }))
  })
}).strict();

// Order Schema
const orderSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  closed: z.boolean(),
  cancelledAt: z.string().nullable(),
  customer: customerSchema.nullable(),
  metafields: z.object({
    edges: z.array(z.object({
      node: metafieldSchema
    }))
  }),
  tags: z.array(z.string()),
  currentTotalPriceSet: z.object({
    shopMoney: moneySchema
  }),
  purchasingEntity: purchasingEntitySchema.optional(),
  poNumber: z.string().nullable(),
  paymentGatewayNames: z.array(z.string()),
  paymentTerms: paymentTermsSchema.nullable(),
  displayFinancialStatus: z.string(),
  displayFulfillmentStatus: z.string(),
  returnStatus: z.string().nullable(),
  status: z.enum(['OPEN', 'CANCELLED']),
  cursor: z.string(),
  approver: customerSchema.nullable()
}).strict();

// Response Schema
export const orderListResponseSchema = z.object({
  orders: z.array(orderSchema),
  pagination: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    startCursor: z.string().optional(),
    endCursor: z.string().optional(),
    totalCount: z.number()
  })
}).strict();

export type OrderListRequest = z.infer<typeof orderListRequestSchema>;
export type OrderListResponse = z.infer<typeof orderListResponseSchema>; 