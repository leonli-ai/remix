import { z } from 'zod';

/**
 * Validation related type definitions using Zod
 */

// Customer data schema
export const CustomerDataSchema = z.object({
  customer: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    tags: z.array(z.string()),
    createdAt: z.string(),
    state: z.string()
  }).nullable()
});

// Company location contact roles schema
export const CompanyLocationContactRolesSchema = z.object({
  companyLocation: z.object({
    company: z.object({
      contactRoles: z.object({
        nodes: z.array(z.object({
          id: z.string(),
          name: z.string(),
          note: z.string()
        }))
      })
    })
  }).nullable()
});

// Product data schema
export const ProductDataSchema = z.object({
  products: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      title: z.string(),
      variants: z.object({
        nodes: z.array(z.object({
          id: z.string(),
          title: z.string(),
          sku: z.string(),
          availableForSale: z.boolean(),
          quantityAvailable: z.number().optional()
        }))
      })
    }))
  })
});

// Batch product variant data schema
export const BatchProductVariantDataSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      sku: z.string(),
      inventoryQuantity: z.number(),
      contextualPricing: z.object({
        price: z.object({
          amount: z.string(),
          currencyCode: z.string()
        }),
        quantityRule: z.object({
          minimum: z.number(),
          maximum: z.number().nullable(),
          increment: z.number()
        })
      }).optional()
    }).nullable()
  )
});

// Batch product data schema
export const BatchProductDataSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      vendor: z.string(),
      totalInventory: z.number(),
      tracksInventory: z.boolean()
    }).nullable()
  )
});

// Validation result schema
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string()
});

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema)
});

// Export types
export type CustomerData = z.infer<typeof CustomerDataSchema>;
export type CompanyLocationContactRolesData = z.infer<typeof CompanyLocationContactRolesSchema>;
export type ProductData = z.infer<typeof ProductDataSchema>;
export type BatchProductVariantData = z.infer<typeof BatchProductVariantDataSchema>;
export type BatchProductData = z.infer<typeof BatchProductDataSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>; 