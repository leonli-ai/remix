import { PropsWithChildren } from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface OrderDetailStatusBadgeProps extends PropsWithChildren {
  statusArray: string[];
  className?: string;
  badgeClassName?: string;
}

const statusVariantMap: Record<
  string,
  {
    variant: "default" | "secondary" | "warning" | "success";
    className?: string;
  }
> = {
  open: {
    variant: "default",
    className: "text-white bg-outline hover:bg-outline",
  },
  cancelled: { variant: "secondary" },
  paid: { variant: "success" },
  expired: { variant: "secondary" },
  fulfilled: { variant: "success" },
  pending: { variant: "warning" },
  unfulfilled: { variant: "warning" },
};

export default function OrderDetailStatusBadge({
  statusArray,
  className,
  badgeClassName,
  children,
}: OrderDetailStatusBadgeProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 flex-col", className)}>
      {statusArray.map((status) => {
        if (!status) return null;
        return (
          <Badge
            variant={
              statusVariantMap[status.toLowerCase()]?.variant || "warning"
            }
            key={status}
            className={cn(
              statusVariantMap[status.toLowerCase()]?.className,
              badgeClassName,
            )}
          >
            {children || status}
          </Badge>
        );
      })}
    </div>
  );
}
