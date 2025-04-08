import { FilterValues } from "~/components/common/DynamicFilterBuilder";
import SubscriptionOrdersListHeader from "./SubscriptionOrdersListHeader";
import SubscriptionOrdersTable from "./SubscriptionOrdersTable";
import { CustomPaginationNew } from "~/components/common/CustomPaginationNew";
import { useEffect, useMemo, useState } from "react";
import { useGetSubscriptionOrders } from "~/hooks/use-subscription-orders";
import { FetchSubscriptionContractsRequest } from "~/types/subscription-contracts/subscription-contract.schema";
import { useShopifyInformation } from "~/lib/shopify";

export default function SubscriptionOrdersList() {
  const { storeName, shopifyCompanyId, shopifyCompanyLocationId } =
    useShopifyInformation();
  const [params, setParams] = useState<FetchSubscriptionContractsRequest>({
    pagination: {
      page: 1,
      pageSize: 10,
    },
    storeName: storeName,
    companyLocationId: shopifyCompanyLocationId,
    companyId: shopifyCompanyId,
    filter: {},
  });

  const { data: subscriptionOrders, isLoading: isLoadingSubscriptionOrders } =
    useGetSubscriptionOrders(params);

  useEffect(() => {
    if (!isLoadingSubscriptionOrders && subscriptionOrders?.data.length === 0) {
      const prevPage = (params.pagination?.page || 1) - 1;
      const newCurrentPage = prevPage > 0 ? prevPage : 1;
      setParams({
        ...params,
        pagination: {
          pageSize: params.pagination?.pageSize || itemsPerPageDefault,
          page: newCurrentPage,
        },
      });
    }
  }, [subscriptionOrders, isLoadingSubscriptionOrders]);

  const handleOnSearch = (filters: FilterValues) => {
    setParams({
      ...params,
      filter: filters,
      pagination: { ...params.pagination, page: 1 },
    });
  };

  const itemsPerPageDefault = 10;
  const totalPages = useMemo(() => {
    return Math.ceil(
      (subscriptionOrders?.total || 0) /
        (subscriptionOrders?.pageSize || itemsPerPageDefault),
    );
  }, [subscriptionOrders]);

  const hasNextPage = useMemo(() => {
    return (subscriptionOrders?.page || 1) < totalPages;
  }, [subscriptionOrders?.page, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return (subscriptionOrders?.page || 1) > 1;
  }, [subscriptionOrders?.page]);

  return (
    <div className="container mx-auto">
      <div className="space-y-5">
        <SubscriptionOrdersListHeader
          onSearch={handleOnSearch}
          totalItems={subscriptionOrders?.total || 0}
        />
        <SubscriptionOrdersTable
          data={subscriptionOrders?.data || []}
          isLoading={isLoadingSubscriptionOrders}
        />
        {(subscriptionOrders?.total || 0) > 10 && (
          <CustomPaginationNew
            hasNextButton={hasNextPage}
            hasPreviousButton={hasPreviousPage}
            currentPage={params.pagination?.page || 1}
            totalPages={totalPages}
            itemsPerPage={params.pagination?.pageSize || itemsPerPageDefault}
            onPageChange={(page) => {
              setParams({
                ...params,
                pagination: { ...params.pagination, page },
              });
            }}
            onItemsPerPageChange={(pageSize) => {
              setParams({
                ...params,
                pagination: { ...params.pagination, pageSize },
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
