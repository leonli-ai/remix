import _ from "lodash";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShoppingListQtyControl } from "~/components/shopping-lists/shopping-lists-detail/ShoppingListQtyControl";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatPrice } from "~/lib/utils";
import { QuickOrderFormSchema } from "~/types/quick-order";
import { QuoteWithCustomer } from "~/types/quotes/quote.schema";
import { QuoteDetailProductTableItemCell } from "./QuoteDetailProductTableItemCell";

interface QuoteDetailProductCardProps {
  currencyCode: string;
  item: QuoteWithCustomer["quoteItems"][number];
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

export const QuoteDetailProductCard = ({
  currencyCode,
  item,
  isLoading,
  onUpdateQuantity,
  onDeleteItem,
  onUpdateTargetPrice,
  onUpdateTargetPriceWhileBlur,
  type,
  className,
  isDeleting,
  onSelect,
}: QuoteDetailProductCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-start justify-between gap-5 rounded-lg border p-4">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-5">
          {/* customer product */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.customer-product")}
            </div>
            <div className="text-sm text-primary-text">
              {item?.variant?.customerPartnerNumber || "-"}
            </div>
          </div>

          {/* sku */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.sku")}
            </div>
            <div className="text-sm text-primary-text">
              {item?.variant?.sku || "-"}
            </div>
          </div>

          {/* item */}
          <div className="col-span-2 flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.item")}
            </div>
            <div className="text-sm text-primary-text">
              <QuoteDetailProductTableItemCell
                item={item}
                onSelect={onSelect}
              />
            </div>
          </div>

          {/* qty */}
          <div className="col-span-1 flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.qty")}
            </div>
            <div className="text-sm text-primary-text">
              {type === "edit" ? (
                <div className="flex flex-col gap-2">
                  <ShoppingListQtyControl
                    product={{
                      id: item.id,
                      quantity: item.quantity,
                    }}
                    increment={item?.variant?.quantityRule?.increment || 1}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                  <div className="w-16 text-[13px] text-grey-dark">
                    {item.quantity}{" "}
                    {item.quantity === 1
                      ? t("common.text.upper-item")
                      : t("common.text.upper-items")}{" "}
                  </div>
                </div>
              ) : (
                <div className="w-16 text-[13px] text-grey-dark">
                  {item.quantity}{" "}
                  {item.quantity === 1
                    ? t("common.text.upper-item")
                    : t("common.text.upper-items")}{" "}
                </div>
              )}
            </div>
          </div>

          {/* uom */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.uom")}
            </div>
            <div className="text-sm text-primary-text">
              {item?.variant?.metafield?.value || "-"}
            </div>
          </div>

          {/* offer price */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.target-price")}
            </div>
            <div className="text-sm text-primary-text">
              {type === "edit" ? (
                <Input
                  placeholder={t(
                    "request-for-quote.create.table.target-price-placeholder",
                  )}
                  value={item?.offerPriceShow || item?.offerPrice}
                  className="h-11 bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  onFocus={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
                    onUpdateTargetPrice(item.id, numericValue);
                  }}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
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
            </div>
          </div>

          {/* listed price */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.listed-price")}
            </div>
            <div className="text-sm text-primary-text">
              {_.toString(item.originalPrice) && currencyCode
                ? formatPrice(item.originalPrice, currencyCode, true)
                : "-"}
            </div>
          </div>

          {/* total price */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-bold text-primary-text">
              {t("request-for-quote.detail.table.total-price")}
            </div>
            <div className="text-sm text-primary-text">
              <span>
                {_.toString(item.offerPrice * item.quantity) && currencyCode
                  ? formatPrice(
                      item.offerPrice * item.quantity,
                      currencyCode,
                      true,
                    )
                  : "-"}
              </span>
            </div>
          </div>

          {/* delete */}
          {type === "edit" && (
            <div className="flex flex-col gap-1">
              <div className="text-sm font-bold text-primary-text"></div>
              <div className="text-sm text-primary-text">
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
