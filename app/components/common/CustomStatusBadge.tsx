import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import _ from "lodash";

type CustomStatusBadgeType =
  | "blue"
  | "secondary-blue"
  | "deep-blue"
  | "gray"
  | "success";

interface CustomStatusBadgePropsV2 {
  status: string;
  className?: string;
  badgeClassName?: string;
  type?: CustomStatusBadgeType;
}

const renderI18nStatus = (status: string) => {
  const { t } = useTranslation();
  return t(`common.status.${_.kebabCase(status)}`);
};

const getBadgeColor = (type: CustomStatusBadgeType) => {
  if (type === "blue")
    return "bg-blue-light text-primary-text hover:bg-blue-light";
  if (type === "gray") return "bg-gray-middle hover:bg-gray-middle";
  if (type === "success") return "bg-success hover:bg-success";
  if (type === "deep-blue") return "bg-blue-900 text-white hover:bg-blue-900";
  if (type === "secondary-blue")
    return "bg-secondary-main text-white hover:bg-secondary-main";
};

export default function CustomStatusBadgeV2({
  status,
  badgeClassName,
  className,
  type = "blue",
}: CustomStatusBadgePropsV2) {
  return (
    <div className={cn("flex flex-wrap gap-2 flex-col", className)}>
      <Badge
        key={status}
        className={cn(
          "rounded-full text-white p-[4px_12px] font-bold",
          getBadgeColor(type),
          badgeClassName,
        )}
      >
        {renderI18nStatus(status)}
      </Badge>
    </div>
  );
}
