import { TZDate } from "@date-fns/tz";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DataTable } from "~/components/common/DataTable";
import { OrderStatusBadge } from "~/components/common/OrderStatusBadge";
import { cn, extractIdFromGid, formatPrice } from "~/lib/utils";
import CustomEye from "../icons/CustomEye";
import { Button } from "../ui/button";
import {useAddLocalePath} from '~/hooks/utils.hooks';

interface DraftOrder {
  id: string;
  name: string;
  status: string;
  tags: string[];
  poNumber: string;
  updatedAt: string;
  customer?: {
    displayName: string;
  };
  purchasingEntity?: {
    location?: {
      name: string;
    };
  };
  totalPriceSet: {
    presentmentMoney: {
      amount: string;
      currencyCode: string;
    };
  };
}

interface DraftOrderTableProps extends React.HTMLAttributes<HTMLDivElement> {
  draftOrders: DraftOrder[];
  isLoading: boolean;
  timezone: string;
}

const formatDate = (
  dateString: string,
  timezone: string = "America/New_York",
) => {
  try {
    const date = new TZDate(new Date(dateString), timezone);
    return format(date, "MM/dd/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export default function DraftOrderTable2({
  className,
  draftOrders,
  isLoading,
  timezone,
}: DraftOrderTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {addLocalePath} = useAddLocalePath()
  const handleView = (order: DraftOrder) => {
    navigate(
      addLocalePath(`/apps/customer-account/orders-pending-approval/${extractIdFromGid(order.id, "DraftOrder")}?routeName=${encodeURIComponent(order.name)}`),
    );
  };

  const renderMobileOrderCard = (order: DraftOrder) => {
    return (
      <div
        key={order.id}
        className="bg-blue-50 p-5 rounded-lg shadow-sm cursor-pointer"
        onClick={() => handleView(order)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-1">
            <div className="text-gray-900 text-sm font-bold">
              {t("draft-order.list.table.draft-order")}
            </div>
            <div className="cursor-pointer hover:underline text-primary-main font-bold text-sm">
              {order.name}
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="text-gray-900 text-sm font-bold">
              {t("draft-order.list.table.po-number")}
            </div>
            <div className="break-all w-full text-sm">
              {order.poNumber ? `${order.poNumber}` : "-"}
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="text-gray-900 text-sm font-bold">
              {t("draft-order.list.table.update-date")}
            </div>
            <div className="break-all w-full text-sm">
              {formatDate(order.updatedAt, timezone)}
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="text-gray-900 text-sm font-bold">
              {t("draft-order.list.table.customer")}
            </div>
            <div className="break-all w-full text-sm">
              {order.customer?.displayName}
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="text-gray-900 text-sm font-bold">
              {t("draft-order.list.table.status")}
            </div>
            <div className="flex gap-1">
              <OrderStatusBadge
                status={order.tags?.length > 0 ? order.tags[0] : order.status}
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="text-gray-900 text-sm font-bold">
              {t("draft-order.list.table.total")}
            </div>
            <div className="break-all w-full text-sm">
              {formatPrice(
                order.totalPriceSet.presentmentMoney.amount,
                order.totalPriceSet.presentmentMoney.currencyCode,
              )}
            </div>
          </div>

          <div className="col-span-2 flex justify-end pr-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(order)}
              className="text-primary-main font-semibold text-[13px]"
            >
              {t("draft-order.list.table.details")}
              <CustomEye strokeWidth={3} className="!w-5 !h-5"></CustomEye>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const columns: ColumnDef<DraftOrder>[] = [
    {
      accessorKey: "name",
      header: t("draft-order.list.table.draft-order"),
      cell: ({ row }) => {
        return (
          <div className="cursor-pointer hover:underline text-primary-main font-bold">
            {row.original.name}
          </div>
        );
      },
    },
    {
      accessorKey: "poNumber",
      header: t("draft-order.list.table.po-number"),
      cell: ({ row }) =>
        row.original.poNumber ? `${row.original.poNumber}` : "-",
    },
    {
      accessorKey: "updatedAt",
      header: t("draft-order.list.table.update-date"),
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      accessorKey: "customer",
      header: t("draft-order.list.table.customer"),
      cell: ({ row }) => {
        return (
          <div>
            <div>{row.original.customer?.displayName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("draft-order.list.table.status"),
      cell: ({ row }) => {
        const status =
          row.original.tags?.length > 0
            ? row.original.tags[0]
            : row.original.status;
        return <OrderStatusBadge status={status} />;
      },
      size: 150,
      minSize: 150,
    },
    {
      accessorKey: "totalPriceSet",
      header: t("draft-order.list.table.total"),
      cell: ({ row }) => {
        const price = row.original.totalPriceSet.presentmentMoney;
        return formatPrice(price.amount, price.currencyCode);
      },
      size: 100,
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="link"
          size="sm"
          className="text-primary-main font-semibold text-[13px] hover:no-underline"
          onClick={() => handleView(row.original)}
        >
          {t("draft-order.list.table.details")}
          <CustomEye strokeWidth={3} className="!w-5 !h-5"></CustomEye>
        </Button>
      ),
      size: 100,
    },
  ];

  return (
    <div className={cn("mt-5", className)}>
      <div className="app-hidden lg:block">
        <DataTable
          columns={columns}
          data={draftOrders}
          isLoading={isLoading}
          setRowId={(row) => row.id.toString()}
          emptyMessage="No orders pending approval."
          headerClassName="bg-blue-50"
          headerCellClassName="font-bold text-black"
          rowClassNameFn={(row, index) =>
            index % 2 !== 0 ? "bg-blue-50 cursor-pointer" : "cursor-pointer"
          }
          tableRowOnClick={(row) => handleView(row)}
        />
      </div>

      <div className="lg:hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : draftOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("draft-order.list.table.no-orders-pending-approval")}
          </div>
        ) : (
          <div className="space-y-[10px]">
            {draftOrders.map(renderMobileOrderCard)}
          </div>
        )}
      </div>
    </div>
  );
}
