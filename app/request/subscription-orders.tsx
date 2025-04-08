import { globalFetch } from "~/lib/fetch";
import {
  CreateSubscriptionContractRequest,
  CreateSubscriptionContractResponse,
} from "~/types/subscription-contracts/subscription-contract-create.schema";
import {
  SubscriptionContractDeleteRequest,
  SubscriptionContractDeleteResponse,
} from "~/types/subscription-contracts/subscription-contract-delete.schema";
import {
  GetSubscriptionContractByIdRequest,
  GetSubscriptionContractByIdResponse,
} from "~/types/subscription-contracts/subscription-contract-get-by-id.schema";
import {
  SubscriptionContractPauseRequest,
  SubscriptionContractPauseResponse,
} from "~/types/subscription-contracts/subscription-contract-pause.schema";
import {
  SubscriptionContractResumeRequest,
  SubscriptionContractResumeResponse,
} from "~/types/subscription-contracts/subscription-contract-resume.schema";
import {
  SubscriptionContractSkipRequest,
  SubscriptionContractSkipResponse,
} from "~/types/subscription-contracts/subscription-contract-skip.schema";
import {
  UpdateSubscriptionContractRequest,
  UpdateSubscriptionContractResponse,
} from "~/types/subscription-contracts/subscription-contract-update.schema";
import {
  FetchSubscriptionContractsRequest,
  FetchSubscriptionContractsResponse,
} from "~/types/subscription-contracts/subscription-contract.schema";

export const createSubscriptionOrder = async (
  params: CreateSubscriptionContractRequest,
) => {
  const res = await globalFetch("/subscription-contracts/create", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as CreateSubscriptionContractResponse;
};

export const getSubscriptionOrders = async (
  params: FetchSubscriptionContractsRequest,
) => {
  const res = await globalFetch("/subscription-contracts/fetch-all", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as FetchSubscriptionContractsResponse;
};

export const getSubscriptionOrderById = async (
  params: GetSubscriptionContractByIdRequest,
) => {
  const res = await globalFetch(`/subscription-contracts/get-by-id`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as GetSubscriptionContractByIdResponse;
};

export const updateSubscriptionOrder = async (
  params: UpdateSubscriptionContractRequest,
) => {
  const res = await globalFetch("/subscription-contracts/update", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as UpdateSubscriptionContractResponse;
};

export const deleteSubscriptionOrder = async (
  params: SubscriptionContractDeleteRequest,
) => {
  const res = await globalFetch("/subscription-contracts/delete", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as SubscriptionContractDeleteResponse;
};

export const skipSubscriptionOrderDelivery = async (
  params: SubscriptionContractSkipRequest,
) => {
  const res = await globalFetch("/subscription-contracts/skip", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as SubscriptionContractSkipResponse;
};

export const pauseSubscriptionOrder = async (
  params: SubscriptionContractPauseRequest,
) => {
  const res = await globalFetch("/subscription-contracts/pause", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as SubscriptionContractPauseResponse;
};

export const resumeSubscriptionOrder = async (
  params: SubscriptionContractResumeRequest,
) => {
  const res = await globalFetch("/subscription-contracts/resume", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res as SubscriptionContractResumeResponse;
};
