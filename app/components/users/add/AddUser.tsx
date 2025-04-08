import { useNavigate } from "@remix-run/react";
import { ArrowLeft, Users } from "lucide-react";
import { UserForm } from "./UserForm";
import { useTranslation } from "react-i18next";
import {useAddLocalePath} from '~/hooks/utils.hooks';

export default function AddUser() {
  const navigate = useNavigate();
  const {addLocalePath} = useAddLocalePath()
  const { t } = useTranslation();
  return (
    <div className="w-full">
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-8 flex items-center">
        <Users className="h-6 w-6 mr-1" />
        {t("user.add.title")}
      </h1>

      {/* Back Button */}
      <div
        onClick={() =>
          navigate(addLocalePath("/apps/customer-account/company-management/customer"))
        }
        className="inline-flex items-center text-sm mb-6 cursor-pointer text-outline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t("user.add.back-to-user-list")}
      </div>

      <UserForm />
    </div>
  );
}
