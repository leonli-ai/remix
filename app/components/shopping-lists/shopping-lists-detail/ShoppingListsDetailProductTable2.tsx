import { Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatPrice, locationReplace, setUrl } from "~/lib/utils";
import type { ShoppingListItem } from "~/types/shopping-lists/shopping-list-items.schema";
import { ShoppingListDetailTableActions } from "./ShoppingListDetailTableActions";
import { ShoppingListQtyControl } from "./ShoppingListQtyControl";
import { useTranslation } from "react-i18next";

interface ShoppingListDetailProductTableProps {
  listId: string;
  products: ShoppingListItem[];
  selectedItems: number[];
  onSelectItems: (items: number[]) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onDeleteItems: (itemId: number[], skipModal?: boolean) => void;
  isDeleting: boolean;
  nowDeleting: number[];
  isLoading: boolean;
  customerPartnerNumberBySku: {
    skuId: string;
    customerPartnerNumber: string | null;
  }[];
}

export function ShoppingListDetailProductTable2({
  listId,
  products,
  selectedItems,
  onSelectItems,
  onUpdateQuantity,
  onDeleteItems,
  isDeleting,
  nowDeleting,
  isLoading,
  customerPartnerNumberBySku,
}: ShoppingListDetailProductTableProps) {
  const { t } = useTranslation();

  const goToProduct = (url: string) => {
    locationReplace(url);
  };

  const toggleAllRows = (checked: boolean) => {
    const newSelectedItems = checked ? products.map((p) => p.id) : [];
    onSelectItems(newSelectedItems);
  };

  const toggleRow = (checked: boolean, productId: number) => {
    const newSelectedItems = checked
      ? [...selectedItems, productId]
      : selectedItems.filter((id) => id !== productId);
    onSelectItems(newSelectedItems);
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="rounded-md border border-secondary-light text-text-color">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow className="border-secondary-light">
                <TableHead className="w-10">
                  <Checkbox
                    className="w-6 h-6 border border-gray-400 rounded-sm bg-white data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 shadow-none data-[state=checked]:text-white [&>span>svg]:stroke-[4]"
                    checked={selectedItems.length === products.length}
                    onCheckedChange={(checked) => toggleAllRows(!!checked)}
                  />
                </TableHead>
                <TableHead className="text-gray-900 font-bold text-sm w-40">
                  {t("shopping-list.detail.product-table.customer-product")}
                </TableHead>
                <TableHead className="text-gray-900 font-bold text-sm w-80">
                  {t("shopping-list.detail.product-table.item")}
                </TableHead>
                <TableHead className="text-gray-900 font-bold text-sm text-center w-40">
                  {t("shopping-list.detail.product-table.qty")}
                </TableHead>
                <TableHead className="text-gray-900 font-bold pl-0"></TableHead>
                <TableHead className="text-gray-900 font-bold text-sm">
                  {t("shopping-list.detail.product-table.price")}
                </TableHead>
                <TableHead className="text-gray-900 font-bold text-sm">
                  {t("shopping-list.detail.product-table.subtotal")}
                </TableHead>
                <TableHead
                  className="text-gray-900 font-bold text-sm w-14"
                  align="center"
                >
                  <ShoppingListDetailTableActions
                    shoppingListId={Number(listId)}
                    selectedItems={selectedItems}
                    products={products}
                    onRemoveSelected={(skipModal) => {
                      onDeleteItems(selectedItems, skipModal);
                    }}
                    isDeleting={isDeleting}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id} className="border-secondary-light">
                    <TableCell>
                      <Checkbox
                        className="w-6 h-6 border border-gray-400 rounded-sm bg-white data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 shadow-none data-[state=checked]:text-white [&>span>svg]:stroke-[4]"
                        checked={selectedItems.includes(product.id)}
                        onCheckedChange={(checked) =>
                          toggleRow(!!checked, product.id)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {
                        customerPartnerNumberBySku.find(
                          (item) => item.skuId === product.skuId,
                        )?.customerPartnerNumber
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-[10px] items-start">
                        <div
                          onClick={() => goToProduct(setUrl(product.url))}
                          className="cursor-pointer pt-1"
                        >
                          <img
                            src={product?.productImageUrl || ""}
                            alt={product?.productName || ""}
                            className="w-[60px] min-w-[60px] h-[60px] object-contain rounded border border-gray-200 max-w-fit"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              (
                                e.currentTarget?.nextSibling as HTMLElement
                              ).style.display = "block";
                            }}
                          />
                          <ImageIcon
                            className="w-[60px] min-w-[60px] h-[60px] text-gray-400"
                            style={{ display: "none" }}
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            onClick={() => goToProduct(setUrl(product.url))}
                            className="font-normal hover:underline cursor-pointer line-clamp-3"
                          >
                            {product?.productName || ""}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("shopping-list.detail.product-table.sku")}:{" "}
                            {product?.skuId || ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <ShoppingListQtyControl
                        product={{
                          id: product.id,
                          quantity: product.quantity,
                        }}
                        onUpdateQuantity={onUpdateQuantity}
                      />
                    </TableCell>
                    <TableCell className="pl-0">
                      <div className="w-16 text-[13px]">
                        {product.quantity}{" "}
                        {product.quantity === 1
                          ? t("common.text.upper-item")
                          : t("common.text.upper-items")}{" "}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.price && product.currencyCode
                        ? formatPrice(product.price, product.currencyCode)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">
                        {product.subtotal && product.currencyCode
                          ? formatPrice(product.subtotal, product.currencyCode)
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItems([product.id], false)}
                        disabled={
                          isDeleting && nowDeleting.includes(product.id)
                        }
                        className="px-0"
                      >
                        {isDeleting && nowDeleting.includes(product.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2
                            className="w-6 h-6 stroke-gray-500"
                            size={24}
                          ></Trash2>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {t("shopping-list.detail.product-table.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
