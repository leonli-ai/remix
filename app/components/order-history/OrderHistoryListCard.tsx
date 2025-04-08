import { useNavigate } from "@remix-run/react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { extractIdFromGid, formatPrice } from "~/lib/utils";
import { OrderListResponse } from "~/types/order-management/order-list.schema";
import CustomEye from "../icons/CustomEye";
import { Button } from "../ui/button";
import OrderDetailStatusBadgeV2 from "./order-detail/OrderDetailStatusBadgeV2";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import { useShopifyInformation } from "~/lib/shopify";
import { useFetchShopSettings } from "~/hooks/use-draft-order";
import { TZDate } from "@date-fns/tz";
export function OrderHistoryListCard({
  data,
  isLoading,
}: {
  data: OrderListResponse["orders"];
  isLoading?: boolean;
}) {
  const { storeName } = useShopifyInformation();
  const { data: shopSettings } = useFetchShopSettings({
    storeName,
  });
  const timezone = shopSettings?.shop?.ianaTimezone || "America/New_York";
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addLocalePath } = useAddLocalePath();
  const handleViewDetails = (order: OrderListResponse["orders"][number]) => {
    navigate(
      addLocalePath(
        `/apps/customer-account/order-history/${extractIdFromGid(order.id, "Order")}?locationId=${extractIdFromGid(order?.purchasingEntity?.location?.id || "", "CompanyLocation")}&routeName=${encodeURIComponent(order.name)}`,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-[10px]">
      {data.map((order) => (
        <div
          key={order.id}
          className="bg-blue-50 rounded-lg p-5 shadow-sm cursor-pointer"
        >
          <div className="grid grid-cols-2 gap-4 ">
            <div className="flex flex-col gap-y-1">
              <div className="text-gray-900 text-sm font-bold">
                {t("order-history.list.table.order-number")}
              </div>
              <div
                className="cursor-pointer text-primary-main font-bold hover:underline text-sm"
                onClick={() => handleViewDetails(order)}
              >
                {order.name}
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <div className="text-gray-900 text-sm font-bold">
                {t("order-history.list.table.order-total")}
              </div>
              <div className="break-all w-full text-sm">
                {formatPrice(
                  order.currentTotalPriceSet.shopMoney.amount,
                  order.currentTotalPriceSet.shopMoney.currencyCode,
                )}
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <div className="text-gray-900 text-sm font-bold">
                {t("order-history.list.table.status")}
              </div>
              <div className="flex flex-wrap gap-1">
                <OrderDetailStatusBadgeV2
                  status={order?.status || ""}
                  className="w-fit text-sm"
                  type={order?.status === "OPEN" ? "blue" : "gray"}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <div className="text-gray-900 text-sm font-bold">
                {t("order-history.list.table.po-number")}
              </div>
              <div className="break-all w-full text-sm">
                {order?.poNumber || "-"}
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <div className="text-gray-900 text-sm font-bold ">
                {t("order-history.list.table.created-by")}
              </div>
              <div className="break-all w-full text-sm">
                <div>{`${order?.customer?.firstName || ""} ${order?.customer?.lastName || ""}`}</div>
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <div className="text-gray-900 text-sm font-bold">
                {t("order-history.list.table.approved-by")}
              </div>
              <div className="break-all w-full text-sm">
                <div>{`${order?.approver?.firstName || ""} ${order?.approver?.lastName || ""}`}</div>
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <div className="text-gray-900 text-sm font-bold">
                {t("order-history.list.table.ordered-date")}
              </div>
              <div className="break-all w-full text-sm">
                <div>
                  {format(
                    new TZDate(new Date(order?.createdAt || ""), timezone),
                    "MM/dd/yyyy",
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end pt-6 pr-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(order)}
                className="text-primary-main font-semibold text-[13px] h-full"
              >
                {t("order-history.list.table.details")}
                <CustomEye strokeWidth={3} className="!w-5 !h-5"></CustomEye>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
