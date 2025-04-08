import { z } from 'zod';

// Request schema
export const shopSettingsRequestSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
});

// Response schemas for nested types
export const shopTimezoneSchema = z.object({
  ianaTimezone: z.string(),
  timezoneAbbreviation: z.string(),
  timezoneOffset: z.string(),
  timezoneOffsetMinutes: z.number()
});

export const shopSchema = z.object({
  id: z.string(),
  ...shopTimezoneSchema.shape
});

// API Response schema
export const shopSettingsResponseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  shop: shopSchema,
  error: z.boolean().optional(),
  errors: z.array(z.object({
    message: z.string(),
    path: z.array(z.string()).optional(),
    extensions: z.record(z.unknown()).optional()
  })).optional()
});

// Type exports
export type ShopSettingsRequest = z.infer<typeof shopSettingsRequestSchema>;
export type ShopSettingsResponse = z.infer<typeof shopSettingsResponseSchema>;
export type Shop = z.infer<typeof shopSchema>; 