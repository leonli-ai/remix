import _ from "lodash";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShoppingListQtyControl } from "~/components/shopping-lists/shopping-lists-detail/ShoppingListQtyControl";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn, formatPrice } from "~/lib/utils";
import { QuoteWithCustomer } from "~/types/quotes/quote.schema";
import { QuoteDetailProductTableItemCell } from "./QuoteDetailProductTableItemCell";
import { QuickOrderFormSchema } from "~/types/quick-order";
interface QuoteDetailProductTableProps {
  currencyCode: string;
  products: QuoteWithCustomer["quoteItems"];
  isLoading: boolean;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onDeleteItem: (itemId: number, skipModal?: boolean) => void;
  onUpdateTargetPrice: (itemId: number, targetPrice: number) => void;
  onUpdateTargetPriceWhileBlur: (itemId: number, targetPrice: number) => void; // send request to update target price while blur
  type: "view" | "edit";
  className?: string;
  isDeleting: boolean;
  onSelect: (
    product: QuickOrderFormSchema["productLines"][string]["product"],
    lineId: string,
  ) => void;
}

export default function QuoteDetailProductTable({
  currencyCode,
  products,
  isLoading,
  onUpdateQuantity,
  onUpdateTargetPrice,
  onUpdateTargetPriceWhileBlur,
  type,
  className,
  onDeleteItem,
  isDeleting,
  onSelect,
}: QuoteDetailProductTableProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="font-bold text-primary-text">
        {t("request-for-quote.detail.table.title")}
      </div>
      <div className="rounded-md border border-secondary-light text-primary-text">
        <Table className="">
          <TableHeader className="bg-blue-50">
            <TableRow className="border-secondary-light">
              <TableHead className="w-40 pl-6 text-sm font-bold text-primary-text">
                {t("request-for-quote.detail.table.customer-product")}
              </TableHead>
              <TableHead className="w-24 text-sm font-bold text-primary-text">
                {t("request-for-quote.detail.table.sku")}
              </TableHead>
              <TableHead className="text-sm font-bold text-primary-text">
                {t("request-for-quote.detail.table.item")}
              </TableHead>
              <TableHead
                className={cn(
                  "text-sm font-bold text-primary-text",
                  type === "edit" ? "" : "",
                )}
              >
                {t("request-for-quote.detail.table.qty")}
              </TableHead>
              {type === "edit" && (
                <TableHead
                  className={cn(
                    "pl-0 font-bold text-primary-text",
                    type === "edit" ? "" : "",
                  )}
                ></TableHead>
              )}
              <TableHead className="text-sm font-bold text-primary-text">
                {t("request-for-quote.detail.table.uom")}
              </TableHead>
              <TableHead
                className={cn(
                  "w-28 text-sm font-bold text-primary-text",
                  type === "edit" ? "text-center" : "",
                )}
              >
                {t("request-for-quote.detail.table.target-price")}
              </TableHead>
              <TableHead className="w-28 text-sm font-bold text-primary-text">
                {t("request-for-quote.detail.table.listed-price")}
              </TableHead>
              <TableHead className="w-28 text-sm font-bold text-primary-text">
                {t("request-for-quote.detail.table.total-price")}
              </TableHead>
              {type === "edit" && (
                <TableHead
                  className="w-10 text-sm font-bold text-primary-text"
                  align="center"
                ></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={type === "edit" ? 10 : 8}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "border-secondary-light",
                    item?.type === "add-product" ? "no-print" : "",
                  )}
                >
                  <TableCell className="pl-6">
                    {item?.variant?.customerPartnerNumber || "-"}
                  </TableCell>
                  <TableCell>{item?.variant?.sku || "-"}</TableCell>
                  <TableCell>
                    <QuoteDetailProductTableItemCell
                      item={item}
                      onSelect={onSelect}
                    />
                  </TableCell>
                  <TableCell align={type === "edit" ? "center" : "left"}>
                    {type === "edit" ? (
                      <ShoppingListQtyControl
                        product={{
                          id: item.id,
                          quantity: item.quantity,
                        }}
                        increment={item?.variant?.quantityRule?.increment || 1}
                        onUpdateQuantity={onUpdateQuantity}
                      />
                    ) : (
                      <div className="w-16 text-[13px] text-grey-dark">
                        {item.quantity}{" "}
                        {item.quantity === 1
                          ? t("common.text.upper-item")
                          : t("common.text.upper-items")}{" "}
                      </div>
                    )}
                  </TableCell>
                  {type === "edit" && (
                    <TableCell className="pl-0">
                      <div className="w-16 text-[13px] text-grey-dark">
                        {item.quantity}{" "}
                        {item.quantity === 1
                          ? t("common.text.upper-item")
                          : t("common.text.upper-items")}{" "}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    {item?.variant?.metafield?.value || "-"}
                  </TableCell>
                  <TableCell align={type === "edit" ? "center" : "left"}>
                    {type === "edit" ? (
                      <Input
                        placeholder={t(
                          "request-for-quote.create.table.target-price-placeholder",
                        )}
                        value={item?.offerPriceShow || item?.offerPrice}
                        className="h-11 w-[84px] bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        onFocus={(e) => {
                          const numericValue = e.target.value.replace(
                            /[^0-9.]/g,
                            "",
                          );
                          onUpdateTargetPrice(item.id, numericValue);
                        }}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /[^0-9.]/g,
                            "",
                          );
                          onUpdateTargetPrice(item.id, numericValue);
                        }}
                        onBlur={(e) => {
                          const numericValue = _.toNumber(e.target.value);

                          onUpdateTargetPriceWhileBlur(item.id, numericValue);
                        }}
                      />
                    ) : (
                      <span>
                        {_.toString(item.offerPrice) && currencyCode
                          ? formatPrice(item.offerPrice, currencyCode, true)
                          : "-"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {_.toString(item.originalPrice) && currencyCode
                      ? formatPrice(item.originalPrice, currencyCode, true)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span>
                      {_.toString(item.offerPrice * item.quantity) &&
                      currencyCode
                        ? formatPrice(
                            item.offerPrice * item.quantity,
                            currencyCode,
                            true,
                          )
                        : "-"}
                    </span>
                  </TableCell>
                  {type === "edit" && (
                    <TableCell align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(item.id, false)}
                        disabled={isDeleting}
                        className="px-0"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2
                            className="h-6 w-6 stroke-gray-500"
                            size={24}
                          ></Trash2>
                        )}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={type === "edit" ? 10 : 8}
                  className="h-24 text-center"
                >
                  {t("request-for-quote.detail.table.empty-product-table")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
