import { z } from 'zod';

export const draftOrderRejectRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  draftOrderId: z.string(),
  note: z.string().optional()
}).strict();

export const draftOrderRejectResponseSchema = z.object({
  success: z.boolean()
}).strict();

export type DraftOrderRejectRequest = z.infer<typeof draftOrderRejectRequestSchema>;
export type DraftOrderRejectResponse = z.infer<typeof draftOrderRejectResponseSchema>; 