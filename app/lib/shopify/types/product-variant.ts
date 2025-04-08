import { z } from 'zod';

export const ThrottleStatusSchema = z.object({
  maximumAvailable: z.number(),
  currentlyAvailable: z.number(),
  restoreRate: z.number()
});

export const CostSchema = z.object({
  requestedQueryCost: z.number(),
  actualQueryCost: z.number(),
  throttleStatus: ThrottleStatusSchema
});

export const ProductVariantResponseSchema = z.object({
  data: z.object({
    productVariants: z.object({
      edges: z.array(z.object({
        node: z.object({
          id: z.string(),
          sku: z.string(),
          title: z.string(),
          product: z.object({
            title: z.string(),
            handle: z.string()
          })
        })
      }))
    })
  }),
  extensions: z.object({
    cost: CostSchema
  }),
  headers: z.record(z.unknown())
});

export const ProductVariantPriceSchema = z.object({
  amount: z.string()
});

export const ProductVariantContextualPricingSchema = z.object({
  price: ProductVariantPriceSchema.optional(),
  currencyCode: z.string().optional()
});

export const ProductVariantPriceResponseSchema = z.object({
  data: z.object({
    productVariant: z.object({
      id: z.string(),
      contextualPricing: ProductVariantContextualPricingSchema
    }).optional()
  }).optional()
});

export type ProductVariantResponse = z.infer<typeof ProductVariantResponseSchema>;
export type ThrottleStatus = z.infer<typeof ThrottleStatusSchema>;
export type Cost = z.infer<typeof CostSchema>;
export type ProductVariantPriceResponse = z.infer<typeof ProductVariantPriceResponseSchema>; 