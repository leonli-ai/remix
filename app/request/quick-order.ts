import { globalFetch } from "~/lib/fetch";
import { ProductVariantSearchRequest } from "~/types/product-variant/product-variant-search.schema";

export const getProductVariantsByApi = async (
  params: ProductVariantSearchRequest,
) => {
  const response = await globalFetch(`/product-variant/fetch-all`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};
