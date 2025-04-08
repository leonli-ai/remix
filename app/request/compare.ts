import { globalFetch } from "~/lib/fetch";

export const searchMultipleProductsPriceListAjax = async (
  productId: string,
) => {
  const response = await globalFetch(`/products/${productId}.js`, {
    method: "GET",
    type: "ajax",
  });

  return response;
};
