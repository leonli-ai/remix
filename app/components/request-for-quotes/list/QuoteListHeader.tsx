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
  requestForQuoteFilterConfig,
  RequestForQuoteFilterType,
} from "~/config/filterConfig";
import { isEmptyFilterInput } from "~/lib/filter";
import { cn } from "~/lib/utils";
import { DynamicFilterValueTypes, FilterTag } from "~/types/filter";

interface QuoteListHeaderProps {
  onSearch: (filters: FilterValues) => void;
  totalItems: number;
  className?: string;
  onShowCreateForm: (show: boolean) => void;
}

export default function QuoteListHeader({
  onSearch,
  totalItems,
  className,
  onShowCreateForm,
}: QuoteListHeaderProps) {
  const { t } = useTranslation();

  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({});

  const functionFilterConfig = requestForQuoteFilterConfig();

  const [filterValue, setFilterValue] =
    useState<Record<RequestForQuoteFilterType, DynamicFilterValueTypes>>();

  const handleApply = (
    filterValue: Record<RequestForQuoteFilterType, DynamicFilterValueTypes>,
  ) => {
    const newFilterValue = {
      ...isEmptyFilterInput("id", filterValue.id as string),
      ...isEmptyFilterInput("poNumber", filterValue.poNumber as string),
      ...isEmptyFilterInput("status", filterValue.status as string),
      ...isEmptyFilterInput("createdAt", filterValue.createdAt as string),
      ...isEmptyFilterInput(
        "expirationDate",
        filterValue.expirationDate as string,
      ),
      ...isEmptyFilterInput("customer", filterValue.customer as string),
    };
    if (newFilterValue?.createdAt) {
      const newDate = format(new Date(newFilterValue.createdAt), "yyyy-MM-dd");
      newFilterValue.createdAt = newDate;
    }
    if (newFilterValue?.expirationDate) {
      const newDate = format(
        new Date(newFilterValue.expirationDate),
        "yyyy-MM-dd",
      );
      newFilterValue.expirationDate = newDate;
    }
    if (newFilterValue?.id) {
      const newId = _.toNumber(newFilterValue.id);
      newFilterValue.id = newId;
    }
    setFilters(newFilterValue);
  };

  const handleRemoveFilter = (tag: FilterTag<RequestForQuoteFilterType>) => {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("request-for-quote.list.title")}
        </h1>
        <Button
          variant={"link"}
          size="sm"
          className="text-primary-main hover:text-primary-main gap-1 font-bold px-0"
          onClick={() => onShowCreateForm(true)}
        >
          <RequestQuoteNew className="!w-6 !h-6" />
          {t("request-for-quote.list.new-request")}
        </Button>
      </div>
      <div className="flex flex-col space-y-4">
        <DynamicFilterBuilderHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          totalItems={totalItems}
          setShowMobileFilter={setShowMobileFilter}
          title={t("request-for-quote.list.total-orders")}
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
