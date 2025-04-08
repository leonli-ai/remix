import { z } from "zod";
import type {
  fileHeaderCustomerPartnerNumber,
  fileHeaderProductSkuID,
  fileHeaderQty,
} from "~/constant/quick-order";

export const quickOrderFormSchema = z.object({
  productLines: z.record(
    z.object({
      product: z.object({
        id: z.string().nullable(), // product Id
        variantId: z.string().nullable(), // varinat Id
        name: z.string().optional(), // varinat title
        originalName: z.string().optional(), // varinat title original name
        sku: z.string().nullable().optional(), // sku id
        price: z.object({
          amount: z.string().or(z.number()).optional(),
          currencyCode: z.string().optional(),
        }), // varinat price
        uom: z.array(z.string().nullable()).optional(), // varinat uom
        description: z.string().optional().nullable(), // product description
        quantityAvailable: z.number().nullable().optional(), // varinat quantity available
        unitPrice: z.string().optional(), // varinat price
        unitPriceMeasurement: z
          .object({
            measuredType: z.string().optional().nullable(),
            quantityUnit: z.string().optional().nullable(),
            quantityValue: z.number().optional().nullable(),
            referenceUnit: z.string().optional().nullable(),
            referenceValue: z.number().optional().nullable(),
          })
          .optional()
          .nullable(),
        image: z.string().optional().nullable(),
        updatedAt: z.string().optional().nullable(),
        onlineStoreUrl: z.string().optional().nullable(),
        quantityRule: z.object({
          increment: z.number().optional().nullable(),
          maximum: z.number().optional().nullable(),
          minimum: z.number().optional().nullable(),
        }),
        handle: z.string().optional().nullable(),
      }), // uom
      quantity: z.number().min(1, "required quantity").nullable(), // selected variant quantity
      selectedUom: z.string(), // selected variant uom
      targetPrice: z.string().or(z.number()).optional(), // target price,for request for quote
    }),
  ),
});

export type QuickOrderFormSchema = z.infer<typeof quickOrderFormSchema>;
export type SearchResult = {
  currentSearchLineId: string;
  products: {
    id: string;
    title: string;
    description: string;
    handle: string;
    updatedAt: string;
    onlineStoreUrl: string;
    images: {
      nodes: {
        url: string;
      }[];
    };
    variants: {
      nodes: {
        id: string;
        title: string;
        sku: string;
        metafield: {
          value: string;
          key: string;
          namespace: string;
        };
        quantityRule: {
          increment: number | null;
          maximum: number | null;
          minimum: number | null;
        };
        price: {
          amount: number;
          currencyCode: string;
        };
        availableForSale: boolean;
        quantityAvailable: number;
        unitPrice: {
          amount: number;
          currencyCode: string;
        } | null;
        unitPriceMeasurement: {
          measuredType: string | null;
          quantityValue: number | null;
          quantityUnit: string | null;
          referenceValue: number | null;
          referenceUnit: string | null;
        } | null;
      }[];
    };
  }[];
};

export type CreateQuickOrderParams = {
  order: {
    lineItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
    }>;
  };
};

export type FileListData = {
  [fileHeaderProductSkuID]?: string;
  [fileHeaderCustomerPartnerNumber]?: string;
  [fileHeaderQty]: number;
}[];

export type ParsedData = Array<[string, string | number]>;

export type ProductLine = {
  product: {
    id: string;
    variantId: string;
    name: string;
    sku: string;
    price: string;
    quantityAvailable: number;
  };
  quantity: number;
  selectedUom: string;
};

export type CurrentLines = Record<string, ProductLine>;

export interface ValidationItem {
  variantId: string;
  quantity: number;
  uom: string;
  message: string;
  isValid: boolean;
}

export type CustomerCodeParams = {
  storeName: string;
  companyId: string;
  data: string[];
};
