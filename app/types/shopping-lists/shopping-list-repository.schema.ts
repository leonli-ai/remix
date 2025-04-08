import { z } from 'zod';

// Base schemas
export const shoppingListSortFieldSchema = z.enum([
  'id',
  'customerId',
  'name',
  'description',
  'companyLocationId',
  'isDefault',
  'canEdit',
  'createBy',
  'updateBy',
  'createdAt',
  'updatedAt',
  'subtotal',
  'items'
]);

export const shoppingListSortOrderSchema = z.enum(['asc', 'desc']);

export const shoppingListFilterSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  canEdit: z.boolean().optional(),
  createBy: z.string().optional(),
  updateBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
}).strict();

// Shopping list base schema
export const shoppingListSchema = z.object({
  id: z.number(),
  customerId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  companyLocationId: z.string(),
  isDefault: z.boolean(),
  canEdit: z.boolean(),
  createBy: z.string().nullable(),
  updateBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  storeName: z.string().nullable()
}).strict();

export const shoppingListWithCountSchema = shoppingListSchema.extend({
  _count: z.object({
    shoppingListItems: z.number()
  })
}).transform(data => ({
  ...data,
  description: data.description || undefined,
  createBy: data.createBy || undefined,
  updateBy: data.updateBy || undefined,
  storeName: data.storeName || undefined
}));

// Repository method parameter schemas
export const findManyParamsSchema = z.object({
  customerId: z.string(),
  companyLocationId: z.string(),
  storeName: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  filters: shoppingListFilterSchema.optional(),
  sort: z.array(z.object({
    field: shoppingListSortFieldSchema,
    order: shoppingListSortOrderSchema
  })).optional()
}).strict();

export const createParamsSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  companyLocationId: z.string(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  storeName: z.string().optional()
}).strict();

export const updateParamsSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  storeName: z.string().optional()
}).strict();

// Types
export type ShoppingListSortField = z.infer<typeof shoppingListSortFieldSchema>;
export type ShoppingListSortOrder = z.infer<typeof shoppingListSortOrderSchema>;
export type ShoppingListFilter = z.infer<typeof shoppingListFilterSchema>;
export type ShoppingList = z.infer<typeof shoppingListSchema>;
export type ShoppingListWithCount = z.infer<typeof shoppingListWithCountSchema>;
export type FindManyParams = z.infer<typeof findManyParamsSchema>;
export type CreateParams = z.infer<typeof createParamsSchema>;
export type UpdateParams = z.infer<typeof updateParamsSchema>; 