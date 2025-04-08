import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import TableProductItem from "~/components/common/TableProdcutItem";
import { ScrollArea } from "~/components/ui/scroll-area";
import _ from "lodash";
import { useGetSubscriptionOrderById } from "~/hooks/use-subscription-orders";
import { useShopifyInformation } from "~/lib/shopify";
import { cn, extractShopifyId, formatPrice } from "~/lib/utils";
import { SubscriptionContractStatusType } from "~/types/subscription-contracts/subscription-contract.schema";
import {
  computedSubscriptionOrderTotal,
  shouldShowButton,
} from "~/lib/subscription-orders";

interface SubscriptionOrderTableExpandProps {
  subscriptionOrderId: number;
  onViewDetails: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSkipDelivery: (id: number) => void;
}
interface SubscriptionOrderTableExpandButtonGroupsProps
  extends SubscriptionOrderTableExpandProps {
  status: SubscriptionContractStatusType;
  customerId: string;
}

const GridItem = ({
  title,
  value,
  className,
  titleClassName,
  valueClassName,
}: {
  title: string;
  value: string;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "break-words flex flex-col gap-1 text-[13px] text-primary-text flex-1",
        className,
      )}
    >
      <div className={cn("font-bold", titleClassName)}>{title}</div>
      <div className={cn("", valueClassName)}>{value || "-"}</div>
    </div>
  );
};
const HeaderButtonGroups = ({
  subscriptionOrderId,
  onViewDetails,
  onEdit,
  onDelete,
  onSkipDelivery,
  status,
  customerId,
}: SubscriptionOrderTableExpandButtonGroupsProps) => {
  const { t } = useTranslation();
  const { customerId: shopifyCustomerId } = useShopifyInformation();
  const shouldShowEditButton = shouldShowButton(status, ["pending"]);
  const shouldShowSkipButton = shouldShowButton(status, ["active"]);
  const shouldShowDeleteButton =
    shopifyCustomerId === extractShopifyId(customerId, "Customer") &&
    shouldShowButton(status, ["pending"]);
  return (
    <div className="flex gap-6 items-center justify-center">
      <Button
        variant="link"
        size="sm"
        onClick={() => onViewDetails(subscriptionOrderId)}
        className="text-primary-main font-bold text-sm p-0 gap-2"
      >
        {t("subscription-orders.list.table.expand.actions.details")}
        <Eye strokeWidth={2} className="!w-5 !h-5"></Eye>
      </Button>
      {shouldShowEditButton && (
        <Button
          variant="link"
          size="sm"
          onClick={() => onEdit(subscriptionOrderId)}
          className="text-primary-main font-bold text-sm p-0 gap-2"
        >
          {t("subscription-orders.list.table.expand.actions.edit")}
          <Pencil strokeWidth={2} className="!w-5 !h-5"></Pencil>
        </Button>
      )}
      {shouldShowDeleteButton && (
        <Button
          variant="link"
          size="sm"
          onClick={() => onDelete(subscriptionOrderId)}
          className="text-primary-main font-bold text-sm p-0 gap-2"
        >
          {t("subscription-orders.list.table.expand.actions.delete")}
          <Trash2 strokeWidth={2} className="!w-5 !h-5"></Trash2>
        </Button>
      )}
      {shouldShowSkipButton && (
        <Button
          variant="outline"
          size="sm"
          className="px-[10px] font-bold text-sm h-10"
          onClick={() => onSkipDelivery(subscriptionOrderId)}
        >
          {t("subscription-orders.list.table.expand.actions.skip-delivery")}
        </Button>
      )}
    </div>
  );
};

