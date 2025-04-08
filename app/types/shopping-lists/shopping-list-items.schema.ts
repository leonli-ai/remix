import { z } from 'zod';

// Add Filter Schema
const filterSchema = z.object({
  productName: z.string().optional(),
  skuId: z.string().optional(),
  customerPartnerNumber: z.string().optional()
}).strict();

// Add Sort Schema
const sortFieldEnum = z.enum(['createdAt', 'productName', 'skuId', 'customerPartnerNumber', 'quantity', 'price']);
const sortOrderEnum = z.enum(['asc', 'desc']);
const sortSchema = z.array(z.object({
  field: sortFieldEnum,
  order: sortOrderEnum
})).optional().default([{ field: 'createdAt', order: 'desc' }]);

// Request Schema
export const fetchShoppingListItemsRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  shoppingListId: z.number(),
  pagination: z.object({
    page: z.number().optional(),
    pageSize: z.number().optional()
  }).optional(),
  filters: filterSchema.optional(),
  sort: sortSchema
}).strict();

// Shopping list item schema
export const shoppingListItemSchema = z.object({
  id: z.number(),
  productId: z.string(),
  productName: z.string(),
  skuId: z.string(),
  productVariantId: z.string(),
  productImageUrl: z.string(),
  url: z.string(),
  customerPartnerNumber: z.string(),
  quantity: z.number(),
  price: z.number(),
  currencyCode: z.string(),
  subtotal: z.number(),
  createdAt: z.string(),
  updatedAt: z.string()
}).strict();

// Response Schema
export const shoppingListWithItemsSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  shoppingListId:z.number(),
  name: z.string(),
  description: z.string(),
  listItems: z.array(shoppingListItemSchema),
  isDefault: z.boolean()
}).strict();

// Delete request schema
export const deleteShoppingListItemsRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  shoppingListId: z.number(),
  listItems: z.array(z.number())
}).strict();

// Delete response schema
export const deleteShoppingListItemsResponseSchema = z.array(z.object({
  id: z.number(),
  shoppingListId: z.number(),
  productId: z.string(),
  productName: z.string(),
  skuId: z.string(),
  productVariantId: z.string(),
  productImageUrl: z.string(),
  url: z.string(),
  customerPartnerNumber: z.string(),
  quantity: z.number(),
  createdAt: z.string(),
  updatedAt: z.string()
}).strict());

// Update item schema
export const updateShoppingListItemSchema = z.object({
  id: z.number().optional(),
  productId: z.string(),
  productName: z.string().optional(),
  skuId: z.string().optional(),
  productVariantId: z.string(),
  productImageUrl: z.string().optional(),
  url: z.string().optional(),
  customerPartnerNumber: z.string().optional(),
  quantity: z.number().positive(),
  updatedAt: z.string().optional()
}).strict();

// Update request schema
export const updateShoppingListItemsRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  companyId: z.string(),
  shoppingListId: z.number(),
  data: z.object({
    listItems: z.array(updateShoppingListItemSchema),
  }),
}).strict();

// Aggregation request schema
export const shoppingListItemsAggregationRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  shoppingListId: z.number()
}).strict();

// Aggregation response schema
export const shoppingListItemsAggregationResponseSchema = z.object({
  summary: z.object({
    totalItemCount: z.number(),
    subtotal: z.number(),
    currencyCode: z.string()
  })
}).strict();

// Types
export type FetchShoppingListItemsRequest = z.infer<typeof fetchShoppingListItemsRequestSchema>;
export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>;
export type ShoppingListWithItems = z.infer<typeof shoppingListWithItemsSchema>;
export type DeleteShoppingListItemsRequest = z.infer<typeof deleteShoppingListItemsRequestSchema>;
export type DeleteShoppingListItemsResponse = z.infer<typeof deleteShoppingListItemsResponseSchema>;
export type UpdateShoppingListItemRequest = z.infer<typeof updateShoppingListItemsRequestSchema>;
export type UpdateShoppingListItem = z.infer<typeof updateShoppingListItemSchema>;
export type ShoppingListItemsAggregationRequest = z.infer<typeof shoppingListItemsAggregationRequestSchema>;
export type ShoppingListItemsAggregationResponse = z.infer<typeof shoppingListItemsAggregationResponseSchema>; 