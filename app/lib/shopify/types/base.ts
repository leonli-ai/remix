import { z } from 'zod';
export const baseResponseSchema = z.object({
  extensions: z.object({
    cost: z.object({
      requestedQueryCost: z.number(),
      actualQueryCost: z.number(),
      throttleStatus: z.object({
        maximumAvailable: z.number(),
        currentlyAvailable: z.number(),
        restoreRate: z.number()
      })
    })
  }).optional(),
  headers: z.record(z.unknown())
});

export type BaseResponse = z.infer<typeof baseResponseSchema>;

export const locationSchema = z.object({
  id: z.string(),
  name: z.string()
});

export const inventoryLevelSchema = z.object({
  available: z.number(),
  location: locationSchema
});

export const inventoryItemSchema = z.object({
  id: z.string(),
  inventoryLevels: z.object({
    edges: z.array(z.object({
      node: inventoryLevelSchema
    }))
  })
});

export const variantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.string(),
  inventoryItem: inventoryItemSchema
}); 