import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(10)
}).optional().default({
  page: 1,
  pageSize: 10
})

export const filterSchema = z.object({
  skuId: z.string().optional(),
  customerPartnerNumber: z.string().optional(),
  productTitle: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional()
}).optional().default({})

// Legacy sort schema
export const legacySortSchema = z.object({
  sortBy: z.enum([
    'id',
    'storeName',
    'skuId',
    'companyId',
    'companyName',
    'customerPartnerNumber',
    'productTitle',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy'
  ]).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const sortFieldSchema = z.enum([
  'id',
  'storeName',
  'skuId',
  'companyId',
  'companyName',
  'customerPartnerNumber',
  'productTitle',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy'
]);

export const sortItemSchema = z.object({
  field: sortFieldSchema,
  order: z.enum(['asc', 'desc']).default('asc')
});

// Combined sort schema that accepts either format
export const sortSchema = z.union([
  z.array(sortItemSchema),
  legacySortSchema
]).optional().default([
  { field: 'companyName', order: 'asc' },
  { field: 'skuId', order: 'asc' }
]);

export const storeCompanyMappingQuerySchema = z.object({
  storeName: z.string(),
  pagination: paginationSchema,
  filter: filterSchema,
  sort: sortSchema
})

export const storeCompanyMappingResponseSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  items: z.array(
    z.object({
      id: z.number(),
      storeName: z.string(),
      skuId: z.string(),
      companyId: z.string(),
      companyName: z.string().nullable(),
      customerPartnerNumber: z.string(),
      productTitle: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      createdBy: z.string().nullable(),
      updatedBy: z.string().nullable()
    })
  )
})

export const bulkDeleteMappingSchema = z.object({
  storeName: z.string(),
  ids: z.array(z.number())
})

export const exportMappingSchema = z.object({
  storeName: z.string(),
  companyId: z.string(),
  format: z.enum(['csv', 'xlsx']).default('xlsx')
});

export type StoreCompanyMappingQuery = z.infer<typeof storeCompanyMappingQuerySchema>
export type StoreCompanyMappingResponse = z.infer<typeof storeCompanyMappingResponseSchema>
export type BulkDeleteMappingRequest = z.infer<typeof bulkDeleteMappingSchema>
export type ExportMappingRequest = z.infer<typeof exportMappingSchema>
export type SortField = z.infer<typeof sortFieldSchema>
export type SortItem = z.infer<typeof sortItemSchema> 