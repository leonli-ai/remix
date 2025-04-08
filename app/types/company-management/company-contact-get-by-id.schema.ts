import { z } from 'zod';

// Request Schema
export const contactDetailRequestSchema = z.object({
  companyContactId: z.string(),
  customerId: z.string(),
  companyId: z.string(),
  storeName: z.string()
}).strict();

// Response Schema
const shippingAddressSchema = z.object({
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional()
}).strict();

const companyLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  shippingAddress: shippingAddressSchema
}).strict();

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  companyLocation: companyLocationSchema
}).strict();

const companySchema = z.object({
  id: z.string(),
  name: z.string()
}).strict();

const customerSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  state: z.string()
}).strict();

export const contactDetailResponseSchema = z.object({
  id: z.string(),
  customer: customerSchema,
  company: companySchema,
  isMainContact: z.boolean(),
  roles: z.array(roleSchema)
}).strict();

export type ContactDetailRequest = z.infer<typeof contactDetailRequestSchema>;
export type ContactDetailResponse = z.infer<typeof contactDetailResponseSchema>; 