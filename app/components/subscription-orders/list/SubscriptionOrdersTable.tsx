import { Fragment, useState } from "react";
import { Button } from "~/components/ui/button";
import CustomStatusBadge from "~/components/common/CustomStatusBadge";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "~/components/ui/table";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import SubscriptionOrderTableExpand from "./SubscriptionOrderTableExpand";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { FetchSubscriptionContractsResponse } from "~/types/subscription-contracts/subscription-contract.schema";
import { format } from "date-fns";
import { useNavigate } from "@remix-run/react";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import { formatSubscriptionListFrequency } from "~/lib/subscription-orders";
import { SubsciptionOrdersListConfirmDialog } from "./SubsciptionOrdersListConfirmDialog";
import {
  useDeleteSubscriptionOrder,
  useSkipSubscriptionOrderDelivery,
} from "~/hooks/use-subscription-orders";
import _ from "lodash";
import { useShopifyInformation } from "~/lib/shopify";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  QUERY_ALL_SUBSCRIPTION_ORDERS,
  QUERY_SUBSCRIPTION_ORDER_BY_ID,
} from "~/constant/react-query-keys";

interface SubscriptionOrder {
  id: number;
  name: string;
  status: string;
  total: string;
  frequency: string;
  nextDelivery: string;
  approvedBy: string;
}

const mockData: SubscriptionOrder[] = [
  {
    id: 1110,
    name: "Pipe Fittings",
    status: "Active",
    total: "$328.94",
    frequency: "Weekly",
    nextDelivery: "12/16/2024",
    approvedBy: "Susan Burns",
  },
  {
    id: 1111,
    name: "Pipe Fittings",
    status: "Active",
    total: "$328.94",
    frequency: "Weekly",
    nextDelivery: "12/16/2024",
    approvedBy: "Susan Burns",
  },
];

