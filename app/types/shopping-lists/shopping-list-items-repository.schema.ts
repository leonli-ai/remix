import { z } from 'zod';

// Base schemas
export const shoppingListItemSchema = z.object({
  id: z.number(),
  shoppingListId: z.number(),
  productId: z.string(),
  productName: z.string().nullable(),
  skuId: z.string(),
  productVariantId: z.string(),
  productImageUrl: z.string().nullable(),
  url: z.string().nullable(),
  customerPartnerNumber: z.string().nullable(),
  quantity: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
}).strict();

// Repository method parameter schemas
export const findManyParamsSchema = z.object({
  shoppingListId: z.number(),
  pagination: z.object({
    page: z.number().optional(),
    pageSize: z.number().optional()
  }).optional(),
  filters: z.object({
    productName: z.string().optional(),
    skuId: z.string().optional(),
    customerPartnerNumber: z.string().optional()
  }).optional(),
  sort: z.array(z.object({
    field: z.enum(['createdAt', 'productName', 'skuId', 'customerPartnerNumber', 'quantity', 'price']),
    order: z.enum(['asc', 'desc'])
  })).optional()
}).strict();

export const findManyResponseSchema = z.object({
  lists: z.array(shoppingListItemSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number()
}).strict();

// Types
export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>;
export type FindManyParams = z.infer<typeof findManyParamsSchema>;
export type FindManyResponse = z.infer<typeof findManyResponseSchema>; 