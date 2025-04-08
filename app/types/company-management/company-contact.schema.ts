import { z } from 'zod';

// Request schema
export const companyContactRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyId: z.string(),
  pagination: z.object({
    first: z.number().min(1).default(10).optional(),
    after: z.string().optional(),
    last: z.number().min(1).optional(),
    before: z.string().optional(),
    query: z.string().optional()
  }).refine(
    (data) => {

      const hasBefore = data.before !== undefined;
      const hasLast = data.last !== undefined;
      return (hasBefore && hasLast) || (!hasBefore && !hasLast);
    },
    {
      message: "before and last must be used together"
    }
  ).refine(
    (data) => {

      const hasForward = data.first !== undefined || data.after !== undefined;
      const hasBackward = data.last !== undefined || data.before !== undefined;
      return !hasForward || !hasBackward;
    },
    {
      message: "Cannot use both forward and backward pagination"
    }
  ).optional()
}).strict();

// Contact schema
const contactSchema = z.object({
  id: z.string(),
  customer: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    state: z.string()
  }),
  isMainContact: z.boolean()
});

// Response schema
export const companyContactResponseSchema = z.object({
  companyContacts: z.array(contactSchema),
  pagination: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    startCursor: z.string().optional(),
    endCursor: z.string().optional(),
    totalCount: z.number()
  })
});

export type CompanyContactRequest = z.infer<typeof companyContactRequestSchema>;
export type CompanyContactResponse = z.infer<typeof companyContactResponseSchema>; 