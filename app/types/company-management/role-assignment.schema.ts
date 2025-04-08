import { z } from 'zod';

// Role names mapping from database to Shopify names
export const ROLE_NAME_MAPPING = {
  'Admin': 'Location admin',
  'Order Approver': 'Ordering only',
  'Ordering Only': 'Ordering only'
} as const;

// Role types that require Shopify API update
export const ADMIN_ROLE_NAMES = ['Admin', 'Location admin'];

// Role assignment schema with validation rules
const roleAssignmentSchema = z.object({
  companyLocationId: z.string().optional(),
  companyId: z.string().optional(),
  roleId: z.string()
})
.refine(
  data => !!(data.companyLocationId || data.companyId),
  { message: "Either companyLocationId or companyId must be provided" }
)
.refine(
  data => !(data.companyLocationId && data.companyId),
  { message: "Cannot provide both companyLocationId and companyId" }
)
.refine(
  data => {
    if (data.companyId) {
      return data.roleId === '1'; // Assuming '1' is the ID for admin role
    }
    return true;
  },
  { message: "When companyId is provided, role must be admin" }
);

// Business data schema
const roleAssignmentDataSchema = z.object({
  companyId: z.string(),
  companyContactId: z.string(),
  roleAssignments: z.array(roleAssignmentSchema)
}).strict();

// Request schema
export const roleAssignmentRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  data: roleAssignmentDataSchema
}).strict();

// Export types
export type RoleAssignmentRequest = z.infer<typeof roleAssignmentRequestSchema>;
export type RoleAssignment = z.infer<typeof roleAssignmentSchema>;

// Single role assignment schema (for other use cases)
const singleRoleAssignmentDataSchema = z.object({
  companyId: z.string(),
  companyLocationId: z.string(),
  companyContactId: z.string(),
  roleId: z.string(),
  companyContactRoleAssignmentId: z.string().optional()
}).strict();

export const singleRoleAssignmentRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  data: singleRoleAssignmentDataSchema
}).strict();

export type SingleRoleAssignmentRequest = z.infer<typeof singleRoleAssignmentRequestSchema>;

