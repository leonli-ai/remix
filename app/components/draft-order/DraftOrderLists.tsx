import { useSearchParams } from "@remix-run/react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { TableFilterHeader } from "~/components/common/TableFilterHeader";
import DraftOrderSort, {
  type SortField,
  type SortOrder,
  sortConfig,
} from "~/components/draft-order/DraftOrderSort";
import DraftOrderTable from "~/components/draft-order/DraftOrderTable";
import { Button } from "~/components/ui/button";
import { draftOrderFilterConfig } from "~/config/filterConfig";
import { useDraftOrder, useFetchShopSettings } from "~/hooks/use-draft-order";
import { useShopifyInformation } from "~/lib/shopify";
import { buildQueryString } from "~/lib/utils";
import type { FilterTag, FilterType } from "~/types/filter";
import { useTranslation } from "react-i18next";
import { TZDate } from "@date-fns/tz";

export default function DraftOrdersLists() {
  const { t } = useTranslation();
  const filterConfig = draftOrderFilterConfig();

  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const { storeName, shopifyCompanyId, companyLocationId } =
    useShopifyInformation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tempFilterValue, setTempFilterValue] = useState<
    Record<FilterType, string>
  >(() => {
    const initialValues: Record<FilterType, string> = {} as Record<
      FilterType,
      string
    >;
    Object.entries(filterConfig).forEach(([key, config]) => {
      if (config.type === "input") {
        initialValues[key as FilterType] = "";
      }
    });
    return initialValues;
  });
  const [tempDateValues, setTempDateValues] = useState<
    Record<string, Date | undefined>
  >({
    created_at: undefined,
    updated_at: undefined,
  });
  const [tempSelectValue, setTempSelectValue] = useState<
    Record<FilterType, string[]>
  >(() => {
    const initialValues: Record<FilterType, string[]> = {} as Record<
      FilterType,
      string[]
    >;
    Object.entries(filterConfig).forEach(([key, config]) => {
      if (config.type === "select") {
        initialValues[key as FilterType] = [];
      }
    });
    return initialValues;
  });
  const [showSort, setShowSort] = useState(false);

  // Get sort params from URL on initial load
  const urlSortField =
    (searchParams.get("sortField") as SortField) || "updatedAt";
  const urlSortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";

  // Initialize sort state from URL
  const [sortField, setSortField] = useState<SortField>(urlSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(urlSortOrder);

  const [filterTags, setFilterTags] = useState<FilterTag<FilterType>[]>([]);

  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);

  const afterCursor = searchParams.get("after") || undefined;
  const searchQuery = searchParams.get("q") || "";

  const { data: shopSettings } = useFetchShopSettings({
    storeName,
  });

  const timezone = shopSettings?.shop?.ianaTimezone || "America/New_York";

  const query = [
    searchQuery,
    `company_location_id:${companyLocationId}`,
    "NOT status:COMPLETED",
  ]
    .filter(Boolean)
    .join(" AND ");

  const { data, isLoading } = useDraftOrder({
    storeName,
    customerId: shopifyCompanyId,
    pagination: {
      first: 10,
      reverse: sortOrder === "desc",
      after: afterCursor,
      query,
      sortKey: sortConfig[sortField].field.toUpperCase(),
    },
  });

  const handleSearch = (
    filterType: FilterType,
    filterValue: Record<FilterType, string>,
    localDateValues: Record<string, Date | undefined>,
    localSelectValue: Record<FilterType, string[]>,
  ) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      const config = filterConfig[filterType];

      let searchValue = "";
      let filterLabel = "";

      if (config.type === "date" && localDateValues[filterType]) {
        searchValue = format(localDateValues[filterType]!, "yyyy-MM-dd");
        // searchValue = format(
        //   new TZDate(new Date(localDateValues[filterType]!), timezone),
        //   "yyyy-MM-dd",
        // );
        filterLabel = `${searchValue}`;
      } else if (config.type === "select") {
        searchValue =
          localSelectValue[filterType]?.[0] || localSelectValue[filterType];
        filterLabel =
          config.options?.find((opt) => opt.value === searchValue)?.label ||
          searchValue;
      } else {
        searchValue = filterValue[filterType] || "";
        filterLabel = filterValue[filterType] || "";
      }

      if (searchValue) {
        setFilterTags((prev) => {
          return [
            ...prev.filter((tag) => tag.type !== filterType),
            {
              type: filterType,
              value: searchValue,
              label: filterLabel,
            },
          ];
        });

        newParams.set(`value_${filterType}`, searchValue);
      } else {
        newParams.delete(`value_${filterType}`);
      }

      const queryParams: { [key: string]: string } = {};
      Array.from(newParams.entries()).forEach(([key, value]) => {
        if (key.startsWith("value_")) {
          const filterKey = key.replace("value_", "");
          queryParams[filterKey] = value;
        }
      });

      const queryString = buildQueryString(filterConfig, queryParams);
      if (queryString) {
        newParams.set("q", queryString);
      } else {
        newParams.delete("q");
      }

      newParams.delete("after");
      return newParams;
    });
  };

  const handleMobileSearch = (
    filterTags: FilterTag<FilterType>[],
    filterValue: Record<FilterType, string>,
    localDateValues: Record<string, Date | undefined>,
    localSelectValue: Record<FilterType, string[]>,
  ) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams("");
      filterTags.forEach((tag) => {
        const filterType = tag.type;
        const config = filterConfig[filterType];

        let searchValue = "";
        let filterLabel = "";

        if (config.type === "date" && localDateValues[filterType]) {
          searchValue = format(localDateValues[filterType]!, "yyyy-MM-dd");
          filterLabel = `${searchValue}`;
        } else if (config.type === "select") {
          searchValue =
            localSelectValue[filterType]?.[0] || localSelectValue[filterType];
          filterLabel =
            config.options?.find((opt) => opt.value === searchValue)?.label ||
            searchValue;
        } else {
          searchValue = filterValue[filterType] || "";
          filterLabel = filterValue[filterType] || "";
        }

        if (searchValue) {
          setFilterTags((prev) => {
            return [
              ...prev.filter((tag) => tag.type !== filterType),
              {
                type: filterType,
                value: searchValue,
                label: filterLabel,
              },
            ];
          });

          newParams.set(`value_${filterType}`, searchValue);
        } else {
          newParams.delete(`value_${filterType}`);
        }

        const queryParams: { [key: string]: string } = {};
        Array.from(newParams.entries()).forEach(([key, value]) => {
          if (key.startsWith("value_")) {
            const filterKey = key.replace("value_", "");
            queryParams[filterKey] = value;
          }
        });

        const queryString = buildQueryString(filterConfig, queryParams);
        if (queryString) {
          newParams.set("q", queryString);
        } else {
          newParams.delete("q");
        }

        newParams.delete("after");
      });
      return newParams;
    });
  };

  const handleNextPage = () => {
    const lastId = data?.draftOrders[data?.draftOrders.length - 1].cursor;

    // Update page history
    const newHistory = pageHistory.slice(0, currentPageIndex + 1);
    newHistory.push(lastId);
    setPageHistory(newHistory);
    setCurrentPageIndex(currentPageIndex + 1);

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("after", lastId);
      return newParams;
    });
  };

  const handlePreviousPage = () => {
    if (currentPageIndex <= 0) {
      // If on first page, remove after parameter
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("after");
        return newParams;
      });
      setCurrentPageIndex(-1);
      setPageHistory([]);
    } else {
      // Get cursor for previous page
      const previousCursor = pageHistory[currentPageIndex - 1];
      setCurrentPageIndex(currentPageIndex - 1);

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("after", previousCursor);
        return newParams;
      });
    }
  };

  const handleSort = (field: SortField) => {
    setSortField(field);
    setShowSort(false);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("sortField", field);
      newParams.set("sortOrder", sortOrder);
      // Reset pagination when sorting changes
      newParams.delete("after");
      return newParams;
    });
  };

  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("sortOrder", order);
      // Reset pagination when sorting changes
      newParams.delete("after");
      return newParams;
    });
  };

  // Effect to update sort state when URL params change
  useEffect(() => {
    const newSortField = searchParams.get("sortField") as SortField;
    const newSortOrder = searchParams.get("sortOrder") as SortOrder;

    if (newSortField && newSortField !== sortField) {
      setSortField(newSortField);
    }
    if (newSortOrder && newSortOrder !== sortOrder) {
      setSortOrder(newSortOrder);
    }
  }, [searchParams]);

  // Effect to ensure sort params are in URL
  useEffect(() => {
    if (!searchParams.has("sortField") || !searchParams.has("sortOrder")) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (!newParams.has("sortField")) {
            newParams.set("sortField", "updatedAt");
          }
          if (!newParams.has("sortOrder")) {
            newParams.set("sortOrder", "desc");
          }
          return newParams;
        },
        {
          replace: true, // Use replace to avoid adding to browser history
        },
      );
    }
  }, []);

  const removeFilter = (tagToRemove: FilterTag<FilterType>) => {
    if (
      tagToRemove.type === "updated_at" ||
      tagToRemove.type === "created_at"
    ) {
      setTempDateValues((prev) => ({
        ...prev,
        [tagToRemove.type]: undefined,
      }));
    } else if (filterConfig[tagToRemove.type].type === "select") {
      setTempSelectValue((prev) => ({
        ...prev,
        [tagToRemove.type]: [],
      }));
    } else {
      setTempFilterValue((prev) => ({
        ...prev,
        [tagToRemove.type]: "",
      }));
    }

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(`value_${tagToRemove.type}`);

      const queryParams: { [key: string]: string } = {};
      Array.from(newParams.entries()).forEach(([key, value]) => {
        if (key.startsWith("value_")) {
          const filterKey = key.replace("value_", "");
          queryParams[filterKey] = value;
        }
      });

      const queryString = buildQueryString(filterConfig, queryParams);
      if (queryString) {
        newParams.set("q", queryString);
      } else {
        newParams.delete("q");
      }

      return newParams;
    });

    setFilterTags((prev) => {
      return prev.filter(
        (tag) =>
          !(tag.type === tagToRemove.type && tag.value === tagToRemove.value),
      );
    });
  };

  const clearAllFilters = () => {
    setTempFilterValue((prev) => {
      const newValues = { ...prev };
      Object.keys(newValues).forEach((key) => {
        newValues[key as FilterType] = "";
      });
      return newValues;
    });
    setTempDateValues({
      created_at: undefined,
      updated_at: undefined,
    });
    setTempSelectValue((prev) => {
      const newValues = { ...prev };
      Object.keys(newValues).forEach((key) => {
        newValues[key as FilterType] = [];
      });
      return newValues;
    });

    setFilterTags([]);

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Array.from(newParams.keys()).forEach((key) => {
        if (key.startsWith("value_")) {
          newParams.delete(key);
        }
      });
      newParams.delete("q");
      return newParams;
    });
  };

  useEffect(() => {
    if (data && afterCursor && data.draftOrders.length === 0) {
      handlePreviousPage();
    }
  }, [data, afterCursor]);

  // Add this effect after other useEffect declarations
  useEffect(() => {
    // Rebuild filter tags from URL parameters
    const newFilterTags: FilterTag<FilterType>[] = [];
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key.startsWith("value_")) {
        const filterType = key.replace("value_", "") as FilterType;
        const config = filterConfig[filterType];

        if (config) {
          let label = value;

          // Get appropriate label based on filter type
          if (config.type === "select") {
            label =
              config.options?.find((opt) => opt.value === value)?.label ||
              value;
            if (filterType === "status") {
              setTempSelectValue((prev) => ({
                ...prev,
                [filterType]: [value],
              }));
            }
          } else if (config.type === "date") {
            // Parse the date string and set tempDate
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) {
              setTempDateValues((prev) => ({
                ...prev,
                [filterType]: dateValue,
              }));
            }
            label = value;
          } else {
            // For input type filters
            setTempFilterValue((prev) => ({
              ...prev,
              [filterType]: value,
            }));
          }

          newFilterTags.push({
            type: filterType,
            value: value,
            label: label,
          });
        }
      }
    });
    setFilterTags(() => {
      return newFilterTags;
    });
  }, [searchParams]); // This will run whenever URL parameters change

  // Initialize page history
  useEffect(() => {
    if (afterCursor) {
      // If URL has afterCursor but page history is empty, initialize history
      if (pageHistory.length === 0) {
        setPageHistory([afterCursor]);
        setCurrentPageIndex(0);
      }
    } else {
      // If no afterCursor, reset page history
      setPageHistory([]);
      setCurrentPageIndex(-1);
    }
  }, [afterCursor]);

  // Reset pagination state when sort or filter changes
  useEffect(() => {
    if (!afterCursor) {
      setPageHistory([]);
      setCurrentPageIndex(-1);
    }
  }, [
    searchParams.get("sortField"),
    searchParams.get("sortOrder"),
    searchParams.get("q"),
  ]);

  return (
    <div className="container mx-auto">
      <TableFilterHeader<FilterType>
        title={t("draft-order.list.title")}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        showMobileFilter={showMobileFilter}
        setShowMobileFilter={setShowMobileFilter}
        filterTags={filterTags}
        onSearch={handleSearch}
        onMobileSearch={handleMobileSearch}
        onClearAllFilters={clearAllFilters}
        tempFilterValue={tempFilterValue}
        setTempFilterValue={setTempFilterValue}
        tempDateValues={tempDateValues}
        setTempDateValues={setTempDateValues}
        tempSelectValue={tempSelectValue}
        setTempSelectValue={setTempSelectValue}
        onRemoveFilter={removeFilter}
        setFilterTags={setFilterTags}
        filterConfig={filterConfig}
        sortComponent={
          <DraftOrderSort
            showSort={showSort}
            setShowSort={setShowSort}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={handleSort}
            onSortOrderChange={handleSortOrderChange}
          />
        }
      />

      <div className="space-y-5">
        <DraftOrderTable
          draftOrders={data?.draftOrders || []}
          isLoading={isLoading}
          timezone={timezone}
        />

        {(data?.pagination?.hasNextPage || currentPageIndex > -1) && (
          <div className="flex items-center justify-end gap-2 p-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePreviousPage}
              disabled={currentPageIndex <= -1}
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
    </div>
  );
}
