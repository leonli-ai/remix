import { Button } from "~/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import _ from "lodash";

export type SortField = "updatedAt" | "customerName" | "number" | "totalPrice";
export type SortOrder = "asc" | "desc";

export const sortConfig: Record<SortField, { field: string; label: string }> = {
  number: { field: "NUMBER", label: "Draft Order Number" },
  updatedAt: { field: "UPDATED_AT", label: "Updated At" },
  customerName: { field: "CUSTOMER_NAME", label: "Customer" },
  totalPrice: { field: "TOTAL_PRICE", label: "Total" },
};

interface DraftOrderSortProps {
  showSort: boolean;
  setShowSort: (show: boolean) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
}

export default function DraftOrderSort({
  showSort,
  setShowSort,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
}: DraftOrderSortProps) {
  const { t } = useTranslation();

  return (
    <Popover open={showSort} onOpenChange={setShowSort}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-lg">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "border-gray-300 text-transparent hover:text-transparent",
                showSort ? "bg-blue-50 border-blue-500" : "",
              )}
            >
              <ArrowUpDown
                className={cn(
                  "h-4 w-4",
                  showSort ? "text-outline" : "text-primary-text",
                )}
              />
            </Button>
          </div>
          <span
            className={cn(
              "font-bold text-sm text-primary-text",
              showSort ? "text-primary-main" : "",
            )}
          >
            {t("draft-order.list.sort.label")}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-4">
          <RadioGroup
            value={sortField}
            onValueChange={(value) => onSortFieldChange(value as SortField)}
            className="gap-2"
          >
            {Object.entries(sortConfig).map(([key, config]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`sort-${key}`} />
                <Label htmlFor={`sort-${key}`}>
                  {t(`draft-order.list.sort.${_.kebabCase(key)}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="border-t pt-2">
            <div className="space-y-1">
              <button
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 ${
                  sortOrder === "asc" ? "bg-gray-100" : ""
                }`}
                onClick={() => onSortOrderChange("asc")}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm">{t("common.sort.ascending")}</span>
              </button>
              <button
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 ${
                  sortOrder === "desc" ? "bg-gray-100" : ""
                }`}
                onClick={() => onSortOrderChange("desc")}
              >
                <ArrowDown className="h-4 w-4" />
                <span className="text-sm">{t("common.sort.descending")}</span>
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
