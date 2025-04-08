import { z } from 'zod';

// Base schemas
const moneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
}).strict();

const metafieldSchema = z.object({
  value: z.string(),
  key: z.string(),
  namespace: z.string()
}).strict();

const customerSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  createdAt: z.string().optional(),
  state: z.string().optional(),
  updatedAt: z.string().optional(),
  phone: z.string().optional()
}).strict();

const shippingAddressSchema = z.object({
  id: z.string(),
  address1: z.string(),
  address2: z.string().nullable(),
  city: z.string(),
  countryCode: z.string(),
  formattedArea: z.string(),
  province: z.string()
}).strict();

const purchasingEntitySchema = z.object({
  company: z.object({
    id: z.string(),
    name: z.string()
  }),
  contact: z.object({
    id: z.string(),
    customer: z.object({
      email: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      phone: z.string().nullable(),
      displayName: z.string(),
      numberOfOrders: z.string()
    })
  }),
  location: z.object({
    id: z.string(),
    name: z.string(),
    shippingAddress: shippingAddressSchema
  })
}).strict().nullable();

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
}).strict().nullable();

const approverSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string()
}).strict().nullable();

// Main Order Node Schema
export const orderNodeSchema = z.object({
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
  purchasingEntity: purchasingEntitySchema,
  poNumber: z.string().nullable(),
  paymentGatewayNames: z.array(z.string()),
  paymentTerms: paymentTermsSchema,
  displayFinancialStatus: z.string(),
  displayFulfillmentStatus: z.string(),
  returnStatus: z.string().nullable(),
  status: z.enum(['OPEN', 'CANCELLED']),
  cursor: z.string(),
  approver: approverSchema
}).strict();

export const orderEdgeSchema = z.object({
  node: orderNodeSchema,
  cursor: z.string()
}).strict();

// Types
export type OrderNode = z.infer<typeof orderNodeSchema>;
export type OrderEdge = z.infer<typeof orderEdgeSchema>; 