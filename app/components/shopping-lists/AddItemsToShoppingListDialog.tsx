import { useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2 } from "lucide-react";
import {
  type ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "sonner";
import { CustomDialog } from "~/components/common/CustomDialog";
import { Checkbox } from "~/components/ui/checkbox";
import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import {
  useGetAllShoppingLists,
  useUpdateShoppingListItems,
} from "~/hooks/use-shopping-lists";
import { useShopifyInformation } from "~/lib/shopify";
import { cn } from "~/lib/utils";
import { type ShoppingList, type ShoppingListFilter } from "~/types";
import { type UpdateShoppingListItem } from "~/types/shopping-lists/shopping-list-items.schema";

import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
interface AddItemsToShoppingListDialogProps {
  trigger: ReactNode;
  products: Omit<UpdateShoppingListItem, "id" | "updatedAt">[];
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  onOpenCreateList?: () => void;
  onAddSuccess?: (res: ShoppingList | ShoppingList[]) => void;
  shoppingListId?: number; // self shopping list id
  type?: "add" | "move";
}

export interface AddItemsToShoppingListDialogRef {
  handleCreateShoppingList: (res: ShoppingList) => void;
  refetchLists: () => void;
}

export const AddItemsToShoppingListDialog = forwardRef<
  AddItemsToShoppingListDialogRef,
  AddItemsToShoppingListDialogProps
>(
  (
    {
      trigger,
      products,
      onOpenChange,
      open,
      onOpenCreateList,
      onAddSuccess,
      shoppingListId,
      type = "add",
    }: AddItemsToShoppingListDialogProps,
    ref,
  ) => {
    const {
      shopifyCustomerId,
      shopifyCompanyLocationId,
      shopifyCompanyId,
      storeName,
    } = useShopifyInformation();

    const { t } = useTranslation();

    const itemsPerPage = 100;

    const [params, setParams] = useState<ShoppingListFilter>({
      customerId: shopifyCustomerId,
      companyLocationId: shopifyCompanyLocationId,
      storeName,
      data: {
        filters: {},
        pagination: {
          page: 1,
          pageSize: itemsPerPage,
        },
        sort: [
          {
            field: "isDefault",
            order: "desc",
          },
          {
            field: "updatedAt",
            order: "desc",
          },
        ],
      },
    });

    const {
      data: shoppingListsData,
      isLoading: isShoppingListsLoading,
      isRefetching: isShoppingListsRefetching,
      refetch,
    } = useGetAllShoppingLists(params, open);

    const successToast = () => {
      if (type === "move") {
        toast.success(
          t("shopping-list.dialog.move-to-shopping-list-success"),
        );
        return;
      }
      toast.success(t("shopping-list.dialog.add-to-shopping-list-success"));
    };

    const errorToast = (error: string) => {
      toast.error(error);
    };

    useEffect(() => {
      if (open) {
        setSelectedList([]);
        refetch();
      }
    }, [open]);

    const { mutateAsync: updateShoppingListItems, isPending: isUpdating } =
      useUpdateShoppingListItems();

    const handleUpdateShoppingListItems = async (listId: number) => {
      return updateShoppingListItems({
        storeName,
        companyLocationId: shopifyCompanyLocationId,
        customerId: shopifyCustomerId,
        shoppingListId: listId,
        companyId: shopifyCompanyId,
        data: {
          listItems: products,
        },
      });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenChange = (open: boolean) => {
      onOpenChange?.(open);
    };

    const queryClient = useQueryClient();

    const handleCreateShoppingList = (res: ShoppingList) => {
      handleUpdateShoppingListItems(res.id)
        .then(() => {
          refetch();
          onOpenChange?.(false);
          successToast();
          onAddSuccess?.(res);
        })
        .catch((error) => {
          errorToast(error.message);
        });
    };

    useImperativeHandle(ref, () => ({
      handleCreateShoppingList,
      refetchLists: refetch,
    }));

    const [selectedList, setSelectedList] = useState<string[]>([]);

    const handleAddToList = async () => {
      try {
        setIsSubmitting(true);

        const updatePromises = selectedList.map((listId) => {
          return updateShoppingListItems({
            storeName,
            companyLocationId: shopifyCompanyLocationId,
            customerId: shopifyCustomerId,
            shoppingListId: Number(listId),
            companyId: shopifyCompanyId,
            data: {
              listItems: products,
            },
          });
        });

        const results = await Promise.all(updatePromises);

        if (results.every((result) => result?.listItems?.length > 0)) {
          successToast();
          onOpenChange?.(false);
          queryClient.invalidateQueries({
            queryKey: [QUERY_ALL_SHOPPING_LISTS],
          });
          onAddSuccess?.(results);
        } else {
          errorToast("Failed to add to shopping list");
        }
      } catch (error) {
        console.error(error);
        errorToast("Failed to add to shopping list");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <CustomDialog
        trigger={trigger}
        title={<></>}
        className="max-w-md gap-0 text-text-color"
        titleClassName="pt-5 !block"
        content={
          <div className="flex max-w-[398px] flex-col gap-6 pb-2">
            <div className="self-center text-lg font-bold">
              {t("shopping-list.dialog.add-to-shopping-list-title")}
            </div>
            <div className="flex max-h-[75vh] flex-col overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar]:w-2">
              {/* Product list area */}
              <div className="mb-8 px-4">
                <div className="flex max-h-72 flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar]:w-2">
                  {products.map((product) => (
                    <div
                      key={product.productVariantId}
                      className="flex items-center space-x-3"
                    >
                      <img
                        src={product.productImageUrl}
                        alt={product.productName}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          (
                            e.currentTarget?.nextSibling as HTMLElement
                          ).style.display = "block";
                        }}
                      />
                      <ImageIcon
                        className="h-16 w-16 text-gray-400"
                        style={{ display: "none" }}
                      />
                      <span className="text-sm">{product.productName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping list area */}
              <div className="flex-1 px-8">
                <div className="max-h-44 space-y-3 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar]:w-2">
                  {isShoppingListsLoading || isShoppingListsRefetching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    shoppingListsData?.shoppingLists.map((list, index) => (
                      <div
                        key={list.id}
                        className={cn(
                          "flex items-center space-x-3 border-b border-gray-200 pb-2",
                          index ===
                            shoppingListsData?.shoppingLists.length - 1 &&
                            "border-b-0",
                        )}
                      >
                        <Checkbox
                          className="h-6 w-6 rounded-sm border border-gray-400 bg-white shadow-none data-[state=checked]:border-blue-400 data-[state=checked]:bg-blue-400 data-[state=checked]:text-white [&>span>svg]:stroke-[4]"
                          checked={selectedList.includes(list.id.toString())}
                          disabled={list.id === shoppingListId}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedList([
                                ...selectedList,
                                list.id.toString(),
                              ]);
                            } else {
                              setSelectedList(
                                selectedList.filter(
                                  (id) => id !== list.id.toString(),
                                ),
                              );
                            }
                          }}
                        />
                        <span className="text-sm text-gray-900">
                          {list.name}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* Action button area */}
            <div className="flex flex-col items-center gap-4 px-8">
              {(shoppingListsData?.shoppingLists.length || 0) > 0 && (
                <Button
                  onClick={handleAddToList}
                  disabled={
                    isSubmitting || isUpdating || selectedList.length === 0
                  }
                  className="h-12 w-full"
                >
                  {isSubmitting || isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    t("shopping-list.dialog.add-to-shopping-list-button")
                  )}
                </Button>
              )}

              <Button
                variant={"outline"}
                disabled={isSubmitting || isUpdating}
                onClick={onOpenCreateList}
                className="h-12 w-full"
              >
                {t("shopping-list.dialog.add-to-shopping-list-create-new-list")}
              </Button>
            </div>
          </div>
        }
        open={open}
        onOpenChange={handleOpenChange}
      ></CustomDialog>
    );
  },
);

AddItemsToShoppingListDialog.displayName = "AddItemsToShoppingListDialog";
