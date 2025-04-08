import { z } from 'zod';

/**
 * Quote status enum
 */
export const QuoteStatus = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  ORDERED: 'Ordered'
} as const;

export type QuoteStatusType = typeof QuoteStatus[keyof typeof QuoteStatus];

/**
 * Base schema for Quote items
 */
export const quoteItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().min(1),
  originalPrice: z.number().min(0),
  offerPrice: z.number().min(0),
  description: z.string().nullable().optional()
});

/**
 * Schema for Quote data in create request
 */
export const quoteDataSchema = z.object({
  customerId: z.string(),
  companyLocationId: z.string().nullable(),
  currencyCode: z.string().default('USD'),
  requestNote: z.string().nullable().optional(),
  poNumber: z.string().nullable().optional(),
  quoteItems: z.array(quoteItemSchema),
  expirationDate: z.string().nullable().optional()
});

/**
 * Base schema for Quote input
 */
export const quoteInputSchema = z.object({
  storeName: z.string(),
  quote: quoteDataSchema
});

/**
 * Schema for creating a new draft Quote
 */
export const createDraftQuoteSchema = quoteInputSchema;

/**
 * Schema for pagination
 */
export const quotePaginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(10)
}).optional().default({
  page: 1,
  pageSize: 10
});

/**
 * Schema for quote filtering
 */
export const quoteFilterSchema = z.object({
  id: z.number().int().optional(),
  customer: z.string().optional(),
  customerIds: z.array(z.string()).optional(),
  companyLocationId: z.string().optional(),
  currencyCode: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  actionBy: z.string().optional(),
  poNumber: z.string().optional(),
  status: z.enum(['Submitted', 'Approved', 'Declined', 'Cancelled', 'Expired', 'Ordered']).optional(),

  // Date fields with >= comparison (YYYY-MM-DD format)
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expirationDate: z.string().optional(),
}).optional().default({});

/**
 * Schema for quote sort fields
 */
export const quoteSortFieldSchema = z.enum([
  'id',
  'customerId',
  'companyLocationId',
  'subtotal',
  'currencyCode',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy'
]);

/**
 * Schema for quote sort item
 */
export const quoteSortItemSchema = z.object({
  field: quoteSortFieldSchema,
  order: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Schema for quote sorting
 */
export const quoteSortSchema = z.array(quoteSortItemSchema)
  .optional()
  .default([{ field: 'createdAt', order: 'desc' }]);

/**
 * Schema for fetching draft quotes
 */
export const fetchDraftQuotesSchema = z.object({
  storeName: z.string(),
  companyLocationId: z.string(),
  customerId: z.string().optional(),
  pagination: quotePaginationSchema,
  filter: quoteFilterSchema,
  sort: quoteSortSchema
});

/**
 * Schema for creating a new Quote
 */
export const createQuoteSchema = z.object({
  storeName: z.string(),
  quote: quoteDataSchema
});

/**
 * Schema for updating a Quote
 */
export const updateQuoteSchema = z.object({
  additionalNotes: z.string().nullable(),
  quoteItems: z.array(quoteItemSchema).optional(),
  status: z.enum(['Draft', 'Submitted', 'Approved', 'Declined', 'Cancelled', 'Expired', 'Ordered']).optional(),
  actionBy: z.string().optional()
});

/**
 * Schema for Quote status update
 */
export const updateQuoteStatusSchema = z.object({
  status: z.enum(['Draft', 'Submitted', 'Approved', 'Declined', 'Cancelled', 'Expired', 'Ordered']),
  actionBy: z.string()
});

/**
 * Schema for Quote search parameters
 */
export const quoteSearchSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  status: z.enum(['Draft', 'Submitted', 'Approved', 'Declined', 'Cancelled', 'Expired', 'Ordered']).optional(),
  customerId: z.string().optional(),
  companyLocationId: z.string().optional()
});

/**
 * Schema for fetching non-draft quotes
 */
export const fetchQuotesSchema = z.object({
  storeName: z.string(),
  companyLocationId: z.string().optional(),
  pagination: quotePaginationSchema,
  filter: quoteFilterSchema,
  sort: quoteSortSchema
}).strict();

/**
 * Schema for Quote response
 */
