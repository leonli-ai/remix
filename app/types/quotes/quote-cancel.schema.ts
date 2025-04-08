import { z } from 'zod';

/**
 * Schema for cancelling a quote
 */
export const cancelQuoteSchema = z.object({
  storeName: z.string(),
  quoteId: z.number(),
  companyLocationId: z.string(),
  customerId: z.string(),
  cancelNote: z.string().optional().nullable()
}).strict();

export type CancelQuoteRequest = z.infer<typeof cancelQuoteSchema>; 