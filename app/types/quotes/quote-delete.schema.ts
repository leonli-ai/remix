import { z } from 'zod';

/**
 * Schema for bulk deleting quotes
 */
export const bulkDeleteQuotesSchema = z.object({
  storeName: z.string(),
  companyLocationId: z.string(),
  customerId: z.string(),
  quoteIds: z.array(z.number()).min(1, 'At least one quote ID must be provided')
}).strict();

export type BulkDeleteQuotesRequest = z.infer<typeof bulkDeleteQuotesSchema>;

/**
 * Schema for bulk deleting draft quotes
 */
export const bulkDeleteDraftQuotesSchema = z.object({
  storeName: z.string(),
  companyLocationId: z.string(),
  customerId: z.string(),
  draftQuoteIds: z.array(z.number()).min(1, 'At least one draft quote ID must be provided')
}).strict();

export type BulkDeleteDraftQuotesRequest = z.infer<typeof bulkDeleteDraftQuotesSchema>; 