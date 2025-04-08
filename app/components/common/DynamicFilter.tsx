import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import type { FilterTag, FilterConfig } from "~/types/filter";
import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { X, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useTranslation } from "react-i18next";
import * as locales from "date-fns/locale";
import { formatTagValue } from "~/lib/filter";

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

interface DynamicFilterProps<T extends string> {
  filterTags: FilterTag<T>[];
  onSearch: (
    type: T,
    localFilterValue: Record<T, string>,
    localDateValues: Record<string, Date | undefined>,
    localSelectValue: Record<T, string[]>,
  ) => void;
  onClearAllFilters: () => void;
  tempFilterValue: Record<T, string>;
  setTempFilterValue: (value: Record<T, string>) => void;
  tempDateValues: Record<string, Date | undefined>;
  setTempDateValues: React.Dispatch<
    React.SetStateAction<Record<string, Date | undefined>>
  >;
  tempSelectValue: Record<T, string[]>;
  setTempSelectValue: (value: Record<T, string[]>) => void;
  onRemoveFilter: (tag: FilterTag<T>) => void;
  isOpen?: boolean;
  onClose?: () => void;
  setFilterTags: React.Dispatch<React.SetStateAction<FilterTag<T>[]>>;
  filterConfig: Record<T, FilterConfig>;
  onMobileSearch: (
    filterTags: FilterTag<T>[],
    filterValue: Record<T, string>,
    localDateValues: Record<string, Date | undefined>,
    localSelectValue: Record<T, string[]>,
  ) => void;
}

