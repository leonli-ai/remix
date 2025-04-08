import type { CompanyLocationItem, Pagination } from "./ship-to-location";

export interface UserItemInfo {
    id: string;
    customer: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        state: string;
      },
    isMainContact: boolean;
  }

export interface UserListParams {
    customerId: string;
    companyId: string;
    storeName: string;
    pagination: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
        query: string;
    }
}

export interface UserListResponse {
  companyContacts: UserItemInfo[];
  pagination: Pagination;
}

export interface DeleteUserRequest {
  storeName: string;
  customerId: string;
  data: {
    companyContactId: string;
    companyId: string;
  }
}

export interface DeleteUserParams {
  storeName: string;
  customerId: string;
  data: {
      companyContactId: string;
      companyId: string;
  }
}

export interface EditUserRequest {
  storeName: string;
  customerId: string;
  data: {
    companyId: string;
    companyContactId: string;
    roleAssignments: Array<{
      companyId?: string;
      companyLocationId?: string;
      roleId: string;
    }>;
  }
}

export interface UserDetailsParams {
  companyContactId: string;
  customerId: string;
  companyId: string;
  storeName: string;
}

export interface UserDetailsResponse extends UserItemInfo {
  roles: {
    id: string;
    name: string;
    companyLocation: CompanyLocationItem
  }[]
  company: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    state: string;
  }
}

export interface RoleItem {
  id: string;
  name: string;
  note: string;
}

export interface RoleListResponse {
  roles: RoleItem[];
}

export interface RolesParams {
  customerId: string;
  storeName: string;
}

export interface CreateUserRequest {
  storeName: string;
  customerId: string;
  companyId: string;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    companyLocations: [
      {
        locationId: string;
        roleId: string;
      }
    ]
  }
}
