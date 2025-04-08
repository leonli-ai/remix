import { globalFetch } from "~/lib/fetch";
import type { DraftOrderListRequest } from "~/types/order-management/draft-order-list.schema";
import type { DraftOrderDetailsRequest } from "~/types/order-management/draft-order-details.schema";
import type { DraftOrderApproveRequest } from "~/types/order-management/draft-order-approve.schema";
import type { DraftOrderRejectRequest } from "~/types/order-management/draft-order-reject.schema";
import type { DraftOrderBulkDeleteRequest } from "~/types/order-management/draft-order-bulk-delete.schema";

export const getDraftOrders = async (params: DraftOrderListRequest) => {
  const response = await globalFetch(`/order-management/draft-order/fetch-all`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response;
};

export const getDraftOrderById = async (params: DraftOrderDetailsRequest) => {
  const response = await globalFetch(`/order-management/draft-order/get-by-id`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response;
};

export const rejectDraftOrder = async (params: DraftOrderRejectRequest) => {
  const response = await globalFetch(`/order-management/draft-order/reject`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response;
};

export const approveDraftOrder = async (params: DraftOrderApproveRequest) => {
  const response = await globalFetch(`/order-management/draft-order/approve`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response;
};

export const deleteDraftOrder = async (params: DraftOrderBulkDeleteRequest) => {
  const response = await globalFetch(`/order-management/draft-order/bulk-delete`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response;
};