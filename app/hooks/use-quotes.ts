import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getQuotesList,
  getQuoteDetails,
  approveQuote,
  convertQuoteToDraftOrder,
  cancelQuote,
  deleteQuote,
  declineQuote,
  createQuote,
  getQuoteById,
  updateQuoteItems,
  convertQuoteToOrder,
} from "~/request/quotes";
import {
  QUERY_ADMIN_PORTAL_QUOTES_LIST,
  QUERY_ADMIN_PORTAL_QUOTE_DETAILS,
  QUERY_QUOTES_BY_ID,
  QUERY_QUOTES_LIST,
} from "~/constant/react-query-keys";
import type {
  CreateQuoteInput,
  FetchQuotesParams,
} from "~/types/quotes/quote.schema";
import type { QuoteDetailsRequest } from "~/types/quotes/quote-details.schema";
import type { ApproveQuoteRequest } from "~/types/quotes/quote-approve.schema";
import type { RejectQuoteRequest } from "~/types/quotes/quote-reject.schema";
import type { ConvertQuoteToOrderRequest } from "~/types/quotes/quote-convert-order.schema";
import type { CancelQuoteRequest } from "~/types/quotes/quote-cancel.schema";
import type { BulkDeleteQuotesRequest } from "~/types/quotes/quote-delete.schema";
import type { UpdateQuoteItemsRequest } from "~/types/quotes/quote-items-update.schema";

