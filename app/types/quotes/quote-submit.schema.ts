import { z } from 'zod';

/**
 * Schema for submitting draft quote
 */
export const submitDraftQuoteSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  quoteId: z.number(),
  companyLocationId: z.string()
}).strict();

/**
 * Schema for submitting draft quote with new parameter names
 */
export const submitDraftQuoteWithNewParamsSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  draftQuoteId: z.number(),
  companyLocationId: z.string()
}).strict();

export type SubmitDraftQuoteRequest = z.infer<typeof submitDraftQuoteSchema>;
export type SubmitDraftQuoteWithNewParamsRequest = z.infer<typeof submitDraftQuoteWithNewParamsSchema>; 