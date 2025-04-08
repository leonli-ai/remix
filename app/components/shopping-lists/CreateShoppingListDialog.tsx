import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useCreateShoppingList,
  useUpdateShoppingList,
} from "~/hooks/use-shopping-lists";
import { useShopifyInformation } from "~/lib/shopify";
import {
  type CreateShoppingListResponse,
  type UpdateShoppingListResponse,
} from "~/types/shopping-lists/shopping-lists.schema";
import { CustomDialog } from "../common/CustomDialog";
import {
  ShoppingListForm,
  type ShoppingListFormRef,
  type ShoppingListFormValues,
} from "./ShoppingListForm";
import { t } from "i18next";
interface CreateShoppingListDialogProps {
  trigger: ReactNode;
  onSuccess: (
    res?: CreateShoppingListResponse | UpdateShoppingListResponse,
  ) => void;
  type: "create" | "edit";
  shoppingListId?: number;
  title?: string;
  submitText?: string;
  initialValues?: ShoppingListFormValues;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateShoppingListDialog({
  trigger,
  onSuccess,
  type,
  shoppingListId,
  title = t("shopping-list.dialog.create-shopping-list-dialog-title"),
  submitText = type === "create"
    ? t("shopping-list.dialog.create-shopping-list-dialog-button-create")
    : t("shopping-list.dialog.create-shopping-list-dialog-button-update"),
  initialValues,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateShoppingListDialogProps) {
  const { shopifyCustomerId, shopifyCompanyLocationId, storeName } =
    useShopifyInformation();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const ref = useRef<ShoppingListFormRef>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    controlledOnOpenChange?.(newOpen);
  };

  const { mutateAsync: createShoppingList, isPending: isCreating } =
    useCreateShoppingList();
  const { mutateAsync: updateShoppingList, isPending: isUpdating } =
    useUpdateShoppingList();

  const handleSubmit = (values: ShoppingListFormValues) => {
    const mutation =
      type === "create" ? createShoppingList : updateShoppingList;
    const payload = {
      storeName,
      customerId: shopifyCustomerId,
      companyLocationId: shopifyCompanyLocationId,
      data: {
        shoppingListName: values.shoppingListName,
        description: values.shoppingListDescription,
        isDefault: !!values?.isDefault,
      },
      ...(type === "edit" && { id: shoppingListId }),
    };

    mutation(payload)
      .then((res) => {
        onSuccess(res?.shoppingList);
        toast.success(() => {
          return (
            <div>
              {t("shopping-list.dialog.create-shopping-list-success-1")}
              The shopping list{" "}
              <strong>'{payload.data.shoppingListName}'</strong> {type === "create" ? t("shopping-list.dialog.create-shopping-list-success-2") : t("shopping-list.dialog.create-shopping-list-success-3")}
            </div>
          );
        });
        setOpen(false);
      })
      .catch((error) => {
        if (error?.message?.includes("already exists")) {
          ref.current?.setError("shoppingListName", {
            message: "A shopping list with this name already exists",
            type: "manual",
          });
        } else {
          toast.error(error.message);
        }
      });
  };

  const dialogContent = (
    <ShoppingListForm
      ref={ref}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      isLoading={isCreating || isUpdating}
      submitText={submitText}
      type={type}
      onCancel={() => setOpen(false)}
      title={title}
    />
  );

  return (
    <CustomDialog
      trigger={trigger}
      title={<></>}
      content={dialogContent}
      className="max-w-md gap-0"
      titleClassName="!block"
      open={open}
      onOpenChange={setOpen}
    />
  );
}
