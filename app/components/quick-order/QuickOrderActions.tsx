import { Button } from "~/components/ui/button";
import { initialProductLines } from "~/lib/quick-order";
import type { UseFormReturn } from "react-hook-form";
import type { QuickOrderFormSchema } from "~/types/quick-order";
import { useTranslation } from "react-i18next";
import { Trash2, Plus } from "lucide-react";

interface QuickOrderListActionsProps {
  form: UseFormReturn<QuickOrderFormSchema>;
  onAddMoreLines: () => void;
  cleanAll?: () => void;
  isLoadingProductVariants: boolean;
}

export function QuickOrderListActions({
  form,
  onAddMoreLines,
  cleanAll,
  isLoadingProductVariants,
}: QuickOrderListActionsProps) {
  const { t } = useTranslation();

  const handleCleanAll = () => {
    if (cleanAll) {
      cleanAll();
    } else {
      form.reset();
      form.setValue("productLines", initialProductLines());
    }
  };
  return (
    <div className="flex items-center justify-between">
      <Button
        variant={null}
        type="button"
        className="text-primary-main flex items-center gap-1 py-3 pl-2 font-bold"
        onClick={onAddMoreLines}
        disabled={isLoadingProductVariants}
      >
        <span className="text-lg">
          <Plus className="!size-5" strokeWidth={3} />
        </span>{" "}
        {t("quick-order.table.add-more-products")}
      </Button>
      <Button
        variant={null}
        type="button"
        className="flex items-center gap-1 text-gray-middle font-bold py-3 pr-2"
        onClick={handleCleanAll}
        disabled={isLoadingProductVariants}
      >
        <Trash2 className="!size-5" strokeWidth={2} />
        {t("quick-order.table.clean-all")}
      </Button>
    </div>
  );
}
