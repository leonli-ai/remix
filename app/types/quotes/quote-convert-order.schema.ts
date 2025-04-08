import { z } from 'zod';

/**
 * Schema for converting a quote to order request
 */
export const convertQuoteToOrderSchema = z.object({
  quoteId: z.number(),
  storeName: z.string(),
  companyLocationId: z.string(),
  customerId: z.string(),
  note: z.string().optional().nullable(),
  shippingLine: z.object({
    title: z.string(),
    priceWithCurrency: z.object({
      amount: z.number(),
      currencyCode: z.string()
    })
  }).optional()
}).strict();

// TypeScript type for the request
export type ConvertQuoteToOrderRequest = z.infer<typeof convertQuoteToOrderSchema>;

/**
 * Schema for convert quote to order response
 */
export const convertQuoteToOrderResponseSchema = z.object({
  code: z.number(),
  message: z.string()
}).strict();

// TypeScript type for the response
export type ConvertQuoteToOrderResponse = z.infer<typeof convertQuoteToOrderResponseSchema>; 