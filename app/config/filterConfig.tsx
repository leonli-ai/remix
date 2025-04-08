import { useTranslation } from "react-i18next";
import type { FilterConfig, FilterType } from "~/types/filter";

export const draftOrderFilterConfig = (): Record<FilterType, FilterConfig> => {
  const { t } = useTranslation();

  return {
    status: {
      label: t("draft-order.list.filter.status"),
      type: "select",
      placeholder: t("draft-order.list.filter.status-placeholder"),
      options: [
        {
          value: "pending_approval",
          label: t("draft-order.list.filter.status-options.pending-approval"),
        },
        {
          value: "rejected",
          label: t("draft-order.list.filter.status-options.declined"),
        },
      ],
      usePrefix: true,
      queryField: "tag",
      matchType: "",
    },
    order_number: {
      label: t("draft-order.list.filter.order-number"),
      type: "input",
      placeholder: t("draft-order.list.filter.order-number-placeholder"),
      usePrefix: false,
      matchType: "contains",
    },
    po_number: {
      label: t("draft-order.list.filter.order-info"),
      type: "input",
      placeholder: t("draft-order.list.filter.order-info-placeholder"),
      usePrefix: false,
      matchType: "contains",
    },
    created_at: {
      label: t("draft-order.list.filter.created-at"),
      type: "date",
      placeholder: t("draft-order.list.filter.created-at-placeholder"),
      usePrefix: true,
      queryField: "created_at",
      operator: ">=",
      matchType: "",
    },
    updated_at: {
      label: t("draft-order.list.filter.updated-at"),
      type: "date",
      placeholder: t("draft-order.list.filter.updated-at-placeholder"),
      usePrefix: true,
      queryField: "updated_at",
      operator: ">=",
      matchType: "",
    },
  };
};

export type ShoppingListFilterType = "name" | "isDefault";

export const shoppingListFilterConfig = (): Record<
  ShoppingListFilterType,
  FilterConfig
> => {
  const { t } = useTranslation();
  return {
    name: {
      label: t("shopping-list.list.filter.name"),
      type: "input",
      placeholder: t("shopping-list.list.filter.name-placeholder"),
      matchType: "contains",
    },

    isDefault: {
      label: t("shopping-list.list.filter.is-default"),
      type: "select",
      options: [
        { label: t("common.text.yes"), value: "Yes" },
        { label: t("common.text.no"), value: "No" },
      ],
      placeholder: t("shopping-list.list.filter.is-default-placeholder"),
      matchType: "",
    },
  };
};

export type ShoppingListItemsFilterType =
  | "productName"
  | "skuId"
  | "customerPartnerNumber";

export const shoppingListItemsFilterConfig = (): Record<
  ShoppingListItemsFilterType,
  FilterConfig
> => {
  const { t } = useTranslation();

  return {
    productName: {
      label: t("shopping-list.detail.filter.product-name"),
      type: "input",
      placeholder: t("shopping-list.detail.filter.product-name-placeholder"),
      matchType: "contains",
    },
    skuId: {
      label: t("shopping-list.detail.filter.sku-id"),
      type: "input",
      placeholder: t("shopping-list.detail.filter.sku-id-placeholder"),
      matchType: "contains",
    },
    customerPartnerNumber: {
      label: t("shopping-list.detail.filter.customer-product"),
      type: "input",
      placeholder: t(
        "shopping-list.detail.filter.customer-product-placeholder",
      ),
      matchType: "contains",
    },
  };
};

export type OrderHistoryFilterType =
  | "name"
  | "po_number"
  | "sku"
  | "status"
  | "purchasing_company_location_id";

export const orderHistoryFilterConfig = (): Record<
  OrderHistoryFilterType,
  FilterConfig
> => {
  const { t } = useTranslation();
  return {
    name: {
      label: t("order-history.list.filter.name"),
      type: "input",
      placeholder: t("order-history.list.filter.name-placeholder"),
      matchType: "contains",
    },
    po_number: {
      label: t("order-history.list.filter.po-number"),
      type: "input",
      placeholder: t("order-history.list.filter.po-number-placeholder"),
      matchType: "contains",
    },
    sku: {
      label: t("order-history.list.filter.sku"),
      type: "input",
      placeholder: t("order-history.list.filter.sku-placeholder"),
      matchType: "contains",
    },
    status: {
      label: t("order-history.list.filter.status"),
      type: "select",
      placeholder: t("order-history.list.filter.status-placeholder"),
      matchType: "",
      options: [
        {
          label: t("order-history.list.filter.status-options.open"),
          value: "open",
        },
        {
          label: t("order-history.list.filter.status-options.cancelled"),
          value: "cancelled",
        },
      ],
    },
    purchasing_company_location_id: {
      label: t("order-history.list.filter.account"),
      type: "select",
      placeholder: t("order-history.list.filter.account-placeholder"),
      matchType: "",
      options: [], // required api
    },
  };
};

export type CompanyLocationFilterType = "name";

export const companyLocationFilterConfig = (): Record<
  CompanyLocationFilterType,
  FilterConfig
> => {
  const { t } = useTranslation();
  return {
    name: {
      label: t("company-location.list.filter.name"),
      type: "input",
      placeholder: t("company-location.list.filter.name-placeholder"),
      matchType: t("company-location.list.filter.matchType") as any,
    },
  };
};

export type UserFilterType = "email";

