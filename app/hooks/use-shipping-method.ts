import { useQuery } from "@tanstack/react-query";
import { getShippingMethods } from "~/request/shipping-method";
import { GetShippingMethodsParams } from "~/types/shipping/shipping-method.schema";
import { QUERY_SHIPPING_METHODS } from "~/constant/react-query-keys";
export const useGetShippingMethods = (
  params: GetShippingMethodsParams | undefined,
  enabled: boolean = true,
) => {
  try {
    return useQuery({
      queryKey: [QUERY_SHIPPING_METHODS, params],
      queryFn: () => getShippingMethods(params as GetShippingMethodsParams),
      enabled: !!params && !!enabled,
    });
  } catch (error) {
    console.error(error);
    return {
      data: [],
      isLoading: false,
      isError: true,
    };
  }
};
