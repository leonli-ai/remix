import { Edit, Eye, Trash } from "lucide-react";
import { cn } from "~/lib/utils";

import { Button } from "../../ui/button";
import type { UserItemInfo } from "~/types/users";
import { useTranslation } from "react-i18next";

interface UserCardProps extends React.HTMLAttributes<HTMLDivElement> {
  userItemInfo: UserItemInfo;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function UserCard({
  userItemInfo,
  onEdit,
  onDelete,
  onView,
  className,
}: UserCardProps) {
  const { t } = useTranslation();
  const { firstName, lastName, email } = userItemInfo.customer;
  const { isMainContact } = userItemInfo;
  return (
    <div
      className={cn("bg-secondary-light rounded-lg p-4 shadow-sm", className)}
    >
      <div className="grid grid-cols-2 gap-y-4">
        <div>
          <div className="text-gray-900 text-sm font-bold">
            {t("user.list.table.first-name")}
          </div>
          <div className="text-gray-900">{firstName}</div>
        </div>
        <div>
          <div className="text-gray-900 text-sm font-bold">
            {t("user.list.table.last-name")}
          </div>
          <div>{lastName}</div>
        </div>
        <div>
          <div className="text-gray-900 text-sm font-bold">
            {t("user.list.table.email")}
          </div>
          <div className="break-words">{email}</div>
        </div>
        <div>
          <div className="text-gray-900 text-sm font-bold">
            {t("user.list.table.main-contact")}
          </div>
          <div>
            {isMainContact ? t("user.list.table.yes") : t("user.list.table.no")}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-start gap-2">
        <Button
          variant="ghost"
          onClick={onView}
          className="p-2 text-main-color rounded-md"
        >
          <Eye className="w-5 h-5" />
          <span>{t("user.list.table.view")}</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onEdit}
          className="p-2 text-main-color rounded-md"
        >
          <Edit className="w-5 h-5" />
          <span>{t("user.list.table.edit")}</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onDelete}
          className="p-2 text-main-color  rounded-md"
        >
          <Trash className="w-5 h-5" />
          <span>{t("user.list.table.delete")}</span>
        </Button>
      </div>
    </div>
  );
}
