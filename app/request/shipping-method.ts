import { globalFetch } from "~/lib/fetch";
import {
  EligibleShippingMethod,
  GetShippingMethodsParams,
} from "~/types/shipping/shipping-method.schema";

export const getShippingMethods = async (params: GetShippingMethodsParams) => {
  const response = await globalFetch("/shipping-methods/fetch-all", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as EligibleShippingMethod[];
};
