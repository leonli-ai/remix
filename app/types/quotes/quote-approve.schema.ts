import { z } from 'zod';

/**
 * Schema for approving a quote
 */
export const approveQuoteSchema = z.object({
  storeName: z.string(),
  quoteId: z.number(),
  companyLocationId: z.string(),
  customerId: z.string(),
  approveNote: z.string().optional().nullable()
}).strict();

export type ApproveQuoteRequest = z.infer<typeof approveQuoteSchema>; 