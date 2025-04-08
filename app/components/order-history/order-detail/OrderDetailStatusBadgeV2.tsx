import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import _ from "lodash";

interface OrderDetailStatusBadgePropsV2 {
  status: string;
  className?: string;
  badgeClassName?: string;
  type?: "blue" | "gray";
}

const renderI18nStatus = (status: string) => {
  const { t } = useTranslation();
  return t(
    `order-history.detail.information-card.status.${_.kebabCase(status)}`,
  );
};

export default function OrderDetailStatusBadgeV2({
  status,
  badgeClassName,
  className,
  type = "blue",
}: OrderDetailStatusBadgePropsV2) {
  return (
    <div className={cn("flex flex-wrap gap-2 flex-col", className)}>
      <Badge
        key={status}
        className={cn(
          "rounded-full text-white p-[4px_12px] font-bold",
          type === "blue"
            ? "bg-blue-light text-primary-text hover:bg-blue-light"
            : "bg-gray-middle hover:bg-gray-middle",
          badgeClassName,
        )}
      >
        {renderI18nStatus(status)}
        {/* {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} */}
      </Badge>
    </div>
  );
}
