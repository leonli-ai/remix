import { Button } from "~/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import type { ShoppingList } from "~/types";
import type { QuickOrderFormSchema } from "~/types/quick-order";

import type { AddItemsToShoppingListDialogRef } from "../shopping-lists/AddItemsToShoppingListDialog";
import { AddItemsToShoppingListDialog } from "../shopping-lists/AddItemsToShoppingListDialog";
import { CreateShoppingListDialog } from "../shopping-lists/CreateShoppingListDialog";
import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
interface QuickOrderActionButtonsProps {
  values: QuickOrderFormSchema["productLines"];
  onAddToCart?: () => void;
  onAddToList?: () => void;
  onCreateNewList?: () => void;
  isLoading?: boolean;
}

export function QuickOrderActionButtons({
  values,
  onAddToCart,
  onAddToList,
  onCreateNewList,
  isLoading,
}: QuickOrderActionButtonsProps) {
  const { t } = useTranslation();

  const handleCreateOrder = () => {
    if (onAddToCart) {
      onAddToCart();
    }
  };

  const [listItems, setListItems] = useState<any[]>([]);

  const getListItems = () => {
    const availableLines = Object.values(values).filter(
      (line) => line.product.variantId,
    );
    const data = availableLines.map((line) => ({
      productId: line.product.id as string,
      productName: line.product.originalName as string,
      productVariantId: line.product.variantId as string,
      skuId: line.product.sku as string,
      productImageUrl: line.product.image as string,
      url: line.product.onlineStoreUrl as string,
      updatedAt: line.product.updatedAt as string,
      quantity: line.quantity,
    }));
    return data;
  };

  const [open, setOpen] = useState(false);
  const [createShoppingListOpen, setCreateShoppingListOpen] = useState(false);

  const onOpenChange = (open: boolean) => {
    const res = onAddToList?.();
    if (!res) {
      setOpen(false);
      return;
    }
    if (open) {
      const data = getListItems();
      setListItems(data);
    }
    setOpen(open);
  };

  const addRef = useRef<AddItemsToShoppingListDialogRef>(null);
  const queryClient = useQueryClient();
  const onCreateShoppingListSuccess = (res: ShoppingList) => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_ALL_SHOPPING_LISTS],
    });
    addRef.current?.handleCreateShoppingList(res);
  };

  const handleCreateShoppingList = () => {
    setCreateShoppingListOpen(true);
    setOpen(false);
  };

  return (
    <div className="mt-4 flex justify-center items-center ">
      <div className="w-full  flex justify-center items-center gap-x-6 gap-y-5 flex-col-reverse lg:flex-row">
        <CreateShoppingListDialog
          type="create"
          trigger={null}
          onOpenChange={setCreateShoppingListOpen}
          open={createShoppingListOpen}
          submitText={t("quick-order.table.create-and-add-button")}
          onSuccess={(res) => {
            if (res) {
              onCreateShoppingListSuccess(res);
            }
          }}
        />
        <AddItemsToShoppingListDialog
          ref={addRef}
          trigger={
            <Button
              type="button"
              variant={"outline"}
              className="w-full lg:w-48 p-0 flex items-center justify-between gap-0 font-bold"
            >
              <div className="flex-1">
                {t("quick-order.table.add-to-list-button")}
              </div>
            </Button>
          }
          products={listItems}
          open={open}
          onOpenChange={onOpenChange}
          onOpenCreateList={handleCreateShoppingList}
        />
        <Button
          type="button"
          variant={null}
          className=" bg-orange-500 hover:bg-orange-600 w-full lg:w-48 text-white font-bold"
          onClick={handleCreateOrder}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            t("quick-order.table.add-to-cart-button")
          )}
        </Button>
      </div>
    </div>
  );
}
