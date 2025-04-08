import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "@remix-run/react";

import type { ColumnDef } from "@tanstack/react-table";
import _ from "lodash";
import {
  companyLocationFilterConfig,
  CompanyLocationFilterType,
} from "~/config/filterConfig";
import { useShipToLocationList } from "~/hooks/use-ship-to-location";
import { isEmptyFilterInput } from "~/lib/filter";
import { useShopifyInformation } from "~/lib/shopify";
import { DynamicFilterValueTypes, FilterTag } from "~/types/filter";
import type {
  CompanyLocationItem,
  CompanyLocationParams,
} from "~/types/ship-to-location";
import { DataTable } from "../common/DataTable";
import { DynamicFilterBuilderHeader } from "../common/DynamicFilterBuilderHeader";
import {
  DesktopDynamicFilterV2,
  MobileDynamicFilterV2,
} from "../common/DynamicFilterV2";
import CompanyLocationCard from "./CompanyLocationCard";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

export default function CompanyLocationTable() {
  const { t } = useTranslation();
  const { storeName, shopifyCustomerId, shopifyCompanyId } =
    useShopifyInformation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const afterCursor = searchParams.get("after") || undefined;
  const searchQuery = searchParams.get("q") || "";

  const [params, setParams] = useState<CompanyLocationParams>({
    customerId: shopifyCustomerId,
    companyId: shopifyCompanyId,
    storeName,
    pagination: {
      first: 10,
      query: searchQuery,
      after: afterCursor,
    },
  });

  const { data, isLoading, isRefetching } = useShipToLocationList(params);

  const columns: ColumnDef<CompanyLocationItem>[] = [
    {
      accessorKey: "name",
      header: t("company-location.list.table.account-name"),
    },
    {
      accessorKey: "shippingAddress",
      header: t("company-location.list.table.company-address"),
      cell: ({ row }) => {
        const { address1, address2 } = row.getValue(
          "shippingAddress",
        ) as CompanyLocationItem["shippingAddress"];
        return (
          <div className="">{`${address1 ? address1 : ""} ${address2 ? address2 : ""}`}</div>
        );
      },
    },
    {
      accessorKey: "shippingAddress.city",
      header: t("company-location.list.table.city"),
    },
    {
      accessorKey: "shippingAddress.province",
      header: t("company-location.list.table.state"),
    },
    {
      accessorKey: "shippingAddress.zip",
      header: t("company-location.list.table.zip"),
    },
    {
      accessorKey: "shippingAddress.country",
      header: t("company-location.list.table.country"),
    },
  ];

  const [filterValue, setFilterValue] = useState<
    Record<CompanyLocationFilterType, DynamicFilterValueTypes>
  >({
    name: "",
  });

  const handleApply = (
    filterValue: Record<CompanyLocationFilterType, DynamicFilterValueTypes>,
  ) => {
    const filters = {
      ...isEmptyFilterInput("name", filterValue.name as string),
    };
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("after");
      newParams.delete("before");
      if (!_.isEmpty(filters)) {
        newParams.set(
          "q",
          `${Object.keys(filters)[0]}:${Object.values(filters)[0]}`,
        );
      } else {
        newParams.delete("q");
      }
      return newParams;
    });
  };

  const handleClear = (
    filterValue?: Record<CompanyLocationFilterType, DynamicFilterValueTypes>,
  ) => {
    const filters = {
      ...isEmptyFilterInput("name", filterValue?.name as string),
    };

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("after");
      newParams.delete("before");
      if (!_.isEmpty(filters)) {
        newParams.set(
          "q",
          `${Object.keys(filters)[0]}:${Object.values(filters)[0]}`,
        );
      } else {
        newParams.delete("q");
      }
      return newParams;
    });
  };

  const handleRemoveFilter = (
    tag: FilterTag<CompanyLocationFilterType>,
    filterValue: Record<CompanyLocationFilterType, DynamicFilterValueTypes>,
  ) => {
    const filters = {
      ...isEmptyFilterInput("name", filterValue.name as string),
    };
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("after");
      newParams.delete("before");
      if (!_.isEmpty(filters)) {
        newParams.set(
          "q",
          `${Object.keys(filters)[0]}:${Object.values(filters)[0]}`,
        );
      } else {
        newParams.delete("q");
      }
      return newParams;
    });
  };

  const handleNextPage = () => {
    if (data?.pagination?.hasNextPage && data?.pagination?.endCursor) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("after", data.pagination.endCursor);
        newParams.delete("before");
        return newParams;
      });
    }
  };

  const handlePreviousPage = () => {
    if (data?.pagination?.hasPreviousPage && data?.pagination?.startCursor) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("after");
        newParams.set("before", data.pagination.startCursor);
        return newParams;
      });
    }
  };

  useEffect(() => {
    const beforeCursor = searchParams.get("before") || undefined;
    setParams((prev) => ({
      ...prev,
      pagination: {
        first: beforeCursor ? undefined : 10,
        last: beforeCursor ? 10 : undefined,
        after: beforeCursor ? undefined : afterCursor,
        before: beforeCursor,
        query: searchQuery,
      },
    }));
  }, [searchQuery, afterCursor, searchParams]);

  useEffect(() => {
    if (data && afterCursor && data.companyLocations.length === 0) {
      handlePreviousPage();
    }
  }, [data, afterCursor]);

  const filterConfig = companyLocationFilterConfig();

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          <h1 className="text-xl md:text-2xl font-semibold">
            {t("company-location.list.table.title")}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <DynamicFilterBuilderHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          setShowMobileFilter={setShowMobileFilter}
          hideFilterTextWhileMobile={true}
          hideSeparator={true}
        />

        {showFilters && (
          <DesktopDynamicFilterV2
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            onSearch={handleApply}
            onClearAllFilters={handleClear}
            onRemoveFilter={handleRemoveFilter}
          />
        )}

        {showMobileFilter && (
          <MobileDynamicFilterV2
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            isOpen={showMobileFilter}
            onClose={() => setShowMobileFilter(false)}
            onMobileApply={handleApply}
          />
        )}
      </div>
      <div className="app-hidden lg:block mt-4">
        <DataTable
          isLoading={isLoading || isRefetching}
          columns={columns}
          data={data?.companyLocations ?? []}
          emptyMessage={t("company-location.list.table.no-locations-found")}
          rowClassNameFn={(_row, index) =>
            index % 2 !== 0 ? "bg-blue-50" : ""
          }
          headerClassName="bg-blue-50"
          headerCellClassName="font-bold text-black"
        />
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-4">
        {data?.companyLocations.map(
          (companyLocationItem: CompanyLocationItem) => (
            <CompanyLocationCard
              key={companyLocationItem.id}
              companyLocationItem={companyLocationItem}
            />
          ),
        )}
      </div>

      {(data?.pagination?.hasNextPage || data?.pagination?.hasPreviousPage) && (
        <div className="flex items-center justify-end gap-2 p-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreviousPage}
            disabled={!data?.pagination?.hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={!data?.pagination?.hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