export const quoteResponseSchema = z.object({
  id: z.number(),
  customerId: z.string(),
  companyLocationId: z.string().nullable(),
  subtotal: z.number(),
  currencyCode: z.string(),
  status: z.enum([QuoteStatus.DRAFT, QuoteStatus.SUBMITTED, QuoteStatus.APPROVED, QuoteStatus.DECLINED, QuoteStatus.CANCELLED, QuoteStatus.EXPIRED, QuoteStatus.ORDERED]),
  poNumber: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string().nullable(),
  actionBy: z.string().nullable(),
  quoteItems: z.array(quoteItemSchema),
  itemCount: z.number(),
  metafield: z.object({
    value: z.string()
  }).nullable()
});

/**
 * Customer information type
 */
export type CustomerInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  state: string | null;
};

/**
 * Schema for Quote response with customer information
 */
export const quoteWithCustomerSchema = quoteResponseSchema
  .omit({ customerId: true })
  .extend({
    customer: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string().nullable(),
      state: z.string().nullable()
    }).nullable(),
    companyLocationDetails: z.object({
      id: z.string(),
      name: z.string(),
      company: z.object({
        id: z.string(),
        name: z.string()
      }),
      shippingAddress: z.any().nullable(),
      billingAddress: z.any().nullable()
    }).nullable(),
    quoteItems: z.array(z.object({
      quantity: z.number(),
      originalPrice: z.number(),
      offerPrice: z.number(),
      description: z.string().nullable().optional(),
      variant: z.object({
        id: z.string(),
        title: z.string(),
        sku: z.string().nullable(),
        inventoryQuantity: z.number().nullable(),
        customerPartnerNumber: z.string().nullable(),
        price: z.any().nullable(),
        quantityRule: z.any().nullable(),
        image: z.any().nullable(),
        product: z.object({
          id: z.string(),
          title: z.string(),
          handle: z.string().nullable(),
          images: z.array(z.any()).nullable()
        }).nullable()
      }).nullable()
    }))
  });

export type QuoteWithCustomer = z.infer<typeof quoteWithCustomerSchema>;

/**
 * Base schema for Draft Quote items with new parameter name
 */
export const draftQuoteItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().min(1),
  originalPrice: z.number().min(0),
  offerPrice: z.number().min(0),
  description: z.string().nullable().optional()
});

/**
 * Schema for Draft Quote data in create request with new parameter names
 */
export const draftQuoteDataSchema = z.object({
  customerId: z.string(),
  companyLocationId: z.string().nullable(),
  currencyCode: z.string().default('USD'),
  additionalNotes: z.string().nullable().optional(),
  draftQuoteItems: z.array(draftQuoteItemSchema)
});

/**
 * Schema for creating a new draft Quote with new parameter names
 */
export const createDraftQuoteWithNewParamsSchema = z.object({
  storeName: z.string(),
  draftQuote: draftQuoteDataSchema
});

/**
 * Schema for paginated Draft Quote response
 */
export const draftQuoteListResponseSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  draftQuotes: z.array(
    quoteResponseSchema.extend({
      draftQuoteItems: z.array(quoteItemSchema)
    }).omit({ quoteItems: true })
  )
});

export type DraftQuoteListResponse = z.infer<typeof draftQuoteListResponseSchema>;

/**
 * Schema for paginated Quote response
 */
export const quoteListResponseSchema = z.object({
  quotes: z.array(quoteWithCustomerSchema),
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number()
});

export type QuoteListResponse = z.infer<typeof quoteListResponseSchema>;

// TypeScript types derived from Zod schemas
export type QuoteItem = z.infer<typeof quoteItemSchema>;
export type QuoteData = z.infer<typeof quoteDataSchema>;
export type QuoteInput = z.infer<typeof quoteInputSchema>;
export type CreateDraftQuoteInput = z.infer<typeof createDraftQuoteSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
export type QuoteSearchParams = z.infer<typeof quoteSearchSchema>;
export type QuotePagination = z.infer<typeof quotePaginationSchema>;
export type QuoteFilter = z.infer<typeof quoteFilterSchema>;
export type QuoteSortField = z.infer<typeof quoteSortFieldSchema>;
export type QuoteSortItem = z.infer<typeof quoteSortItemSchema>;
export type FetchDraftQuotesParams = z.infer<typeof fetchDraftQuotesSchema>;
export type FetchQuotesParams = z.infer<typeof fetchQuotesSchema>;
export type QuoteResponse = z.infer<typeof quoteResponseSchema>;
export type DraftQuoteItem = z.infer<typeof draftQuoteItemSchema>;
export type DraftQuoteData = z.infer<typeof draftQuoteDataSchema>;
export type CreateDraftQuoteWithNewParamsInput = z.infer<typeof createDraftQuoteWithNewParamsSchema>;
