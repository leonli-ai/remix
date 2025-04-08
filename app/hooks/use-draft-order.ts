import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_DRAFT_ORDERS, QUERY_DRAFT_ORDER_DETAILS, QUERY_SHOP_SETTINGS } from "~/constant/react-query-keys";
import { getDraftOrders, getDraftOrderById, approveDraftOrder, rejectDraftOrder, deleteDraftOrder } from "~/request/draft-order";
import type { DraftOrderListRequest } from "~/types/order-management/draft-order-list.schema";
import type { DraftOrderDetailsRequest } from "~/types/order-management/draft-order-details.schema";
import { fetchShopSettings } from "~/request/shop";
import type { ShopSettingsRequest } from "~/types/shop/shop-settings.schema";

export function useDraftOrder(params: DraftOrderListRequest, isEnabled: boolean = true) {
  const queryResult = useQuery({
    queryKey: [QUERY_DRAFT_ORDERS, params],
    queryFn: async () => await getDraftOrders(params),
    enabled: isEnabled
  });

  return queryResult;
}

export function useDraftOrderDetail(params: DraftOrderDetailsRequest) {
  const queryResult = useQuery({
    queryKey: [QUERY_DRAFT_ORDER_DETAILS, params],
    queryFn: async () => await getDraftOrderById(params),
    enabled: !!params.storeName && !!params.customerId && !!params.draftOrderId && !!params.companyLocationId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return queryResult;
}

interface RejectDraftOrderOptions {
  draftOrderId: string;
  storeName: string;
  customerId: string;
  note: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useRejectDraftOrder = ({
  storeName,
  customerId,
  draftOrderId,
  note,
  onSuccess,
}: RejectDraftOrderOptions) => {
  return useMutation({
    mutationFn: () =>
      rejectDraftOrder({
        storeName,
        customerId,
        draftOrderId,
        note,
      }),
    onSuccess,
  });
};

interface ApproveDraftOrderOptions {
  draftOrderId: string;
  storeName: string;
  customerId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApproveDraftOrder = ({ draftOrderId, storeName, customerId, onSuccess, onError }: ApproveDraftOrderOptions) => {
  return useMutation({
    mutationFn: async () => await approveDraftOrder({ draftOrderId, storeName, customerId }),
    onSuccess,
    onError,
  });
};

interface DeleteDraftOrderOptions {
  ids: string[];
  storeName: string;
  customerId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useDeleteDraftOrder = ({ ids, storeName, customerId, onSuccess }: DeleteDraftOrderOptions) => {
  return useMutation({
    mutationFn: async () => await deleteDraftOrder({ ids, storeName, customerId }),
    onSuccess,
  });
};

export const useFetchShopSettings = (params: ShopSettingsRequest) => {
  return useQuery({
    queryKey: [QUERY_SHOP_SETTINGS],
    queryFn: async () => await fetchShopSettings(params),
    retry: false,
  });
};
