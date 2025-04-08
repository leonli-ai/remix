import { useCallback, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import SubscriptionOrderCreateInformationForm, {
  type SubscriptionOrderCreateInformationFormRef,
} from "~/components/subscription-orders/create/SubscriptionOrderCreateInformationForm";
import RecommendForYou from "~/components/subscription-orders/recommend-for-you/RecommendForYou";
import { SubscriptionOrderContext } from "~/context/subscription-order.context";
import { cn } from "~/lib/utils";

export function SubsciptionCreateOrder({ className }: { className?: string }) {
  const { t } = useTranslation();
  const context = useContext(SubscriptionOrderContext);

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

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <h1 className="text-2xl font-bold">
        {t("subscription-orders.create.title")}
      </h1>
      <SubscriptionOrderCreateInformationForm ref={ref} type="create" />
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
