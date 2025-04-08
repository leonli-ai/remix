import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface SubscriptionOrderCreateFormActionsProps {
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  isLoadingProductVariants: boolean;
  type: "create" | "edit";
}
export default function SubscriptionOrderCreateFormActions({
  onSubmit,
  onBack,
  isLoading,
  isLoadingProductVariants,
  type,
}: SubscriptionOrderCreateFormActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center ">
      <div className="w-full  flex justify-center items-center gap-x-6 gap-y-5 flex-col-reverse lg:flex-row">
        <Button
          type="button"
          variant={"outline"}
          className="w-full lg:w-48 p-0 flex items-center justify-between gap-0 font-bold"
          onClick={onBack}
        >
          <div className="flex-1">
            {t(
              "subscription-orders.create.form.actions.back-to-subscription-orders-list",
            )}
          </div>
        </Button>
        <Button
          type="button"
          variant={null}
          className=" bg-orange-500 hover:bg-orange-600 w-full lg:w-48 text-white font-bold"
          onClick={onSubmit}
          disabled={isLoadingProductVariants || isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : type === "create" ? (
            t("subscription-orders.create.form.actions.create")
          ) : (
            t("subscription-orders.edit.form.actions.update")
          )}
        </Button>
      </div>
    </div>
  );
}
