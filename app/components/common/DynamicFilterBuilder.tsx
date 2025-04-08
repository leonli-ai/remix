import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FilterInput } from "./FilterInput";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "~/lib/utils";
export interface DatePickerConfig {
  disabled?: boolean;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[];
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  popoverAlign?: "start" | "center" | "end";
}

export interface DateRangePickerConfig extends DatePickerConfig {
  numberOfMonths?: number;
  fixedWeeks?: boolean;
  showWeekNumber?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface FilterOption {
  id: string;
  placeholder: string;
  type: "text" | "number" | "select" | "date" | "daterange";
  options?: {
    disabled?: boolean;
    label: string;
    value: string;
    tagValue?: string;
  }[];
  width?: string;
  disabled?: boolean;
  dateConfig?: DatePickerConfig;
  dateRangeConfig?: DateRangePickerConfig;
  inputConfig?: React.ComponentProps<"input">;
  selectConfig?: React.ComponentProps<"select">;
}

export type FilterValue =
  | string
  | Date
  | DateRange
  | null
  | boolean
  | undefined;

export interface FilterValues {
  [key: string]: FilterValue;
}

export interface DefaultFilterValues {
  [key: string]: {
    value: FilterValue;
    tagValue?: string;
  };
}

interface DynamicFilterBuilderProps {
  filters: FilterOption[];
  onFiltersChange: (filters: FilterValues) => void;
  defaultFilterValues?: DefaultFilterValues;
}

interface FilterTag {
  field: string;
  value: string | Date | DateRange | null;
  label: string;
}

const formatDateRangeLabel = (range: DateRange) => {
  if (!range.from) return "";
  if (!range.to) return `From ${format(range.from, "yyyy-MM-dd")}`;
  return `${format(range.from, "yyyy-MM-dd")} to ${format(range.to, "yyyy-MM-dd")}`;
};

const formatFilterLabel = (
  filter: FilterOption,
  value: FilterValue,
  tagValue?: string,
): string => {
  let labelValue = value;
  if (filter.type === "daterange" && value) {
    labelValue = formatDateRangeLabel(value as DateRange);
  } else if (filter.type === "date" && value) {
    labelValue = format(value as Date, "yyyy-MM-dd");
  } else {
    const selectedOption = filter.options?.find((opt) => opt.value === value);
    labelValue = tagValue || selectedOption?.tagValue || value;
  }

  return `${filter.placeholder}: ${labelValue}`;
};

export function DynamicFilterBuilder({
  filters,
  onFiltersChange,
  defaultFilterValues,
}: DynamicFilterBuilderProps) {
  const [selectedField, setSelectedField] = useState<string>(
    filters.length > 0 ? filters[0].id : "",
  );
  const [filterTags, setFilterTags] = useState<FilterTag[]>([]);

  useEffect(() => {
    if (!defaultFilterValues) return;

    const tags = Object.entries(defaultFilterValues)
      .filter(([_, value]) => value.value !== null && value.value !== undefined)
      .map(([field, filterValue]) => {
        const filter = filters.find((f) => f.id === field);
        if (!filter) return null;

        return {
          field,
          value: filterValue.value,
          label: formatFilterLabel(
            filter,
            filterValue.value,
            filterValue.tagValue,
          ),
        };
      })
      .filter((tag): tag is FilterTag => tag !== null);

    setFilterTags(tags);
  }, [defaultFilterValues]);

  const [currentValue, setCurrentValue] = useState<any>(
    defaultFilterValues?.[selectedField]?.value || null,
  );

  useEffect(() => {
    if (filters.length > 0 && !selectedField) {
      setSelectedField(filters[0].id);
    }
  }, [filters]);

  const handleAddFilter = () => {
    if (!selectedField || !currentValue) return;

    const selectedFilter = filters.find((f) => f.id === selectedField);
    if (!selectedFilter) return;

    const newTag: FilterTag = {
      field: selectedField,
      value: currentValue,
      label: formatFilterLabel(selectedFilter, currentValue),
    };

    // Check if filter with same field exists
    const existingTagIndex = filterTags.findIndex(
      (tag) => tag.field === selectedField,
    );

    let newFilterTags: FilterTag[];
    if (existingTagIndex !== -1) {
      newFilterTags = filterTags.map((tag, index) =>
        index === existingTagIndex ? newTag : tag,
      );
    } else {
      newFilterTags = [...filterTags, newTag];
    }

    setFilterTags(newFilterTags);
    // setCurrentValue(null);

    // Update filter values
    const newFilters = newFilterTags.reduce(
      (acc, tag) => ({
        ...acc,
        [tag.field]: tag.value,
      }),
      {},
    );
    onFiltersChange(newFilters);
  };

  const removeTag = (index: number) => {
    const newTags = filterTags.filter((_, i) => i !== index);
    const newFilters = newTags.reduce(
      (acc, tag) => ({
        ...acc,
        [tag.field]: tag.value,
      }),
      {},
    );
    onFiltersChange(newFilters);
    setFilterTags(newTags);
  };

  const clearAllFilters = () => {
    setFilterTags([]);
    setCurrentValue(null);
    setSelectedField(filters.length > 0 ? filters[0].id : "");
    onFiltersChange({});
  };

  const handleFieldChange = (newField: string) => {
    setSelectedField(newField);
    setCurrentValue(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <div
          className={cn(
            "flex gap-2",
            filters.length === 1 ? "w-auto" : "w-3/4",
          )}
        >
          <div className={"w-auto"}>
            {filters.length === 1 ? (
              <div className="h-full flex items-center">{`${filters[0].placeholder}:`}</div>
            ) : (
              <Select
                value={selectedField}
                onValueChange={handleFieldChange}
                defaultValue={filters.length > 0 ? filters[0].id : undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {filters.map((filter) => (
                    <SelectItem key={filter.id} value={filter.id}>
                      {filter.placeholder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex-1 app-hidden lg:block">
            {selectedField && (
              <FilterInput
                filter={filters.find((f) => f.id === selectedField)!}
                value={currentValue}
                onChange={setCurrentValue}
              />
            )}
          </div>
        </div>
        <div className=" flex justify-end gap-2">
          <Button
            className="bg-main-color hover:bg-main-color/80"
            onClick={handleAddFilter}
            disabled={!selectedField || !currentValue}
          >
            Search
          </Button>
          {filterTags.length > 0 && (
            <Button
              size="icon"
              onClick={clearAllFilters}
              title="Clear all filters"
              className="bg-gray-200 hover:bg-gray-300"
            >
              <Trash2 className="h-4 w-4 text-black" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 lg:hidden block">
        {selectedField && (
          <FilterInput
            filter={filters.find((f) => f.id === selectedField)!}
            value={currentValue}
            onChange={setCurrentValue}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="break-all">
            {tag.label}
            <X
              className="ml-2 h-3 w-3 cursor-pointer"
              onClick={() => removeTag(index)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
