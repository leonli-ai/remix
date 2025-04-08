import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn, formatPrice } from "~/lib/utils";
import { useTranslation } from "react-i18next";

import OrderDetailStatusBadgeV2 from "./OrderDetailStatusBadgeV2";
import { FileTextIcon } from "lucide-react";
import { extractPoFileName } from "~/lib/order";
import { TZDate } from "@date-fns/tz";
import { useFetchShopSettings } from "~/hooks/use-draft-order";
import { useShopifyInformation } from "~/lib/shopify";
import { useEffect } from "react";

interface OrderDetailInformationCardProps {
  config: {
    orderNumberTitle?: string;
    orderNumber: string;
    companyName: string;
    contactEmail: string;
    paymentTerms: string;
    shipTo: {
      company: string;
      address1: string;
      address2: string;
      city: string;
      provinceCode: string;
      zip: string;
      countryCodeV2: string;
      phone: string;
    };
    orderDate: string;
    billingAddress: {
      company: string;
      address1: string;
      address2: string;
      city: string;
      provinceCode: string;
      zip: string;
      countryCodeV2: string;
      phone: string;
    };
    shippingMethod: string;
    orderedBy: string;
    status: string;
    financialStatus: string;
    fulfillmentStatus: string;
    poNumber: string;
    location: {
      name: string;
      externalId: string;
    };
    itemCount: number;
    subtotal: {
      amount: number;
      currencyCode: string;
    };
    total: {
      amount: number;
      currencyCode: string;
    };
    tax: {
      amount: number;
      currencyCode: string;
    };
    shipping: {
      amount: number;
      currencyCode: string;
    };
    poLink?: {
      url: string;
      fileType: string;
    };
  };
  desktopButtons: React.ReactNode;
  mobileButtons: React.ReactNode;
  orderStatusBadge?: React.ReactNode;
  hideInvoiceButton?: boolean;
  isDraftOrder?: boolean;
}

