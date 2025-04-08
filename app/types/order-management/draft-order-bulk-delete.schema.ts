import { z } from 'zod';

export const draftOrderBulkDeleteRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  ids: z.array(z.string()).optional(),
  search: z.string().optional()
}).strict()
.refine(data => data.ids || data.search, {
  message: "Either ids or search must be provided"
});

export const draftOrderBulkDeleteResponseSchema = z.object({
  success: z.boolean()
}).strict();

export type DraftOrderBulkDeleteRequest = z.infer<typeof draftOrderBulkDeleteRequestSchema>;
export type DraftOrderBulkDeleteResponse = z.infer<typeof draftOrderBulkDeleteResponseSchema>; 