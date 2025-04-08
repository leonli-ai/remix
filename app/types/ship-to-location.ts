export interface shippingAddress {
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  countryCode?: string;
}

export interface CompanyLocationItem {
  id: string;
  name: string;
  role?: string;
  roleId?: string;
  shippingAddress: shippingAddress
}

export interface Pagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
  totalCount: number;
}

export interface CompanyLocationResponse {
  companyLocations: CompanyLocationItem[];
  pagination: Pagination;
}

export interface AddressFilters {
    customerAddress: string
    city: string
    state: string
    zipCode: string
    country: string
  }

export interface CompanyLocationParams {
  customerId: string;
  companyId: string;
  storeName: string;
  pagination: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
    query: string;
    currentPage?: number;
    perPage?: number;
  }
}
