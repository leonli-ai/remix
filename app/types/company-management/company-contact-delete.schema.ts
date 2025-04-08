import { z } from 'zod';

const deleteContactDataSchema = z.object({
  companyContactId: z.string(),
  companyId: z.string()
}).strict();

export const deleteCompanyContactRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  data: deleteContactDataSchema
}).strict();

export const deleteCompanyContactResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export type DeleteCompanyContactRequest = z.infer<typeof deleteCompanyContactRequestSchema>;
export type DeleteCompanyContactResponse = z.infer<typeof deleteCompanyContactResponseSchema>; 