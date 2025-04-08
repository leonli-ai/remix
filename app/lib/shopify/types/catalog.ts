import { z } from 'zod';
import { baseResponseSchema } from './base';

export const catalogProductNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string()
});

export const catalogProductEdgeSchema = z.object({
  node: catalogProductNodeSchema
});

export const catalogProductConnectionSchema = z.object({
  edges: z.array(catalogProductEdgeSchema)
});

export const catalogPublicationSchema = z.object({
  products: catalogProductConnectionSchema.optional()
});

export const catalogNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  publication: catalogPublicationSchema.optional()
});

export const catalogEdgeSchema = z.object({
  node: catalogNodeSchema
});

export const catalogConnectionSchema = z.object({
  edges: z.array(catalogEdgeSchema)
});

export const companyLocationCatalogsSchema = z.object({
  id: z.string(),
  name: z.string(),
  catalogs: catalogConnectionSchema
});

export const companyLocationCatalogsResponseDataSchema = z.object({
  companyLocation: companyLocationCatalogsSchema
});

export const companyLocationCatalogsResponseSchema = baseResponseSchema.extend({
  data: companyLocationCatalogsResponseDataSchema
});

// Type exports
export type CatalogProductNode = z.infer<typeof catalogProductNodeSchema>;
export type CatalogProductEdge = z.infer<typeof catalogProductEdgeSchema>;
export type CatalogProductConnection = z.infer<typeof catalogProductConnectionSchema>;
export type CatalogPublication = z.infer<typeof catalogPublicationSchema>;
export type CatalogNode = z.infer<typeof catalogNodeSchema>;
export type CatalogEdge = z.infer<typeof catalogEdgeSchema>;
export type CatalogConnection = z.infer<typeof catalogConnectionSchema>;
export type CompanyLocationCatalogs = z.infer<typeof companyLocationCatalogsSchema>;
export type CompanyLocationCatalogsResponseData = z.infer<typeof companyLocationCatalogsResponseDataSchema>;
export type CompanyLocationCatalogsResponse = z.infer<typeof companyLocationCatalogsResponseSchema>; 