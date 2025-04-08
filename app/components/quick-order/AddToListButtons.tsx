import { Button } from "~/components/ui/button";
import { useRef, useState } from "react";
import { ShoppingList } from "~/types";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import {
  AddItemsToShoppingListDialog,
  AddItemsToShoppingListDialogRef,
} from "../shopping-lists/AddItemsToShoppingListDialog";
import { CreateShoppingListDialog } from "../shopping-lists/CreateShoppingListDialog";
import { useTranslation } from "react-i18next";
interface AddToListButtonsProps {
  listItems: any[];
  onAddToList?: () => void;
  onAddToListOpenChange?: (open: boolean) => void;
}

export function AddToListButtons({
  listItems,
  onAddToList,
  onAddToListOpenChange,
}: AddToListButtonsProps) {
  const [open, setOpen] = useState(false);
  const [createShoppingListOpen, setCreateShoppingListOpen] = useState(false);
  const addRef = useRef<AddItemsToShoppingListDialogRef>(null);
  const queryClient = useQueryClient();

  const onOpenChange = (open: boolean) => {
    const res = onAddToList?.();
    if (!res) {
      setOpen(false);
      return;
    }
    setOpen(open);
  };

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

  const { t } = useTranslation();

  return (
    <>
      <CreateShoppingListDialog
        type="create"
        trigger={null}
        onOpenChange={setCreateShoppingListOpen}
        open={createShoppingListOpen}
        onSuccess={(res) => {
          if (res) {
            onCreateShoppingListSuccess(res);
          }
        }}
        submitText={t(
          "shopping-list.add-to-list.add-to-shopping-list-button-create-and-add",
        )}
      />
      <AddItemsToShoppingListDialog
        ref={addRef}
        trigger={
          <Button type="button" variant={"outline"}>
            <div className="flex-1">
              {t("shopping-list.add-to-list.add-to-shopping-list-button")}
            </div>
          </Button>
        }
        products={listItems}
        open={open}
        onOpenChange={onOpenChange}
        onOpenCreateList={handleCreateShoppingList}
      />
    </>
  );
}
