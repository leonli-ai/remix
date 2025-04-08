import { z } from 'zod';

// Zod schemas
export const ShopifyPriceSchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
});

export const ShopifyPriceResponseSchema = z.object({
  data: z.object({
    productVariant: z.object({
      contextualPricing: z.object({
        price: ShopifyPriceSchema
      })
    }).optional()
  }).nullable()
});

export const CompanyLocationEdgeSchema = z.object({
  node: z.object({
    id: z.string(),
    name: z.string()
  })
});

// TypeScript types inferred from Zod schemas
export type ShopifyPrice = z.infer<typeof ShopifyPriceSchema>;
export type ShopifyPriceResponse = z.infer<typeof ShopifyPriceResponseSchema>;
export type CompanyLocationEdge = z.infer<typeof CompanyLocationEdgeSchema>; 