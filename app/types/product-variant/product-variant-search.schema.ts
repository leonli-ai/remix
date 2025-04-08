import { z } from 'zod';

// Request schema
export const productVariantSearchRequestSchema = z.object({
  query: z.array(z.string()),
  storeName: z.string().min(1, 'Store name is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  companyLocationId: z.string().min(1, 'Company location ID is required'),
  companyId: z.string().min(1, 'Company ID is required')
});

// Response schemas for nested types
export const metafieldSchema = z.object({
  id: z.string().optional(),
  value: z.string(),
  key: z.string(),
  namespace: z.string()
});

export const priceSchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
});

export const quantityRuleSchema = z.object({
  minimum: z.number().nullable(),
  maximum: z.number().nullable(),
  increment: z.number().nullable()
});

export const contextualPricingSchema = z.object({
  price: priceSchema.nullable(),
  quantityRule: quantityRuleSchema.nullable()
});

export const unitPriceSchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
});

export const unitPriceMeasurementSchema = z.object({
  measuredType: z.string().nullable(),
  quantityUnit: z.string().nullable(),
  quantityValue: z.number().nullable(),
  referenceUnit: z.string().nullable(),
  referenceValue: z.number().nullable()
});

export const imageSchema = z.object({
  altText: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  id: z.string(),
  url: z.string()
});

export const variantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string(),
  customerPartnerNumber: z.string().nullable(),
  metafield: metafieldSchema.nullable(),
  unitPrice: unitPriceSchema.nullable(),
  availableForSale: z.boolean(),
  sellableOnlineQuantity: z.number().nullable(),
  unitPriceMeasurement: unitPriceMeasurementSchema.nullable(),
  contextualPricing: contextualPricingSchema.nullable()
});

export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  handle: z.string(),
  onlineStoreUrl: z.string().nullable(),
  metafields: z.object({
    nodes: z.array(metafieldSchema)
  }).optional(),
  images: z.object({
    nodes: z.array(imageSchema)
  }),
  updatedAt: z.string(),
  variants: z.object({
    nodes: z.array(variantSchema)
  })
});

// API Response schemas
export const productSearchResponseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  products: z.array(productSchema),
  error: z.boolean().optional(),
  errors: z.array(z.object({
    message: z.string(),
    path: z.array(z.string()).optional(),
    extensions: z.record(z.unknown()).optional()
  })).optional()
});

// Type exports
export type ProductVariantSearchRequest = z.infer<typeof productVariantSearchRequestSchema>;
export type ProductSearchResponse = z.infer<typeof productSearchResponseSchema>;
export type Product = z.infer<typeof productSchema>;
export type Variant = z.infer<typeof variantSchema>; 