import { z } from 'zod';

/**
 * Allowed file types for PO automation upload
 */
export const AllowedFileTypes = {
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  BMP: 'image/bmp'
} as const;

export type AllowedFileTypesEnum = typeof AllowedFileTypes[keyof typeof AllowedFileTypes];

/**
 * Schema for file upload request
 */
export const poFileUploadSchema = z.object({
  storeName: z.string({
    required_error: 'Store name is required',
    invalid_type_error: 'Store name must be a string'
  }).min(1, 'Store name cannot be empty'),
  file: z.instanceof(File, {
    message: 'File is required and must be a valid file'
  }).refine(
    (file) => {
      const validTypes = Object.values(AllowedFileTypes);
      // Special handling for PDF files with empty type
      if (file.name.toLowerCase().endsWith('.pdf') && !file.type) {
        return true;
      }
      return validTypes.includes(file.type as AllowedFileTypesEnum);
    },
    {
      message: 'File must be a PDF, JPEG, PNG, GIF, or BMP'
    }
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB max
    {
      message: 'File size must be less than 10MB'
    }
  ),
  customerId: z.string({
    invalid_type_error: 'Customer ID must be a string'
  }).nullable().optional(),
  companyId: z.string({
    invalid_type_error: 'Company ID must be a string'
  }).nullable().optional(),
  companyLocationId: z.string({
    invalid_type_error: 'Company location ID must be a string'
  }).nullable().optional()
}).strict();

export type PoFileUploadRequest = z.infer<typeof poFileUploadSchema>;

/**
 * Schema for file upload response
 */
export const poFileUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  fileUrl: z.string().url('File URL must be a valid URL'),
  fileName: z.string().min(1, 'File name cannot be empty'),
  fileType: z.enum([
    AllowedFileTypes.PDF,
    AllowedFileTypes.JPEG,
    AllowedFileTypes.PNG,
    AllowedFileTypes.GIF,
    AllowedFileTypes.BMP
  ], {
    required_error: 'File type is required',
    invalid_type_error: 'Invalid file type'
  }),
  fileSize: z.number().positive('File size must be positive'),
  fileId: z.number().positive('File ID must be positive'),
  uploadedAt: z.string().datetime('Upload time must be a valid datetime'),
  status: z.enum(['UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED']),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
}).strict();

export type PoFileUploadResponse = z.infer<typeof poFileUploadResponseSchema>; 