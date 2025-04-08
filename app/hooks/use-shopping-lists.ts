import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import _ from "lodash";
import { ShoppingListFilter } from "~/types";
import {
  QUERY_ALL_SHOPPING_LISTS,
  QUERY_SHOPPING_LIST_AGGREGATION,
} from "~/constant/react-query-keys";
import {
  createShoppingList,
  deleteShoppingList,
  deleteShoppingListItems,
  getAllShoppingLists,
  getShoppingListAggregation,
  getShoppingListItems,
  updateShoppingList,
  updateShoppingListItems,
} from "~/request/shopping-lists";
import {
  CreateShoppingListRequest,
  DeleteShoppingListRequest,
  ShoppingListResponse,
  UpdateShoppingListRequest,
} from "~/types/shopping-lists/shopping-lists.schema";
import {
  DeleteShoppingListItemsRequest,
  FetchShoppingListItemsRequest,
  ShoppingListItemsAggregationRequest,
  ShoppingListItemsAggregationResponse,
  UpdateShoppingListItemRequest,
} from "~/types/shopping-lists/shopping-list-items.schema";

export function useGetAllShoppingLists(
  params: ShoppingListFilter,
  enabled: boolean = true,
): UseQueryResult<ShoppingListResponse> {
  const queryResult = useQuery({
    queryKey: [QUERY_ALL_SHOPPING_LISTS, params],
    queryFn: async () => {
      return await getAllShoppingLists(params);
    },
    enabled: enabled,
    // refetchOnWindowFocus: false,
  });
  return queryResult;
}

export function useCreateShoppingList() {
  const mutation = useMutation({
    mutationFn: async (input: CreateShoppingListRequest) => {
      return await createShoppingList(input);
    },
  });
  return mutation;
}

export function useUpdateShoppingList() {
  const mutation = useMutation({
    mutationFn: async (input: UpdateShoppingListRequest) => {
      return await updateShoppingList(input);
    },
  });
  return mutation;
}

export function useDeleteShoppingList() {
  const mutation = useMutation({
    mutationFn: async (input: DeleteShoppingListRequest) => {
      return await deleteShoppingList(input);
    },
  });
  return mutation;
}

export function useGetShoppingListItems() {
  const mutation = useMutation({
    mutationFn: async (input: FetchShoppingListItemsRequest) => {
      return await getShoppingListItems(input);
    },
  });
  return mutation;
}

export function useUpdateShoppingListItems() {
  const mutation = useMutation({
    mutationFn: async (input: UpdateShoppingListItemRequest) => {
      return await updateShoppingListItems(input);
    },
  });
  return mutation;
}

export function useDeleteShoppingListItems() {
  const mutation = useMutation({
    mutationFn: async (input: DeleteShoppingListItemsRequest) => {
      return await deleteShoppingListItems(input);
    },
  });
  return mutation;
}

export function useGetShoppingListAggregation(
  params: ShoppingListItemsAggregationRequest,
  enabled: boolean = true,
): UseQueryResult<ShoppingListItemsAggregationResponse> {
  const queryResult = useQuery({
    queryKey: [QUERY_SHOPPING_LIST_AGGREGATION, params],
    queryFn: async () => {
      return await getShoppingListAggregation(params);
    },
    enabled: enabled && !!params.shoppingListId,
  });
  return queryResult;
}
