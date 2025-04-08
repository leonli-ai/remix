import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DataTable } from "~/components/common/DataTable";
import { Button } from "~/components/ui/button";
import { extractIdFromGid, formatPrice } from "~/lib/utils";
import type { OrderListResponse } from "~/types/order-management/order-list.schema";
import CustomEye from "../icons/CustomEye";
import OrderDetailStatusBadgeV2 from "./order-detail/OrderDetailStatusBadgeV2";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import { useShopifyInformation } from "~/lib/shopify";
import { useFetchShopSettings } from "~/hooks/use-draft-order";
import { TZDate } from "@date-fns/tz";

export function OrderHistoryListTable({
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
        `/apps/customer-account/order-history/${extractIdFromGid(order.id, "Order")}?locationId=${extractIdFromGid(order?.purchasingEntity?.location?.id || "", "CompanyLocation")}&routeName=${encodeURIComponent(order.name)})`,
      ),
    );
  };

  const columns: ColumnDef<OrderListResponse["orders"][number], any>[] = [
    {
      accessorKey: "name",
      header: t("order-history.list.table.order-number"),
      cell: ({ row }) => {
        return (
          <div
            onClick={() => handleViewDetails(row.original)}
            className="cursor-pointer hover:underline text-primary-main font-bold"
          >
            {row.original.name}
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "total",
      header: t("order-history.list.table.order-total"),
      cell: ({ row }) => {
        const { currentTotalPriceSet } = row.original;
        return formatPrice(
          currentTotalPriceSet.shopMoney.amount,
          currentTotalPriceSet.shopMoney.currencyCode,
        );
      },
    },
    {
      accessorKey: "status",
      header: t("order-history.list.table.status"),
      cell: ({ row }) => {
        const { status } = row.original;
        return (
          <OrderDetailStatusBadgeV2
            className="w-fit"
            status={status}
            type={status === "OPEN" ? "blue" : "gray"}
          />
        );
      },
    },
    {
      accessorKey: "poNumber",
      header: t("order-history.list.table.po-number"),
      cell: ({ row }) => {
        return <p>{row.original?.poNumber || "-"}</p>;
      },
    },
    {
      accessorKey: "customer",
      header: t("order-history.list.table.created-by"),
      cell: ({ row }) => {
        const { customer } = row.original;
        return (
          <div>
            <div>{`${customer?.firstName || ""} ${customer?.lastName || ""}`}</div>
          </div>
        );
      },
      minSize: 120,
      maxSize: 180,
    },
    {
      accessorKey: "approver",
      header: t("order-history.list.table.approved-by"),
      cell: ({ row }) => {
        const { approver } = row.original;
        return (
          <div>
            <div>{`${approver?.firstName || ""} ${approver?.lastName || ""}`}</div>
          </div>
        );
      },
      minSize: 120,
      maxSize: 180,
    },
    {
      accessorKey: "orderedDate",
      header: t("order-history.list.table.ordered-date"),
      cell: ({ row }) => {
        return format(
          new TZDate(new Date(row.original.createdAt), timezone),
          "MM/dd/yyyy",
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row.original)}
            className="text-primary-main font-semibold text-[13px]"
          >
            {t("order-history.list.table.details")}
            <CustomEye strokeWidth={3} className="!w-5 !h-5"></CustomEye>
          </Button>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      setRowId={(row) => row.id.toString()}
      rowClassName="text-text-color"
      rowClassNameFn={(row, index) => (index % 2 !== 0 ? "bg-blue-50" : "")}
      headerClassName="bg-blue-50"
      headerCellClassName="font-bold text-text-color"
    />
  );
}
