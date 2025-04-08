import { useMutation, useQuery } from "@tanstack/react-query";
import {
  QUERY_ALL_SUBSCRIPTION_ORDERS,
  QUERY_SUBSCRIPTION_ORDER_BY_ID,
} from "~/constant/react-query-keys";
import {
  createSubscriptionOrder,
  deleteSubscriptionOrder,
  getSubscriptionOrderById,
  getSubscriptionOrders,
  pauseSubscriptionOrder,
  resumeSubscriptionOrder,
  skipSubscriptionOrderDelivery,
  updateSubscriptionOrder,
} from "~/request/subscription-orders";
import { GetSubscriptionContractByIdRequest } from "~/types/subscription-contracts/subscription-contract-get-by-id.schema";
import { FetchSubscriptionContractsRequest } from "~/types/subscription-contracts/subscription-contract.schema";

export const useCreateSubscriptionOrder = () => {
  return useMutation({ mutationFn: createSubscriptionOrder });
};

export const useGetSubscriptionOrders = (
  params: FetchSubscriptionContractsRequest,
  enabled: boolean = true,
) => {
  const queryResult = useQuery({
    queryKey: [QUERY_ALL_SUBSCRIPTION_ORDERS, params],
    queryFn: () => getSubscriptionOrders(params),
    enabled: enabled && !!params,
  });

  return queryResult;
};

export const useGetSubscriptionOrderById = (
  params: GetSubscriptionContractByIdRequest,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [QUERY_SUBSCRIPTION_ORDER_BY_ID, params],
    queryFn: () => getSubscriptionOrderById(params),
    enabled: enabled && !!params.id,
  });
};

export const useUpdateSubscriptionOrder = () => {
  return useMutation({ mutationFn: updateSubscriptionOrder });
};

export const useDeleteSubscriptionOrder = () => {
  return useMutation({ mutationFn: deleteSubscriptionOrder });
};

export const useSkipSubscriptionOrderDelivery = () => {
  return useMutation({ mutationFn: skipSubscriptionOrderDelivery });
};

export const usePauseSubscriptionOrder = () => {
  return useMutation({ mutationFn: pauseSubscriptionOrder });
};

export const useResumeSubscriptionOrder = () => {
  return useMutation({ mutationFn: resumeSubscriptionOrder });
};
