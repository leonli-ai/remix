import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { CustomDialog } from "~/components/common/CustomDialog";
import { useState } from "react";
import { CancelQuoteRequest } from "~/types/quotes/quote-cancel.schema";
import { useShopifyInformation } from "~/lib/shopify";
import {
  useCancelQuote,
  useConvertQuoteToOrder,
  useDeleteQuote,
} from "~/hooks/use-quotes";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import {
  QUERY_QUOTES_BY_ID,
  QUERY_QUOTES_LIST,
} from "~/constant/react-query-keys";
import { BulkDeleteQuotesRequest } from "~/types/quotes/quote-delete.schema";
import { useNavigate } from "@remix-run/react";
import { ConvertQuoteToOrderRequest } from "~/types/quotes/quote-convert-order.schema";
import {useAddLocalePath} from '~/hooks/utils.hooks';
interface QuoteDetailDialogProps {
  id: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  type: "cancel" | "delete" | "convert";
}

export function QuoteDetailDialog({
  id,
  isOpen,
  setIsOpen,
  type,
}: QuoteDetailDialogProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const { storeName, shopifyCompanyLocationId, shopifyCustomerId } =
    useShopifyInformation();
  const { mutateAsync: cancelQuote, isPending: isCancelling } =
    useCancelQuote();
  const { mutateAsync: deleteQuote, isPending: isDeleting } = useDeleteQuote();
  const { mutateAsync: convertQuoteToOrder, isPending: isConverting } =
    useConvertQuoteToOrder();
  const {addLocalePath} = useAddLocalePath()
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_QUOTES_BY_ID, { quoteId: _.toNumber(id) }],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_QUOTES_LIST],
    });
  };
  const handleCancelConfirm = () => {
    const params: CancelQuoteRequest = {
      storeName,
      quoteId: _.toNumber(id),
      companyLocationId: shopifyCompanyLocationId,
      customerId: shopifyCustomerId,
      cancelNote: note,
    };
    cancelQuote(params)
      .then((res) => {
        if (res?.code === 200) {
          toast.success(
            t("request-for-quote.detail.dialog.cancel-quote.success"),
          );
        } else {
          return toast.error(res?.message);
        }
        invalidateQueries();
        setIsOpen(false);
      })
      .catch((err) => {
        toast.error(err?.message);
        console.error(err);
      });
  };

  const handleDeleteConfirm = () => {
    const params: BulkDeleteQuotesRequest = {
      storeName,
      quoteIds: [_.toNumber(id)],
      companyLocationId: shopifyCompanyLocationId,
      customerId: shopifyCustomerId,
    };
    deleteQuote(params)
      .then((res) => {
        if (res?.success) {
          toast.success(
            t("request-for-quote.detail.dialog.delete-quote.success"),
          );
        } else {
          return toast.error(res?.message);
        }
        invalidateQueries();
        setIsOpen(false);
        navigate(addLocalePath("/apps/customer-account/quotes"));
      })
      .catch((err) => {
        toast.error(err?.message);
        console.error(err);
      });
  };

  const handleConvertToOrder = () => {
    const params: ConvertQuoteToOrderRequest = {
      storeName,
      quoteId: _.toNumber(id),
      companyLocationId: shopifyCompanyLocationId,
      customerId: shopifyCustomerId,
      note: note,
    };
    convertQuoteToOrder(params)
      .then((res) => {
        if (res?.code === 200) {
          toast.success(
            t("request-for-quote.detail.dialog.convert-quote.success"),
          );
        } else {
          return toast.error(res?.message);
        }
        invalidateQueries();
        setIsOpen(false);
        // navigate("/apps/customer-account/quotes");
      })
      .catch((err) => {
        toast.error(err?.message);
        console.error(err);
      });
  };
  const config: {
    [key: string]: {
      title: string;
      description: string;
      placeholder: string;
      confirmButton: string;
      confirmFunction: () => void;
      confirmLoading: boolean;
      cancelButton: string;
    };
  } = {
    cancel: {
      title: t("request-for-quote.detail.dialog.cancel-quote.title"),
      description: t(
        "request-for-quote.detail.dialog.cancel-quote.description",
      ),
      placeholder: t(
        "request-for-quote.detail.dialog.cancel-quote.placeholder",
      ),
      confirmButton: t(
        "request-for-quote.detail.dialog.cancel-quote.confirm-button",
      ),
      confirmFunction: handleCancelConfirm,
      confirmLoading: isCancelling,
      cancelButton: t(
        "request-for-quote.detail.dialog.cancel-quote.cancel-button",
      ),
    },
    delete: {
      title: t("request-for-quote.detail.dialog.delete-quote.title"),
      description: t(
        "request-for-quote.detail.dialog.delete-quote.description",
      ),
      confirmButton: t(
        "request-for-quote.detail.dialog.delete-quote.confirm-button",
      ),
      confirmFunction: handleDeleteConfirm,
      confirmLoading: isDeleting,
      cancelButton: t(
        "request-for-quote.detail.dialog.delete-quote.cancel-button",
      ),
      placeholder: t(
        "request-for-quote.detail.dialog.delete-quote.placeholder",
      ),
    },
    convert: {
      title: t("request-for-quote.detail.dialog.convert-quote.title"),
      description: t(
        "request-for-quote.detail.dialog.convert-quote.description",
      ),
      confirmButton: t(
        "request-for-quote.detail.dialog.convert-quote.confirm-button",
      ),
      confirmFunction: handleConvertToOrder,
      confirmLoading: isConverting,
      cancelButton: t(
        "request-for-quote.detail.dialog.convert-quote.cancel-button",
      ),
      placeholder: t(
        "request-for-quote.detail.dialog.convert-quote.placeholder",
      ),
    },
  };

  return (
    <CustomDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      className="max-w-md gap-0 px-14 text-primary-text"
      titleClassName="pt-5 !block"
      title={<></>}
      content={
        <div className="flex max-w-[398px] flex-col gap-6 pb-2">
          <div className="self-center text-lg font-bold">
            {config[type]?.title}
          </div>
          <div>{config[type]?.description}</div>
          {type !== "delete" && (
            <div className="pb-4">
              <Textarea
                placeholder={config[type]?.placeholder}
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                className="min-h-[100px]"
              />
              <div className="mt-2 text-sm text-muted-foreground">
                {t(
                  "request-for-quote.detail.dialog.cancel-quote.character-count",
                  {
                    count: note?.length || 0,
                  },
                )}
              </div>
            </div>
          )}
          {/* Action button area */}
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={config[type]?.confirmFunction}
              disabled={
                config[type]?.confirmLoading ||
                (type !== "delete" && note.length === 0)
              }
              className="h-12 w-full"
            >
              {config[type]?.confirmLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                config[type]?.confirmButton
              )}
            </Button>

            <Button
              variant={"outline"}
              disabled={config[type]?.confirmLoading}
              onClick={() => setIsOpen(false)}
              className="h-12 w-full"
            >
              {config[type]?.cancelButton}
            </Button>
          </div>
        </div>
      }
    />
  );
}
