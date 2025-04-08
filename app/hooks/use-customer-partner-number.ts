import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_ADMIN_PORTAL_COMPANY_LIST, QUERY_ADMIN_PORTAL_CUSTOMER_CODE_LIST } from "~/constant/react-query-keys";
import { deleteCustomerPartnerNumber, downloadTemplate, getAdminPortalCompanyList, getAdminPortalCustomerCodeList, uploadAdminPortalFile } from "~/request/admin-portal";
import type { AdminPortalCustomerCodeListParams, AdminPortalDeleteCustomerPartnerNumberParams } from "~/types/admin-portal-customer-code";

export function useAdminPortalCustomerCodeList(params: AdminPortalCustomerCodeListParams) {
    const queryResult = useQuery({
      queryKey: [QUERY_ADMIN_PORTAL_CUSTOMER_CODE_LIST,params],
      queryFn: async () => {
        return await getAdminPortalCustomerCodeList(params);
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });
    return queryResult;
  }

export function useAdminPortalCompanyList() {
    const queryResult = useQuery({
      queryKey: [QUERY_ADMIN_PORTAL_COMPANY_LIST],
      queryFn: async () => {
        return await getAdminPortalCompanyList();
      },
      staleTime: 1000 * 60 * 5,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });
    return queryResult;
  }

  export function useDownloadTemplate() {
    const mutation = useMutation({
      mutationFn: async (params: { storeName: string, companyId: string, format: string }) => {
        return await downloadTemplate(params);
      },
    });
    return mutation;
  }

  export function useAdminPortalUploadFile() {
    const mutation = useMutation({
      mutationFn: async ({storeName, file}: {storeName: string, file: File}) => {
        try {
          return await uploadAdminPortalFile(storeName, file);
        } catch (error) {
          throw error instanceof Error 
            ? error 
            : new Error('Failed to upload file');
        }
      },
    });
    return mutation;
  }

  export function useAdminPortalDeleteCustomerPartnerNumber() {
    const mutation = useMutation({
      mutationFn: async (params:AdminPortalDeleteCustomerPartnerNumberParams) => {
        return await deleteCustomerPartnerNumber(params);
      },
    });
    return mutation;
  }
