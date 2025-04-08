import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import { isEmptyFilterInput } from "~/lib/filter";
import { cn } from "~/lib/utils";
import { DynamicFilterValueTypes, FilterTag } from "~/types/filter";
import { type FilterValues } from "../common/DynamicFilterBuilder";
import { DynamicFilterBuilderHeader } from "../common/DynamicFilterBuilderHeader";
import {
  DesktopDynamicFilterV2,
  MobileDynamicFilterV2,
} from "../common/DynamicFilterV2";
import { CreateShoppingListDialog } from "./CreateShoppingListDialog";
import {
  shoppingListFilterConfig,
  ShoppingListFilterType,
} from "~/config/filterConfig";
import CreateNewList from "../icons/CreateNewList";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onSearch: (values: FilterValues) => void;
  onClear: () => void;
  onDelete: () => void;
  refetch: () => void;
  totalItems?: number;
}

export default function ShoppingListsHeader(props: Props) {
  const { t } = useTranslation();
  const { onSearch, onClear, totalItems = 0 } = props;

  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const queryClient = useQueryClient();

  const handleCreateShoppingList = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_ALL_SHOPPING_LISTS],
    });
  };

  const handleApplyV2 = (
    filterValue: Record<ShoppingListFilterType, DynamicFilterValueTypes>,
  ) => {
    if (onSearch) {
      const isDefaultParams = (value: string) => {
        if (value === "Yes") return { isDefault: true };
        if (value === "No") return { isDefault: false };
        return {};
      };

      const filters = {
        ...isEmptyFilterInput("name", filterValue.name as string),
        ...isDefaultParams(filterValue.isDefault as string),
      };
      onSearch(filters);
    }
  };

  const handleRemoveFilterV2 = (
    tagToRemove: FilterTag<ShoppingListFilterType>,
    filterValue: Record<ShoppingListFilterType, DynamicFilterValueTypes>,
  ) => {
    if (onSearch) {
      const isDefaultParams = (value: string) => {
        if (value === "Yes") return { isDefault: true };
        if (value === "No") return { isDefault: false };
        return {};
      };

      const filters = {
        ...isEmptyFilterInput("name", filterValue.name as string),
        ...isDefaultParams(filterValue.isDefault as string),
      };
      onSearch(filters);
    }
  };

  const handleClearV2 = (
    filterValue?: Record<ShoppingListFilterType, DynamicFilterValueTypes>,
  ) => {
    if (onClear) {
      onClear();
    }
  };

  const filterConfig = shoppingListFilterConfig();

  const [filterValue, setFilterValue] = useState<
    Record<ShoppingListFilterType, DynamicFilterValueTypes>
  >({
    name: "",
    isDefault: "",
  });

  return (
    <div className={cn("flex flex-col gap-4 mb-5", props.className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("shopping-list.list.title")}</h1>
        <div className="flex items-center gap-2">
          <CreateShoppingListDialog
            onSuccess={handleCreateShoppingList}
            trigger={
              <Button
                variant={"link"}
                className="text-primary-main hover:text-primary-main gap-0 font-bold px-0"
              >
                <CreateNewList className="!size-8" />
                {t("shopping-list.list.create-new-list")}
              </Button>
            }
            type="create"
          />
        </div>
      </div>
      <div className="flex flex-col lg:gap-y-5">
        <DynamicFilterBuilderHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          totalItems={totalItems}
          setShowMobileFilter={setShowMobileFilter}
          title={t("shopping-list.list.total")}
          hideFilterTextWhileMobile
        />

        {showFilters && (
          <DesktopDynamicFilterV2
            onSearch={handleApplyV2}
            onClearAllFilters={handleClearV2}
            onRemoveFilter={handleRemoveFilterV2}
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
          />
        )}

        {showMobileFilter && (
          <MobileDynamicFilterV2
            onMobileApply={handleApplyV2}
            onMobileClearAllFilters={handleClearV2}
            onMobileRemoveFilter={handleRemoveFilterV2}
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            isOpen={showMobileFilter}
            onClose={() => setShowMobileFilter(false)}
          />
        )}
      </div>
    </div>
  );
}
