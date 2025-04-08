import { useNavigate } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {useAddLocalePath} from '~/hooks/utils.hooks';
interface OrderDetailHeaderV2Props {
  title?: string;
  link?: string;
}

export default function OrderDetailHeaderV2({
  title,
  link,
}: OrderDetailHeaderV2Props) {
  const navigate = useNavigate();
  const {addLocalePath} = useAddLocalePath()
  const { t } = useTranslation();
  const goBack = () => {
    navigate(addLocalePath(link || "/apps/customer-account/order-history"));
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
          {title || t("order-history.detail.title")}
        </div>
      </div>
    </div>
  );
}
