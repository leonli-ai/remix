import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import _ from "lodash";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomStatusBadge from "~/components/common/CustomStatusBadge";
import { DataTable } from "~/components/common/DataTable";
import CustomEye from "~/components/icons/CustomEye";
import { Button } from "~/components/ui/button";
import { getStatusColor } from "~/lib/quote";
import {
  QuoteListResponse,
  QuoteWithCustomer,
} from "~/types/quotes/quote.schema";
import {useAddLocalePath} from '~/hooks/utils.hooks';

interface Props {
  data: QuoteListResponse["quotes"];
  isLoading: boolean;
}

const MoblieCard = ({ data, isLoading }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {addLocalePath} = useAddLocalePath()
  const handleViewDetails = (rfq: QuoteWithCustomer) => {
    navigate(addLocalePath(`/apps/customer-account/quotes/${rfq.id}`));
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
      {data.map((rfq) => (
        <div
          key={rfq.id}
          className="bg-blue-50 rounded-lg p-5 shadow-sm cursor-pointer"
        >
          <div className="grid grid-cols-2 gap-4 ">
            <div className="flex flex-col gap-y-1 break-all">
              <div className="text-gray-900 text-sm font-bold">
                {t("request-for-quote.list.table.id")}
              </div>
              <div
                className="cursor-pointer text-primary-main font-bold hover:underline text-sm"
                onClick={() => handleViewDetails(rfq)}
              >
                #{rfq.id}
              </div>
            </div>

            <div className="flex flex-col gap-y-1 break-all">
              <div className="text-gray-900 text-sm font-bold">
                {t("request-for-quote.list.table.status")}
              </div>
              <div className="break-all w-full text-sm">
                <CustomStatusBadge
                  status={rfq?.status || ""}
                  className="w-fit text-sm"
                  type={getStatusColor(rfq?.status || "")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-1 break-all">
              <div className="text-gray-900 text-sm font-bold">
                {t("request-for-quote.list.table.po-number")}
              </div>
              <div className="flex flex-wrap gap-1">{rfq?.poNumber || "-"}</div>
            </div>

            <div className="flex flex-col gap-y-1 break-all">
              <div className="text-gray-900 text-sm font-bold">
                {t("request-for-quote.list.table.created-at")}
              </div>
              <div className="break-all w-full text-sm">
                {format(new Date(rfq?.createdAt || ""), "MM/dd/yyyy")}
              </div>
            </div>

            <div className="flex flex-col gap-y-1 break-all">
              <div className="text-gray-900 text-sm font-bold ">
                {t("request-for-quote.list.table.owner")}
              </div>
              <div className="break-all w-full text-sm">
                {`${rfq?.customer?.firstName || ""} ${rfq?.customer?.lastName || ""}`}
              </div>
            </div>

            <div className="flex flex-col gap-y-1 break-all">
              <div className="text-gray-900 text-sm font-bold ">
                {t("request-for-quote.list.table.expiration-date")}
              </div>
              <div className="break-all w-full text-sm">
                {rfq?.expirationDate
                  ? format(new Date(rfq?.expirationDate), "MM/dd/yyyy")
                  : "-"}
              </div>
            </div>

            <div className="flex justify-end col-span-2 pr-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(rfq)}
                className="text-primary-main font-semibold text-[13px]"
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
};

export default function QuotesTable({ data, isLoading }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {addLocalePath} = useAddLocalePath()
  const handleViewDetails = (rfq: QuoteWithCustomer) => {
    navigate(addLocalePath(`/apps/customer-account/quotes/${rfq.id}`));
  };

  const columns: ColumnDef<QuoteWithCustomer, any>[] = [
    {
      accessorKey: "id",
      header: () => (
        <div className="text-primary-text text-sm font-bold">
          {t("request-for-quote.list.table.id")}
        </div>
      ),
      cell: ({ row }) => (
        <div
          onClick={() => handleViewDetails(row.original)}
          className="cursor-pointer hover:underline text-primary-main font-bold"
        >
          #{row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("request-for-quote.list.table.status"),
      cell: ({ row }) => (
        <CustomStatusBadge
          className="w-fit"
          status={row.original.status}
          type={getStatusColor(row.original.status)}
        />
      ),
      maxSize: 150,
    },
    {
      accessorKey: "poNumber",
      header: t("request-for-quote.list.table.po-number"),
      cell: ({ row }) => <p>{row.original.poNumber || "-"}</p>,
      maxSize: 150,
    },
    {
      accessorKey: "createdAt",
      header: t("request-for-quote.list.table.created-at"),
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "expirationDate",
      header: t("request-for-quote.list.table.expiration-date"),
      cell: ({ row }) =>
        row.original?.expirationDate
          ? format(new Date(row.original?.expirationDate), "MM/dd/yyyy")
          : "-",
    },
    {
      accessorKey: "owner",
      header: t("request-for-quote.list.table.owner"),
      cell: ({ row }) => {
        const { customer } = row.original;
        return (
          <div>{`${_.toString(customer?.firstName)} ${_.toString(
            customer?.lastName,
          )}`}</div>
        );
      },
      maxSize: 150,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row.original)}
          className="text-primary-main font-semibold text-[13px]"
        >
          {t("request-for-quote.list.table.details")}
          <CustomEye strokeWidth={3} className="!w-5 !h-5"></CustomEye>
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="app-hidden lg:block">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          setRowId={(row) => row.id}
          rowClassName="text-text-color"
          rowClassNameFn={(row, index) => (index % 2 !== 0 ? "bg-blue-50" : "")}
          headerClassName="bg-blue-50"
          headerCellClassName="font-bold text-text-color"
          emptyMessage={t("request-for-quote.list.table.no-quotes-found")}
        />
      </div>
      <div className="block lg:hidden">
        <MoblieCard data={data} isLoading={isLoading} />
      </div>
    </div>
  );
}
