import { globalFetch } from "~/lib/fetch";
import type { UserDetailsParams, UserListParams, UserListResponse ,UserDetailsResponse, DeleteUserRequest,RoleListResponse, RolesParams, EditUserRequest, CreateUserRequest } from "~/types/users";

export const getUserList = async (params: UserListParams) => {
    const response = await globalFetch("/company-management/company-contact/fetch-all", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response as UserListResponse;
  };

  export const getUserDetails = async (params: UserDetailsParams) => {
    const response = await globalFetch("/company-management/company-contact/get-by-id", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response as UserDetailsResponse;
  };

  export const deleteUser = async (params: DeleteUserRequest) => {
    const response = await globalFetch("/company-management/company-contact/delete", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response;
  }

  export const editUser = async (params: EditUserRequest) => {
    const response = await globalFetch("/company-management/contact-role-management/role-assign", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response;
  }

  export const getRoles = async (params: RolesParams) => {
    const response = await globalFetch("/company-management/contact-role-management/fetch-all", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response as RoleListResponse;
  };

  export const createUser = async (params: CreateUserRequest) => {
    const response = await globalFetch("/company-management/company-contact/create", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response;
  }

  export const getCustomerInformation = async (params:{storeName:string,customerId:string}) => {
    const response = await globalFetch("/customer-management/customer/get-by-id", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response;
  }