export const userFilterConfig = (): Record<UserFilterType, FilterConfig> => {
  const { t } = useTranslation();
  return {
    email: {
      label: t("user.list.filter.email"),
      type: "input",
      placeholder: t("user.list.filter.email-placeholder"),
      matchType: "contains",
    },
  };
};

export type RequestForQuoteFilterType =
  | "id"
  | "status"
  | "poNumber"
  | "createdAt"
  | "customer"
  | "expirationDate";

export const requestForQuoteFilterConfig = (): Record<
  RequestForQuoteFilterType,
  FilterConfig
> => {
  const { t } = useTranslation();
  return {
    id: {
      label: t("request-for-quote.list.filter.id"),
      type: "input",
      placeholder: t("request-for-quote.list.filter.id-placeholder"),
      matchType: "contains",
    },
    status: {
      label: t("request-for-quote.list.filter.status"),
      type: "select",
      placeholder: t("request-for-quote.list.filter.status-placeholder"),
      matchType: "",
      options: [
        {
          label: t("request-for-quote.list.filter.status-options.submitted"),
          value: "Submitted",
        },
        {
          label: t("request-for-quote.list.filter.status-options.approved"),
          value: "Approved",
        },
        {
          label: t("request-for-quote.list.filter.status-options.ordered"),
          value: "Ordered",
        },
        {
          label: t("request-for-quote.list.filter.status-options.declined"),
          value: "Declined",
        },
        {
          label: t("request-for-quote.list.filter.status-options.cancelled"),
          value: "Cancelled",
        },
        {
          label: t("request-for-quote.list.filter.status-options.expired"),
          value: "Expired",
        },
      ],
    },
    poNumber: {
      label: t("request-for-quote.list.filter.po-number"),
      type: "input",
      placeholder: t("request-for-quote.list.filter.po-number-placeholder"),
      matchType: "contains",
    },
    createdAt: {
      label: t("request-for-quote.list.filter.created-at"),
      type: "date",
      placeholder: t("request-for-quote.list.filter.created-at-placeholder"),
      matchType: "",
    },
    expirationDate: {
      label: t("request-for-quote.list.filter.expiration-date"),
      type: "date",
      placeholder: t(
        "request-for-quote.list.filter.expiration-date-placeholder",
      ),
      matchType: "",
    },
    customer: {
      label: t("request-for-quote.list.filter.owner"),
      type: "input",
      placeholder: t("request-for-quote.list.filter.owner-placeholder"),
      matchType: "contains",
    },
  };
};

// todo: add filter config, base on api params
export type SubscriptionOrdersFilterType =
  | "orderNumber"
  | "name"
  | "status"
  | "nextOrderCreationDateFrom"
  | "approvedByName";

export const subscriptionOrdersFilterConfig = (): Record<
  SubscriptionOrdersFilterType,
  FilterConfig
> => {
  const { t } = useTranslation();
  return {
    orderNumber: {
      label: t("subscription-orders.list.filter.order-number"),
      type: "input",
      placeholder: t(
        "subscription-orders.list.filter.order-number-placeholder",
      ),
      matchType: "contains",
    },
    name: {
      label: t("subscription-orders.list.filter.order-name"),
      type: "input",
      placeholder: t("subscription-orders.list.filter.order-name-placeholder"),
      matchType: "contains",
    },
    status: {
      label: t("subscription-orders.list.filter.status"),
      type: "select",
      placeholder: t("subscription-orders.list.filter.status-placeholder"),
      matchType: "",
      options: [
        {
          label: t("subscription-orders.list.filter.status-options.active"),
          value: "active",
        },
        {
          label: t("subscription-orders.list.filter.status-options.declined"),
          value: "declined",
        },
        {
          label: t("subscription-orders.list.filter.status-options.pending"),
          value: "pending",
        },
        {
          label: t("subscription-orders.list.filter.status-options.paused"),
          value: "paused",
        },
        {
          label: t("subscription-orders.list.filter.status-options.cancelled"),
          value: "cancelled",
        },
        {
          label: t("subscription-orders.list.filter.status-options.completed"),
          value: "completed",
        },
      ],
    },

    nextOrderCreationDateFrom: {
      label: t("subscription-orders.list.filter.next-delivery-date"),
      type: "date",
      placeholder: t(
        "subscription-orders.list.filter.next-delivery-date-placeholder",
      ),
      matchType: "",
    },
    approvedByName: {
      label: t("subscription-orders.list.filter.approved-by"),
      type: "input",
      placeholder: t("subscription-orders.list.filter.approved-by-placeholder"),
      matchType: "contains",
    },
  };
};

export type DeliveryHistoryFilterType = "name" | "deliveryDate";

export const deliveryHistoryFilterConfig = (): Record<
  DeliveryHistoryFilterType,
  FilterConfig
> => {
  const { t } = useTranslation();
  return {
    name: {
      label: t("subscription-orders.delivery-history.list.filter.name"),
      type: "input",
      placeholder: t(
        "subscription-orders.delivery-history.list.filter.name-placeholder",
      ),
      matchType: "contains",
    },
    deliveryDate: {
      label: t(
        "subscription-orders.delivery-history.list.filter.delivery-date",
      ),
      type: "date",
      placeholder: t(
        "subscription-orders.delivery-history.list.filter.delivery-date-placeholder",
      ),
      matchType: "",
    },
  };
};
