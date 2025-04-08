import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "~/lib/utils";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

interface DateRangePickerProps {
  value?: DateRange | null;
  onChange?: (date: DateRange | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[];
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  popoverAlign?: "start" | "center" | "end";
  numberOfMonths?: number;
  fixedWeeks?: boolean;
  showWeekNumber?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function DateRangePickerWithRange({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  disabledDates = [],
  disabledDaysOfWeek = [],
  minDate,
  maxDate,
  dateFormat = "yyyy-MM-dd",
  popoverAlign = "start",
  numberOfMonths = 2,
  fixedWeeks = false,
  showWeekNumber = false,
  weekStartsOn = 1,
}: DateRangePickerProps) {
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
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, dateFormat)} -{" "}
                {format(value.to, dateFormat)}
              </>
            ) : (
              format(value.from, dateFormat)
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={popoverAlign}
        sideOffset={4}
      >
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value || undefined}
          onSelect={(range: DateRange | undefined) => onChange?.(range || null)}
          numberOfMonths={numberOfMonths}
          fixedWeeks={fixedWeeks}
          showWeekNumber={showWeekNumber}
          weekStartsOn={weekStartsOn}
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
        />
      </PopoverContent>
    </Popover>
  );
}
