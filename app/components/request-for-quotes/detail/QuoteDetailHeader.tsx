import { useParams } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
interface QuoteDetailHeaderProps {
  title?: string;
  link?: string;
}

export default function QuoteDetailHeader({
  title,
  link,
}: QuoteDetailHeaderProps) {
  const { id } = useParams();
  const { t } = useTranslation();
  const goBack = () => {
    window.history.back();
  };
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center w-full gap-4 pb-2">
        <div
          className="text-primary-main font-bold flex items-center gap-0 cursor-pointer text-sm no-print"
          onClick={goBack}
        >
          <ChevronLeft size={28} strokeWidth={3} />
          {t("common.text.back")}
        </div>
        <div className="text-2xl font-bold">
          {title || t("request-for-quote.detail.title-with-id", { id })}
        </div>
      </div>
    </div>
  );
}
