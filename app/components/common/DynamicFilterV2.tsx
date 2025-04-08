import { format } from "date-fns";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { formatTagValue } from "~/lib/filter";
import type {
  DynamicFilterValueTypes,
  FilterConfig,
  FilterTag,
} from "~/types/filter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import * as locales from "date-fns/locale";

interface FilterPopoverProps<T extends string> {
  type: T;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  placeholder: string;
  children: React.ReactNode;
}

function FilterPopover<T extends string>({
  type,
  open,
  onOpenChange,
  value,
  placeholder,
  children,
}: FilterPopoverProps<T>) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative inline-flex">
          <div className="flex items-center h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm cursor-pointer">
            <span className="whitespace-nowrap">{value || placeholder}</span>
            <ChevronDown
              className="ml-2 h-4 w-4 text-primary-tex"
              aria-hidden="true"
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[264px] p-0" align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}

type FilterValue<T extends string> = Record<T, DynamicFilterValueTypes>;

interface DynamicFilterProps<T extends string> {
  filterConfig: Record<T, FilterConfig>;

  isOpen?: boolean;
  onClose?: () => void;
  filterValue?: FilterValue<T>;
  setFilterValue?: (filterValue: FilterValue<T>) => void;
}

interface DesktopDynamicFilterProps<T extends string>
  extends DynamicFilterProps<T> {
  onSearch: (filterValue: FilterValue<T>) => void;
  onClearAllFilters: (filterValue?: FilterValue<T>) => void;
  onRemoveFilter: (tag: FilterTag<T>, filterValue: FilterValue<T>) => void;
}

