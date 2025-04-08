import { cn, formatPrice } from "~/lib/utils";
import { ShoppingList } from "~/types";
import { useShopifyInformation } from "~/lib/shopify";
import { format } from "date-fns";

import { ShoppingListActions } from "./ShoppingListActions";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import { useTranslation } from "react-i18next";
interface ShoppingListCardProps extends React.HTMLAttributes<HTMLDivElement> {
  shoppingList: ShoppingList;
  onEdit: () => void;
  onDelete: () => void;
  onSetAsDefault: () => void;
}

export default function ShoppingListCard({
  shoppingList,
  onEdit,
  onDelete,
  onSetAsDefault,
  className,
}: ShoppingListCardProps) {
  const { t } = useTranslation();
  const { cartCurrency } = useShopifyInformation();
  const queryClient = useQueryClient();
  const { name, subtotal, currencyCode, items, createdAt, updatedAt } =
    shoppingList;

  const subtotalPrice = formatPrice(
    subtotal?.toString() || "0",
    currencyCode || cartCurrency,
  );

  return (
    <div className={cn("bg-blue-50 rounded-lg p-4 shadow-sm", className)}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div onClick={onEdit} className="cursor-pointer space-y-1">
            <div className="text-primary-text text-sm font-bold">
              {t("shopping-list.list.card.name")}
            </div>
            <div className="break-all text-sm">{name}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-primary-text text-sm font-bold">
            {t("shopping-list.list.card.subtotal")}
          </div>
          <div className="text-primary-text text-sm">{subtotalPrice}</div>
        </div>

        <div className="space-y-1">
          <div className="text-primary-text text-sm font-bold">
            {t("shopping-list.list.card.items")}
          </div>
          <div className="text-primary-text text-sm">{items}</div>
        </div>

        <div className="space-y-1">
          <div className="text-primary-text text-sm font-bold">
            {t("shopping-list.list.card.created-at")}
          </div>
          <div className="text-primary-text text-sm">
            {format(new Date(createdAt), "MM/dd/yyyy")}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-primary-text text-sm font-bold">
            {t("shopping-list.list.card.updated-at")}
          </div>
          <div className="text-primary-text text-sm">
            {format(new Date(updatedAt), "MM/dd/yyyy")}
          </div>
        </div>

        <div className="flex items-end justify-end gap-2">
          <ShoppingListActions
            shoppingListId={shoppingList.id}
            onEdit={() => {}}
            onDelete={onDelete}
            onSetAsDefault={onSetAsDefault}
            isDefault={Boolean(shoppingList?.isDefault)}
            useShoppingListEditDialog={{
              initialValues: {
                shoppingListName: shoppingList.name,
                shoppingListDescription: shoppingList?.description || "",
                isDefault: Boolean(shoppingList?.isDefault),
              },
              onSuccess: () => {
                queryClient.invalidateQueries({
                  queryKey: [QUERY_ALL_SHOPPING_LISTS],
                });
              },
            }}
          ></ShoppingListActions>
        </div>
      </div>
    </div>
  );
}
