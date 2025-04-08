import { z } from 'zod';

/**
 * Schema for PO link information
 */
const PoLinkSchema = z.object({
  url: z.string().url('PO link URL must be a valid URL'),
  fileType: z.string().min(1, 'File type is required')
}).strict();

const PriceWithCurrencySchema = z.object({
  amount: z.number().min(0, 'Price cannot be negative'),
  currencyCode: z.string().min(1, 'Currency code is required')
});

const ShippingLineSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  priceWithCurrency: PriceWithCurrencySchema
}).optional();

/**
 * Schema for create order request
 */
export const CreateOrderRequestSchema = z.object({
  // Store name is required for Shopify operations
  storeName: z.string().min(1, 'Store name is required'),
  
  // Customer ID who is creating the order
  customerId: z.string().min(1, 'Customer ID is required'),
  
  // Company location ID for shipping and billing addresses
  companyLocationId: z.string().min(1, 'Company location ID is required'),
  
  // Optional purchase order number
  poNumber: z.string().optional(),
  
  // Optional note for the order
  note: z.string().optional(),

  // Optional PO link information
  poLink: PoLinkSchema.optional(),
  
  // Order items
  items: z.array(z.object({
    variantId: z.string().min(1, 'Product variant ID is required'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    price: z.number().positive('Price must be a positive number')
  })).min(1, 'At least one item is required'),
  
  // Currency code for the order
  currencyCode: z.string().min(1, 'Currency code is required'),

  shippingLine: ShippingLineSchema.optional()
}).strict();

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

/**
 * Schema for create order response
 */
export const CreateOrderResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    orderId: z.string().optional(),
    draftOrderId: z.string().optional()
  }).optional()
});

export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>; 