export function DesktopDynamicFilter<T extends string>({
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
  filterConfig,
}: Omit<DynamicFilterProps<T>, "isOpen" | "onClose" | "setFilterTags">) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const localeObject = locales[locale as keyof typeof locales];
  const [openPopover, setOpenPopover] = useState<Record<T, boolean>>(
    {} as Record<T, boolean>,
  );

  const handleDesktopApply = (type: T) => {
    onSearch(type, tempFilterValue, tempDateValues, tempSelectValue);
    setOpenPopover((prev) => ({ ...prev, [type]: false }));
  };

  const renderFilterContent = (type: T) => {
    const config = filterConfig[type];

    if (config.type === "date") {
      return (
        <div className="px-2 py-4 flex flex-col">
          <Calendar
            mode="single"
            selected={tempDateValues[type]}
            onSelect={(date) =>
              setTempDateValues((prev) => ({
                ...prev,
                [type]: date,
              }))
            }
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
            value={tempFilterValue[type] || ""}
            onChange={(e) =>
              setTempFilterValue((prev) => ({
                ...prev,
                [type]: e.target.value,
              }))
            }
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
            value={tempSelectValue[type]?.[0] || ""}
            onValueChange={(value) =>
              setTempSelectValue((prev) => ({
                ...prev,
                [type]: [value],
              }))
            }
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

        {filterTags.length > 0 && (
          <div className="flex flex-wrap gap-5">
            {filterTags.map((tag, index) => (
              <div
                key={`${tag.type}-${index}`}
                className="flex items-center gap-1 px-2 py-1 bg-grey-light rounded text-sm"
              >
                <span>{formatTagValue(tag, filterConfig[tag.type])}</span>
                <button
                  onClick={() => onRemoveFilter(tag)}
                  className="ml-1 hover:text-gray-600"
                >
                  <X size={14} stroke="black" strokeWidth={4} />
                </button>
              </div>
            ))}
            {filterTags.length > 0 && (
              <button
                className="text-sm text-primary-text font-semibold flex items-center gap-1"
                onClick={onClearAllFilters}
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

export function MobileDynamicFilter<T extends string>({
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
  isOpen,
  onClose,
  setFilterTags,
  filterConfig,
  onMobileSearch,
}: DynamicFilterProps<T>) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const localeObject = locales[locale as keyof typeof locales];
  const [localFilterValue, setLocalFilterValue] = useState(tempFilterValue);
  const [localDateValues, setLocalDateValues] = useState(tempDateValues);
  const [localSelectValue, setLocalSelectValue] = useState(tempSelectValue);
  const [openSections, setOpenSections] = useState<string[]>([
    Object.keys(filterConfig)[0],
  ]);
  const [showCalendar, setShowCalendar] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setLocalFilterValue(tempFilterValue);
      setLocalDateValues(tempDateValues);
      setLocalSelectValue(tempSelectValue);
      setOpenSections([Object.keys(filterConfig)[0]]);
    }
  }, [isOpen, tempFilterValue, tempDateValues, tempSelectValue]);

  const handleLocalRemoveFilter = (tagToRemove: FilterTag<T>) => {
    if (
      tagToRemove.type === "updated_at" ||
      tagToRemove.type === "created_at"
    ) {
      setLocalDateValues((prev) => ({
        ...prev,
        [tagToRemove.type]: undefined,
      }));
    } else if (tagToRemove.type === "status") {
      setLocalSelectValue([]);
    } else {
      setLocalFilterValue((prev) => ({
        ...prev,
        [tagToRemove.type]: "",
      }));
    }
    setFilterTags((prev) => {
      return prev.filter(
        (tag) =>
          !(tag.type === tagToRemove.type && tag.value === tagToRemove.value),
      );
    });
  };

  const handleClearAll = () => {
    setLocalFilterValue(
      Object.keys(filterConfig).reduce(
        (acc, key) => {
          acc[key as T] = "";
          return acc;
        },
        {} as Record<T, string>,
      ),
    );
    setLocalDateValues({
      created_at: undefined,
      updated_at: undefined,
    });
    setLocalSelectValue([]);
    onClearAllFilters();
  };

  const handleChange = (value: string) => {
    const type = "status" as T;
    setLocalSelectValue((prev) => ({
      ...prev,
      [type]: [value],
    }));

    const config = filterConfig[type];
    const label =
      config.options?.find((opt) => opt.value === value)?.label || value;

    if (value) {
      setFilterTags((prev) => {
        return [
          ...prev.filter((tag) => tag.type !== type),
          {
            type,
            value,
            label,
          },
        ];
      });
    } else {
      setFilterTags((prev) => {
        return prev.filter((tag) => tag.type !== type);
      });
    }
  };

  const handleInputChange = (type: T, value: string) => {
    setLocalFilterValue((prev) => ({
      ...prev,
      [type]: value,
    }));

    if (value) {
      setFilterTags((prev) => {
        return [
          ...prev.filter((tag) => tag.type !== type),
          {
            type,
            value,
            label: value,
          },
        ];
      });
    } else {
      setFilterTags((prev) => {
        return prev.filter((tag) => tag.type !== type);
      });
    }
  };

  const handleClose = () => {
    setLocalFilterValue(tempFilterValue);
    setLocalDateValues(tempDateValues);
    setLocalSelectValue(tempSelectValue);
    onClose?.();
  };

  const handleMobileApply = () => {
    setTempFilterValue(localFilterValue);
    setTempDateValues(localDateValues);
    setTempSelectValue(localSelectValue);

    filterTags.length
      ? filterTags.forEach((tag) => {
          setTimeout(() => {
            onMobileSearch(
              filterTags,
              localFilterValue,
              localDateValues,
              localSelectValue,
            );
          }, 10);
        })
      : handleClearAll();

    onClose?.();
  };

  const handleDateChange = (type: T, date: Date | undefined) => {
    setLocalDateValues((prev) => ({
      ...prev,
      [type]: date,
    }));

    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setFilterTags((prev) => {
        return [
          ...prev.filter((tag) => tag.type !== type),
          {
            type,
            value: formattedDate,
            label: `on or after ${formattedDate}`,
          },
        ];
      });
    } else {
      setFilterTags((prev) => {
        return prev.filter((tag) => tag.type !== type);
      });
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  return (
    <div className="block lg:hidden">
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="flex flex-col h-[100dvh] max-w-full p-0 text-primary-text">
          {/* Header */}
          <div className="flex-none bg-white flex items-center justify-between px-5 py-4">
            <div className="flex items-center">
              <DialogTitle className="text-sm font-bold">Filters</DialogTitle>
            </div>
          </div>

          {/* Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Selected Filters */}
            {filterTags.length > 0 && (
              <div className="border-b">
                <div className="px-5 py-4">
                  <div className="mb-5 flex justify-between">
                    <span className="text-base font-bold">
                      Selected filters
                    </span>
                    {filterTags.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-primary-main font-semibold"
                      >
                        {t("dynamic-filter-builder.header.clear-all")}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterTags.map((tag, index) => (
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
                              value={formatDate(localDateValues[type as T])}
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
                                selected={localDateValues[type as T]}
                                onSelect={(date) => {
                                  handleDateChange(type as T, date);
                                  setShowCalendar((prev) => ({
                                    ...prev,
                                    [type]: false,
                                  }));
                                }}
                                className="rounded-md border"
                                locale={localeObject}
                              />
                            )}
                          </div>
                        )}
                        {config.type === "input" && (
                          <Input
                            value={localFilterValue[type as T] || ""}
                            onChange={(e) =>
                              handleInputChange(type as T, e.target.value)
                            }
                            placeholder={config.placeholder}
                            className="w-full border"
                          />
                        )}
                        {config.type === "select" && (
                          <div className="space-y-2">
                            <RadioGroup
                              value={localSelectValue[type as T]?.[0] || ""}
                              onValueChange={(value) => handleChange(value)}
                            >
                              {config.options?.map((option) => (
                                <div
                                  key={option.value}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    id={`${type}-${option.value}`}
                                    value={option.value}
                                  />
                                  <label
                                    htmlFor={`${type}-${option.value}`}
                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
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
              {t("dynamic-filter-builder.header.apply")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
