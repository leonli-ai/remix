import { z } from 'zod';

// Request Schema
export const customerDetailsRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string()
}).strict();

// Cached Customer Data Schema
export const cachedCustomerDataSchema = z.object({
  customer: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string(),
    phone: z.string().nullable(),
    state: z.string(),
    companyId: z.string(),
    companyContactId: z.string()
  }),
  company: z.object({
    id: z.string(),
    name: z.string()
  })
}).strict();

// Role Assignment from Shopify Schema
export const shopifyRoleAssignmentSchema = z.object({
  node: z.object({
    id: z.string(),
    companyLocation: z.object({
      id: z.string(),
      name: z.string()
    }).optional(),
    company: z.object({
      id: z.string(),
      name: z.string()
    }),
    role: z.object({
      id: z.string(),
      name: z.string()
    })
  })
});

// Database Role Assignment Schema
export const dbRoleAssignmentSchema = z.object({
  companyContactId: z.string(),
  companyId: z.string(),
  storeName: z.string(),
  roleId: z.string(),
  companyLocationId: z.string().optional(),
  companyContactRoleAssignmentId: z.string(),
  createdBy: z.string(),
  updatedBy: z.string()
});

// Role schemas for response
const locationBasedRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  companyLocationId: z.string(),
  companyLocationName: z.string().optional()
});

const companyWideRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  companyId: z.string()
});

const roleSchema = z.union([locationBasedRoleSchema, companyWideRoleSchema]);

// Response Schema
export const customerDetailsResponseSchema = z.object({
  customer: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string(),
    phone: z.string().nullable(),
    state: z.string(),
    companyId: z.string().optional(),
    companyContactId: z.string().optional()
  }),
  company: z.object({
    id: z.string(),
    name: z.string()
  }).optional(),
  roles: z.array(roleSchema).optional()
});

// Export types
export type CustomerDetailsRequest = z.infer<typeof customerDetailsRequestSchema>;
export type CustomerDetailsResponse = z.infer<typeof customerDetailsResponseSchema>;
export type LocationBasedRole = z.infer<typeof locationBasedRoleSchema>;
export type CompanyWideRole = z.infer<typeof companyWideRoleSchema>;
export type Role = z.infer<typeof roleSchema>;
export type ShopifyRoleAssignment = z.infer<typeof shopifyRoleAssignmentSchema>;
export type DbRoleAssignment = z.infer<typeof dbRoleAssignmentSchema>;
export type CachedCustomerData = z.infer<typeof cachedCustomerDataSchema>; 