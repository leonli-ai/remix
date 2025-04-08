import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_CUSTOMER_INFORMATION, QUERY_ROLES, QUERY_USER_DETAILS, QUERY_USER_LIST } from "~/constant/react-query-keys";
import { useShopifyInformation } from "~/lib/shopify";
import { createUser, deleteUser, editUser, getCustomerInformation, getRoles, getUserDetails, getUserList } from "~/request/users";
import type { CreateUserRequest, DeleteUserRequest, EditUserRequest, RolesParams, UserDetailsParams, UserListParams } from "~/types/users";

export function useUserList(params: UserListParams) {
    const queryResult = useQuery({
      queryKey: [QUERY_USER_LIST,params],
      queryFn: async () => {
        return await getUserList(params);
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });
    return queryResult;
  }

export function useUserDetails(params: UserDetailsParams) {
    const queryResult = useQuery({
      queryKey: [QUERY_USER_DETAILS,params],
      queryFn: async () => {
        return await getUserDetails(params);
      },
    });
    return queryResult;
  }

export function useDeleteUser() {
    const mutation = useMutation({
      mutationFn: async (input: DeleteUserRequest) => {
        return await deleteUser(input);
      },
    });
    return mutation;
  }

  export function useRoles(params: RolesParams) {
    const queryResult = useQuery({
      queryKey: [QUERY_ROLES ,params],
      queryFn: async () => {
        return await getRoles(params);
      },
      staleTime: 1000 * 60 * 5,
    });
    return queryResult;
  }

  export function useEditUser() {
    const mutation = useMutation({
      mutationFn: async (input: EditUserRequest) => {
        return await editUser(input);
      },
    });
    return mutation;
  }

  export function useCreateUser() {
    const mutation = useMutation({
      mutationFn: async (input: CreateUserRequest) => {
        return await createUser(input);
      },
    });
    return mutation;
  }

export function useCustomerInformation() {
  const { shopifyCustomerId ,storeName } = useShopifyInformation();
  const params = {
    storeName: storeName,
    customerId: shopifyCustomerId
  }
    const queryResult = useQuery({
      queryKey: [QUERY_CUSTOMER_INFORMATION ,params],
      queryFn: async () => {
        return await getCustomerInformation(params);
      },
      staleTime: 1000 * 60 * 60,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });
    return queryResult;
  }