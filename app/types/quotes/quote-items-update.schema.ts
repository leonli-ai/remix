import { z } from 'zod';

/**
 * Schema for quote item update operations
 */
export const quoteItemUpdateSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().min(1),
  originalPrice: z.number().min(0),
  offerPrice: z.number().min(0),
  description: z.string().nullable().optional()
}).strict();

/**
 * Schema for quote items update request
 */
export const updateQuoteItemsSchema = z.object({
  storeName: z.string(),
  quoteId: z.number(),
  companyLocationId: z.string(),
  customerId: z.string(),
  quoteItems: z.array(quoteItemUpdateSchema).min(1, 'At least one quote item must be provided'),
  expirationDate: z.string().optional(),
  poNumber: z.string().optional(),
  note: z.object({
    id: z.number().optional(),
    content: z.string().optional().nullable()
  }).optional()
}).strict();

/**
 * Schema for draft quote item update operations with new parameter names
 */
export const draftQuoteItemUpdateSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().min(1),
  originalPrice: z.number().min(0),
  offerPrice: z.number().min(0),
  description: z.string().nullable().optional()
}).strict();

/**
 * Schema for draft quote items update request with new parameter names
 */
export const updateDraftQuoteItemsWithNewParamsSchema = z.object({
  storeName: z.string(),
  draftQuoteId: z.number(),
  companyLocationId: z.string(),
  customerId: z.string(),
  draftQuoteItems: z.array(draftQuoteItemUpdateSchema).min(1, 'At least one draft quote item must be provided')
}).strict();

export type QuoteItemUpdate = z.infer<typeof quoteItemUpdateSchema>;
export type UpdateQuoteItemsRequest = z.infer<typeof updateQuoteItemsSchema>;
export type DraftQuoteItemUpdate = z.infer<typeof draftQuoteItemUpdateSchema>;
export type UpdateDraftQuoteItemsWithNewParamsRequest = z.infer<typeof updateDraftQuoteItemsWithNewParamsSchema>;