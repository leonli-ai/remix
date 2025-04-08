import { useQuery } from "@tanstack/react-query";
import {
  QUERY_ORDER_DETAIL,
  QUERY_ORDER_HISTORY,
} from "~/constant/react-query-keys";
import { getOrderDetail, getOrderHistory } from "~/request/order-history";
import { OrderDetailRequest } from "~/types/order-management/order-detail.schema";
import { OrderListRequest } from "~/types/order-management/order-list.schema";
import { useGetPreserveQueryData } from "./utils.hooks";

export function useGetOrderHistory(
  params: OrderListRequest,
  enabled: boolean = true,
) {
  const { pagination } = params;
  const newParams = {
    ...params,
    pagination: {
      first: pagination.first,
      after: pagination.after,
      last: pagination.last,
      before: pagination.before,
      query: pagination.query,
      sortKey: pagination.sortKey,
      reverse: pagination.reverse,
    },
  };

  const query = useQuery({
    queryKey: [QUERY_ORDER_HISTORY, newParams],
    queryFn: async () => {
      return await getOrderHistory(newParams);
    },
    enabled: !!params && enabled,
    staleTime: 1000 * 60 * 5,
  });

  const data = useGetPreserveQueryData<typeof query.data>(query.data);

  return { ...query, data };
}

export function useGetOrderDetail(
  params: OrderDetailRequest,
  enabled: boolean = true,
) {
  const query = useQuery({
    queryKey: [QUERY_ORDER_DETAIL, params],
    queryFn: async () => {
      return await getOrderDetail(params);
    },
    enabled: !!params && enabled,
  });
  return query;
}
