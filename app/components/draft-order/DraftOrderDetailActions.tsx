import {
  Loader2,
  ShoppingCartIcon,
  Trash2,
  Ellipsis,
  Check,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn, extractShopifyId } from "~/lib/utils";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTranslation } from "react-i18next";
const DraftOrderDeclineButton = ({
  handleReject,
  isRejecting,
}: {
  handleReject: () => void;
  isRejecting: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="link"
      onClick={handleReject}
      disabled={isRejecting}
      className="text-primary-main font-bold lg:p-0  text-sm gap-1"
    >
      {isRejecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <X className="!h-6 !w-6" strokeWidth={4} />
          {t("draft-order.detail.decline-button")}
        </>
      )}
    </Button>
  );
};

const DraftOrderApproveButton = ({
  handleApprove,
  isApproving,
}: {
  handleApprove: () => void;
  isApproving: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="link"
      onClick={handleApprove}
      disabled={isApproving}
      className="text-primary-main font-bold lg:p-0 text-sm gap-1"
    >
      {isApproving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Check className="!h-6 !w-6" strokeWidth={4} />
          {t("draft-order.detail.approve-button")}
        </>
      )}
    </Button>
  );
};

const DraftOrderReorderButton = ({
  handleReorder,
  isReordering,
}: {
  handleReorder: () => void;
  isReordering: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="link"
      onClick={handleReorder}
      disabled={isReordering}
      className="text-primary-main font-bold lg:p-0 text-sm gap-1"
    >
      {isReordering ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <ShoppingCartIcon className="!h-6 !w-6 fill-primary-main" />
          {t("draft-order.detail.reorder-button")}
        </>
      )}
    </Button>
  );
};

const DraftOrderDeleteButton = ({
  handleDelete,
  isDeleting,
}: {
  handleDelete: () => void;
  isDeleting: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="link"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-primary-main font-bold lg:p-0 text-sm gap-1"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="!h-6 !w-6" />
          {t("draft-order.detail.delete-button")}
        </>
      )}
    </Button>
  );
};

interface DraftOrderDetailActionsProps {
  orderApproverRole: boolean;
  draftOrder: any;
  handleReject: () => void;
  isRejecting: boolean;
  handleApprove: () => void;
  isApproving: boolean;
  handleReOrder: () => void;
  isReOrdering: boolean;
  handleDelete: () => void;
  isDeleting: boolean;
  className?: string;
  customerId: string;
}

const shouldApproveFn = (draftOrder: any) => {
  return (
    (draftOrder.status === "OPEN" || draftOrder.status === "INVOICE_SENT") &&
    (draftOrder.tags?.[0] === "po automation" || draftOrder.tags?.length === 0)
  );
};

const shouldRejectFn = (draftOrder: any) => {
  return draftOrder.tags?.[0] !== "rejected";
};

export const DraftOrderDesktopButtonsSection = ({
  className,
  orderApproverRole,
  draftOrder,
  handleReject,
  isRejecting,
  handleApprove,
  isApproving,
  handleReOrder,
  isReOrdering,
  handleDelete,
  isDeleting,
  customerId,
}: DraftOrderDetailActionsProps) => {
  const shouldApprove = shouldApproveFn(draftOrder);

  const shouldReject = shouldRejectFn(draftOrder);

  return (
    <div
      className={cn(
        `flex flex-row items-center justify-end gap-x-3 [&>*:last-child]:hidden lg:max-w-72`,
        className,
      )}
    >
      {orderApproverRole && (
        <>
          {shouldApprove && (
            <>
              <DraftOrderApproveButton
                handleApprove={handleApprove}
                isApproving={isApproving}
              />
              <Separator
                orientation="vertical"
                className="h-6  app-hidden lg:block"
              ></Separator>
            </>
          )}
          {shouldReject && (
            <>
              <DraftOrderDeclineButton
                handleReject={handleReject}
                isRejecting={isRejecting}
              />
              <Separator orientation="vertical" className="h-6 "></Separator>
            </>
          )}
        </>
      )}
      <DraftOrderReorderButton
        handleReorder={handleReOrder}
        isReordering={isReOrdering}
      />
      <Separator
        orientation="vertical"
        className="h-6  app-hidden lg:block"
      ></Separator>
      {customerId ===
        extractShopifyId(draftOrder?.customer?.id, "Customer") && (
        <>
          <DraftOrderDeleteButton
            handleDelete={handleDelete}
            isDeleting={isDeleting}
          />
          <Separator
            orientation="vertical"
            className="h-6  app-hidden lg:block"
          ></Separator>
        </>
      )}
    </div>
  );
};

export const DraftOrderMobileButtonsSection = ({
  className,
  orderApproverRole,
  draftOrder,
  handleReject,
  isRejecting,
  handleApprove,
  isApproving,
  handleReOrder,
  isReOrdering,
  handleDelete,
  isDeleting,
  customerId,
}: DraftOrderDetailActionsProps) => {
  const shouldApprove = shouldApproveFn(draftOrder);
  const shouldReject = shouldRejectFn(draftOrder);
  return (
    <div className={cn("flex justify-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-outline">
            <Ellipsis
              width={20}
              height={20}
              className="!w-5 !h-5 stroke-primary-main"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="shadow-[0px_4px_30px_0px_rgba(0,0,0,0.25)]"
        >
          {orderApproverRole && (
            <>
              {shouldApprove && (
                <DropdownMenuItem>
                  <DraftOrderApproveButton
                    handleApprove={handleApprove}
                    isApproving={isApproving}
                  />
                </DropdownMenuItem>
              )}
              {shouldReject && (
                <DropdownMenuItem>
                  <DraftOrderDeclineButton
                    handleReject={handleReject}
                    isRejecting={isRejecting}
                  />
                </DropdownMenuItem>
              )}
            </>
          )}

          <DropdownMenuItem>
            <DraftOrderReorderButton
              handleReorder={handleReOrder}
              isReordering={isReOrdering}
            />
          </DropdownMenuItem>

          {customerId ===
            extractShopifyId(draftOrder?.customer?.id, "Customer") && (
            <DropdownMenuItem>
              <DraftOrderDeleteButton
                handleDelete={handleDelete}
                isDeleting={isDeleting}
              />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
