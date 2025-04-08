import { z } from 'zod';

/**
 * Quote note type enum
 */
export const QuoteNoteType = {
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  ORDERED: 'Ordered'
} as const;

export type QuoteNoteTypeEnum = typeof QuoteNoteType[keyof typeof QuoteNoteType];

/**
 * Schema for quote note
 */
export const quoteNoteSchema = z.object({
  quoteId: z.number(),
  noteType: z.enum([
    QuoteNoteType.SUBMITTED,
    QuoteNoteType.APPROVED,
    QuoteNoteType.DECLINED,
    QuoteNoteType.CANCELLED,
    QuoteNoteType.EXPIRED,
    QuoteNoteType.ORDERED
  ]),
  noteContent: z.string().optional().nullable(),
  createdBy: z.string()
}).strict();

export type QuoteNoteInput = z.infer<typeof quoteNoteSchema>;