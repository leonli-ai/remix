import { z } from 'zod';

// Record validation schema
export const customerPartnerNumberRecordSchema = z.object({
  skuId: z.string().min(1, 'SKU ID is required'),
  customerPartnerNumber: z.string().min(1, 'Customer Partner Number is required'),
  productName: z.string().min(1, 'Product Name is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  companyName: z.string().optional()
});

// Failed record structure
export interface FailedRecord {
  record: Partial<CustomerPartnerNumberRecord>;
  row: number;
  errors: string[];
}

// Validation result interface
export interface ValidationResult {
  validRecords: CustomerPartnerNumberRecord[];
  failedRecords: FailedRecord[];
}

export type CustomerPartnerNumberRecord = z.infer<typeof customerPartnerNumberRecordSchema>;

// Upload request schema with file
export const customerPartnerNumberUploadRequestSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  format: z.enum(['xlsx', 'csv']).optional().default('xlsx'),
  file: z.instanceof(File, { message: 'File is required' })
}).strict();

export const validationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    row: z.number(),
    message: z.string(),
    record: customerPartnerNumberRecordSchema
  })).optional()
}).strict();

export const customerPartnerNumberUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  totalProcessed: z.number(),
  successCount: z.number(),
  failureCount: z.number(),
  failedRecords: z.array(z.object({
    record: customerPartnerNumberRecordSchema.partial(),
    row: z.number(),
    errors: z.array(z.string())
  }))
}).strict();

export type CustomerPartnerNumberUploadRequest = z.infer<typeof customerPartnerNumberUploadRequestSchema>;
export type CustomerPartnerNumberUploadResponse = z.infer<typeof customerPartnerNumberUploadResponseSchema>; 