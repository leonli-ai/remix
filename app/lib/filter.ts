import { t } from "i18next";
import { FilterConfig, FilterTag } from "~/types/filter";

export const isEmptyFilterInput = (key: string, value: string) => {
  if (!value || value === "" || value === "All") return {};
  return { [key]: value };
};

// ... existing code ...

interface FilterState<T extends string> {
  tempSelectValue: Record<T, string[]>;
  tempFilterValue: Record<T, string>;
  totalFilterValue: Record<T, string>;
  filterTags: FilterTag<T>[];
}

interface FilterStateSetters<T extends string> {
  setTempSelectValue: (
    value: React.SetStateAction<Record<T, string[]>>,
  ) => void;
  setTempFilterValue: (value: React.SetStateAction<Record<T, string>>) => void;
  setTotalFilterValue: (value: React.SetStateAction<Record<T, string>>) => void;
  setFilterTags: (value: React.SetStateAction<FilterTag<T>[]>) => void;
}

export const removeFilter = <T extends string>(
  tagToRemove: FilterTag<T>,
  filterConfig: Record<T, { type: string }>,
  filterState: FilterState<T>,
  stateSetters: FilterStateSetters<T>,
) => {
  const config = filterConfig[tagToRemove.type];
  const {
    setTempSelectValue,
    setTempFilterValue,
    setTotalFilterValue,
    setFilterTags,
  } = stateSetters;

  if (config.type === "select") {
    setTempSelectValue((prev) => {
      const newState = { ...prev };
      delete newState[tagToRemove.type];
      return newState;
    });
  } else {
    setTempFilterValue((prev) => {
      const newState = { ...prev };
      delete newState[tagToRemove.type];
      return newState;
    });
  }

  setTotalFilterValue((prev) => {
    const newState = { ...prev };
    delete newState[tagToRemove.type];
    return newState;
  });

  setFilterTags((prev) => prev.filter((tag) => tag.type !== tagToRemove.type));
};

export const initializeFilterValues = <
  FilterType extends string,
  T extends string | string[],
>(
  filterConfig: Record<string, { type: string }>,
  type: "input" | "select" | "date",
  defaultValue: T,
): Record<FilterType, T> => {
  const initialValues = {} as Record<FilterType, T>;
  Object.entries(filterConfig).forEach(([key, config]) => {
    if (config.type === type) {
      initialValues[key as FilterType] = defaultValue;
    }
  });
  return initialValues;
};

export const formatTagValue = <T extends string>(
  tag: FilterTag<T>,
  config: FilterConfig,
) => {
  // return `${config?.label}: ${config?.matchType} "${tag.label}"`;
  return `${config?.label}: ${t(`dynamic-filter-builder.header.match-type.${config?.matchType}`)} "${tag.label}"`;
};
