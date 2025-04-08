import { z } from 'zod';

export const VariantPriceRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  variantIds: z.array(z.string())
});

export const VariantPriceSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  sku: z.string().optional(),
  price: z.object({
    amount: z.string(),
    currencyCode: z.string()
  }).optional(),
  quantityRule: z.object({
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    increment: z.number().optional()
  }).optional()
});

export const VariantPricesResponseSchema = z.object({
  variantPrices: z.array(VariantPriceSchema)
});

export type VariantPriceRequest = z.infer<typeof VariantPriceRequestSchema>;
export type VariantPrice = z.infer<typeof VariantPriceSchema>;
export type VariantPricesResponse = z.infer<typeof VariantPricesResponseSchema>; 