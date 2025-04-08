import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DateRange } from "react-day-picker";
import { FilterOption } from "./DynamicFilterBuilder";
import { DatePicker } from "../ui/custom/date-picker";
import { DateRangePickerWithRange } from "../ui/custom/date-range-picker";

interface FilterInputProps {
  filter: FilterOption;
  value: string | Date | DateRange | null | undefined;
  onChange: (value: string | Date | DateRange | null) => void;
}

export function FilterInput({ filter, value, onChange }: FilterInputProps) {
  switch (filter?.type) {
    case "select":
      return (
        <Select
          value={value?.toString() || filter?.selectConfig?.defaultValue}
          onValueChange={onChange}
          disabled={filter.disabled}
          {...filter.selectConfig}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "date":
      return (
        <DatePicker
          value={value as Date | undefined}
          onChange={onChange}
          className="w-full"
          placeholder={filter.placeholder}
          disabled={filter.disabled}
          {...filter.dateConfig}
        />
      );

    case "daterange":
      return (
        <DateRangePickerWithRange
          value={value as DateRange | null}
          onChange={onChange}
          className="w-full"
          placeholder={filter.placeholder}
          disabled={filter.disabled}
          {...filter.dateRangeConfig}
        />
      );

    default:
      return (
        <Input
          type={filter.type}
          placeholder={filter.placeholder}
          className="w-full"
          value={value?.toString() || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={filter.disabled}
          {...filter.inputConfig}
        />
      );
  }
}
