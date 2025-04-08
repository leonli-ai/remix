import { z } from "zod";

// Request schema
export const ContactRoleRequestSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  customerId: z.string().min(1, 'Customer ID is required')
}).strict();

// Response schema for a single role
export const ContactRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().optional()
});

// Response schema for role list
export const ContactRoleResponseSchema = z.object({
  roles: z.array(ContactRoleSchema)
});

// Export types
export type ContactRoleRequest = z.infer<typeof ContactRoleRequestSchema>;
export type ContactRole = z.infer<typeof ContactRoleSchema>;
export type ContactRoleResponse = z.infer<typeof ContactRoleResponseSchema>;
