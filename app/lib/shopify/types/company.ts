import { z } from 'zod';
import { UserErrorSchema } from './customer';
import { baseResponseSchema } from './base';

/**
 * Schema for company contact response
 */
export const CompanyContactSchema = z.object({
  id: z.string()
});

/**
 * Schema for company assign customer as contact mutation response
 */
export const CompanyAssignCustomerAsContactResponseSchema = z.object({
  companyAssignCustomerAsContact: z.object({
    companyContact: CompanyContactSchema.nullable(),
    userErrors: z.array(UserErrorSchema)
  })
});

/**
 * Schema for company location role assignment input
 */
export const CompanyLocationRoleAssignSchema = z.object({
  roleId: z.string(),
  userId: z.string()
});

/**
 * Schema for role assignment response
 */
export const RoleAssignmentSchema = z.object({
  companyContactId: z.string(),
  companyContactRoleId: z.string()
});

/**
 * Schema for company location assign roles mutation response
 */
export const CompanyLocationAssignRolesResponseSchema = z.object({
  companyLocationAssignRoles: z.object({
    roleAssignments: z.array(RoleAssignmentSchema),
    userErrors: z.array(UserErrorSchema)
  })
});

/**
 * Type definitions derived from the schemas
 */
export type CompanyContact = z.infer<typeof CompanyContactSchema>;
export type CompanyAssignCustomerAsContactResponse = z.infer<typeof CompanyAssignCustomerAsContactResponseSchema>;
export type CompanyLocationRoleAssign = z.infer<typeof CompanyLocationRoleAssignSchema>;
export type RoleAssignment = z.infer<typeof RoleAssignmentSchema>;
export type CompanyLocationAssignRolesResponse = z.infer<typeof CompanyLocationAssignRolesResponseSchema>;

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  externalId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const CompanyResponseSchema = baseResponseSchema.extend({
  data: z.object({
    company: CompanySchema
  })
});

export type Company = z.infer<typeof CompanySchema>;
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>;