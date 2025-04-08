import { FilterValues } from "~/components/common/DynamicFilterBuilder";
import DeliveryHistoryListHeader from "./DeliveryHistoryListHeader";
import { DeliveryHistoryListTable } from "./DeliveryHistoryListTable";
import { DeliveryHistoryListCard } from "./DeliveryHistoryListCard";
import { CustomPaginationNew } from "~/components/common/CustomPaginationNew";
import { useShopifyInformation } from "~/lib/shopify";
import { useState } from "react";
import { OrderListRequest } from "~/types/order-management/order-list.schema";
import { useGetOrderHistory } from "~/hooks/use-order-history";
interface DeliveryHistoryListProps {
  id: number;
}
interface OrderListParams extends OrderListRequest {
  pagination: {
    currentPage: number;
    perPage: number;
    first?: number;
    after?: string;
    last?: number;
    before?: string;
    query: string;
    sortKey: OrderListRequest["pagination"]["sortKey"];
    reverse: boolean;
  };
}

export default function DeliveryHistoryList({ id }: DeliveryHistoryListProps) {
  // TODO: get delivery history from new api
  const { storeName, shopifyCustomerId } = useShopifyInformation();
  const [params, setParams] = useState<OrderListParams>({
    storeName,
    customerId: shopifyCustomerId,
    pagination: {
      currentPage: 1,
      perPage: 10,
      first: 10,
      after: undefined,
      query: "",
      sortKey: "CREATED_AT",
      reverse: true,
    },
  });

  const { data, isLoading } = useGetOrderHistory(params);

  const handleSearch = (filters: FilterValues) => {
    console.log(filters);
  };

  const itemsPerPageChange = (value: number) => {
    setParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: 1,
        perPage: value,
        first: value,
        after: undefined,
        last: undefined,
        before: undefined,
      },
    }));
  };

  const handleNextPage = () => {
    const lastId = data?.pagination?.endCursor;
    setParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: prev.pagination.currentPage + 1,
        first: prev.pagination.perPage,
        before: undefined,
        after: lastId,
        last: undefined,
      },
    }));
  };

  const handlePreviousPage = () => {
    const firstId = data?.pagination?.startCursor;
    setParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage:
          prev.pagination.currentPage - 1 < 1
            ? 1
            : prev.pagination.currentPage - 1,
        before: firstId,
        after: undefined,
        first: undefined,
        last: prev.pagination.perPage,
      },
    }));
  };

  return (
    <div className="container mx-auto">
      <div className="space-y-5">
        <DeliveryHistoryListHeader
          onSearch={handleSearch}
          totalItems={data?.pagination?.totalCount || 0}
        />
        <div className="app-hidden lg:block">
          <DeliveryHistoryListTable
            data={data?.orders || []}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:hidden">
          <DeliveryHistoryListCard
            data={data?.orders || []}
            isLoading={isLoading}
          />
        </div>

        {(data?.pagination?.totalCount || 0) > 10 && (
          <CustomPaginationNew
            currentPage={params.pagination.currentPage}
            totalPages={
              data?.pagination?.totalCount
                ? Math.ceil(
                    data?.pagination?.totalCount /
                      (params?.pagination?.perPage || 10),
                  )
                : 1
            }
            itemsPerPage={params.pagination.perPage}
            hasPreviousButton={data?.pagination?.hasPreviousPage}
            hasNextButton={data?.pagination?.hasNextPage}
            onPreviousPageChange={() => {
              handlePreviousPage();
            }}
            onNextPageChange={() => {
              handleNextPage();
            }}
            onItemsPerPageChange={(value) => {
              itemsPerPageChange(value);
            }}
          />
        )}
      </div>
    </div>
  );
}
