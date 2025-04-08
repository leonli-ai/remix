import { z } from 'zod';

export const draftOrderApproveRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  draftOrderId: z.string()
}).strict();

export const draftOrderApproveResponseSchema = z.object({
  success: z.boolean(),
  draftOrder: z.object({
    id: z.string(),
    status: z.string(),
    order: z.object({
      id: z.string()
    }).nullable()
  })
}).strict();

export type DraftOrderApproveRequest = z.infer<typeof draftOrderApproveRequestSchema>;
export type DraftOrderApproveResponse = z.infer<typeof draftOrderApproveResponseSchema>; 