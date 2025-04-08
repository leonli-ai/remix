import { useNavigate } from "@remix-run/react";
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
import RequestQuoteNew from "~/components/icons/RequestQuoteNew";
import { Button } from "~/components/ui/button";
import {
  subscriptionOrdersFilterConfig,
  SubscriptionOrdersFilterType,
} from "~/config/filterConfig";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import { isEmptyFilterInput } from "~/lib/filter";
import { cn } from "~/lib/utils";
import { DynamicFilterValueTypes, FilterTag } from "~/types/filter";

interface SubscriptionOrdersListHeaderProps {
  onSearch: (filters: FilterValues) => void;
  totalItems: number;
  className?: string;
}

export default function SubscriptionOrdersListHeader({
  onSearch,
  totalItems,
  className,
}: SubscriptionOrdersListHeaderProps) {
  const { t } = useTranslation();

  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({});

  const functionFilterConfig = subscriptionOrdersFilterConfig();

  const [filterValue, setFilterValue] =
    useState<Record<SubscriptionOrdersFilterType, DynamicFilterValueTypes>>();

  const handleApply = (
    filterValue: Record<SubscriptionOrdersFilterType, DynamicFilterValueTypes>,
  ) => {
    const newFilterValue = {
      ...isEmptyFilterInput("orderNumber", filterValue.orderNumber as string),
      ...isEmptyFilterInput("name", filterValue.name as string),
      ...isEmptyFilterInput("status", filterValue.status as string),
      ...isEmptyFilterInput(
        "nextOrderCreationDateFrom",
        filterValue.nextOrderCreationDateFrom as string,
      ),
      ...isEmptyFilterInput(
        "approvedByName",
        filterValue.approvedByName as string,
      ),
    };
    if (newFilterValue?.nextOrderCreationDateFrom) {
      const newDate = format(
        new Date(newFilterValue.nextOrderCreationDateFrom),
        "yyyy-MM-dd",
      );
      newFilterValue.nextOrderCreationDateFrom = newDate;
    }

    if (newFilterValue?.orderNumber) {
      const newOrderNumber = _.toNumber(newFilterValue.orderNumber);
      newFilterValue.orderNumber = newOrderNumber;
    }

    if (newFilterValue?.status) {
      const arrayStatus = [newFilterValue.status];
      newFilterValue.status = arrayStatus;
    }
    setFilters(newFilterValue);
  };

  const handleRemoveFilter = (tag: FilterTag<SubscriptionOrdersFilterType>) => {
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

  const navigate = useNavigate();
  const { addLocalePath } = useAddLocalePath();
  const handleShowCreateForm = () => {
    navigate(
      addLocalePath(
        "/apps/customer-account/subscription-orders/create-subscription",
      ),
    );
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          {t("subscription-orders.list.title")}
        </h1>
        <Button
          variant={"link"}
          size="sm"
          className="text-primary-main hover:text-primary-main gap-1 font-bold px-0 truncate"
          onClick={handleShowCreateForm}
        >
          <RequestQuoteNew className="!w-6 !h-6" />
          <div className="truncate">
            {t("subscription-orders.list.new-request")}
          </div>
        </Button>
      </div>
      <div className="flex flex-col space-y-4">
        <DynamicFilterBuilderHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          totalItems={totalItems}
          setShowMobileFilter={setShowMobileFilter}
          title={t("subscription-orders.list.total-orders")}
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
