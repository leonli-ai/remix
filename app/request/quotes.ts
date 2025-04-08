import { globalFetch } from "~/lib/fetch";
import type { CancelQuoteRequest } from "~/types/quotes/quote-cancel.schema";
import type { BulkDeleteQuotesRequest } from "~/types/quotes/quote-delete.schema";
import type { QuoteDetailsRequest } from "~/types/quotes/quote-details.schema";
import type { UpdateQuoteItemsRequest } from "~/types/quotes/quote-items-update.schema";
import type {
  CreateQuoteInput,
  FetchQuotesParams,
  QuoteListResponse,
  QuoteResponse,
  QuoteWithCustomer,
} from "~/types/quotes/quote.schema";
import type { ApproveQuoteRequest } from "~/types/quotes/quote-approve.schema";
import type { RejectQuoteRequest } from '~/types/quotes/quote-reject.schema';
import type {
  ConvertQuoteToOrderRequest,
  ConvertQuoteToOrderResponse,
} from "~/types/quotes/quote-convert-order.schema";

export const getQuotesList = async (params: FetchQuotesParams) => {
  const response = await globalFetch("/quotes/fetch-all", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as QuoteListResponse;
};

export const createQuote = async (params: CreateQuoteInput) => {
  const response = await globalFetch("/quotes/create", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as QuoteWithCustomer;
};

export const getQuoteById = async (params: QuoteDetailsRequest) => {
  const response = await globalFetch("/quotes/get-by-id", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as QuoteListResponse;
};

export const approveQuote = async (params: ApproveQuoteRequest) => {
  const response = await globalFetch("/quotes/approve", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as QuoteWithCustomer;
};

export const updateQuoteItems = async (params: UpdateQuoteItemsRequest) => {
  const response = await globalFetch("/quotes/items/update", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};

export const getQuoteDetails = async (params: QuoteDetailsRequest) => {
  const response = await globalFetch("/quotes/get-by-id", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response as QuoteResponse;
};

export const declineQuote = async (params: RejectQuoteRequest) => {
  const response = await globalFetch("/quotes/reject", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as QuoteWithCustomer;
};

export const convertQuoteToDraftOrder = async (
  params: ConvertQuoteToOrderRequest,
) => {
  const response = await globalFetch("/quotes/convert-to-order", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as ConvertQuoteToOrderResponse;
};

export const cancelQuote = async (params: CancelQuoteRequest) => {
  const response = await globalFetch("/quotes/cancel", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as QuoteWithCustomer;
};

export const deleteQuote = async (params: BulkDeleteQuotesRequest) => {
  const response = await globalFetch("/quotes/bulk-delete", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response as QuoteResponse;
};

export const convertQuoteToOrder = async (
  params: ConvertQuoteToOrderRequest,
) => {
  const response = await globalFetch("/quotes/convert-to-order", {
    method: "POST",
    body: JSON.stringify(params), 
  });

  return response as ConvertQuoteToOrderResponse;
};
