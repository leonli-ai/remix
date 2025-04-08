import { z } from 'zod';

// Request schema
export const companyLocationRequestSchema = z.object({
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

// Address schema
const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  companyName: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  zip: z.string().optional(),
  province: z.string().optional(),
  recipient: z.string().optional(),
  zoneCode: z.string().optional(),
  phone: z.string().optional()
});

// Payment terms template schema
const paymentTermsTemplateSchema = z.object({
  description: z.string().optional(),
  dueInDays: z.number().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  paymentTermsType: z.string().optional(),
  translatedName: z.string().optional()
});

// Buyer experience configuration schema
const buyerExperienceConfigurationSchema = z.object({
  paymentTermsTemplate: paymentTermsTemplateSchema.optional()
});

// Location schema
const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  buyerExperienceConfiguration: buyerExperienceConfigurationSchema.optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional()
});

// Response schema
export const companyLocationResponseSchema = z.object({
  companyLocations: z.array(locationSchema),
  pagination: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    startCursor: z.string().optional(),
    endCursor: z.string().optional(),
    totalCount: z.number()
  })
}).strict();

// Export types
export type CompanyLocationRequest = z.infer<typeof companyLocationRequestSchema>;
export type CompanyLocationResponse = z.infer<typeof companyLocationResponseSchema>; 