export function useQuotesList(params: FetchQuotesParams) {
  const queryResult = useQuery({
    queryKey: [QUERY_ADMIN_PORTAL_QUOTES_LIST, params],
    queryFn: async () => {
      return await getQuotesList(params);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return queryResult;
}

export function useGetQuotesList(params: FetchQuotesParams) {
  const queryResult = useQuery({
    queryKey: [QUERY_QUOTES_LIST, params],
    queryFn: async () => {
      return await getQuotesList(params);
    },
    staleTime: 1000 * 60 * 5,
  });

  return queryResult;
}

export function useCreateQuote() {
  const mutation = useMutation({
    mutationFn: async (params: CreateQuoteInput) => {
      return await createQuote(params);
    },
  });

  return mutation;
}

export function useGetQuoteById(params: QuoteDetailsRequest) {
  const queryResult = useQuery({
    queryKey: [QUERY_QUOTES_BY_ID, params],
    queryFn: async () => {
      try {
        return await getQuoteById(params);
      } catch (error) {
        console.error("getQuoteById error", error);
        throw error;
      }
    },
    enabled: !!params.quoteId,
    staleTime: 1000 * 60 * 5,
  });

  return queryResult;
}

export function useUpdateQuoteItems() {
  const mutation = useMutation({
    mutationFn: async (params: UpdateQuoteItemsRequest) => {
      return await updateQuoteItems(params);
    },
  });

  return mutation;
}

export function useQuoteDetails(params: QuoteDetailsRequest) {
  const queryResult = useQuery({
    queryKey: [QUERY_ADMIN_PORTAL_QUOTE_DETAILS, params],
    queryFn: async () => {
      return await getQuoteDetails(params);
    },
  });

  return queryResult;
}

export function useQuoteCreateWithQuoteId() {
  const mutation = useMutation({
    mutationFn: async (params: QuoteDetailsRequest) => {
      return await getQuoteDetails(params);
    },
  });

  return mutation;
}

export function useCancelQuote() {
  const mutation = useMutation({
    mutationFn: async (params: CancelQuoteRequest) => {
      return await cancelQuote(params);
    },
  });

  return mutation;
}

export function useApproveQuote() {
  const mutation = useMutation({
    mutationFn: async (params: ApproveQuoteRequest) => {
      try {
        return await approveQuote(params);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Failed to approve quote");
      }
    },
  });

  return mutation;
}

export function useConvertQuoteToOrder() {
  const mutation = useMutation({
    mutationFn: async (params: ConvertQuoteToOrderRequest) => {
      return await convertQuoteToOrder(params);
    },
  });

  return mutation;
}

export function useDeclineQuote() {
  const mutation = useMutation({
    mutationFn: async (params: RejectQuoteRequest) => {
      try {
        return await declineQuote(params);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Failed to decline quote");
      }
    },
  });

  return mutation;
}

export function useConvertQuoteToDraftOrder() {
  const mutation = useMutation({
    mutationFn: async (params: ConvertQuoteToOrderRequest) => {
      try {
        return await convertQuoteToDraftOrder(params);
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Failed to convert quote to draft order");
      }
    },
  });

  return mutation;
}

export function useDeleteQuote() {
  const mutation = useMutation({
    mutationFn: async (params: BulkDeleteQuotesRequest) => {
      return await deleteQuote(params);
    },
  });

  return mutation;
}

export interface RoleAssignment {
  id: string;
  company: {
    id: string;
    name: string;
  };
  companyLocation: {
    id: string;
    name: string;
  };
}

export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface RoleAssignmentSearchRequest {
  contactId: string;
  first: number;
  searchQuery: string;
  after?: string;
}

export interface RoleAssignmentResponse {
  data: {
    companyContact: {
      id: string;
      roleAssignments: {
        pageInfo: {
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string;
          endCursor: string;
        };
        edges: {
          cursor: string;
          node: RoleAssignment;
        }[];
      };
    };
  };
}

export function useRoleAssignmentsSearch() {
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchRoleAssignments = useCallback(
    async (params: RoleAssignmentSearchRequest) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/v1/admin/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
            query B2BRoleAssignmentsSearch($first: Int!, $contactId: ID!, $searchQuery: String = "", $after: String) {
              companyContact(id: $contactId) {
                id
                roleAssignments(
                  first: $first
                  query: $searchQuery
                  after: $after
                  sortKey: LOCATION_NAME
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
                      company {
                        id
                        name
                        note
                      }
                      companyLocation {
                        id
                        name
                        note
                        taxSettings {
                          taxExempt
                        }
                        billingAddress {
                          id
                          firstName
                          lastName
                          formattedAddress(withName: true, withCompanyName: true)
                          address1
                          address2
                          city
                          countryCode
                          province
                          phone
                          zoneCode
                          zip
                          company: recipient
                        }
                        shippingAddress {
                          id
                          firstName
                          lastName
                          formattedAddress(withName: true, withCompanyName: true)
                          address1
                          address2
                          city
                          countryCode
                          province
                          phone
                          zoneCode
                          zip
                          company: recipient
                        }
                        buyerExperienceConfiguration {
                          paymentTermsTemplate {
                            dueInDays
                            id
                            name
                            paymentTermsType
                            translatedName
                          }
                          deposit {
                            ... on DepositPercentage {
                              percentage
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
            variables: {
              contactId: params.contactId,
              first: params.first,
              searchQuery: params.searchQuery,
              after: params.after,
            },
          }),
        });

        const data = (await response.json()) as RoleAssignmentResponse;

        if (data.data?.companyContact?.roleAssignments?.edges) {
          const roleAssignmentsList =
            data.data.companyContact.roleAssignments.edges.map(
              (edge) => edge.node,
            );

          setRoleAssignments(roleAssignmentsList);

          setPagination({
            hasNextPage:
              data.data.companyContact.roleAssignments.pageInfo.hasNextPage,
            hasPreviousPage:
              data.data.companyContact.roleAssignments.pageInfo.hasPreviousPage,
            startCursor:
              data.data.companyContact.roleAssignments.pageInfo?.startCursor,
            endCursor:
              data.data.companyContact.roleAssignments.pageInfo?.endCursor,
          });
        } else {
          setRoleAssignments([]);
          setPagination({
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }
      } catch (error) {
        console.error("Error fetching role assignments:", error);
        setRoleAssignments([]);
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
    roleAssignments,
    isLoading,
    fetchRoleAssignments,
    pagination,
  };
}
