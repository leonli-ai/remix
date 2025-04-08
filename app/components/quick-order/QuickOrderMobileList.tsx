import { Button } from "~/components/ui/button";
import {
  ProductNameField,
  QuantityField,
  UomField,
  PriceField,
} from "./QuickOrderFields";
import type { UseFormReturn } from "react-hook-form";
import type { QuickOrderFormSchema } from "~/types/quick-order";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { Loader2, X } from "lucide-react";
interface QuickOrderMobileListProps {
  form: UseFormReturn<QuickOrderFormSchema>;
  selectProduct: (
    product: QuickOrderFormSchema["productLines"][string]["product"],
    lineId: string,
  ) => void;
  removeLine: (id: string) => void;
  type?: "normal" | "withTargetPrice";
  isLoading?: boolean;
  companyLocationId?: string;
  onTargetPriceChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    lineId: string,
  ) => void;
  onTargetPriceFocus?: (
    e: React.FocusEvent<HTMLInputElement>,
    lineId: string,
  ) => void;
  onTargetPriceBlur?: (
    e: React.FocusEvent<HTMLInputElement>,
    lineId: string,
  ) => void;
}

export function QuickOrderMobileList({
  form,
  selectProduct,
  removeLine,
  type = "normal",
  isLoading = false,
  companyLocationId,
  onTargetPriceChange,
  onTargetPriceFocus,
  onTargetPriceBlur,
}: QuickOrderMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="lg:hidden space-y-4 mb-8">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        Object.entries(form.watch("productLines") || {}).map(
          ([lineId, line]) => (
            <div key={lineId} className="border rounded-lg p-4 bg-gray-base">
              <div className="space-y-5">
                <ProductNameField
                  form={form}
                  control={form.control}
                  lineId={lineId}
                  onSelect={selectProduct}
                  line={line}
                  label={
                    type === "normal"
                      ? t("quick-order.table.product")
                      : t("request-for-quote.create.table.product")
                  }
                  companyLocationId={companyLocationId}
                />
                <div
                  className={cn(
                    "grid gap-4",
                    type === "normal" ? "grid-cols-3" : "grid-cols-2",
                  )}
                >
                  <QuantityField
                    form={form}
                    control={form.control}
                    lineId={lineId}
                    line={line}
                    label={
                      type === "normal"
                        ? t("quick-order.table.qty")
                        : t("request-for-quote.create.table.qty")
                    }
                  />
                  <UomField
                    form={form}
                    control={form.control}
                    lineId={lineId}
                    line={line}
                    label={
                      type === "normal"
                        ? t("quick-order.table.uom")
                        : t("request-for-quote.create.table.uom")
                    }
                    valueClassName="!mt-3.5"
                  />
                  {type === "withTargetPrice" && (
                    <PriceField
                      form={form}
                      control={form.control}
                      lineId={lineId}
                      type="edit"
                      name="targetPrice"
                      line={line}
                      label={t("request-for-quote.create.table.target-price")}
                      valueClassName="mt-3.5"
                      onFocus={onTargetPriceFocus}
                      onBlur={onTargetPriceBlur}
                      onChange={onTargetPriceChange}
                    />
                  )}
                  <PriceField
                    form={form}
                    control={form.control}
                    lineId={lineId}
                    type="view"
                    line={line}
                    label={
                      type === "normal"
                        ? t("quick-order.table.price")
                        : t("request-for-quote.create.table.listed-price")
                    }
                    valueClassName="mt-3.5"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant={null}
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => removeLine(lineId)}
                  >
                    <X
                      className="!w-[18px] !h-[18px]"
                      strokeWidth={4}
                      stroke="var(--custom-gray-middle)"
                    />
                  </Button>
                </div>
              </div>
            </div>
          ),
        )
      )}
    </div>
  );
}
