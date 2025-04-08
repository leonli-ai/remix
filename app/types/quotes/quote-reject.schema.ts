import { z } from 'zod';

/**
 * Schema for rejecting a quote
 */
export const rejectQuoteSchema = z.object({
  storeName: z.string(),
  quoteId: z.number(),
  companyLocationId: z.string(),
  customerId: z.string(),
  rejectNote: z.string().min(1).max(500)
}).strict();

export type RejectQuoteRequest = z.infer<typeof rejectQuoteSchema>; 