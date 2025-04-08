import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import {
  OrderHistoryFilterType,
  orderHistoryFilterConfig,
} from "~/config/filterConfig";
import { useShipToLocationList } from "~/hooks/use-ship-to-location";
import { useCustomerInformation } from "~/hooks/use-users";
import { isEmptyFilterInput } from "~/lib/filter";
import { useShopifyInformation } from "~/lib/shopify";
import { cn, extractIdFromGid } from "~/lib/utils";
import { DynamicFilterValueTypes, FilterTag } from "~/types/filter";
import { CompanyLocationParams } from "~/types/ship-to-location";
import { useTranslation } from "react-i18next";

import { type FilterValues } from "../common/DynamicFilterBuilder";
import { DynamicFilterBuilderHeader } from "../common/DynamicFilterBuilderHeader";
import {
  DesktopDynamicFilterV2,
  MobileDynamicFilterV2,
} from "../common/DynamicFilterV2";
import OrderHistorySort, {
  OrderHistorySortConfig,
  OrderHistorySortField,
  OrderHistorySortOrder,
} from "./OrderHistorySort";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onSearch: (
    values: FilterValues,
    sortField: OrderHistorySortField,
    sortOrder: boolean,
  ) => void;
  totalItems?: number;
}

export default function OrderHistoryListHeader(props: Props) {
  const { t } = useTranslation();

  const { shopifyCustomerId, shopifyCompanyId, storeName } =
    useShopifyInformation();

  const pageSize = 250;

  const [configData, setConfigData] = useState<CompanyLocationParams>({
    customerId: shopifyCustomerId,
    companyId: shopifyCompanyId,
    storeName,
    pagination: {
      currentPage: 1,
      perPage: pageSize,
      first: pageSize,
      query: ``,
    },
  });

  const { data: customerInformation } = useCustomerInformation();

  const { data: locations } = useShipToLocationList(configData, true);

  const { onSearch, totalItems = 0 } = props;

  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const functionFilterConfig = orderHistoryFilterConfig();
  const filterConfig = useMemo(() => {
    const options = locations?.companyLocations
      ?.map((location) => {
        const isOkLocation = customerInformation?.roles?.find(
          (role: any) => role.companyLocationId === location.id,
        );
        if (!isOkLocation) return null;

        return {
          label: location.name,
          value: extractIdFromGid(location.id, "CompanyLocation"),
          tagValue: location.name,
        };
      })
      .filter((item) => item !== null);
    const config = _.cloneDeep(functionFilterConfig);
    const { purchasing_company_location_id, ...rest } = config;
    const res = {
      ...rest,
      purchasing_company_location_id: {
        ...purchasing_company_location_id,
        options: options, // required api
      },
    };
    return res;
  }, [locations, customerInformation, functionFilterConfig]);

  const [filters, setFilters] = useState<FilterValues>({});
  const [sortField, setSortField] =
    useState<OrderHistorySortField>("orderNumber");
  const [sortOrder, setSortOrder] = useState<OrderHistorySortOrder>("desc");

  const onSortFieldChange = (field: OrderHistorySortField) => {
    setSortField(field);
  };

  const onSortOrderChange = (order: OrderHistorySortOrder) => {
    setSortOrder(order);
  };

  const handleSearch = () => {
    const myValues = {
      purchasing_company_location_id: "All",
      ...filters,
    };
    onSearch(
      myValues,
      OrderHistorySortConfig[sortField].field as OrderHistorySortField,
      sortOrder === "desc",
    );
  };

  const [filterValue, setFilterValue] =
    useState<Record<OrderHistoryFilterType, DynamicFilterValueTypes>>();

  const handleApply = (
    filterValue: Record<OrderHistoryFilterType, DynamicFilterValueTypes>,
  ) => {
    const newFilterValue = {
      ...isEmptyFilterInput(
        "purchasing_company_location_id",
        filterValue.purchasing_company_location_id as string,
      ),
      ...isEmptyFilterInput("name", filterValue.name as string),
      ...isEmptyFilterInput("po_number", filterValue.po_number as string),
      ...isEmptyFilterInput("sku", filterValue.sku as string),
      ...isEmptyFilterInput("status", filterValue.status as string),
    };
    setFilters(newFilterValue);
  };

  const handleClear = () => {
    setFilters({});
  };

  const handleRemoveFilter = (tag: FilterTag<OrderHistoryFilterType>) => {
    const newFilters = { ...filters };
    delete newFilters[tag.type];
    setFilters(newFilters);
  };

  useEffect(() => {
    handleSearch();
  }, [filters, sortField, sortOrder, customerInformation]);

  const [showSort, setShowSort] = useState(false);

  return (
    <div className={cn("flex flex-col gap-5", props.className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("order-history.list.title")}</h1>
      </div>
      <div className="flex flex-col space-y-4">
        <DynamicFilterBuilderHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          totalItems={totalItems}
          setShowMobileFilter={setShowMobileFilter}
          title={t("order-history.list.total-orders")}
          hideFilterTextWhileMobile={true}
        >
          <OrderHistorySort
            showSort={showSort}
            setShowSort={setShowSort}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={onSortFieldChange}
            onSortOrderChange={onSortOrderChange}
          />
        </DynamicFilterBuilderHeader>

        {showFilters && (
          <DesktopDynamicFilterV2
            onSearch={handleApply}
            onClearAllFilters={handleClear}
            onRemoveFilter={handleRemoveFilter}
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
          />
        )}
        {showMobileFilter && (
          <MobileDynamicFilterV2
            isOpen={showMobileFilter}
            onClose={() => setShowMobileFilter(false)}
            onMobileApply={handleApply}
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
          />
        )}
      </div>
    </div>
  );
}
