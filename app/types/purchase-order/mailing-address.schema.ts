import { z } from 'zod';

export const mailingAddressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  company: z.string().optional(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  provinceCode: z.string().optional()
});

export type MailingAddress = z.infer<typeof mailingAddressSchema>; 