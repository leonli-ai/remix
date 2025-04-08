import { z } from 'zod';



// Base user information schema
const userBaseSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  accountStatus: z.string(),
});

// Company location role schema
const companyLocationRoleSchema = z.object({
  locationId: z.string(),
  roleId: z.string()
});

// Create user request schema
export const createUserRequestSchema = z.object({
  storeName: z.string(),
  customerId: z.string(),
  companyId: z.string(),
  data: userBaseSchema.extend({
    accountStatus: z.string().optional(),
    password: z.string().optional(),
    companyLocations: z.array(companyLocationRoleSchema).optional()
  })
}).strict();

// User location information schema
const userLocationSchema = z.object({
  companyId: z.string(),
  companyLocationName: z.string(),
  companyLocationId: z.string(),
  city: z.string(),
  state: z.string(),
  zipPostalCode: z.string(),
  country: z.string(),
  role: z.string()
});

// User detail response schema
export const userDetailResponseSchema = userBaseSchema.extend({
  id: z.string(),
  isMainContact: z.boolean(),
  role: z.string(),
  locations: z.array(userLocationSchema),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Export types
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export interface UserDetailResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: string;
}
