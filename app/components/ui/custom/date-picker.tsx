import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { useTranslation } from "react-i18next";
import * as locales from "date-fns/locale";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[];
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  popoverAlign?: "start" | "center" | "end";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  disabledDates = [],
  disabledDaysOfWeek = [],
  minDate,
  maxDate,
  dateFormat = "PPP",
  popoverAlign = "start",
}: DatePickerProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const localeObject = locales[locale as keyof typeof locales];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={popoverAlign}
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          disabled={(date) => {
            if (
              disabledDates.some(
                (disabled) =>
                  disabled.getFullYear() === date.getFullYear() &&
                  disabled.getMonth() === date.getMonth() &&
                  disabled.getDate() === date.getDate(),
              )
            )
              return true;

            if (disabledDaysOfWeek.includes(date.getDay())) return true;

            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;

            return false;
          }}
          locale={localeObject}
        />
      </PopoverContent>
    </Popover>
  );
}
