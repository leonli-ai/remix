import { z } from 'zod';

/**
 * Schema for getting quote details
 */
export const quoteDetailsRequestSchema = z.object({
  storeName: z.string(),
  quoteId: z.number(),
  companyLocationId: z.string().optional(),
  customerId: z.string().optional()
}).strict();

export type QuoteDetailsRequest = z.infer<typeof quoteDetailsRequestSchema>;

/**
 * Schema for getting draft quote details
 */
export const draftQuoteDetailsRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  quoteId: z.number(),
  companyLocationId: z.string()
}).strict();

export type DraftQuoteDetailsRequest = z.infer<typeof draftQuoteDetailsRequestSchema>;

/**
 * Schema for getting draft quote details with new parameter names
 */
export const draftQuoteDetailsWithNewParamsRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  draftQuoteId: z.number(),
  companyLocationId: z.string()
}).strict();

export type DraftQuoteDetailsWithNewParamsRequest = z.infer<typeof draftQuoteDetailsWithNewParamsRequestSchema>;