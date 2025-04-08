import { format } from "date-fns";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import CustomStatusBadge from "~/components/common/CustomStatusBadge";
import OrderDetailStatusBadgeV2 from "~/components/order-history/order-detail/OrderDetailStatusBadgeV2";
import { Separator } from "~/components/ui/separator";
import { cn, formatPrice } from "~/lib/utils";

type LocationConfig = {
  name: string;
  externalId?: string;
};

type MoneyType = {
  amount: string;
  currencyCode: string;
};

type SubscriptionInfo = {
  number: string;
  companyAccount?: string;
  contactEmail?: string;
  billingAddress?: any;
  shippingAddress?: any;
  orderDate: string;
  orderedBy?: string;
  status: string;
  location?: LocationConfig;
  paymentTerms?: string;
  poNumber?: string;
  shippingMethod?: string;
  startDeliveryDate?: string;
  nextDeliveryDate?: string;
  endDeliveryDate?: string;
  frequency?: string;
  itemCount: number;
  subtotal?: MoneyType;
  total?: MoneyType;
  tax?: MoneyType;
  shipping?: MoneyType;
};

interface InformationCardProps {
  subscription: SubscriptionInfo;
  mobileButtons?: ReactNode;
  desktopButtons?: ReactNode;
  orderStatusBadge?: ReactNode;
}

export default function SubscriptionDetailInformationCard({
  subscription,
  orderStatusBadge,
  mobileButtons,
  desktopButtons,
}: InformationCardProps) {
  const { t } = useTranslation();

  const {
    number,
    companyAccount,
    contactEmail,
    billingAddress,
    shippingAddress,
    orderDate,
    nextDeliveryDate,
    endDeliveryDate,
    orderedBy,
    status,
    paymentTerms,
    poNumber,
    shippingMethod,
    startDeliveryDate,
    frequency,
    itemCount,
    subtotal,
    total,
    tax,
    shipping,
  } = subscription;

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
          "min-h-11 break-words px-0 text-sm text-primary-text lg:min-w-[295px]",
          className,
        )}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="rounded-lg bg-gray-base p-5 flex flex-col gap-y-5 lg:gap-y-0">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="grid grid-cols-2 gap-4 col-span-2">
          <div
            className={cn(
              "flex w-full flex-col px-0 text-base font-bold text-primary-text",
            )}
          >
            <div>
              {t("subscription-orders.detail.information-card.order-number")} #
              {number.replace("#", "")}
            </div>
          </div>

          {mobileButtons}

          <div className="!flex items-center px-0">
            {orderStatusBadge || (
              <CustomStatusBadge
                status={status}
                className="w-fit"
                type={
                  status === "active" || status === "pending"
                    ? "secondary-blue"
                    : "gray"
                }
              />
            )}
          </div>

          <div></div>
        </div>
        <div className="col-span-2">{desktopButtons}</div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3 grid gap-4 grid-cols-2 lg:grid-cols-3">
          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.company-account")}
            </div>
            <p className="break-words">{companyAccount}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.order-date")}
            </div>
            <p className="break-words">
              {format(new Date(orderDate), "dd MMM yyyy, h:mm a")}
            </p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t(
                "subscription-orders.detail.information-card.start-delivery-date",
              )}
            </div>
            <p className="break-words">{startDeliveryDate}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t(
                "subscription-orders.detail.information-card.next-delivery-date",
              )}
            </div>
            <p className="break-words">{nextDeliveryDate}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t(
                "subscription-orders.detail.information-card.end-delivery-date",
              )}
            </div>
            <p className="break-words">{endDeliveryDate}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.frequency")}
            </div>
            <p className="break-words">{frequency || "-"}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.ordered-by")}
            </div>
            <p className="break-words">{orderedBy || "-"}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.contact-email")}
            </div>
            <p className="break-words">{contactEmail || "-"}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.po-number")}
            </div>
            <p className="break-words">{poNumber || "-"}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.payment-terms")}
            </div>
            <p className="break-words">{paymentTerms || "-"}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.billing-address")}
            </div>
            <div className="flex gap-2">
              {billingAddress?.company || ""} {billingAddress?.address1 || ""}{" "}
              {billingAddress?.address2 || ""}
            </div>
            <div className="flex gap-2">
              {renderAddress(billingAddress)}{" "}
              {billingAddress?.countryCodeV2 || ""}{" "}
              {billingAddress?.phone || ""}
            </div>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.shipping-method")}
            </div>
            <p className="break-words">{shippingMethod || "-"}</p>
          </RenderLabel>

          <RenderLabel>
            <div className="text-sm font-bold">
              {t("subscription-orders.detail.information-card.ship-to")}
            </div>
            <div className="flex gap-2">
              {shippingAddress?.company || ""} {shippingAddress?.address1 || ""}{" "}
              {shippingAddress?.address2 || ""}
            </div>
            <div className="flex gap-2">
              {renderAddress(shippingAddress)}{" "}
              {shippingAddress?.countryCodeV2 || ""}{" "}
              {shippingAddress?.phone || ""}
            </div>
          </RenderLabel>
        </div>
        <div className="flex h-fit  flex-col gap-2 rounded-lg border bg-white p-4">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold text-primary-text">
              {t("subscription-orders.detail.information-card.summary")}
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>
                {t("subscription-orders.detail.information-card.item-count")}
              </div>
              <div>
                {itemCount} {t("common.text.upper-items")}
              </div>
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>
                {t("subscription-orders.detail.information-card.subtotal")}
              </div>
              <div>
                {formatPrice(
                  subtotal?.amount || 0,
                  subtotal?.currencyCode || "USD",
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>{t("subscription-orders.detail.information-card.tax")}</div>
              <div>
                {formatPrice(tax?.amount || 0, tax?.currencyCode || "USD")}
              </div>
            </div>
            <div className="flex justify-between text-sm text-primary-text">
              <div>
                {t("subscription-orders.detail.information-card.shipping")}
              </div>
              <div>
                {formatPrice(
                  shipping?.amount || 0,
                  shipping?.currencyCode || "USD",
                )}
              </div>
            </div>
          </div>

          <Separator />
          <div className="flex justify-between text-sm font-bold text-primary-text">
            <div>{t("subscription-orders.detail.information-card.total")}</div>
            <div>
              {formatPrice(total?.amount || 0, total?.currencyCode || "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