export default function SubscriptionOrderTableExpand({
  subscriptionOrderId,
  onViewDetails,
  onEdit,
  onDelete,
  onSkipDelivery,
}: SubscriptionOrderTableExpandProps) {
  const { t } = useTranslation();
  const { storeName, shopifyCustomerId } = useShopifyInformation();
  const { data: subscriptionOrder, isLoading: isLoadingSubscriptionOrder } =
    useGetSubscriptionOrderById({
      id: _.toNumber(subscriptionOrderId),
      storeName: storeName,
      customerId: shopifyCustomerId,
    });

  const handleViewDetails = (id: number) => {
    onViewDetails(id);
  };
  const handleEdit = (id: number) => {
    onEdit(id);
  };
  const handleDelete = (id: number) => {
    onDelete(id);
  };
  const handleSkipDelivery = (id: number) => {
    onSkipDelivery(id);
  };

  const data = subscriptionOrder?.subscriptionContract;

  const products = data?.lines;

  // products total + shipping cost
  const { total: orderTotal } = computedSubscriptionOrderTotal(
    products || [],
    data?.shippingCost || 0,
  );

  const ProductsTable = () => {
    return (
      <div className="rounded-md border border-grey-light bg-white">
        <Table>
          <ScrollArea className="[&>[data-radix-scroll-area-viewport]]:max-h-80">
            <TableHeader className="bg-secondary-light sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[156px] pl-6 text-sm font-bold text-primary-text">
                  {t(
                    "subscription-orders.list.table.expand.table.customer-product",
                  )}
                </TableHead>
                <TableHead className="w-[156px] pl-6 text-sm font-bold text-primary-text">
                  {t("subscription-orders.list.table.expand.table.sku")}
                </TableHead>
                <TableHead className="text-sm font-bold text-primary-text w-96">
                  {t("subscription-orders.list.table.expand.table.item")}
                </TableHead>
                <TableHead className="text-sm font-bold text-primary-text">
                  {t("subscription-orders.list.table.expand.table.qty")}
                </TableHead>
                <TableHead className="text-sm font-bold text-primary-text">
                  {t("subscription-orders.list.table.expand.table.subtotal")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products || []).map((item) => (
                <TableRow className="border-grey-light">
                  <TableCell className="pl-6">
                    {item.variant?.customerPartnerNumber || "-"}
                  </TableCell>
                  <TableCell className="pl-6">
                    {item.variant?.sku || "-"}
                  </TableCell>
                  <TableCell>
                    <TableProductItem
                      imageSrc={item.image?.[0]?.url || ""}
                      imageAlt={item.image?.[0]?.altText || ""}
                      title={item.variant?.title || "-"}
                    />
                  </TableCell>
                  <TableCell>{item.variant?.quantity || 0}</TableCell>
                  <TableCell className="font-bold">
                    {formatPrice(
                      item.variant?.price || 0,
                      data?.currencyCode || "",
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ScrollArea>
        </Table>
      </div>
    );
  };

  return (
    <div className="p-5 bg-gray-base shadow-[2px_2px_8px_0px_rgba(0,0,0,0.08)_inset] flex flex-col gap-5">
      {/* header information grid */}
      {isLoadingSubscriptionOrder ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex gap-6 justify-between bg-white px-4 py-[10px] rounded-md">
            <GridItem
              title={t(
                "subscription-orders.list.table.expand.delivery-order-date",
              )}
              value={
                data?.nextOrderDate
                  ? format(
                      new Date(data?.nextOrderDate),
                      "dd MMM yyyy, h:mm aa",
                    )
                  : "-"
              }
            />

            <GridItem
              title={t(
                "subscription-orders.list.table.expand.total-delivery-items",
              )}
              value={`${products?.length || 0}`}
            />
            <GridItem
              title={t("subscription-orders.list.table.expand.order-total")}
              value={formatPrice(orderTotal || 0, data?.currencyCode || "")}
            />
            <HeaderButtonGroups
              subscriptionOrderId={subscriptionOrderId}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSkipDelivery={handleSkipDelivery}
              status={data?.status as SubscriptionContractStatusType}
              customerId={data?.customer?.id || ""}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="font-bold text-primary-text text-base">
              {t("subscription-orders.list.table.expand.table.title")}
            </div>
            <ProductsTable />
          </div>
        </>
      )}
    </div>
  );
}
