import _ from "lodash";
import { Loader2 } from "lucide-react";
import { useCallback, useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "@remix-run/react";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import SubscriptionOrderCreateInformationForm, {
  type SubscriptionOrderCreateInformationFormRef,
} from "~/components/subscription-orders/create/SubscriptionOrderCreateInformationForm";
import RecommendForYou from "~/components/subscription-orders/recommend-for-you/RecommendForYou";
import { SubscriptionOrderContext } from "~/context/subscription-order.context";
import { useGetSubscriptionOrderById } from "~/hooks/use-subscription-orders";
import { useShopifyInformation } from "~/lib/shopify";
import { cn } from "~/lib/utils";

export function SubscriptionEditOrder({
  className,
  id,
}: {
  className?: string;
  id: string;
}) {
  const { t } = useTranslation();
  const { storeName, shopifyCustomerId } = useShopifyInformation();
  const context = useContext(SubscriptionOrderContext);
  const navigate = useNavigate();
  const { addLocalePath } = useAddLocalePath();

  const ref = useRef<SubscriptionOrderCreateInformationFormRef>(null);

  const handleAddRecommendedProductAtForm = (skus: string[]) => {
    ref.current?.handleAddRecommendedProductAtForm(
      skus,
      context?.companyLocationId || "",
      {
        addType: "to-the-end",
        cleanStorage: true,
      },
    );
  };

  const {
    data: subscriptionOrder,
    isLoading: isLoadingSubscriptionOrder,
    status,
  } = useGetSubscriptionOrderById({
    id: _.toNumber(id),
    storeName: storeName,
    customerId: shopifyCustomerId,
  });

  useEffect(() => {
    if (status === "error") {
      toast.error(t("subscription-orders.edit.error.no-order-data"));
      navigate(addLocalePath("/apps/customer-account/subscription-orders"));
    }
  }, [status]);

  if (isLoadingSubscriptionOrder) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <h1 className="text-2xl font-bold">
        {t("subscription-orders.edit.title")}
      </h1>
      <SubscriptionOrderCreateInformationForm
        ref={ref}
        type="edit"
        editData={subscriptionOrder}
      />
      <RecommendForYou
        handleAddRecommendedProductAtForm={handleAddRecommendedProductAtForm}
        companyLocationId={context?.companyLocationId || undefined}
        isAddingRecommendedProduct={context?.isAddingRecommendedProduct}
        isAddingRecommendedProductSkus={
          context?.isAddingRecommendedProductSkus || []
        }
      />
    </div>
  );
}
