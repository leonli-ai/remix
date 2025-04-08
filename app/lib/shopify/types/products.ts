import { z } from 'zod';
import { variantSchema } from './base';

export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  variants: z.object({
    edges: z.array(z.object({
      node: variantSchema
    }))
  })
});

export const productsResponseSchema = z.object({
  products: z.object({
    edges: z.array(z.object({
      cursor: z.string(),
      node: productSchema
    })),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string()
    })
  })
});

export const productDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string().optional(),
  priceRangeV2: z.object({
    minVariantPrice: z.object({
      amount: z.string(),
      currencyCode: z.string()
    })
  }),
  variants: z.object({
    edges: z.array(z.object({
      node: z.object({
        id: z.string(),
        title: z.string(),
        sku: z.string(),
        price: z.string()
      })
    }))
  })
});

export type ShopifyProduct = z.infer<typeof productSchema>;
export type ShopifyProductsResponse = z.infer<typeof productsResponseSchema>;
export type ShopifyProductDetail = z.infer<typeof productDetailSchema>; 