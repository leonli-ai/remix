import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { formatPrice } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import infoIcon from "~/assets/icons/quick-order-info-icon.svg";
import { QuoteStatusType } from "~/types/quotes/quote.schema";
import { shouldShowWhichByQuotaStatus } from "~/lib/quote";
import { QuoteDetailDialog } from "./QuoteDetailDialog";
import { useState } from "react";
interface QuoteDetailActionCardProps {
  id: string;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  currencyCode: string;
  onItemUpdateSubmit: () => void;
  isItemUpdaing: boolean;
  status: QuoteStatusType;
  onItemResubmitRequest: () => void;
  isGetCustomerPartnerNumberLoading: boolean;
}

export function QuoteDetailActionCard({
  id,
  isLoading,
  itemCount,
  subtotal,
  currencyCode,
  onItemUpdateSubmit,
  isItemUpdaing,
  status,
  onItemResubmitRequest,
  isGetCustomerPartnerNumberLoading,
}: QuoteDetailActionCardProps) {
  const { t } = useTranslation();

  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-[10px] border rounded-lg p-4 bg-gray-50 h-fit lg:max-w-[300px] print-avoid-break">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-gray-900 text-sm">
          <div>{t("request-for-quote.detail.action-card.item-count")} </div>
          <div>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `${itemCount} ${t("common.text.upper-items")}`
            )}
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex justify-between text-gray-900 text-sm font-bold mb-[10px]">
        <div>{t("request-for-quote.detail.action-card.subtotal")}</div>
        <div>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            formatPrice(subtotal || 0, currencyCode || "", true)
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 mb-[10px]">
        <img src={infoIcon} alt="info" className="w-4 h-4" />
        <div className="text-xs text-black">
          {t("request-for-quote.detail.action-card.notice")}
        </div>
      </div>

      {/* update */}
      {shouldShowWhichByQuotaStatus(status, ["Submitted"]) && (
        <Button
          className="h-[44px] mt-2 no-print"
          onClick={onItemUpdateSubmit}
          disabled={
            isLoading ||
            itemCount === 0 ||
            isItemUpdaing ||
            isGetCustomerPartnerNumberLoading
          }
        >
          {isItemUpdaing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("request-for-quote.detail.action-card.buttons.submit")
          )}
        </Button>
      )}

      {/* convert */}
      {shouldShowWhichByQuotaStatus(status, ["Approved"]) && (
        <Button
          className="h-[44px] mt-2 no-print"
          onClick={() => setConvertDialogOpen(true)}
          disabled={isLoading || itemCount === 0 || status !== "Approved"}
        >
          {t("request-for-quote.detail.action-card.buttons.convert")}
        </Button>
      )}

      {/* resubmit */}
      {shouldShowWhichByQuotaStatus(status, [
        "Approved",
        "Cancelled",
        "Declined",
        "Expired",
        "Ordered",
      ]) && (
        <Button
          className="h-[44px] mt-2 no-print"
          onClick={onItemResubmitRequest}
          disabled={isLoading || itemCount === 0 || isItemUpdaing}
        >
          {isItemUpdaing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("request-for-quote.detail.action-card.buttons.resubmit")
          )}
        </Button>
      )}

      <QuoteDetailDialog
        id={id}
        isOpen={convertDialogOpen}
        setIsOpen={setConvertDialogOpen}
        type="convert"
      />
    </div>
  );
}
