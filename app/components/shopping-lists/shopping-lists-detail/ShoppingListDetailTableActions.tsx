import { useNavigate } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CornerLeftUp,
  Ellipsis,
  FileSliders,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import { RESUBMIT_QUOTE_ITEMS_STORAGE_KEY } from "~/lib/quote";
import { ShoppingList } from "~/types";
import { ShoppingListItem } from "~/types/shopping-lists/shopping-list-items.schema";
import {
  AddItemsToShoppingListDialog,
  AddItemsToShoppingListDialogRef,
} from "../AddItemsToShoppingListDialog";
import { CreateShoppingListDialog } from "../CreateShoppingListDialog";

interface Props {
  selectedItems: number[];
  products: ShoppingListItem[];
  onRemoveSelected: (skipModal?: boolean) => void;
  isDeleting: boolean;
  shoppingListId: number;
  alignOffset?: number;
}

export function ShoppingListDetailTableActions({
  selectedItems = [],
  products,
  onRemoveSelected,
  isDeleting,
  shoppingListId,
  alignOffset = -16,
}: Props) {
  const { t } = useTranslation();
  const [listItems, setListItems] = useState<any[]>([]);

  const getListItems = () => {
    const availableLines = products.filter((product) =>
      selectedItems.includes(product.id),
    );
    const data = availableLines.map((line) => ({
      productId: line.productId as string,
      productName: line.productName as string,
      productVariantId: line.productVariantId as string,
      skuId: line.skuId as string,
      productImageUrl: line.productImageUrl as string,
      url: line.url as string,
      updatedAt: line.updatedAt as string,
      quantity: line.quantity,
    }));
    return data;
  };
  const [createShoppingListOpen, setCreateShoppingListOpen] = useState(false);
  const [open, setOpen] = useState(false);
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

  const handleOpenAddItemsToShoppingList = () => {
    if (selectedItems.length === 0) {
      return;
    }
    const data = getListItems();
    setListItems(data);
    setOpen(true);
  };

  const handleAddSuccess = () => {
    onRemoveSelected(true);
  };

  const navigate = useNavigate();
  const { addLocalePath } = useAddLocalePath();
  const handleRequestForQuote = () => {
    const getQuoteItems = products.filter((product) =>
      selectedItems.includes(product.id),
    );
    const params = {
      quoteItems: getQuoteItems.map((item) => ({
        sku: item.skuId,
        quantity: item.quantity,
        offerPrice: item.price,
        originalPrice: item.price,
      })),
    };
    navigate(addLocalePath("/apps/customer-account/request-for-quote"), {
      state: {
        quoteItems: JSON.stringify(params),
      },
    });
    sessionStorage.setItem(
      RESUBMIT_QUOTE_ITEMS_STORAGE_KEY,
      JSON.stringify(params),
    );
  };

  return (
    <div className="flex justify-center items-center">
      <CreateShoppingListDialog
        type="create"
        trigger={null}
        onOpenChange={setCreateShoppingListOpen}
        open={createShoppingListOpen}
        submitText={t("shopping-list.detail.table-actions.create-and-add")}
        onSuccess={(res) => {
          if (res) {
            onCreateShoppingListSuccess(res);
          }
        }}
      />
      <AddItemsToShoppingListDialog
        ref={addRef}
        trigger={null}
        products={listItems}
        open={open}
        onOpenChange={setOpen}
        onOpenCreateList={handleCreateShoppingList}
        onAddSuccess={handleAddSuccess}
        shoppingListId={shoppingListId}
        type={"move"}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Ellipsis
            strokeWidth={3}
            className="stroke-blue-800 cursor-pointer"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          alignOffset={alignOffset}
          className="shadow-[0px_4px_30px_0px_rgba(0,0,0,0.25)]"
        >
          <DropdownMenuItem
            className="text-main-color"
            disabled={isDeleting || selectedItems.length === 0}
          >
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onRemoveSelected(false)}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="w-6 h-6 stroke-gray-500" size={24}></Trash2>
              )}
              <span className="font-normal">
                {t("shopping-list.detail.table-actions.delete")}
              </span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-main-color"
            disabled={isDeleting || selectedItems.length === 0}
          >
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleOpenAddItemsToShoppingList}
            >
              <CornerLeftUp
                className="w-6 h-6 stroke-gray-500 stroke-[3]"
                size={24}
              ></CornerLeftUp>
              <span className="font-normal">
                {t("shopping-list.detail.table-actions.move")}
              </span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-main-color"
            disabled={isDeleting || selectedItems.length === 0}
          >
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleRequestForQuote}
            >
              <FileSliders
                className="w-6 h-6 stroke-gray-500 stroke-[3]"
                size={24}
              ></FileSliders>
              <span className="font-normal">
                {t("shopping-list.detail.table-actions.request-for-quote")}
              </span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
