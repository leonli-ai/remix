import type { CustomerCodeParams } from "~/types/quick-order";
import {
  queryMultipleProducts,
  searchProductBySkuAndTitleGraphQL,
} from "./graphql/quick-order";

import { globalFetch } from "~/lib/fetch";
import { extractShopifyId } from "~/lib/utils";
import type {
  VariantPriceRequest,
  VariantPricesResponse,
} from "~/types/product-variant/variant-prices.schema";
import _ from "lodash";

export const searchProductBySkuAndTitle = async (
  searchQuery: string,
  searchableFields: string[],
  storeName: string,
  customerId: string,
  companyLocationId: string,
) => {
  const response = await globalFetch(`/storefront/proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storeName: storeName,
      query: searchProductBySkuAndTitleGraphQL,
      variables: { query: searchQuery, searchableFields },
    }),
  });

  const mapFields: { [key: string]: string } = {
    VARIANTS_SKU: "variants.sku",
    TITLE: "title",
  };
  const validFields = searchableFields
    .map((field) => mapFields[field])
    .join(",");
  const ajaxResponse = await searchProductBySkuAndTitleAjax(
    searchQuery,
    validFields,
  );
  // get product id from two data source
  const data = await response.json();
  const graphqlProducts = data.data.predictiveSearch.products;
  const getAllVariantsIds = _.flatMap(graphqlProducts, (product) => {
    const variants = product.variants.nodes;
    return variants.map((variant: any) => variant.id);
  });
  const priceData = await searchProductPriceByVariants({
    variantIds: getAllVariantsIds,
    storeName,
    customerId,
    companyLocationId,
  });
  const ajaxProducts = ajaxResponse;

  // map to filter data
  const filteredProducts = graphqlProducts
    .map((graphqlProduct) => {
      const matchingAjaxProduct = ajaxProducts.find(
        (ajaxProduct) =>
          ajaxProduct.id ===
          Number(extractShopifyId(graphqlProduct.id, "Product")),
      );

      // find variant price
      const variantPrices = graphqlProduct.variants.nodes.map(
        (variant: any) => {
          const variantPrice = priceData.variantPrices.find(
            (price) => price.id === variant.id,
          );

          return {
            ...variant,
            price: variantPrice?.price || variant.price,
            quantityRule: variantPrice?.quantityRule || variant.quantityRule,
          };
        },
      );

      // return product if ajax product exists
      return matchingAjaxProduct
        ? {
            ...graphqlProduct,
            variants: {
              ...graphqlProduct.variants,
              nodes: variantPrices,
            },
            // add extra data from ajax product
            // for example: customField: matchingAjaxProduct.someField
          }
        : null;
    })
    .filter(Boolean); // filter null

  return filteredProducts;
};

export const searchProductBySkuAndTitleAjax = async (
  searchQuery: string,
  searchableFields: string,
) => {
  const response = await globalFetch(
    `/search/suggest.json?q=${searchQuery}&resources[type]=product&resources[options][fields]=${searchableFields}`,
    {
      method: "GET",
      type: "ajax",
    },
  );

  return response.resources.results.products;
};

export const searchProductPriceByVariants = async (
  params: VariantPriceRequest,
): Promise<VariantPricesResponse> => {
  const response = await globalFetch(`/product-variant/price/get-by-ids`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};

export const searchMultipleProducts = async (ids: string[]) => {
  const storeName = localStorage.getItem("store-name") ?? "";

  const response = await globalFetch(`/storefront/proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storeName: storeName,
      query: queryMultipleProducts,
      variables: {
        productIds: ids,
      },
    }),
  });

  const data = await response;

  return data.data.nodes;
};

export const getVariantIdsByCustomerCode = async (
  params: CustomerCodeParams,
) => {
  const response = await globalFetch(
    `/product-variant/customer-partner-number/fetch`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );

  return response;
};

export const getCustomerPartnerNumberBySku = async (params: {
  storeName: string;
  companyId: string;
  skuIds: string[];
}) => {
  const response = await globalFetch(
    `/product-variant/customer-partner-number/get-by-sku`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
  return response;
};
