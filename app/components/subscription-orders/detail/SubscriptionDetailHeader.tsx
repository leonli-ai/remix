import { useNavigate } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAddLocalePath } from "~/hooks/utils.hooks";

interface SubscriptionDetailHeaderProps {
  title?: string;
  link?: string;
}

export default function SubscriptionDetailHeader({
  title,
  link,
}: SubscriptionDetailHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addLocalePath } = useAddLocalePath();

  const goBack = () => {
    navigate(
      addLocalePath(link || "/apps/customer-account/subscription-orders"),
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex w-full items-center gap-4 pb-2">
        <div
          className="no-print flex cursor-pointer items-center gap-0 text-sm font-bold text-primary-main"
          onClick={goBack}
        >
          <ChevronLeft size={28} strokeWidth={3} />
          {t("common.text.back")}
        </div>
        <div className="text-2xl font-bold">
          {title || t("subscription-orders.detail.header.title")}
        </div>
      </div>
    </div>
  );
}
