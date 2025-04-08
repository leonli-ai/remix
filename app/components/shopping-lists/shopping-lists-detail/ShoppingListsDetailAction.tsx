import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useAddToCartAjax } from "~/hooks/use-cart";
import { extractVariantId } from "~/lib/quick-order";
import { useShopifyInformation } from "~/lib/shopify";
import { ShoppingListItem } from "~/types/shopping-lists/shopping-list-items.schema";
import { useTranslation } from "react-i18next";
interface ShoppingListDetailActionsProps {
  selectedItems: number[];
  products: ShoppingListItem[];
}

export function ShoppingListDetailActions({
  selectedItems,
  products,
}: ShoppingListDetailActionsProps) {
  const { t } = useTranslation();
  const { mutateAsync: addToCartAjax, isPending: isAddingToCart } =
    useAddToCartAjax();
  const { storeName } = useShopifyInformation();

  const goToCart = () => {
    window.location.href = `https://${storeName}/cart`;
  };

  const addToCart = async () => {
    const selectedProducts = products.filter((product) =>
      selectedItems.includes(product.id),
    );
    const items = selectedProducts.map((product) => ({
      id: Number(extractVariantId(product.productVariantId)),
      quantity: product.quantity,
    }));
    if (items.length === 0) return;
    addToCartAjax(items)
      .then((res) => {
        if (res?.items) {
          toast.success(
            t("shopping-list.detail.actions.add-to-cart-success", {
              count: res?.items ? res?.items?.length : "",
            }),
            {
              description: (
                <div className="flex flex-col gap-1">
                  <span>
                    {t("shopping-list.detail.actions.add-to-cart-success", {
                      count: res?.items ? res?.items?.length : "",
                    })}
                  </span>
                  <div
                    onClick={goToCart}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    {t("shopping-list.detail.actions.view-cart")}
                  </div>
                </div>
              ),
            },
          );
        } else {
          toast.error(
            t("shopping-list.detail.actions.add-to-cart-error", {
              error: res?.message,
            }),
          );
        }
      })
      .catch((error) => {
        toast.error(
          t("shopping-list.detail.actions.add-to-cart-error", {
            error: error?.message,
          }),
        );
      });
  };

  return (
    <div className="flex justify-end items-center gap-2 my-5 bg-gray-base rounded-lg p-5 border border-grey-light">
      <div className="text-sm text-primary-text mr-5">
        {t("shopping-list.detail.actions.selected")}{" "}
        <span className="font-bold ml-2">
          {selectedItems.length}{" "}
          {selectedItems.length === 1
            ? t("common.text.item")
            : t("common.text.items")}
        </span>
      </div>
      <Button
        onClick={addToCart}
        disabled={isAddingToCart || selectedItems.length === 0}
        className="font-bold h-11 rounded-[5px] px-4 lg:min-w-52 text-sm"
      >
        {isAddingToCart ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t("shopping-list.detail.actions.add-to-cart")
        )}
      </Button>
    </div>
  );
}
