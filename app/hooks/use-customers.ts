import { useCallback, useState } from "react";

export interface Company {
  id: string;
  name: string;
}

export interface CompanyContactProfile {
  id: string;
  company: {
    id: string;
    name: string;
  };
}

export interface Customer {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  companyContactProfiles: CompanyContactProfile[];
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
  __typename?: string;
}

interface CustomerEdge {
  cursor: string;
  node: Customer;
  __typename?: string;
}

interface CustomerResponse {
  data: {
    customers: {
      pageInfo: PageInfo;
      edges: CustomerEdge[];
      __typename?: string;
    };
  };
  extensions?: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
    };
  };
}

interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

interface FetchCustomersParams {
  searchQuery?: string;
  pagination?: {
    first?: number;
    last?: number;
    after?: string;
    before?: string;
  };
}

interface PaymentTermsTemplate {
  id: string;
  translatedName: string;
  __typename?: string;
}

interface BuyerExperienceConfiguration {
  checkoutToDraft: boolean;
  paymentTermsTemplate: PaymentTermsTemplate;
  __typename?: string;
}

export interface CompanyLocation {
  id: string;
  name: string;
  buyerExperienceConfiguration: BuyerExperienceConfiguration;
  catalogsCount: { count: number; __typename?: string };
  ordersCount: { count: number; __typename?: string };
  totalSpent: {
    currencyCode: string;
    amount: string;
    __typename?: string;
  };
  __typename?: string;
}

interface CompanyLocationsResponse {
  data: {
    company: {
      id: string;
      locationsCount: { count: number; __typename?: string };
      locations: {
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
          hasPreviousPage: boolean;
          __typename?: string;
        };
        edges: Array<{
          cursor: string;
          node: CompanyLocation;
          __typename?: string;
        }>;
        __typename?: string;
      };
      __typename?: string;
    };
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchCustomers = useCallback(
    async (params: FetchCustomersParams = {}) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/v1/admin/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
            query CustomerList(
              $first: Int,
              $last: Int,
              $before: String,
              $after: String,
              $query: String,
              $reverse: Boolean!
            ) {
              customers(
                first: $first,
                last: $last,
                before: $before,
                after: $after,
                query: $query,
                reverse: $reverse
              ) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                edges {
                  cursor
                  node {
                    id
                    displayName
                    firstName
                    lastName
                    email
                    phone
                    companyContactProfiles {
                      id
                      company {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          `,
            variables: {
              first: params.pagination?.first,
              last: params.pagination?.last,
              before: params.pagination?.before,
              after: params.pagination?.after,
              query: params.searchQuery,
              reverse: false,
            },
          }),
        });

        const data = (await response.json()) as CustomerResponse;

        if (data.data?.customers?.edges) {
          const customerList = data.data.customers.edges.map(
            (edge) => edge.node,
          );
          setCustomers(customerList);
          setPagination({
            hasNextPage: data.data.customers.pageInfo.hasNextPage,
            hasPreviousPage: data.data.customers.pageInfo.hasPreviousPage,
            startCursor: data.data.customers.pageInfo.startCursor,
            endCursor: data.data.customers.pageInfo.endCursor,
          });
        } else {
          setCustomers([]);
          setPagination({
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
        setPagination({
          hasNextPage: false,
          hasPreviousPage: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    customers,
    isLoading,
    fetchCustomers,
    pagination,
  };
}

export function useCompanyLocations() {
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setLocations([]);
    setHasNextPage(false);
    setEndCursor(null);
    setIsLoading(false);
  }, []);

  const fetchLocations = useCallback(
    async (companyId: string, after?: string) => {
      if (!companyId) {
        resetState();
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/v1/admin/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
            query CompanyLocationsList($companyId: ID!, $first: Int, $after: String) {
              company(id: $companyId) {
                id
                locations(first: $first, after: $after) {
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                  edges {
                    node {
                      id
                      name
                      buyerExperienceConfiguration {
                        checkoutToDraft
                        paymentTermsTemplate {
                          id
                          translatedName
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
            variables: {
              companyId,
              first: 5,
              after,
            },
          }),
        });

        const data = (await response.json()) as CompanyLocationsResponse;

        if (data.data?.company?.locations?.edges) {
          const newLocations = data.data.company.locations.edges.map(
            (edge) => edge.node,
          );
          setLocations((prev) =>
            after ? [...prev, ...newLocations] : newLocations,
          );
          setHasNextPage(data.data.company.locations.pageInfo.hasNextPage);
          setEndCursor(data.data.company.locations.pageInfo.endCursor);
        } else {
          resetState();
        }
      } catch (error) {
        console.error("Error fetching company locations:", error);
        resetState();
      } finally {
        setIsLoading(false);
      }
    },
    [resetState],
  );

  const loadMore = useCallback(
    (companyId: string) => {
      if (!companyId || !hasNextPage || !endCursor) {
        return;
      }
      fetchLocations(companyId, endCursor);
    },
    [fetchLocations, hasNextPage, endCursor],
  );

  return {
    locations,
    isLoading,
    fetchLocations,
    hasNextPage,
    loadMore,
  };
}

export function useShopTheme() {
  const [themeId, setThemeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShopTheme = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/admin/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetShopTheme($roles: [ThemeRole!], $first: Int) {
              themes(first: $first, roles: $roles) {
                edges {
                  node {
                    id
                    name
                    role
                  }
                }
              }
            }
          `,
          variables: {
            first: 1,
            roles: "MAIN",
          },
        }),
      });

      const data = await response.json();

      console.log("11111111data", data);
      
      const themeId = data?.data?.themes?.edges.find((theme: any) => theme.node.role === 'main')?.node.id.split('/').pop();
      
      setThemeId(themeId);
      
      return themeId;
    } catch (error) {
      console.error('Error fetching shop theme:', error);
      setThemeId(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { themeId, isLoading, fetchShopTheme };
}
