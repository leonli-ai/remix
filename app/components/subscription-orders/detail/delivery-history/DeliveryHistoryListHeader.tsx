import { format } from "date-fns";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilterValues } from "~/components/common/DynamicFilterBuilder";
import { DynamicFilterBuilderHeader } from "~/components/common/DynamicFilterBuilderHeader";
import {
  DesktopDynamicFilterV2,
  MobileDynamicFilterV2,
} from "~/components/common/DynamicFilterV2";
import {
  deliveryHistoryFilterConfig,
  DeliveryHistoryFilterType,
} from "~/config/filterConfig";
import { isEmptyFilterInput } from "~/lib/filter";
import { cn } from "~/lib/utils";
import { DynamicFilterValueTypes, FilterTag } from "~/types/filter";

interface DeliveryHistoryListHeaderProps {
  onSearch: (filters: FilterValues) => void;
  totalItems: number;
  className?: string;
}

export default function DeliveryHistoryListHeader({
  onSearch,
  totalItems,
  className,
}: DeliveryHistoryListHeaderProps) {
  const { t } = useTranslation();

  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({});

  const functionFilterConfig = deliveryHistoryFilterConfig();

  const [filterValue, setFilterValue] =
    useState<Record<DeliveryHistoryFilterType, DynamicFilterValueTypes>>();

  const handleApply = (
    filterValue: Record<DeliveryHistoryFilterType, DynamicFilterValueTypes>,
  ) => {
    const newFilterValue = {
      ...isEmptyFilterInput("name", filterValue.name as string),
      ...isEmptyFilterInput("deliveryDate", filterValue.deliveryDate as string),
    };
    if (newFilterValue?.deliveryDate) {
      const newDate = format(
        new Date(newFilterValue.deliveryDate),
        "yyyy-MM-dd",
      );
      newFilterValue.deliveryDate = newDate;
    }

    setFilters(newFilterValue);
  };

  const handleRemoveFilter = (tag: FilterTag<DeliveryHistoryFilterType>) => {
    const newFilters = { ...filters };
    delete newFilters[tag.type];
    setFilters(newFilters);
  };

  const handleClear = () => {
    setFilters({});
  };

  useEffect(() => {
    onSearch(filters);
  }, [filters]);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          {t("subscription-orders.delivery-history.list.title")}
        </h1>
      </div>
      <div className="flex flex-col space-y-4">
        <DynamicFilterBuilderHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          totalItems={totalItems}
          setShowMobileFilter={setShowMobileFilter}
          title={t(
            "subscription-orders.delivery-history.list.total-deliveries",
          )}
          hideFilterTextWhileMobile={true}
        ></DynamicFilterBuilderHeader>

        {showFilters && (
          <DesktopDynamicFilterV2
            onSearch={handleApply}
            onClearAllFilters={handleClear}
            onRemoveFilter={handleRemoveFilter}
            filterConfig={functionFilterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
          />
        )}
        {showMobileFilter && (
          <MobileDynamicFilterV2
            isOpen={showMobileFilter}
            onClose={() => setShowMobileFilter(false)}
            onMobileApply={handleApply}
            filterConfig={functionFilterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
          />
        )}
      </div>
    </div>
  );
}
