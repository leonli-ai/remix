import { z } from 'zod';
import { CurrencyCode } from '../../../types/currency';

// Base price schema
export const ShopPriceSchema = z.object({
  amount: z.string(),
  currencyCode: z.nativeEnum(CurrencyCode)
});

// Contextual pricing schema
export const ShopContextualPricingSchema = z.object({
  price: ShopPriceSchema.optional()
});

// Product variant schema
export const ShopProductVariantSchema = z.object({
  id: z.string(),
  contextualPricing: ShopContextualPricingSchema
});

// Response data schema
export const ShopProductVariantResponseDataSchema = z.object({
  productVariant: ShopProductVariantSchema.optional()
});

// Full response schema
export const ShopProductVariantPriceResponseSchema = z.object({
  data: ShopProductVariantResponseDataSchema.optional()
});

// Export types
export type ShopPrice = z.infer<typeof ShopPriceSchema>;
export type ShopContextualPricing = z.infer<typeof ShopContextualPricingSchema>;
export type ShopProductVariant = z.infer<typeof ShopProductVariantSchema>;
export type ShopProductVariantPriceResponse = z.infer<typeof ShopProductVariantPriceResponseSchema>;
