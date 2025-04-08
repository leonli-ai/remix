import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { formatPrice, locationReplace, setUrl } from "~/lib/utils";
import { ShoppingListItem } from "~/types/shopping-lists/shopping-list-items.schema";
import { ShoppingListQtyControl } from "./ShoppingListQtyControl";

interface ShoppingListDetailProductCardProps {
  product: ShoppingListItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onDeleteItems: (itemId: number[], skipModal?: boolean) => void;
  isDeleting: boolean;
  nowDeleting: number[];
  selectedItems: number[];
  onSelectItems: (items: number[]) => void;
  customerPartnerNumberBySku: {
    skuId: string;
    customerPartnerNumber: string | null;
  }[];
}

export function ShoppingListDetailProductCard({
  product,
  onUpdateQuantity,
  onDeleteItems,
  isDeleting,
  nowDeleting,
  selectedItems,
  onSelectItems,
  customerPartnerNumberBySku,
}: ShoppingListDetailProductCardProps) {
  const { t } = useTranslation();

  const goToProduct = (url: string) => {
    locationReplace(url);
  };

  return (
    <div className="border rounded-lg p-4 gap-5 flex items-start justify-between">
      <Checkbox
        className="w-6 h-6 border border-gray-400 rounded-sm bg-white data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 shadow-none data-[state=checked]:text-white [&>span>svg]:stroke-[4]"
        checked={selectedItems.includes(product.id)}
        onCheckedChange={(checked) => {
          if (checked) {
            onSelectItems([...selectedItems, product.id]);
          } else {
            onSelectItems(selectedItems.filter((id) => id !== product.id));
          }
        }}
      />
      <div className="flex gap-3 flex-col flex-1">
        <div className="flex flex-col gap-1">
          <div className="text-gray-900 font-bold text-sm">
            {t("shopping-list.detail.product-table.customer-product")}
          </div>
          <div className="text-gray-900 text-sm">
            {
              customerPartnerNumberBySku.find(
                (item) => item.skuId === product.skuId,
              )?.customerPartnerNumber
            }
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-gray-900 font-bold text-sm">
            {t("shopping-list.detail.product-table.item")}
          </div>
          <div className="text-gray-900 text-sm flex items-start gap-[10px]">
            <div
              onClick={() => goToProduct(setUrl(product.url))}
              className="shrink-0 pt-1"
            >
              <img
                src={product?.productImageUrl || ""}
                alt={product?.productName || ""}
                className="w-[60px] min-w-[60px] h-[60px] object-contain rounded cursor-pointer border border-gray-200 max-w-fit"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  (e.currentTarget?.nextSibling as HTMLElement).style.display =
                    "block";
                }}
              />
              <ImageIcon
                className="w-[60px] min-w-[60px] h-[60px] text-gray-400"
                style={{ display: "none" }}
              />
            </div>
            <div>
              <div
                onClick={() => goToProduct(setUrl(product.url))}
                className="font-normal hover:underline line-clamp-3"
              >
                {product?.productName || ""}
              </div>

              <p className="text-sm text-muted-foreground mt-1 break-all">
                SKU: {product?.skuId || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-gray-900 font-bold text-sm">
            {t("shopping-list.detail.product-table.qty")}
          </div>
          <div className="flex items-center gap-[10px]">
            <ShoppingListQtyControl
              product={{
                id: product.id,
                quantity: product.quantity,
              }}
              onUpdateQuantity={onUpdateQuantity}
            />
            <div className="text-[13px]">
              {product.quantity}{" "}
              {product.quantity === 1
                ? t("common.text.upper-item")
                : t("common.text.upper-items")}{" "}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-gray-900 font-bold text-sm">
            {t("shopping-list.detail.product-table.price")}
          </div>
          <div className="text-gray-900 text-sm">
            {product.price && product.currencyCode
              ? formatPrice(product.price, product.currencyCode)
              : "-"}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-gray-900 font-bold text-sm">
            {t("shopping-list.detail.product-table.subtotal")}
          </div>
          <div className="text-gray-900 text-sm font-bold">
            {product.subtotal && product.currencyCode
              ? formatPrice(product.subtotal, product.currencyCode)
              : "-"}
          </div>
        </div>
      </div>

      <div className="flex self-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteItems([product.id], false)}
          disabled={isDeleting && nowDeleting.includes(product.id)}
          className="lg:w-auto px-0"
        >
          {isDeleting && nowDeleting.includes(product.id) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="!size-5" strokeWidth={2} />
          )}
        </Button>
      </div>
    </div>
  );
}
