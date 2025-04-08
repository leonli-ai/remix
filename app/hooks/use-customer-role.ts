import { useMemo } from "react";
import { useCustomerInformation } from "./use-users";
import { useShopifyInformation } from "~/lib/shopify";

export function useCustomerRole() {
  const { data: customerInformation } = useCustomerInformation();
  const { shopifyCompanyLocationId, shopifyCompanyId } = useShopifyInformation();

  const companyRole = useMemo(() => {
    return (
      customerInformation?.roles?.find(
        (role: any) =>
          role.companyLocationId === shopifyCompanyLocationId ||
          role.companyId === shopifyCompanyId,
      )?.name ?? ""
    );
  }, [customerInformation?.roles, shopifyCompanyLocationId, shopifyCompanyId]);

  const orderApproverRole = useMemo(() => {
    const role = customerInformation?.roles?.find(
      (role: any) =>
        role.companyLocationId === shopifyCompanyLocationId
    )?.name ?? ""
    return role === 'Order Approver'
  }, [customerInformation?.roles, shopifyCompanyLocationId]);

  const orderingOnlyRole = useMemo(() => {
    const role = customerInformation?.roles?.find(
      (role: any) =>
        role.companyLocationId === shopifyCompanyLocationId
    )?.name ?? ""
    return role === 'Ordering Only'
  }, [customerInformation?.roles, shopifyCompanyLocationId]);

  return {
    companyRole,
    orderApproverRole,
    orderingOnlyRole
  };
} 
