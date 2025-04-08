import { ChevronDown, ChevronLeft, Edit, Ellipsis } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CreateShoppingListDialog } from "../CreateShoppingListDialog";
import { cn } from "~/lib/utils";
import { ShoppingListWithItems } from "~/types/shopping-lists/shopping-list-items.schema";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import { useNavigate } from "@remix-run/react";
import { Separator } from "~/components/ui/separator";
import { ShoppingListActions } from "../ShoppingListActions";
import {
  useDeleteShoppingList,
  useUpdateShoppingList,
} from "~/hooks/use-shopping-lists";
import { useShopifyInformation } from "~/lib/shopify";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {useAddLocalePath} from '~/hooks/utils.hooks';

interface ShoppingListDetailHeaderProps {
  detail: ShoppingListWithItems;
  shoppingListId: number;
  setDetail: (detail: ShoppingListWithItems) => void;
}
export function ShoppingListDetailHeader({
  detail,
  shoppingListId,
  setDetail,
}: ShoppingListDetailHeaderProps) {
  const { t } = useTranslation();
  const { storeName, shopifyCustomerId, shopifyCompanyLocationId } =
    useShopifyInformation();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {addLocalePath} = useAddLocalePath()
  const goBack = () => {
    navigate(addLocalePath("/apps/customer-account/shopping-lists"));
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [isDefault, setIsDefault] = useState(detail?.isDefault);

  const { mutateAsync: deleteShoppingList, isPending: isDeleting } =
    useDeleteShoppingList();
  const { mutateAsync: updateShoppingList } = useUpdateShoppingList();

  const handleDelete = () => {
    const filter = {
      storeName,
      customerId: shopifyCustomerId,
      companyLocationId: shopifyCompanyLocationId,
    };
    deleteShoppingList({ id: shoppingListId, ...filter })
      .then(() => {
        toast.success(t("shopping-list.detail.delete-success"), {
          description: t("shopping-list.detail.delete-success-description"),
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_ALL_SHOPPING_LISTS],
        });
        setShowDeleteDialog(false);
        goBack();
      })
      .catch((error) => {
        toast.error(t("shopping-list.detail.delete-failed"), {
          description: t("shopping-list.detail.delete-failed-description"),
        });
      });
  };

  const handleSetAsDefault = () => {
    const filter = {
      storeName,
      customerId: shopifyCustomerId,
      companyLocationId: shopifyCompanyLocationId,
    };
    updateShoppingList({
      id: shoppingListId,
      ...filter,
      data: { isDefault: true },
    })
      .then(() => {
        toast.success(t("shopping-list.detail.set-default-success"), {
          description: t(
            "shopping-list.detail.set-default-success-description",
          ),
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_ALL_SHOPPING_LISTS],
        });
        setIsDefault(true);
      })
      .catch(() => {
        toast.error(t("shopping-list.detail.set-default-failed"), {
          description: t("shopping-list.detail.set-default-failed-description"),
        });
      });
  };

  return (
    <div className="flex justify-between items-center pb-2 border-b">
      <div className="flex items-center gap-4 max-w-[80%] flex-1">
        <div
          className="text-primary-main font-bold flex items-center gap-0 cursor-pointer text-sm"
          onClick={goBack}
        >
          <ChevronLeft size={24} strokeWidth={3} />
          {t("common.text.back")}
        </div>
        <div className="text-lg font-bold text-text-color !leading-none break-words max-w-[60%]">
          <div className="break-words">{detail?.name}</div>
          <div className="text-sm text-muted-foreground flex-1 lg:max-w-96 overflow-hidden text-ellipsis whitespace-nowrap block lg:hidden">
            {detail?.description}
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex-1 lg:max-w-96 overflow-hidden text-ellipsis whitespace-nowrap app-hidden lg:block">
          {detail?.description}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <ShoppingListActions
          icon={
            <Button
              variant={"ghost"}
              className="text-outline w-auto pr-0 hover:bg-transparent"
            >
              <Ellipsis strokeWidth={4} className="stroke-blue-800" />
              <ChevronDown size={16} className="stroke-blue-800" />
            </Button>
          }
          onDelete={() => setShowDeleteDialog(true)}
          onEdit={() => {}}
          onSetAsDefault={handleSetAsDefault}
          isDefault={isDefault}
          shoppingListId={shoppingListId}
          useShoppingListEditDialog={{
            initialValues: {
              shoppingListName: detail?.name || "",
              shoppingListDescription: detail?.description || "",
              isDefault: isDefault,
            },
            onSuccess: (res) => {
              const newDetail = {
                ...detail,
                name: res?.name,
                description: res?.description,
                isDefault: res?.isDefault,
              };
              setIsDefault(res?.isDefault);
              setDetail(newDetail);
              queryClient.invalidateQueries({
                queryKey: [QUERY_ALL_SHOPPING_LISTS],
              });
            },
          }}
          alignOffset={-20}
        ></ShoppingListActions>
      </div>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("shopping-list.detail.confirm-delete-list-title")}
        description={t("shopping-list.detail.confirm-delete-list-description")}
        onCancel={() => setShowDeleteDialog(false)}
        onOK={handleDelete}
        okText={t("shopping-list.detail.confirm-delete-list-ok-button")}
        okDisabled={isDeleting}
        okLoading={isDeleting}
      />
      {/* <p className="text-sm text-muted-foreground">{detail?.description}</p> */}
    </div>
  );
}
