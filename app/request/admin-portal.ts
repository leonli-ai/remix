import { getRuntimeApiEndpoint, globalFetch } from "~/lib/fetch";
import { queryAdminPortalCompanies } from "./graphql/admin-portal";
import type {
  AdminPortalCompany,
  AdminPortalCustomerCodeListParams,
  AdminPortalCustomerCodeListResponse,
  AdminPortalDeleteCustomerPartnerNumberParams,
} from "~/types/admin-portal-customer-code";

export const getAdminPortalCustomerCodeList = async (
  params: AdminPortalCustomerCodeListParams,
) => {
  const response = await globalFetch(
    "/product-variant/customer-partner-number/fetch-all",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
  return response as AdminPortalCustomerCodeListResponse;
};

export const getAdminPortalCompanyList = async () => {
  const response = await globalFetch("/admin/proxy", {
    method: "POST",
    body: JSON.stringify({ query: queryAdminPortalCompanies, variables: {} }),
  });
  return response.data.companies.edges.map(
    (company: { node: AdminPortalCompany }) => company.node,
  ) as AdminPortalCompany[];
};

export const downloadTemplate = async (params: {
  storeName: string;
  companyId: string;
  format: string;
}) => {
  const endpoint = getRuntimeApiEndpoint();
  const response = await fetch(
    `${endpoint}/product-variant/customer-partner-number/export`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );

  // const response = await fetch(
  //   `${import.meta.env.VITE_PUBLIC_API_V1_ENDPOINT}/product-variant/customer-partner-number/export`,
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(params),
  //   },
  // );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Export failed");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export.${params.format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const uploadAdminPortalFile = async (storeName: string, file: File) => {
  const formData = new FormData();
  formData.append("storeName", storeName);
  formData.append("file", file);

  // const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_V1_ENDPOINT}/product-variant/customer-partner-number/upload`, {
  //   method: 'POST',
  //   body: formData
  // });

  // if (!response.ok) {
  //     throw new Error('Upload failed');
  // }

  // return response;

  try {
    const response = await globalFetch(
      "/product-variant/customer-partner-number/upload",
      {
        method: "POST",
        body: formData,
      },
    );
    return response;
  } catch (error) {
    throw new Error("Upload failed");
  }
};

export const deleteCustomerPartnerNumber = async (
  params: AdminPortalDeleteCustomerPartnerNumberParams,
) => {
  const response = await globalFetch(
    "/product-variant/customer-partner-number/bulk-delete",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
  return response;
};
