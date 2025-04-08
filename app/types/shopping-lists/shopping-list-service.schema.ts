import { z } from 'zod';

// Shop data schema
export const shopDataSchema = z.object({
  shop: z.object({
    currencyCode: z.string()
  })
}).strict();

// Price operation schemas
export const priceOperationItemSchema = z.object({
  productVariantId: z.string()
}).strict();

export const priceResultSchema = z.object({
  price: z.number(),
  currencyCode: z.string()
}).strict();

// Service method parameter schemas
export const getPricesForFetchOperationParamsSchema = z.object({
  shoppingListId: z.number(),
  items: z.array(priceOperationItemSchema),
  companyLocationId: z.string(),
  storeName: z.string().optional(),
  isDefault: z.boolean().optional(),
  description: z.string().optional(),
  name: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  totalCount: z.number().optional(),
  listItems: z.array(z.object({
    currencyCode: z.string(),
    productVariantId: z.string(),
    url: z.string()
  })).optional()
}).strict();

export const getPricesForUpdateOperationParamsSchema = z.object({
  items: z.array(priceOperationItemSchema),
  companyLocationId: z.string(),
  storeName: z.string()
}).strict();

// Types
export type ShopData = z.infer<typeof shopDataSchema>;
export type PriceOperationItem = z.infer<typeof priceOperationItemSchema>;
export type PriceResult = z.infer<typeof priceResultSchema>;
export type GetPricesForFetchOperationParams = z.infer<typeof getPricesForFetchOperationParamsSchema>;
export type GetPricesForUpdateOperationParams = z.infer<typeof getPricesForUpdateOperationParamsSchema>; 