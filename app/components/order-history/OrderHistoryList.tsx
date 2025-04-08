import { format } from "date-fns";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useGetOrderHistory } from "~/hooks/use-order-history";
import { useCustomerInformation } from "~/hooks/use-users";
import { useShopifyInformation } from "~/lib/shopify";
import { extractIdFromGid } from "~/lib/utils";
import { OrderListRequest } from "~/types/order-management/order-list.schema";

import { CustomPaginationNew } from "../common/CustomPaginationNew";
import { FilterValues } from "../common/DynamicFilterBuilder";
import { OrderHistoryListCard } from "./OrderHistoryListCard";
import OrderHistoryListHeader from "./OrderHistoryListHeader";
import { OrderHistoryListTable } from "./OrderHistoryListTable";

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

export default function OrderHistoryList() {
  const { storeName, shopifyCustomerId } = useShopifyInformation();
  const { data: customerInformation } = useCustomerInformation();
  const roleLocation = useMemo(
    () =>
      (customerInformation?.roles || [])?.map((role: any) =>
        extractIdFromGid(role?.companyLocationId || "", "CompanyLocation"),
      ),
    [customerInformation],
  );

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

  const { data, isLoading } = useGetOrderHistory(
    params,
    !!params?.pagination?.query,
  );

  const handleSearch = (
    filters: FilterValues,
    sortKey: OrderListParams["pagination"]["sortKey"],
    reverse: OrderListParams["pagination"]["reverse"],
  ) => {
    const statusKeys = ["status", "financial_status", "fulfillment_status"];
    const query = Object.entries(filters)
      .map(([key, value]) => {
        // created_at
        if (key === "created_at") {
          const { from, to } = value as DateRange;
          let fromString = "";
          let toString = "";
          if (from) {
            fromString = `created_at:>=${format(from, "yyyy-MM-dd'T'HH:mm:ss'Z'")}`;
          }
          if (to) {
            toString = `created_at:<=${format(to, "yyyy-MM-dd'T'HH:mm:ss'Z'")}`;
          }
          return `${fromString} ${fromString && toString ? "AND" : ""} ${toString}`;
        }

        // status, financial_status, fulfillment_status
        if (statusKeys.includes(key)) {
          if (value === "All") {
            return ``;
          }
          return `${key}:${value}`;
        }

        // purchasing_company_location_id
        if (key === "purchasing_company_location_id") {
          if (value === "All") {
            return `(${key}:${roleLocation.join(" OR ")})`;
          }
          return `${key}:${value}`;
        }

        // common filter
        return `${key}:${value}*`;
      })
      .join(" AND ");

    setParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: 1,
        query,
        first: prev.pagination.perPage,
        after: undefined,
        last: undefined,
        before: undefined,
        sortKey,
        reverse,
      },
    }));
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
        <OrderHistoryListHeader
          onSearch={handleSearch}
          totalItems={data?.pagination?.totalCount}
        />
        <div className="app-hidden lg:block">
          <OrderHistoryListTable
            data={data?.orders || []}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:hidden">
          <OrderHistoryListCard
            data={data?.orders || []}
            isLoading={isLoading}
          />
        </div>

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
      </div>
    </div>
  );
}
