import { z } from 'zod'

// Existing schemas
export const CustomerPartnerNumberFetchRequestSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  data: z.array(z.string().min(1, 'Customer partner number is required'))
});


// Existing schemas
export const SkuFetchRequestSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  skuIds: z.array(z.string().min(1, 'SKU is required'))
});



// Schema for customer partner number detail
export const CustomerPartnerNumberDetailSchema = z.object({
  storeName: z.string(),
  skuId: z.string().nullable(),
  companyId: z.string(),
  customerPartnerNumber: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable()
});

// Response schema for batch fetch
export const CustomerPartnerNumberFetchResponseSchema = z.object({
  code: z.number(),
  skuDetails: z.array(CustomerPartnerNumberDetailSchema).optional()
});

// New schemas for search
export const CustomerPartnerNumberSearchRequestSchema = z.object({
  q: z.string().min(1, 'Customer partner number is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  storeName: z.string().min(1, 'Store name is required')
});

export const ShopifyProductVariantSchema = z.object({
  data: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      title: z.string(),
      product: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        handle: z.string()
      })
    }))
  })
});


export const CustomerPartnerNumberSearchSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  customerPartnerNumber: z.string().min(1, 'Customer partner number is required')
})


// Type exports
export type CustomerPartnerNumberFetchRequest = z.infer<typeof CustomerPartnerNumberFetchRequestSchema>;
export type CustomerPartnerNumberDetail = z.infer<typeof CustomerPartnerNumberDetailSchema>;
export type CustomerPartnerNumberFetchResponse = z.infer<typeof CustomerPartnerNumberFetchResponseSchema>;
export type CustomerPartnerNumberSearchRequest = z.infer<typeof CustomerPartnerNumberSearchRequestSchema>;
export type ShopifyProductVariantResponse = z.infer<typeof ShopifyProductVariantSchema>; 
export type CustomerPartnerNumberSearchSchemaType = z.infer<typeof CustomerPartnerNumberSearchSchema> 
export type SkuFetchRequest = z.infer<typeof SkuFetchRequestSchema>;

// New schemas for optimized bulk operations
export const BulkCustomerPartnerNumberRecordSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  skuId: z.string().min(1, 'SKU ID is required'),
  customerPartnerNumber: z.string().min(1, 'Customer partner number is required'),
  productName: z.string().min(1, 'Product name is required'),
  companyName: z.string().optional()
});

export const BulkOperationResultSchema = z.object({
  batchIndex: z.number(),
  successCount: z.number(),
  failedRecords: z.array(z.object({
    record: BulkCustomerPartnerNumberRecordSchema,
    error: z.string(),
    context: z.record(z.unknown()).optional()
  }))
});

export const BulkOperationSummarySchema = z.object({
  totalProcessed: z.number(),
  successCount: z.number(),
  failureCount: z.number(),
  batchResults: z.array(BulkOperationResultSchema),
  failedRecords: z.array(z.object({
    record: BulkCustomerPartnerNumberRecordSchema,
    error: z.string(),
    context: z.record(z.unknown()).optional()
  }))
});

// Type exports for new schemas
export type BulkCustomerPartnerNumberRecord = z.infer<typeof BulkCustomerPartnerNumberRecordSchema>;
export type BulkOperationResult = z.infer<typeof BulkOperationResultSchema>;
export type BulkOperationSummary = z.infer<typeof BulkOperationSummarySchema>;

export interface IStoreCompanyMappingService {
  getRedirectUrl(
    params: CustomerPartnerNumberSearchRequest,
    allSearchParams: Record<string, string>
  ): Promise<string>;
  // ... other methods ...
}
