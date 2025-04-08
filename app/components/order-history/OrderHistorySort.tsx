import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { OrderListRequest } from "~/types/order-management/order-list.schema";
import { useTranslation } from "react-i18next";
import _ from "lodash";

export type OrderHistorySortField = "customerName" | "orderNumber";
export type OrderHistorySortOrder = "asc" | "desc";

export const OrderHistorySortConfig: Record<
  OrderHistorySortField,
  { field: OrderListRequest["pagination"]["sortKey"]; label: string }
> = {
  customerName: { field: "CUSTOMER_NAME", label: "Customer" },
  orderNumber: { field: "ORDER_NUMBER", label: "Order Number" },
};

interface OrderHistorySortProps {
  showSort: boolean;
  setShowSort: (show: boolean) => void;
  sortField: OrderHistorySortField;
  sortOrder: OrderHistorySortOrder;
  onSortFieldChange: (field: OrderHistorySortField) => void;
  onSortOrderChange: (order: OrderHistorySortOrder) => void;
}

const renderI18nLabel = (key: string) => {
  const { t } = useTranslation();
  return t(`order-history.list.sort.${_.kebabCase(key)}-label`);
};

export default function OrderHistorySort({
  showSort,
  setShowSort,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
}: OrderHistorySortProps) {
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
            {t("order-history.list.sort.label")}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-4">
          <RadioGroup
            value={sortField}
            onValueChange={(value) =>
              onSortFieldChange(value as OrderHistorySortField)
            }
            className="gap-2"
          >
            {Object.entries(OrderHistorySortConfig).map(([key, config]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`sort-${key}`} />
                <Label htmlFor={`sort-${key}`}>{renderI18nLabel(key)}</Label>
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