interface SubscriptionOrdersTableProps {
  data: FetchSubscriptionContractsResponse["data"];
  isLoading: boolean;
}
export default function SubscriptionOrdersTable({
  data,
  isLoading,
}: SubscriptionOrdersTableProps) {
  const { t } = useTranslation();

  const { shopifyCompanyLocationId, shopifyCustomerId, storeName } =
    useShopifyInformation();

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleToggleDetails = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const navigate = useNavigate();
  const { addLocalePath } = useAddLocalePath();
  const queryClient = useQueryClient();
  const resetQuery = (id?: number) => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_ALL_SUBSCRIPTION_ORDERS],
    });
    if (id) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_SUBSCRIPTION_ORDER_BY_ID, { id }],
      });
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(
      addLocalePath(
        `/apps/customer-account/subscription-orders/${id}?routeName=${encodeURIComponent(
          `#${id}`,
        )}`,
      ),
    );
  };

  const handleEdit = (id: number) => {
    navigate(
      addLocalePath(
        `/apps/customer-account/subscription-orders/edit-subscription/${id}?routeName=${encodeURIComponent(
          `#${id}`,
        )}`,
      ),
    );
  };

  // skip delivery
  const [showSkipDeliveryDialog, setShowSkipDeliveryDialog] = useState(false);
  const [skipDeliveryId, setSkipDeliveryId] = useState<number | null>(null);

  const {
    mutateAsync: skipSubscriptionOrderDelivery,
    isPending: isSkippingDelivery,
  } = useSkipSubscriptionOrderDelivery();

  const handleSkipDelivery = (id: number) => {
    setSkipDeliveryId(id);
    setShowSkipDeliveryDialog(true);
  };

  const handleConfirmSkipDelivery = () => {
    if (!skipDeliveryId) {
      console.error("skip delivery id is not found");
      toast.error(
        t("subscription-orders.common-actions.skip-delivery.toast.error"),
      );
      return;
    }
    skipSubscriptionOrderDelivery({
      subscriptionContractId: _.toNumber(skipDeliveryId),
      companyLocationId: shopifyCompanyLocationId,
      customerId: shopifyCustomerId,
      storeName: storeName,
    })
      .then((res) => {
        if (res?.success) {
          toast.success(
            res?.message ||
              t(
                "subscription-orders.common-actions.skip-delivery.toast.success",
              ),
          );
          setShowSkipDeliveryDialog(false);
          resetQuery(skipDeliveryId);
        } else {
          toast.error(
            res?.message ||
              t("subscription-orders.common-actions.skip-delivery.toast.error"),
          );
        }
      })
      .catch((err) => {
        console.error("skip delivery error", err);
        toast.error(
          err?.message ||
            t("subscription-orders.common-actions.skip-delivery.toast.error"),
        );
      });
  };
  // delete subscription order
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    mutateAsync: deleteSubscriptionOrder,
    isPending: isDeletingSubscriptionOrder,
  } = useDeleteSubscriptionOrder();

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };
  const handleConfirmDelete = () => {
    if (!deleteId) {
      console.error("delete id is not found");
      toast.error(t("subscription-orders.common-actions.delete.toast.error"));
      return;
    }

    deleteSubscriptionOrder({
      subscriptionContractId: _.toNumber(deleteId),
      companyLocationId: shopifyCompanyLocationId,
      customerId: shopifyCustomerId,
      storeName: storeName,
    })
      .then((res) => {
        if (res?.success) {
          toast.success(
            res?.message ||
              t("subscription-orders.common-actions.delete.toast.success"),
          );
          setShowDeleteDialog(false);
          resetQuery();
        } else {
          toast.error(
            res?.message ||
              t("subscription-orders.common-actions.delete.toast.error"),
          );
        }
      })
      .catch((err) => {
        console.error("delete subscription order error", err);
        toast.error(
          err?.message ||
            t("subscription-orders.common-actions.delete.toast.error"),
        );
      });
  };

  return (
    <div className="rounded-md border border-secondary-light">
      <Table>
        <TableHeader className="bg-secondary-light">
          <TableRow className="border-secondary-light">
            <TableCell className="text-sm font-bold text-text-color align-top pl-4">
              {t("subscription-orders.list.table.order-number")}
            </TableCell>
            <TableCell className="text-sm font-bold text-text-color align-top">
              {t("subscription-orders.list.table.order-name")}
            </TableCell>
            <TableCell className="text-sm font-bold text-text-color align-top">
              {t("subscription-orders.list.table.status")}
            </TableCell>
            <TableCell className="text-sm font-bold text-text-color align-top">
              {t("subscription-orders.list.table.order-total")}
            </TableCell>
            <TableCell className="text-sm font-bold text-text-color align-top">
              {t("subscription-orders.list.table.frequency")}
            </TableCell>
            <TableCell className="text-sm font-bold text-text-color align-top">
              {t("subscription-orders.list.table.next-delivery-date")}
            </TableCell>
            <TableCell className="text-sm font-bold text-text-color align-top">
              {t("subscription-orders.list.table.approved-by")}
            </TableCell>
            <TableCell className="text-sm font-bold text-text-color align-top"></TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : data?.length > 0 ? (
            data.map((order, index) => (
              <Fragment key={order.id}>
                <TableRow
                  key={order.id}
                  className={cn(
                    "border-secondary-light",
                    index % 2 !== 0 ? "bg-secondary-light" : "",
                  )}
                >
                  <TableCell className="pl-4">
                    <div
                      onClick={() => handleViewDetails(order.id)}
                      className="cursor-pointer hover:underline text-primary-main font-bold"
                    >
                      #{order.id}
                    </div>
                  </TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>
                    <CustomStatusBadge
                      status={order.status}
                      className="w-fit"
                      type={
                        order.status === "active" || order.status === "pending"
                          ? "secondary-blue"
                          : "gray"
                      }
                    />
                  </TableCell>
                  {/* tofix: orderTotal is not available in the response */}
                  <TableCell>{order.orderTotal}</TableCell>
                  <TableCell>
                    {formatSubscriptionListFrequency(
                      order.intervalUnit,
                      order.intervalValue,
                      t,
                    )}
                  </TableCell>
                  <TableCell>
                    {format(order.nextOrderCreationDate, "MM/dd/yyyy")}
                  </TableCell>
                  <TableCell>{order.approvedByName || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDetails(order.id)}
                      className="text-primary-main font-semibold text-[13px]"
                    >
                      {t("subscription-orders.list.table.details")}
                      {expandedRow === order.id ? (
                        <ChevronUp className="!w-5 !h-5" strokeWidth={3} />
                      ) : (
                        <ChevronDown className="!w-5 !h-5" strokeWidth={3} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRow === order.id && (
                  <TableRow className="border-none">
                    <TableCell colSpan={8} className="p-0">
                      <SubscriptionOrderTableExpand
                        subscriptionOrderId={order.id}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSkipDelivery={handleSkipDelivery}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                {t("subscription-orders.list.table.no-data")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <SubsciptionOrdersListConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        type="delete"
        onOK={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        disabled={isDeletingSubscriptionOrder}
        loading={isDeletingSubscriptionOrder}
      />
      <SubsciptionOrdersListConfirmDialog
        open={showSkipDeliveryDialog}
        onOpenChange={setShowSkipDeliveryDialog}
        type="skip-delivery"
        onOK={handleConfirmSkipDelivery}
        onCancel={() => setShowSkipDeliveryDialog(false)}
        disabled={isSkippingDelivery}
        loading={isSkippingDelivery}
      />
    </div>
  );
}
