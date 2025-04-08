import { DynamicFilterBuilderHeader } from "./DynamicFilterBuilderHeader";
import { DesktopDynamicFilter, MobileDynamicFilter } from "./DynamicFilter";
import type { FilterTag, FilterConfig } from "~/types/filter";

interface TableFilterHeaderProps<T extends string> {
  title: string;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showMobileFilter: boolean;
  setShowMobileFilter: (show: boolean) => void;
  filterTags: FilterTag<T>[];
  onSearch: (
    filterType: T,
    localFilterValue: Record<T, string>,
    localDateValues: Record<string, Date | undefined>,
    localSelectValue: Record<T, string[]>,
  ) => void;
  onClearAllFilters: () => void;
  tempFilterValue: Record<T, string>;
  setTempFilterValue: (value: React.SetStateAction<Record<T, string>>) => void;
  tempDateValues: Record<string, Date | undefined>;
  setTempDateValues: (
    value: React.SetStateAction<Record<string, Date | undefined>>,
  ) => void;
  tempSelectValue: Record<T, string[]>;
  setTempSelectValue: (
    value: React.SetStateAction<Record<T, string[]>>,
  ) => void;
  onRemoveFilter: (tag: FilterTag<T>) => void;
  setFilterTags: (tags: FilterTag<T>[]) => void;
  sortComponent: React.ReactNode;
  showTotalItems?: boolean;
  totalItems?: number;
  filterConfig: Record<T, FilterConfig>;
  onMobileSearch: (
    filterTags: FilterTag<T>[],
    filterValue: Record<T, string>,
    localDateValues: Record<string, Date | undefined>,
    localSelectValue: Record<T, string[]>,
  ) => void;
}

export function TableFilterHeader<T extends string>({
  title,
  showFilters,
  setShowFilters,
  showMobileFilter,
  setShowMobileFilter,
  filterTags,
  onSearch,
  onClearAllFilters,
  tempFilterValue,
  setTempFilterValue,
  tempDateValues,
  setTempDateValues,
  tempSelectValue,
  setTempSelectValue,
  onRemoveFilter,
  setFilterTags,
  sortComponent,
  showTotalItems = false,
  totalItems = 0,
  filterConfig,
  onMobileSearch,
}: TableFilterHeaderProps<T>) {
  const handleCloseMobileFilter = () => {
    setShowMobileFilter(false);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">{title}</h1>

      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <DynamicFilterBuilderHeader
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            totalItems={totalItems}
            showTotalItems={showTotalItems}
            title=""
            setShowMobileFilter={setShowMobileFilter}
            hideFilterTextWhileMobile
          >
            {sortComponent}
          </DynamicFilterBuilderHeader>
        </div>

        {/* Desktop Filter */}
        {showFilters && (
          <DesktopDynamicFilter
            filterTags={filterTags}
            onSearch={onSearch}
            onClearAllFilters={onClearAllFilters}
            tempFilterValue={tempFilterValue}
            setTempFilterValue={setTempFilterValue}
            tempDateValues={tempDateValues}
            setTempDateValues={setTempDateValues}
            tempSelectValue={tempSelectValue}
            setTempSelectValue={setTempSelectValue}
            onRemoveFilter={onRemoveFilter}
            filterConfig={filterConfig}
          />
        )}

        {/* Mobile Filter */}
        <MobileDynamicFilter
          filterTags={filterTags}
          onSearch={onSearch}
          onClearAllFilters={onClearAllFilters}
          tempFilterValue={tempFilterValue}
          setTempFilterValue={setTempFilterValue}
          tempDateValues={tempDateValues}
          setTempDateValues={setTempDateValues}
          tempSelectValue={tempSelectValue}
          setTempSelectValue={setTempSelectValue}
          onRemoveFilter={onRemoveFilter}
          isOpen={showMobileFilter}
          onClose={handleCloseMobileFilter}
          setFilterTags={setFilterTags}
          filterConfig={filterConfig}
          onMobileSearch={onMobileSearch}
        />
      </div>
    </>
  );
}
