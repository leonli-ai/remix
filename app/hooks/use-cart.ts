import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CART_ADD_TO_CART_AJAX,
  CART_GET_AJAX,
} from "~/constant/react-query-keys";
import { addToCartAjax, getCartAjax } from "~/request/cart";

export function useGetCartAjax() {
  const queryResult = useQuery({
    queryKey: [CART_GET_AJAX],
    queryFn: async () => {
      return await getCartAjax();
    },
  });

  return queryResult;
}

export function useAddToCartAjax() {
  const queryResult = useMutation({
    mutationKey: [CART_ADD_TO_CART_AJAX],
    mutationFn: async (items: { id: number; quantity: number }[]) => {
      return await addToCartAjax(items);
    },
  });

  return queryResult;
}
