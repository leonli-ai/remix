import { globalFetch } from "~/lib/fetch";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "~/types/order-management/create-order.schema";
import {
  PoFileUploadRequest,
  PoFileUploadResponse,
} from "~/types/purchase-order/file-upload.schema";
import {
  PoParserRequest,
  PoParserResponse,
} from "~/types/purchase-order/po-parser.schema";

export const uploadPoFile = async (params: PoFileUploadRequest) => {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("storeName", params.storeName);

  const response = await globalFetch(`/purchase-order/upload`, {
    method: "POST",
    body: formData,
  });

  return response as PoFileUploadResponse;
};

export const parsePoFile = async (params: PoParserRequest) => {
  const response = await globalFetch(`/purchase-order/parse`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as PoParserResponse;
};

export const createOrder = async (params: CreateOrderRequest) => {
  const response = await globalFetch(`/order-management/order/create`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as CreateOrderResponse;
};
