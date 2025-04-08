import { z } from 'zod';
import { mailingAddressSchema } from './mailing-address.schema';

export const productImageSchema = z.object({
  id: z.string(),
  url: z.string()
});

export const productVariantQuantityRuleSchema = z.object({
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  increment: z.number().optional()
});

export const productVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  customerPartNumber: z.string().optional(),
  title: z.string(),
  price: z.number(),
  parsedPrice: z.number(),
  currencyCode: z.string().optional(),
  inventoryQuantity: z.number(),
  availableForSale: z.boolean(),
  customUom: z.string().optional(),
  quantityRule: productVariantQuantityRuleSchema.nullable().optional(),
  quantity: z.number().optional()
});

export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  handle: z.string(),
  onlineStoreUrl: z.string(),
  updatedAt: z.string(),
  image: productImageSchema.nullable(),
  variant: productVariantSchema
});

export const parseDataSchema = z.object({
  orderNumber: z.string(),
  date: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  email: z.string(),
  shippingAddress: mailingAddressSchema,
  lineItems: z.array(z.object({
    sku: z.string(),
    quantity: z.number(),
    price: z.number(),
    title: z.string().optional()
  }))
});

export const parseResultSchema = z.object({
  isValid: z.boolean(),
  errorMessage: z.string().optional(),
  validationErrors: z.array(z.string()).optional(),
  data: z.object({
    customer: z.any(),
    companyContactProfiles: z.array(z.any()).optional(),
    products: z.array(z.any())
  }).optional()
});

export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Product = z.infer<typeof productSchema>;
export type ParseData = z.infer<typeof parseDataSchema>;
export type ParseResult = z.infer<typeof parseResultSchema>; 