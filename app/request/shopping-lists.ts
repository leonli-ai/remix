import { globalFetch } from "~/lib/fetch";
import { ShoppingListFilter } from "~/types";
import {
  DeleteShoppingListItemsRequest,
  FetchShoppingListItemsRequest,
  ShoppingListItemsAggregationRequest,
  UpdateShoppingListItemRequest,
} from "~/types/shopping-lists/shopping-list-items.schema";
import {
  CreateShoppingListRequest,
  DeleteShoppingListRequest,
  UpdateShoppingListRequest,
} from "~/types/shopping-lists/shopping-lists.schema";

export const getAllShoppingLists = async (params: ShoppingListFilter) => {
  const response = await globalFetch("/shopping-lists/fetch-all", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};

export const createShoppingList = async (params: CreateShoppingListRequest) => {
  const response = await globalFetch("/shopping-lists/create", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};

export const updateShoppingList = async (params: UpdateShoppingListRequest) => {
  const response = await globalFetch(`/shopping-lists/${params.id}/update`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};

export const deleteShoppingList = async (params: DeleteShoppingListRequest) => {
  const response = await globalFetch(`/shopping-lists/${params.id}/delete`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};

export const getShoppingListItems = async (
  params: FetchShoppingListItemsRequest,
) => {
  const response = await globalFetch(
    `/shopping-lists/${params.shoppingListId}/items/fetch`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
  return response;
};

export const updateShoppingListItems = async (
  params: UpdateShoppingListItemRequest,
) => {
  const response = await globalFetch(
    `/shopping-lists/${params.shoppingListId}/items/patch`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
  return response;
};

export const deleteShoppingListItems = async (
  params: DeleteShoppingListItemsRequest,
) => {
  const response = await globalFetch(
    `/shopping-lists/${params.shoppingListId}/items/delete`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
  return response;
};

export const getShoppingListAggregation = async (
  params: ShoppingListItemsAggregationRequest,
) => {
  const { shoppingListId, ...rest } = params;
  const response = await globalFetch(
    `/shopping-lists/${params.shoppingListId}/items/aggregation`,
    {
      method: "POST",
      body: JSON.stringify(rest),
    },
  );
  return response;
};
