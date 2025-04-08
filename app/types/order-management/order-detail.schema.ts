import { z } from 'zod';

export const OrderDetailRequestSchema = z.object({
  orderId: z.string(),
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string()
});

export const MoneySetSchema = z.object({
  presentmentMoney: z.object({
    amount: z.string().optional().nullable(),
    currencyCode: z.string().optional().nullable(),
    __typename: z.string().optional().nullable()
  }).optional().nullable(),
  shopMoney: z.object({
    amount: z.string().optional().nullable(),
    currencyCode: z.string().optional().nullable(),
    __typename: z.string().optional().nullable()
  }).optional().nullable(),
  __typename: z.string().optional().nullable()
}).optional().nullable();

export const DiscountSchema = z.object({
  amountSet: MoneySetSchema,
  value: z.string().optional().nullable(),
  valueType: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  __typename: z.string().optional().nullable()
}).optional().nullable();

export const ImageSchema = z.object({
  id: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  transformedSrc: z.string().optional().nullable(),
  __typename: z.string().optional().nullable()
}).optional().nullable();

export const ProductSchema = z.object({
  id: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalVariants: z.number().optional().nullable(),
  __typename: z.string().optional().nullable()
}).optional().nullable();

export const MetafieldSchema = z.object({
  value: z.string().optional().nullable(),
  key: z.string().optional().nullable(),
  namespace: z.string().optional().nullable()
}).optional().nullable();

export const ContextualPricingSchema = z.object({
  price: z.object({
    amount: z.string().optional().nullable()
  }).optional().nullable()
}).optional().nullable();

export const VariantSchema = z.object({
  id: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  contextualPricing: ContextualPricingSchema,
  metafield: MetafieldSchema
}).optional().nullable();

export const WeightSchema = z.object({
  value: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  __typename: z.string().optional().nullable()
}).optional().nullable();

export const LineItemSchema = z.object({
  id: z.string().optional().nullable(),
  discountedTotalSet: MoneySetSchema,
  discountedUnitPriceSet: MoneySetSchema,
  image: ImageSchema,
  isGiftCard: z.boolean().optional().nullable(),
  originalTotal: z.string().optional().nullable(),
  originalUnitPriceSet: MoneySetSchema,
  product: ProductSchema,
  quantity: z.number().optional().nullable(),
  requiresShipping: z.boolean().optional().nullable(),
  sku: z.string().optional().nullable(),
  taxable: z.boolean().optional().nullable(),
  title: z.string().optional().nullable(),
  variantTitle: z.string().optional().nullable(),
  variant: VariantSchema
}).optional().nullable();

export const AddressSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  provinceCode: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  countryCodeV2: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable()
}).optional().nullable();

export const ShippingLineSchema = z.object({
  title: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  originalPriceSet: MoneySetSchema
}).optional().nullable();

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

export const OrderDetailSchema = z.object({
  name: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  metafields: z.array(MetafieldSchema).optional().nullable(),

  approver: z.object({
    id: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
  }).optional().nullable(),

  customer: z.object({
    id: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    defaultAddress: AddressSchema
  }).optional().nullable(),
  purchasingEntity: z.object({
    company: z.object({
      id: z.string().optional().nullable(),
      name: z.string().optional().nullable()
    }).optional().nullable(),
    location: z.object({
      id: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
      externalId: z.string().optional().nullable()
    }).optional().nullable()
  }).optional().nullable(),
  lineItems: z.array(LineItemSchema).optional().nullable(),
  totalPriceSet: MoneySetSchema,
  totalTaxSet: MoneySetSchema,
  totalDiscountsSet: MoneySetSchema,
  subtotalPriceSet: MoneySetSchema,
  totalShippingPriceSet: MoneySetSchema,
  discountedPriceSet: MoneySetSchema,
  originalPriceSet: MoneySetSchema,
  processedAt: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  shippingLine: ShippingLineSchema,
  poNumber: z.string().optional().nullable(),
  paymentGatewayNames: z.array(z.string()).optional().nullable(),
  displayFinancialStatus: z.string().optional().nullable(),
  displayFulfillmentStatus: z.string().optional().nullable(),
  returnStatus: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  closed: z.boolean().optional().nullable(),
  cancelledAt: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  paymentTerms: paymentTermsSchema.nullable(),
  status: z.string().optional().nullable()
});

export type OrderDetailRequest = z.infer<typeof OrderDetailRequestSchema>;
export type OrderDetail = z.infer<typeof OrderDetailSchema>; 