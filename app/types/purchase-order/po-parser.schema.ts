import { z } from 'zod';
import type { ValidateResult } from '~/types/purchase-order';

/**
 * Allowed file types for PO parser
 */
export const AllowedParserFileTypes = {
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
  PNG: 'image/png',
  BMP: 'image/bmp'
} as const;

export type AllowedParserFileTypesEnum = typeof AllowedParserFileTypes[keyof typeof AllowedParserFileTypes];

/**
 * Schema for parsing purchase order
 */
export const poParserRequestSchema = z.object({
  storeName: z.string(),
  fileType: z.string(),
  url: z.string().optional(),
  file: z.string().optional(),
  companyId: z.string().optional(),
  companyLocationId: z.string().optional()
});

export type PoParserRequest = z.infer<typeof poParserRequestSchema>;

export interface PoParserResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  errors?: string[];
  validationErrors?: string[];
}