export default function OrderDetailInformationCard({
  config,
  desktopButtons,
  mobileButtons,
  orderStatusBadge,
  hideInvoiceButton,
  isDraftOrder,
}: OrderDetailInformationCardProps) {
  const { storeName } = useShopifyInformation();
  const { t } = useTranslation();
  const {
    orderNumber,
    companyName,
    contactEmail,
    paymentTerms,
    shipTo,
    orderDate,
    billingAddress,
    shippingMethod,
    orderedBy,
    status,
    financialStatus,
    fulfillmentStatus,
    poNumber,
    location,
    itemCount,
    subtotal,
    total,
    orderNumberTitle,
    tax,
    shipping,
    poLink,
  } = config;
  const { data: shopSettings } = useFetchShopSettings({
    storeName,
  });
  const timezone = shopSettings?.shop?.ianaTimezone || "America/New_York";

  const renderAddress = (address: any) => {
    const res = `${address?.city || ""}${address?.city ? "," : ""} ${address?.provinceCode || ""} ${address?.zip || ""}`;
    return res.trim().length > 0 ? res : "-";
  };

  const RenderLabel = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div
        className={cn(
          "px-0 text-sm text-primary-text min-h-11 lg:min-w-[295px] break-words",
          className,
        )}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg bg-gray-base p-5 lg:flex-row">
      <div className="grid grid-cols-2 gap-4 lg:gap-x-6 lg:gap-y-5 lg:grid-cols-3 !mb-0">
        <div
          className={cn(
            "flex flex-wrap items-center px-0 text-base font-bold text-primary-text break-all lg:mb-[-4px]",
          )}
        >
          <span className="whitespace-nowrap mr-1">
            {orderNumberTitle ||
              t("order-history.detail.information-card.order-number")}
          </span>
          <span className="whitespace-normal">
            <span className="mr-1">#</span>
            {orderNumber.replace("#", "")}
          </span>
        </div>

        {mobileButtons}

        <div className="!flex items-center px-0 lg:mb-[-4px]">
          {orderStatusBadge || (
            <OrderDetailStatusBadgeV2
              status={status}
              type={status === "OPEN" ? "blue" : "gray"}
              className="w-fit"
            />
          )}
        </div>
        <RenderLabel className="min-h-0 lg:min-h-11 lg:mb-[-4px] no-print">
          {hideInvoiceButton ? (
            <div className="!block"></div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-[44px] w-full lg:w-fit mt-[-1rem] lg:mt-0 no-print"
            >
              {t("order-history.detail.information-card.view-invoice")}
            </Button>
          )}
        </RenderLabel>
        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.company-name")}
          </div>
          <p className="break-words">{companyName}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.order-date")}
          </div>
          <p className="break-words">
            {format(
              new TZDate(new Date(orderDate), timezone || "America/New_York"),
              "dd MMM yyyy, h:mm a",
            )}
          </p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.ordered-by")}
          </div>
          <p className="break-words">{orderedBy}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.contact-email")}
          </div>
          <p className="break-words">{contactEmail}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.financial-status")}
          </div>
          <p className="break-words">{financialStatus}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.fulfillment-status")}
          </div>
          <p className="break-words">{fulfillmentStatus}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.payment-terms")}
          </div>
          <p className="break-words">{paymentTerms || "-"}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.billing-address")}
          </div>
          <div className="flex gap-2">
            {billingAddress?.company || ""} {billingAddress?.address1 || ""}{" "}
            {billingAddress?.address2 || ""}
          </div>
          <div className="flex gap-2">
            {renderAddress(billingAddress)}{" "}
            {billingAddress?.countryCodeV2 || ""} {billingAddress?.phone || ""}
          </div>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.po-number")}
          </div>
          <p className="break-words">{poNumber || "-"}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.ship-to")}
          </div>
          <div className="flex gap-2">
            {shipTo?.company || ""} {shipTo?.address1 || ""}{" "}
            {shipTo?.address2 || ""}
          </div>
          <div className="flex gap-2">
            {renderAddress(shipTo)} {shipTo?.countryCodeV2 || ""}{" "}
            {shipTo?.phone || ""}
          </div>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.shipping-method")}
          </div>
          <p className="break-words">{shippingMethod || "-"}</p>
        </RenderLabel>

        <RenderLabel>
          <div className="text-sm font-bold">
            {t("order-history.detail.information-card.location")}
          </div>
          <p className="break-words">
            {location?.name}
            <span> - </span>
            {location?.externalId}
          </p>
        </RenderLabel>

        {poLink && (
          <RenderLabel className="col-span-2">
            <div className="text-sm font-bold">
              {t("order-history.detail.information-card.po-link")}
            </div>
            <div className="flex">
              <Button
                variant={"link"}
                className="text-primary-main pl-0 truncate"
                onClick={() => {
                  window.open(poLink.url, "_blank");
                }}
              >
                <FileTextIcon className="!w-6 !h-6" />
                <div className="truncate">{extractPoFileName(poLink.url)}</div>
              </Button>
            </div>
          </RenderLabel>
        )}
      </div>

      <div className="flex flex-col gap-5 ">
        {desktopButtons}
        <div className="flex h-fit min-w-72 flex-col gap-2 rounded-lg border bg-white p-4">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold text-primary-text">
              {t("order-history.detail.information-card.summary")}
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>{t("order-history.detail.information-card.item-count")}</div>
              <div>
                {itemCount} {t("common.text.upper-items")}
              </div>
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>{t("order-history.detail.information-card.subtotal")}</div>
              <div>
                {formatPrice(
                  subtotal?.amount || 0,
                  subtotal?.currencyCode || "USD",
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>{t("order-history.detail.information-card.tax")}</div>
              <div>
                {formatPrice(tax?.amount || 0, tax?.currencyCode || "")}
              </div>
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>{t("order-history.detail.information-card.shipping")}</div>
              <div>
                {formatPrice(
                  shipping?.amount || 0,
                  shipping?.currencyCode || "",
                )}
              </div>
            </div>
          </div>

          <Separator />
          <div className="flex justify-between text-sm font-bold text-primary-text">
            <div>{t("order-history.detail.information-card.total")}</div>
            <div>
              {formatPrice(total?.amount || 0, total?.currencyCode || "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
