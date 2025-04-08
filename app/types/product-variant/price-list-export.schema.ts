import { z } from 'zod';

// Product variant related schemas
export const ProductVariantSchema = z.object({
  sku: z.string(),
  title: z.string(),
  price: z.object({
    amount: z.string(),
    currencyCode: z.string()
  })
});

export const CatalogProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  variants: z.array(ProductVariantSchema)
});

export const CatalogSchema = z.object({
  id: z.string(),
  title: z.string(),
  products: z.array(CatalogProductSchema)
});

export const CatalogNodeSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  publication: z.object({
    products: z.object({
      edges: z.array(z.object({
        node: z.object({
          id: z.string()
        }).optional()
      }))
    }).optional()
  }).optional()
});

export const ProductNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  variants: z.object({
    edges: z.array(z.object({
      node: z.object({
        id: z.string(),
        sku: z.string().optional(),
        title: z.string(),
        contextualPricing: z.object({
          price: z.object({
            amount: z.string(),
            currencyCode: z.string()
          }).optional()
        }).optional()
      })
    }))
  }).optional()
});

export const CatalogWithProductIdsSchema = z.object({
  id: z.string(),
  title: z.string(),
  productIds: z.array(z.string())
});

// Request schema
export const PriceListExportRequestSchema = z.object({
  companyLocationId: z.string(),
  storeName: z.string(),
  customerId: z.string(),
  format: z.enum(['xlsx', 'csv']).optional()
});

// Export types
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type CatalogProduct = z.infer<typeof CatalogProductSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type CatalogNode = z.infer<typeof CatalogNodeSchema>;
export type ProductNode = z.infer<typeof ProductNodeSchema>;
export type CatalogWithProductIds = z.infer<typeof CatalogWithProductIdsSchema>;
export type PriceListExportRequest = z.infer<typeof PriceListExportRequestSchema>;