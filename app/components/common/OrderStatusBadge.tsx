import _ from "lodash";
import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export const statusConfig: Record<
  string,
  { label: string; variant: "secondary" | "warning" | "success" }
> = {
  INVOICE_SENT: { label: "Pending Approval", variant: "warning" },
  OPEN: { label: "Pending Approval", variant: "warning" },
  rejected: { label: "Declined", variant: "warning" },
  approved: { label: "Pending Approval", variant: "warning" },
  "po automation": { label: "Pending Approval", variant: "warning" },
};

interface OrderStatusBadgeProps {
  status: keyof typeof statusConfig;
  className?: string;
}

const renderI18nLabel = (status: keyof typeof statusConfig) => {
  const { t } = useTranslation();
  return t(`draft-order.list.table.status-${_.kebabCase(status)}-label`);
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const checkType = () => {
    return config?.label === "Pending Approval";
  };

  return (
    <Badge
      className={cn(
        "rounded-full text-white p-[4px_12px] font-bold w-fit flex items-center justify-center",
        checkType()
          ? "bg-blue-light text-primary-text hover:bg-blue-light"
          : "bg-gray-middle hover:bg-gray-middle",
      )}
    >
      {renderI18nLabel(status)}
    </Badge>
  );
}
