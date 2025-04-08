import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Loader2, X } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  ProductNameField,
  QuantityField,
  UomField,
  PriceField,
} from "./QuickOrderFields";
import type { UseFormReturn } from "react-hook-form";
import type { QuickOrderFormSchema } from "~/types/quick-order";
import { useTranslation } from "react-i18next";
interface QuickOrderTableProps {
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

export function QuickOrderTable({
  form,
  selectProduct,
  removeLine,
  type = "normal",
  isLoading = false,
  companyLocationId,
  onTargetPriceChange,
  onTargetPriceFocus,
  onTargetPriceBlur,
}: QuickOrderTableProps) {
  const { t } = useTranslation();

  const widthConfig = {
    normal: {
      product: "w-[55%]",
      qty: "w-[15%]",
      uom: "w-[15%]",
      listedPrice: "w-[15%]",
    },
    withTargetPrice: {
      product: "w-[55%]",
      qty: "w-[10%]",
      uom: "w-[10%]",
      listedPrice: "w-[15%]",
      targetPrice: "w-[15%]",
    },
  };

  return (
    <Table className="app-hidden lg:block">
      <TableHeader>
        <TableRow>
          <TableHead
            className={cn(
              widthConfig[type].product,
              "text-grey-dark font-semibold px-[10px]",
            )}
          >
            {type === "normal"
              ? t("quick-order.table.product")
              : t("request-for-quote.create.table.product")}
          </TableHead>
          <TableHead
            className={cn(
              widthConfig[type].qty,
              "text-grey-dark font-semibold px-[10px]",
            )}
          >
            {type === "normal"
              ? t("quick-order.table.qty")
              : t("request-for-quote.create.table.qty")}
          </TableHead>
          <TableHead
            className={cn(
              widthConfig[type].uom,
              "text-grey-dark font-semibold px-[10px]",
            )}
          >
            {type === "normal"
              ? t("quick-order.table.uom")
              : t("request-for-quote.create.table.uom")}
          </TableHead>
          {type === "withTargetPrice" && (
            <TableHead
              className={cn(
                widthConfig[type].targetPrice,
                "text-grey-dark font-semibold px-[10px]",
              )}
            >
              {t("request-for-quote.create.table.target-price")}
            </TableHead>
          )}
          <TableHead
            className={cn(
              widthConfig[type]?.listedPrice,
              "text-grey-dark font-semibold px-[10px]",
            )}
          >
            {type === "normal"
              ? t("quick-order.table.price")
              : t("request-for-quote.create.table.listed-price")}
          </TableHead>
          <TableHead className="w-[5%] text-grey-dark font-semibold px-[10px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center  w-full">
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <>
            {Object.entries(form.watch("productLines") || {}).map(
              ([lineId, line], index) => (
                <TableRow
                  key={lineId}
                  className={cn(index % 2 === 0 && "bg-gray-base")}
                >
                  <TableCell className="p-[10px]">
                    <ProductNameField
                      form={form}
                      control={form.control}
                      lineId={lineId}
                      onSelect={selectProduct}
                      line={line}
                      companyLocationId={companyLocationId}
                    />
                  </TableCell>
                  <TableCell className="p-[10px]">
                    <QuantityField
                      form={form}
                      control={form.control}
                      lineId={lineId}
                      line={line}
                    />
                  </TableCell>
                  <TableCell className="p-[10px]">
                    <UomField
                      form={form}
                      control={form.control}
                      lineId={lineId}
                      line={line}
                    />
                  </TableCell>
                  {type === "withTargetPrice" && (
                    <TableCell className="p-[10px]">
                      <PriceField
                        line={line}
                        type="edit"
                        control={form.control}
                        lineId={lineId}
                        form={form}
                        name="targetPrice"
                        onFocus={onTargetPriceFocus}
                        onBlur={onTargetPriceBlur}
                        onChange={onTargetPriceChange}
                      />
                    </TableCell>
                  )}
                  <TableCell className="p-[10px]">
                    <PriceField
                      line={line}
                      type="view"
                      control={form.control}
                      lineId={lineId}
                      form={form}
                    />
                  </TableCell>
                  <TableCell className="p-[10px]">
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
                  </TableCell>
                </TableRow>
              ),
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
}
