import listIcon from "~/assets/icons/list.svg";
import { useTranslation } from "react-i18next";
import { CircleAlert } from "lucide-react";
interface QuickOrderListHeadProps {
  showWarning: boolean;
}

export function QuickOrderListHead({ showWarning }: QuickOrderListHeadProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-4 text-grey-dark">
        <img src={listIcon} alt="list icon" className="w-6 h-6" />
        <h2 className="font-bold">{t("quick-order.list-head-title")}</h2>
      </div>
      {showWarning && (
        <div className="flex items-center gap-2 mb-4 text-warning">
          <CircleAlert className="w-5 h-5" />
          <span className="text-sm">
            {t("quick-order.list-head-warning")}
          </span>
        </div>
      )}
    </div>
  );
}
