import { globalFetch } from "~/lib/fetch";
import { OrderDetailRequest } from "~/types/order-management/order-detail.schema";
import { OrderListRequest } from "~/types/order-management/order-list.schema";

export const getOrderHistory = async (params: OrderListRequest) => {
  const response = await globalFetch("/order-management/order/fetch-all", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};

export const getOrderDetail = async (params: OrderDetailRequest) => {
  const response = await globalFetch("/order-management/order/get-by-id", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};
