import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface RequestForQuoteCreateFormActionsProps {
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  isLoadingProductVariants: boolean;
}
export default function RequestForQuoteCreateFormActions({
  onSubmit,
  onBack,
  isLoading,
  isLoadingProductVariants,
}: RequestForQuoteCreateFormActionsProps) {
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
            {t("request-for-quote.create.back-to-request-for-quote-list")}
          </div>
        </Button>
        <Button
          type="button"
          variant={null}
          className=" bg-orange-500 hover:bg-orange-600 w-full lg:w-48 text-white font-bold"
          onClick={onSubmit}
          disabled={isLoadingProductVariants}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            t("request-for-quote.create.create")
          )}
        </Button>
      </div>
    </div>
  );
}
