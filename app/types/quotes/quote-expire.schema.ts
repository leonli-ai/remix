import { z } from 'zod';

/**
 * Schema for expiring a quote
 * Only quotes in Submitted or Approved status can be expired
 */
export const expireQuoteSchema = z.object({
  storeName: z.string().min(1),
  quoteId: z.number().int().positive(),
  companyLocationId: z.string().min(1),
  customerId: z.string().min(1),
  expireNote: z.string().optional().nullable()
}).strict();

/**
 * Schema for expire quote request
 */
export type ExpireQuoteRequest = z.infer<typeof expireQuoteSchema>;

/**
 * Schema for expire quote response
 */
export const expireQuoteResponseSchema = z.object({
  code: z.number(),
  message: z.string()
}).strict();

export type ExpireQuoteResponse = z.infer<typeof expireQuoteResponseSchema>;