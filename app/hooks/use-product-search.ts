import {
  useMutation,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import _ from "lodash";
import {
  PRODUCT_PRICE,
  PRODUCT_SEARCH_BY_SKU_AND_TITLE,
  PRODUCT_SEARCH_BY_SKU_AND_TITLE_AJAX,
  PRODUCTS_BY_IDS,
  QUERY_CUSTOMER_PARTNER_NUMBER_BY_SKU,
  QUERY_PRODUCT_PRICE_BY_VARIANTS,
  QUERY_PRODUCT_VARIANTS_BY_API,
  QUERY_VARIANTIDS_BY_CUSTOMER_CODE,
} from "~/constant/react-query-keys";
import { useShopifyInformation } from "~/lib/shopify";
import { searchMultipleProductsPriceListAjax } from "~/request/compare";
import { getProductVariantsByApi } from "~/request/quick-order";
import {
  getCustomerPartnerNumberBySku,
  getVariantIdsByCustomerCode,
  searchMultipleProducts,
  searchProductBySkuAndTitle,
  searchProductBySkuAndTitleAjax,
  searchProductPriceByVariants,
} from "~/request/search-product";
import {
  type ProductSearchResponse,
  type ProductVariantSearchRequest,
} from "~/types/product-variant/product-variant-search.schema";
import { VariantPriceRequest } from "~/types/product-variant/variant-prices.schema";
import type { CustomerCodeParams } from "~/types/quick-order";

export function useProductSearchBySkuAndTitle(params: {
  searchQuery: string;
  searchableFields?: string[];
  enabled?: boolean;
}) {
  const { storeName, shopifyCompanyLocationId, shopifyCustomerId } =
    useShopifyInformation();
  const {
    searchQuery,
    searchableFields = ["VARIANTS_SKU"],
    enabled = true,
  } = params;
  const queryResult = useQuery({
    queryKey: [PRODUCT_SEARCH_BY_SKU_AND_TITLE, searchQuery, searchableFields],
    queryFn: async () => {
      return await searchProductBySkuAndTitle(
        searchQuery,
        searchableFields,
        storeName,
        shopifyCustomerId,
        shopifyCompanyLocationId,
      );
    },
    enabled: !!searchQuery && enabled,
    staleTime: 1000 * 60 * 5,
  });

  return queryResult;
}

export function useProductSearchBySkuAndTitleAjax(params: {
  searchQuery: string;
  searchableFields?: string[];
  enabled?: boolean;
}) {
  const {
    searchQuery,
    searchableFields = ["VARIANTS_SKU"],
    enabled = true,
  } = params;
  const mapFields: { [key: string]: string } = {
    VARIANTS_SKU: "variants.sku",
    TITLE: "title",
  };
  const validFields = searchableFields
    .map((field) => mapFields[field])
    .join(",");
  const queryResult = useQuery({
    queryKey: [
      PRODUCT_SEARCH_BY_SKU_AND_TITLE_AJAX,
      searchQuery,
      searchableFields,
    ],
    queryFn: async () => {
      return await searchProductBySkuAndTitleAjax(searchQuery, validFields);
    },
    enabled: !!searchQuery && enabled,
    staleTime: 1000 * 60 * 5,
  });
  return queryResult;
}

export function useMultipleProducts(ids: string[]) {
  const fullIds = _.map(ids, (id) => `gid://shopify/Product/${id}`);

  const queryResult = useQuery({
    queryKey: [PRODUCTS_BY_IDS, ids],
    queryFn: async () => {
      return await searchMultipleProducts(fullIds);
    },
    enabled: !!ids.length,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return queryResult;
}

export function useProductInfo(productId: string) {
  const queryResult = useQuery({
    queryKey: [PRODUCT_PRICE, productId],
    queryFn: async () => {
      return await searchMultipleProductsPriceListAjax(productId);
    },
    retry: false,
  });

  return queryResult;
}

export function useVariantIdsByCustomerCode(params: CustomerCodeParams) {
  const queryResult = useQuery({
    queryKey: [QUERY_VARIANTIDS_BY_CUSTOMER_CODE, params],
    queryFn: async () => {
      return await getVariantIdsByCustomerCode(params);
    },
    enabled: !!params.data.length,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return queryResult;
}

export function useCustomerPartnerNumberBySku(params: {
  storeName: string;
  companyId: string;
  skuIds: string[];
}) {
  const queryResult = useQuery({
    queryKey: [QUERY_CUSTOMER_PARTNER_NUMBER_BY_SKU, params],
    queryFn: async () => {
      return await getCustomerPartnerNumberBySku(params);
    },
    enabled: !!params.skuIds.length,
  });
  return queryResult;
}

export function useCustomerPartnerNumberBySkuMutation() {
  const queryResult = useMutation({
    mutationFn: async (params: {
      storeName: string;
      companyId: string;
      skuIds: string[];
    }) => {
      return await getCustomerPartnerNumberBySku(params);
    },
  });
  return queryResult;
}

export function useGetProductVariantsByApi(
  params: ProductVariantSearchRequest,
): UseQueryResult<ProductSearchResponse> {
  const queryResult = useQuery({
    queryKey: [QUERY_PRODUCT_VARIANTS_BY_API, params],
    queryFn: async () => {
      return await getProductVariantsByApi(params);
    },
    enabled: !!params.query && !!params.query.length,
  });
  return queryResult;
}

export function useGetProductVariantsByApiMutation() {
  const queryResult = useMutation({
    mutationFn: async (params: ProductVariantSearchRequest) => {
      return await getProductVariantsByApi(params);
    },
  });
  return queryResult;
}

export function useGetProductPriceByVariants(params: VariantPriceRequest) {
  const enabled = !!params.variantIds.length;
  const queryResult = useQuery({
    queryKey: [QUERY_PRODUCT_PRICE_BY_VARIANTS, params],
    queryFn: async () => {
      return await searchProductPriceByVariants(params);
    },
    enabled,
  });
  return queryResult;
}
