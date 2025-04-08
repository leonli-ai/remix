import { z } from 'zod';
import { CurrencyCode, isValidCurrencyCode } from '../currency';

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(10)
}).strict();

// Filter schema
export const filterSchema = z.object({
  name: z.string().optional(),
  subtotal: z.string().optional(),
  items: z.number().optional(),
  isDefault: z.boolean().optional(),
  description: z.string().optional(),
  companyLocationId: z.string().optional(),
  canEdit: z.boolean().optional(),
  createBy: z.string().optional(),
  updateBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
}).strict();

// Sort field schema
export const sortFieldSchema = z.enum([
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
]) as z.ZodType<'id' | 'customerId' | 'name' | 'description' | 'companyLocationId' | 'isDefault' | 'canEdit' | 'createBy' | 'updateBy' | 'createdAt' | 'updatedAt' | 'subtotal' | 'items'>;

export const sortItemSchema = z.object({
  field: sortFieldSchema,
  order: z.enum(['asc', 'desc']) as z.ZodType<'asc' | 'desc'>
});

export const sortSchema = z.array(sortItemSchema).default([
  { field: 'updatedAt', order: 'desc' }
]);

// Request data schema
export const dataSchema = z.object({
  filters: filterSchema.optional(),
  pagination: paginationSchema.optional(),
  sort: sortSchema.optional()
}).strict();

// Main filter schema
export const shoppingListFilterSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  data: z.object({
    filters: filterSchema.optional(),
    pagination: paginationSchema.optional(),
    sort: sortSchema.optional(),
    currencyCode: z.nativeEnum(CurrencyCode).optional()
  }).optional()
}).strict();

// Shopping list schema
export const shoppingListSchema = z.object({
  id: z.number(),
  customerId: z.string(),
  companyLocationId: z.string(),
  description: z.string().nullable().optional(),
  name: z.string(),
  subtotal: z.number().optional(),
  currencyCode: z.string().optional(),
  items: z.number().optional(),
  isDefault: z.boolean().optional(),
  storeName: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
}).strict();

// Types inferred from schemas
export type PaginationParams = z.infer<typeof paginationSchema>;
export type FilterParams = z.infer<typeof filterSchema>;
export type data = z.infer<typeof dataSchema>;
export type ShoppingListFilter = z.infer<typeof shoppingListFilterSchema>;
export type ShoppingList = z.infer<typeof shoppingListSchema>;

// Response type
export type ShoppingListResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  shoppingLists: ShoppingList[];
};

// Repository findMany params schema
export const repositoryFindManyParamsSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  filters: z.object({
    shoppingListName: z.string().optional(),
    subtotal: z.string().optional(),
    items: z.number().optional(),
    isDefault: z.boolean().optional()
  }).optional(),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number()
  }).optional(),
  currencyCode: z.string().optional().refine(isValidCurrencyCode, { message: 'Invalid currency code' })
}).strict();

// Repository where clause schema
export const repositoryWhereClauseSchema = z.object({
  customerId: z.string(),
  companyLocationId: z.string(),
  name: z.object({
    contains: z.string(),
    mode: z.enum(['insensitive'])
  }).optional(),
  isDefault: z.boolean().optional()
}).strict();

// Repository types
export type RepositoryWhereClause = z.infer<typeof repositoryWhereClauseSchema>;
export type RepositoryFindManyParams = z.infer<typeof repositoryFindManyParamsSchema>;

// Reuse the response schema for all operations
export type DeleteShoppingListResponse = ShoppingListResponse['shoppingLists'][0];
export type CreateShoppingListResponse = ShoppingListResponse['shoppingLists'][0];
export type UpdateShoppingListResponse = ShoppingListResponse['shoppingLists'][0];

// Request schemas
export const updateShoppingListRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  id: z.number(),
  data: z.object({
    shoppingListName: z.string().optional(),
    isDefault: z.boolean().optional(),
    description: z.string().optional()
  })
}).strict();

export const deleteShoppingListRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  id: z.number()
}).strict();

// Request types
export type UpdateShoppingListRequest = z.infer<typeof updateShoppingListRequestSchema>;
export type DeleteShoppingListRequest = z.infer<typeof deleteShoppingListRequestSchema>;

// Create shopping list schemas
export const createShoppingListRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyLocationId: z.string(),
  data: z.object({
    shoppingListName: z.string(),
    isDefault: z.boolean().optional(),
    description: z.string().optional()
  })
}).strict();

export type CreateShoppingListRequest = z.infer<typeof createShoppingListRequestSchema>; 