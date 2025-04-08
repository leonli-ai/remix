import { z } from 'zod';

/**
 * Schema for customer input validation
 */
export const CustomerInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

/**
 * Schema for user errors
 */
export const UserErrorSchema = z.object({
  field: z.string(),
  message: z.string()
});

/**
 * Schema for customer response
 */
export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable()
});

/**
 * Schema for customer creation mutation response
 */
export const CustomerCreateResponseSchema = z.object({
  customerCreate: z.object({
    userErrors: z.array(UserErrorSchema),
    customer: CustomerSchema.nullable()
  })
});

/**
 * Type definitions derived from the schemas
 */
export type CustomerInput = z.infer<typeof CustomerInputSchema>;
export type UserError = z.infer<typeof UserErrorSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerCreateResponse = z.infer<typeof CustomerCreateResponseSchema>; 