export function DesktopDynamicFilterV2<T extends string>({
  onSearch,
  onClearAllFilters,
  onRemoveFilter,
  filterConfig,
  filterValue,
  setFilterValue,
}: Omit<DesktopDynamicFilterProps<T>, "isOpen" | "onClose">) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const localeObject = locales[locale as keyof typeof locales];
  const [innerFilterTags, setInnerFilterTags] = useState<FilterTag<T>[]>([]);

  const [innerFilterValue, setInnerFilterValue] = useState<FilterValue<T>>(
    filterValue || ({} as FilterValue<T>),
  );

  const [appliedFilterValue, setAppliedFilterValue] = useState<FilterValue<T>>(
    {} as FilterValue<T>,
  );
  useEffect(() => {
    const newInnerFilterValue = filterValue || ({} as FilterValue<T>);
    setInnerFilterValue(newInnerFilterValue);
    const newInnerFilterTags = Object.keys(newInnerFilterValue)
      .map((type) => {
        const config = filterConfig[type];
        let value = newInnerFilterValue[type];
        let label = value as string;
        if (!value) return null;
        if (config.type === "date") {
          value = format(value as Date, "yyyy-MM-dd");
          label = format(value as Date, "yyyy-MM-dd");
        }
        if (config.type === "select") {
          label =
            config.options?.find((option) => option.value === value)?.label ||
            (value as string);
        }
        return {
          type,
          value: value as string,
          label: label as string,
        };
      })
      .filter((tag) => tag !== null);
    setInnerFilterTags(newInnerFilterTags);
  }, [filterValue]);

  const [openPopover, setOpenPopover] = useState<Record<T, boolean>>(
    {} as Record<T, boolean>,
  );

  useEffect(() => {
    const newInnerFilterTags = Object.keys(innerFilterValue)
      .map((type) => {
        const config = filterConfig[type];
        let value = innerFilterValue[type];
        let label = value as string;
        if (!value) return null;
        if (config.type === "date") {
          value = format(value as Date, "yyyy-MM-dd");
          label = format(value as Date, "yyyy-MM-dd");
        }
        if (config.type === "select") {
          label =
            config.options?.find((option) => option.value === value)?.label ||
            (value as string);
        }
        return {
          type,
          value: value as string,
          label: label as string,
        };
      })
      .filter((tag) => tag !== null);
    setInnerFilterTags(newInnerFilterTags);
  }, []);

  const handleDesktopApply = (type: T) => {
    const newAppliedFilterValue = { ...appliedFilterValue };
    newAppliedFilterValue[type] = innerFilterValue[type];
    setAppliedFilterValue(newAppliedFilterValue);
    setFilterValue?.(newAppliedFilterValue);

    const config = filterConfig[type];
    let value = newAppliedFilterValue[type];
    if (!value) return;
    let label = value as string;
    if (config.type === "date") {
      value = format(value as Date, "yyyy-MM-dd");
      label = format(value as Date, "yyyy-MM-dd");
    }
    if (config.type === "select") {
      label =
        config.options?.find((option) => option.value === value)?.label ||
        (value as string);
    }
    const newInnerFilterTags = innerFilterTags.filter((t) => t.type !== type);
    setInnerFilterTags((prev) => [
      ...newInnerFilterTags,
      {
        type,
        value: value as string,
        label: label as string,
      },
    ]);
    setOpenPopover((prev) => ({ ...prev, [type]: false }));

    onSearch(newAppliedFilterValue);
  };

  const handleRemoveFilter = (tag: FilterTag<T>) => {
    const newAppliedFilterValue = { ...appliedFilterValue };
    delete newAppliedFilterValue[tag.type];
    setAppliedFilterValue(newAppliedFilterValue);
    setFilterValue?.(newAppliedFilterValue);

    const newInnerFilterTags = innerFilterTags.filter(
      (t) => t.type !== tag.type,
    );
    const newInnerFilterValue = { ...innerFilterValue };
    delete newInnerFilterValue[tag.type];
    setInnerFilterTags(newInnerFilterTags);
    setInnerFilterValue(newInnerFilterValue);
    setFilterValue?.(newAppliedFilterValue);
    onRemoveFilter(tag, newAppliedFilterValue);
  };

  const handleClearAllFilters = () => {
    setInnerFilterTags([]);
    setAppliedFilterValue({} as FilterValue<T>);
    setInnerFilterValue({} as FilterValue<T>);
    setFilterValue?.({} as FilterValue<T>);
    onClearAllFilters({} as FilterValue<T>);
  };

  const renderFilterContent = (type: T) => {
    const config = filterConfig[type];

    if (config.type === "date") {
      return (
        <div className="px-2 py-4 flex flex-col">
          <Calendar
            mode="single"
            selected={innerFilterValue[type] as Date}
            onSelect={(date) => {
              const newFilterValue = { ...innerFilterValue };
              newFilterValue[type] = date as Date;
              setInnerFilterValue(newFilterValue);
            }}
            initialFocus
            locale={localeObject}
          />
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleDesktopApply(type)}>
              {t("dynamic-filter-builder.header.apply")}
            </Button>
          </div>
        </div>
      );
    }

    if (config.type === "input") {
      return (
        <div className="p-4 flex flex-col gap-4">
          <Input
            value={innerFilterValue[type] || ""}
            onChange={(e) => {
              const newFilterValue = { ...innerFilterValue };
              newFilterValue[type] = e.target.value;
              setInnerFilterValue(newFilterValue);
            }}
            placeholder={config.placeholder}
          />
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleDesktopApply(type)}>
              {t("dynamic-filter-builder.header.apply")}
            </Button>
          </div>
        </div>
      );
    }

    if (config.type === "select") {
      return (
        <div className="p-4 flex flex-col gap-4">
          <Select
            value={innerFilterValue[type] || ""}
            onValueChange={(value) => {
              const newFilterValue = { ...innerFilterValue };
              newFilterValue[type] = value;
              setInnerFilterValue(newFilterValue);
            }}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleDesktopApply(type)}>
              {t("dynamic-filter-builder.header.apply")}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderFilterInput = (type: T) => {
    const config = filterConfig[type];

    return (
      <FilterPopover
        type={type}
        open={openPopover[type]}
        onOpenChange={(open) =>
          setOpenPopover((prev) => ({ ...prev, [type]: open }))
        }
        value=""
        placeholder={config.placeholder}
      >
        {renderFilterContent(type)}
      </FilterPopover>
    );
  };

  return (
    <div className="app-hidden lg:block">
      <div className="flex flex-col gap-4 text-primary-text">
        <div className="flex flex-wrap gap-5">
          {Object.keys(filterConfig).map((type) => (
            <div key={type}>{renderFilterInput(type as T)}</div>
          ))}
        </div>

        {innerFilterTags.length > 0 && (
          <div className="flex flex-wrap gap-5">
            {innerFilterTags.map((tag, index) => (
              <div
                key={`${tag.type}-${index}`}
                className="flex items-center gap-1 px-2 py-1 bg-grey-light rounded text-sm"
              >
                <span>{formatTagValue(tag, filterConfig[tag.type])}</span>
                <button
                  onClick={() => handleRemoveFilter(tag)}
                  className="ml-1 hover:text-gray-600"
                >
                  <X size={14} stroke="black" strokeWidth={4} />
                </button>
              </div>
            ))}
            {innerFilterTags.length > 0 && (
              <button
                className="text-sm text-primary-text font-semibold flex items-center gap-1"
                onClick={handleClearAllFilters}
              >
                {t("dynamic-filter-builder.header.clear-all")}
                <X size={14} stroke="black" strokeWidth={4} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MobileDynamicFilterProps<T extends string>
  extends DynamicFilterProps<T> {
  onMobileApply: (filterValue: FilterValue<T>) => void;
  onMobileClearAllFilters?: (filterValue?: FilterValue<T>) => void;
  onMobileRemoveFilter?: (
    tag: FilterTag<T>,
    filterValue: FilterValue<T>,
  ) => void;
}

export function MobileDynamicFilterV2<T extends string>({
  filterConfig,
  onMobileApply,
  onMobileClearAllFilters,
  onMobileRemoveFilter,
  isOpen,
  onClose,
  filterValue,
  setFilterValue,
}: MobileDynamicFilterProps<T>) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const localeObject = locales[locale as keyof typeof locales];
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const [innerFilterTags, setInnerFilterTags] = useState<FilterTag<T>[]>([]);

  const [innerFilterValue, setInnerFilterValue] = useState<FilterValue<T>>(
    filterValue || ({} as FilterValue<T>),
  );

  const [openSections, setOpenSections] = useState<string[]>([
    Object.keys(filterConfig)[0],
  ]);
  const [showCalendar, setShowCalendar] = useState<Record<string, boolean>>({});

  const handleMobileApply = () => {
    onMobileApply(innerFilterValue);
    setFilterValue?.(innerFilterValue);
    onClose?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  useEffect(() => {
    const newInnerFilterTags = Object.keys(innerFilterValue)
      .map((type) => {
        const config = filterConfig[type];
        let value = innerFilterValue[type];
        let label = value as string;
        if (!value) return null;
        if (config.type === "date") {
          value = format(value as Date, "yyyy-MM-dd");
          label = format(value as Date, "yyyy-MM-dd");
        }
        if (config.type === "select") {
          label =
            config.options?.find((option) => option.value === value)?.label ||
            (value as string);
        }
        return {
          type,
          value: value as string,
          label: label as string,
        };
      })
      .filter((tag) => tag !== null);

    setInnerFilterTags(newInnerFilterTags);
  }, [innerFilterValue, filterValue]);

  const handleLocalRemoveFilter = (tag: FilterTag<T>) => {
    const newInnerFilterValue = { ...innerFilterValue };
    delete newInnerFilterValue[tag.type];
    setInnerFilterValue(newInnerFilterValue);
    setFilterValue?.(newInnerFilterValue);
    onMobileRemoveFilter?.(tag, newInnerFilterValue);
  };

  const handleClearAll = () => {
    setInnerFilterTags([]);
    setInnerFilterValue({} as FilterValue<T>);
    setFilterValue?.({} as FilterValue<T>);
    onMobileClearAllFilters?.({} as FilterValue<T>);
  };

  return (
    <div className="block lg:hidden">
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="flex flex-col h-[100dvh] max-w-full p-0 text-primary-text">
          {/* Header */}
          <div className="flex-none bg-white flex items-center justify-between px-5 py-4">
            <div className="flex items-center">
              <DialogTitle className="text-sm font-bold">
                {t("dynamic-filter-builder.header.filters")}
              </DialogTitle>
            </div>
          </div>

          {/* Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Selected Filters */}
            {innerFilterTags.length > 0 && (
              <div className="border-b">
                <div className="px-5 py-4">
                  <div className="mb-5 flex justify-between">
                    <span className="text-base font-bold">
                      {t("dynamic-filter-builder.header.selected-filters")}
                    </span>
                    {innerFilterTags.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-primary-main font-semibold"
                      >
                        {t("dynamic-filter-builder.header.clear-all")}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {innerFilterTags.map((tag, index) => (
                      <div
                        key={`${tag.type}-${index}`}
                        className="flex items-center gap-1 px-2 py-1 bg-grey-light rounded text-sm"
                      >
                        <span>
                          {formatTagValue(tag, filterConfig[tag.type])}
                        </span>
                        <button
                          onClick={() => handleLocalRemoveFilter(tag)}
                          className="ml-1 hover:text-gray-600"
                        >
                          <X size={14} stroke="black" strokeWidth={4} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filter Options */}
            <div className="px-5">
              <Accordion
                type="multiple"
                className="w-full"
                value={openSections}
                onValueChange={setOpenSections}
              >
                {(Object.entries(filterConfig) as Array<[T, FilterConfig]>).map(
                  ([type, config]) => (
                    <AccordionItem
                      key={type}
                      value={type}
                      className="text-primary-text"
                    >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <span className="font-semibold text-base">
                          {config.label}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        {config.type === "date" && (
                          <div className="space-y-4">
                            <Input
                              value={formatDate(innerFilterValue[type as T])}
                              placeholder={config.placeholder}
                              onClick={() =>
                                setShowCalendar((prev) => ({
                                  ...prev,
                                  [type]: !prev[type],
                                }))
                              }
                              readOnly
                              className="w-full border"
                            />
                            {showCalendar[type] && (
                              <Calendar
                                mode="single"
                                selected={innerFilterValue[type as T]}
                                onSelect={(date) => {
                                  const newFilterValue = {
                                    ...innerFilterValue,
                                  };
                                  newFilterValue[type as T] = date as Date;
                                  setInnerFilterValue(newFilterValue);
                                  // setFilterValue?.(newFilterValue);
                                }}
                                locale={localeObject}
                                className="rounded-md border"
                              />
                            )}
                          </div>
                        )}
                        {config.type === "input" && (
                          <Input
                            value={innerFilterValue[type as T] || ""}
                            onChange={(e) => {
                              const newFilterValue = { ...innerFilterValue };
                              newFilterValue[type as T] = e.target.value;
                              setInnerFilterValue(newFilterValue);
                              // setFilterValue?.(newFilterValue);
                            }}
                            placeholder={config.placeholder}
                            className="w-full border"
                          />
                        )}
                        {config.type === "select" && (
                          <div className="space-y-2">
                            {config.options?.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`${type}-${option.value}`}
                                  checked={
                                    innerFilterValue[type as T] === option.value
                                  }
                                  onCheckedChange={() => {
                                    const newFilterValue = {
                                      ...innerFilterValue,
                                    };
                                    newFilterValue[type as T] = option.value;
                                    setInnerFilterValue(newFilterValue);
                                    // setFilterValue?.(newFilterValue);
                                  }}
                                />
                                <label
                                  htmlFor={`${type}-${option.value}`}
                                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-none bg-white px-5 py-4 border-t">
            <Button
              type="primary"
              className="w-full"
              onClick={handleMobileApply}
            >
              {t("dynamic-filter-builder.header.apply-filters")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
