import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

export const UserInfo = ({ customerData }: { customerData: any }) => {
  const { t } = useTranslation();
  return (
    <div className="">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6" />
        <h2 className="text-lg font-semibold">
          {t("user.details.account-info")}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-sm text-gray-600">
              {t("user.details.name")}:
            </label>
            <div className="mt-1">{`${customerData.firstName ?? ""} ${customerData.lastName ?? ""}`}</div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600">
              {t("user.details.email")}:
            </label>
            <div className="mt-1">{customerData.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-600">
              {t("user.details.company")}:
            </label>
            <div className="mt-1">{customerData.company}</div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600">
              {t("user.details.main-contact")}:
            </label>
            <div className="mt-1">
              {customerData.isMainContact
                ? t("common.text.yes")
                : t("common.text.no")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
