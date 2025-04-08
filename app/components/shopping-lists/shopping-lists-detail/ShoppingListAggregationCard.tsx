import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { QUERY_SHOPPING_LIST_AGGREGATION } from "~/constant/react-query-keys";
import { useAddToCartAjax } from "~/hooks/use-cart";
import {
  useGetShoppingListAggregation,
  useGetShoppingListItems,
} from "~/hooks/use-shopping-lists";
import { extractVariantId } from "~/lib/quick-order";
import { useShopifyInformation } from "~/lib/shopify";
import { formatPrice } from "~/lib/utils";

interface ShoppingListAggregationCardProps {
  shoppingListId: string;
  totalListItemsCount: number;
}

export function ShoppingListAggregationCard({
  shoppingListId,
  totalListItemsCount,
}: ShoppingListAggregationCardProps) {
  const queryClient = useQueryClient();
  const { storeName, shopifyCustomerId, shopifyCompanyLocationId } =
    useShopifyInformation();
  const { data, isLoading, isRefetching } = useGetShoppingListAggregation({
    shoppingListId: Number(shoppingListId),
    customerId: shopifyCustomerId,
    companyLocationId: shopifyCompanyLocationId,
    storeName,
  });

  const { mutateAsync: getShoppingListItems, isPending } =
    useGetShoppingListItems();

  const { mutateAsync: addToCartAjax, isPending: isAddingToCart } =
    useAddToCartAjax();

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_SHOPPING_LIST_AGGREGATION],
    });
  }, []);

  const goToCart = () => {
    window.location.href = `https://${storeName}/cart`;
  };

  const handleAddListToCart = () => {
    getShoppingListItems({
      shoppingListId: Number(shoppingListId),
      customerId: shopifyCustomerId,
      companyLocationId: shopifyCompanyLocationId,
      storeName,
      pagination: {
        page: 1,
        pageSize: totalListItemsCount,
      },
      sort: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    })
      .then((res) => {
        const items = (res?.shoppingList?.listItems || [])?.map((item) => ({
          id: Number(extractVariantId(item.productVariantId)),
          quantity: item.quantity,
        }));
        if (items.length === 0) {
          toast.error("Please add at least one item.");
          return;
        }
        addToCartAjax(items)
          .then((res) => {
            if (res?.items) {
              toast.success(
                `Add ${res?.items ? res?.items?.length : ""} items to cart success`,
                {
                  description: (
                    <div className="flex flex-col gap-1">
                      <span>Add to cart success</span>
                      <div
                        onClick={goToCart}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        View cart
                      </div>
                    </div>
                  ),
                },
              );
            } else {
              toast.error(`Add to cart failed, ${res?.message}`);
            }
          })
          .catch((error) => {
            toast.error(`Add to cart failed, ${error?.message}`);
          });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Add list to cart failed");
      });
  };

  return (
    <div className="flex flex-col gap-2 border rounded-lg p-4 bg-gray-50 h-fit min-w-48">
      <div className="flex flex-col gap-2">
        <div className="text-gray-900 font-bold text-lg">Summary</div>
        <div className="flex justify-between text-gray-900 text-sm">
          <div>Item Count: </div>
          <div>
            {isLoading || isRefetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `${data?.summary?.totalItemCount || 0} items`
            )}
          </div>
        </div>
        <div className="flex justify-between text-gray-900 text-sm">
          <div>Subtotal: </div>
          <div>
            {isLoading || isRefetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              formatPrice(
                data?.summary?.subtotal || 0,
                data?.summary?.currencyCode || "USD",
              )
            )}
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex justify-between text-gray-900 text-sm font-bold">
        <div>Total</div>
        <div>
          {isLoading || isRefetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            formatPrice(
              data?.summary?.subtotal || 0,
              data?.summary?.currencyCode || "",
            )
          )}
        </div>
      </div>

      <Button
        className="h-[44px] mt-2"
        onClick={handleAddListToCart}
        disabled={isPending || isAddingToCart || totalListItemsCount === 0}
      >
        {isPending || isAddingToCart ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Add List to Cart"
        )}
      </Button>
    </div>
  );
}
