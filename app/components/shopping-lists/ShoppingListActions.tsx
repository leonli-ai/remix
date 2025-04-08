import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Check, Pencil, Trash2 } from "lucide-react";
import { CreateShoppingListDialog } from "./CreateShoppingListDialog";
import { useState } from "react";
import Ellipsis from "../icons/Ellipsis";
import { useTranslation } from "react-i18next";

interface ShoppingListActionsProps {
  shoppingListId: number;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetAsDefault: () => void;
  useShoppingListEditDialog?: {
    initialValues: {
      shoppingListName: string;
      shoppingListDescription: string;
      isDefault: boolean;
    };
    onSuccess: (res: any) => void;
  };
  icon?: React.ReactNode;
  align?: "start" | "end" | "center";
  alignOffset?: number;
}

export function ShoppingListActions({
  shoppingListId,
  isDefault,
  onEdit,
  onDelete,
  onSetAsDefault,
  useShoppingListEditDialog,
  icon,
  align = "end",
  alignOffset = 0,
}: ShoppingListActionsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const handleEdit = () => {
    if (useShoppingListEditDialog) {
      setOpen(true);
    } else {
      onEdit();
    }
  };
  return (
    <div className="flex justify-end">
      {useShoppingListEditDialog && (
        <CreateShoppingListDialog
          trigger={<></>}
          title={t("shopping-list.list.actions.edit-dialog-title")}
          type="edit"
          initialValues={useShoppingListEditDialog.initialValues}
          shoppingListId={shoppingListId}
          onSuccess={useShoppingListEditDialog.onSuccess}
          open={open}
          onOpenChange={setOpen}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {icon || (
            <Button variant="ghost" size="icon" className="text-outline">
              <Ellipsis width={20} height={20} className="!w-5 !h-5" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          alignOffset={alignOffset}
          className="shadow-[0px_4px_30px_0px_rgba(0,0,0,0.25)] p-6 space-y-5"
        >
          <DropdownMenuItem className="text-main-color p-0">
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-5"
              onClick={handleEdit}
            >
              {/* <Edit /> */}
              <Pencil strokeWidth={3} />
              <span className="font-normal">
                {t("shopping-list.list.actions.edit")}
              </span>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-main-color p-0 h-5">
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-5"
              onClick={onDelete}
            >
              <Trash2 strokeWidth={3}></Trash2>
              <span className="font-normal">
                {t("shopping-list.list.actions.delete")}
              </span>
            </Button>
          </DropdownMenuItem>
          {!isDefault && (
            <DropdownMenuItem className="text-main-color p-0 h-5">
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-5"
                onClick={onSetAsDefault}
              >
                <Check strokeWidth={3}></Check>
                <span className="font-normal">
                  {t("shopping-list.list.actions.set-as-default")}
                </span>
              </Button>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
