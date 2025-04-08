import { z } from 'zod';

// Request Schema
export const draftOrderDetailsRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  draftOrderId: z.string(),
  companyLocationId: z.string()
}).strict();

// Money Schema
const moneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
}).strict();

// Price Set Schema
const priceSetSchema = z.object({
  presentmentMoney: moneySchema,
  shopMoney: moneySchema
}).strict();

// Address Schema
const addressSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  address1: z.string().nullable(),
  address2: z.string().nullable(),
  city: z.string().nullable(),
  provinceCode: z.string().nullable(),
  zip: z.string().nullable(),
  countryCodeV2: z.string().nullable(),
  company: z.string().nullable(),
  phone: z.string().nullable()
}).strict();

// Custom Attribute Schema
const customAttributeSchema = z.object({
  key: z.string(),
  value: z.string()
}).strict();

// Shipping Line Schema
const shippingLineSchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string().nullable(),
  customShippingInputPrice: moneySchema.optional(),
  discountedPriceSet: priceSetSchema.optional(),
  originalPriceSet: priceSetSchema.optional()
}).strict();

// Add Company Location Schema
const companyLocationSchema = z.object({
  id: z.string(),
  name: z.string()
}).strict();

// Add Company Schema
const companySchema = z.object({
  locations: z.object({
    edges: z.array(z.object({
      node: companyLocationSchema
    }))
  })
}).strict();

// Add Company Contact Profiles Schema
const companyContactProfilesSchema = z.object({
  company: companySchema
}).strict();

// Add Customer Schema
const customerSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  displayName: z.string(),
  email: z.string().nullable(),
  numberOfOrders: z.number(),
  companyContactProfiles: z.array(companyContactProfilesSchema),
  __typename: z.string()
}).strict();

// Product Metafield Schema
const metafieldSchema = z.object({
  value: z.string(),
  key: z.string(),
  namespace: z.string()
}).strict();

// Product Variant Schema
const variantSchema = z.object({
  id: z.string(),
  price: z.string(),
  contextualPricing: z.object({
    price: z.object({
      amount: z.string()
    }).optional()
  }).optional(),
  metafield: metafieldSchema.nullable()
}).strict();

// Product Schema
const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  totalVariants: z.number()
}).strict();

// Weight Schema
const weightSchema = z.object({
  value: z.number(),
  unit: z.string()
}).strict();

// Applied Discount Schema
const appliedDiscountSchema = z.object({
  amountSet: priceSetSchema.optional(),
  value: z.string(),
  valueType: z.string(),
  description: z.string().nullable()
}).strict();

// Add Image Schema
const imageSchema = z.object({
  id: z.string(),
  altText: z.string().nullable(),
  transformedSrc: z.string()
}).strict();

// Line Item Schema
const lineItemSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  appliedDiscount: appliedDiscountSchema.nullable(),
  isCustomLineItem: z.boolean(),
  discountedTotalSet: priceSetSchema,
  discountedUnitPriceSet: priceSetSchema,
  image: imageSchema.nullable(),
  isGiftCard: z.boolean(),
  originalTotal: z.string(),
  originalUnitPriceSet: priceSetSchema,
  product: productSchema.nullable(),
  quantity: z.number(),
  requiresShipping: z.boolean(),
  sku: z.string().nullable(),
  taxable: z.boolean(),
  title: z.string(),
  variantTitle: z.string().nullable(),
  variant: variantSchema.nullable(),
  weight: weightSchema.nullable()
}).strict();

// Line Items Connection Schema
const lineItemsConnectionSchema = z.object({
  edges: z.array(z.object({
    cursor: z.string(),
    node: lineItemSchema
  }))
}).strict();

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

// Purchasing Entity Location Schema
const purchasingEntityLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  externalId: z.string().optional().nullable()
}).strict();

// Purchasing Entity Schema
const purchasingEntitySchema = z.object({
  location: purchasingEntityLocationSchema.optional()
}).strict();

// Update Draft Order Details Schema
const draftOrderDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  email: z.string().nullable(),
  paymentTerms: paymentTermsSchema.nullable(),
  purchasingEntity: purchasingEntitySchema.optional(),
  customer: customerSchema.nullable(),
  rejectedBy: customerSchema.nullable(),
  approvedBy: customerSchema.nullable(),
  phone: z.string().nullable(),
  note2: z.string().nullable(),
  poNumber: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  taxExempt: z.boolean(),
  taxesIncluded: z.boolean(),
  currencyCode: z.string(),
  totalQuantityOfLineItems: z.number(),
  lineItems: lineItemsConnectionSchema,
  billingAddress: addressSchema.nullable(),
  shippingAddress: addressSchema.nullable(),
  shippingLine: shippingLineSchema.nullable(),
  totalPriceSet: priceSetSchema,
  totalTaxSet: priceSetSchema,
  totalDiscountsSet: priceSetSchema,
  lineItemsSubtotalPrice: priceSetSchema,
  customAttributes: z.array(customAttributeSchema),
  tags: z.array(z.string())
}).strict();

// Response Schema
export const draftOrderDetailsResponseSchema = z.object({
  draftOrder: draftOrderDetailsSchema
}).strict();

export type DraftOrderDetailsRequest = z.infer<typeof draftOrderDetailsRequestSchema>;
export type DraftOrderDetailsResponse = z.infer<typeof draftOrderDetailsResponseSchema>; 