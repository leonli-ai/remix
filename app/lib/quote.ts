import { t } from "i18next";
import _ from "lodash";
import { QuickOrderFormSchema } from "~/types/quick-order";
import {
  QuoteStatusType,
  QuoteWithCustomer,
} from "~/types/quotes/quote.schema";
import { getValidQuantity } from "./quick-order";
import { formatPrice } from "./utils";

export const getStatusColor = (status: QuoteStatusType) => {
  if (status === "Submitted") return "deep-blue";
  if (status === "Approved") return "success";
  if (status === "Ordered") return "blue";
  if (status === "Declined") return "gray";
  if (status === "Cancelled") return "gray";
  return "blue";
};

export const shouldShowWhichByQuotaStatus = (
  status: QuoteStatusType,
  applyStatus: QuoteStatusType[],
) => {
  return applyStatus.includes(status);
};

export const updateValidLines = (
  quoteItems: QuoteWithCustomer["quoteItems"],
  {
    enableQuantityRule = true,
    enableAvailableQuantity = true,
  }: {
    enableQuantityRule?: boolean;
    enableAvailableQuantity?: boolean;
  } = {},
) => {
  const successLines: QuoteWithCustomer["quoteItems"] = [];
  const errorLines: {
    line: QuoteWithCustomer["quoteItems"][number];
    errorId: string;
    error: string;
  }[] = [];
  const successCollect = (line: QuoteWithCustomer["quoteItems"][number]) => {
    successLines.push(line);
  };
  const errorCollect = (
    line: QuoteWithCustomer["quoteItems"][number],
    errorId: string,
    error: string,
  ) => {
    errorLines.push({ line, errorId, error });
  };

  const checkAvailableQuantity = (
    line: QuoteWithCustomer["quoteItems"][number],
  ) => {
    return (line?.quantity || 0) <= (line.variant?.inventoryQuantity || 0);
  };

  const checkQuantityRule = (line: QuoteWithCustomer["quoteItems"][number]) => {
    const quantityRule = line.variant?.quantityRule;
    const { minimum, maximum, increment } = quantityRule;
    if (minimum && (line?.quantity || 0) < minimum) {
      return {
        status: (line?.quantity || 0) >= minimum,
        message: t(
          "request-for-quote.detail.action-card.submit-action.min-quantity",
          {
            productTitle: `${line.variant?.sku} - ${line.variant?.product?.title}`,
            minQuantity: minimum,
          },
        ),
      };
    }
    if (maximum && (line?.quantity || 0) > maximum) {
      return {
        status: (line?.quantity || 0) <= maximum,
        message: t(
          "request-for-quote.detail.action-card.submit-action.max-quantity",
          {
            productTitle: `${line.variant?.sku} - ${line.variant?.product?.title}`,
            maxQuantity: maximum,
          },
        ),
      };
    }
    if (increment && (line?.quantity || 0) % increment !== 0) {
      return {
        status: false,
        message: t(
          "request-for-quote.detail.action-card.submit-action.increment-quantity",
          {
            productTitle: `${line.variant?.sku} - ${line.variant?.product?.title}`,
            increment: increment,
          },
        ),
      };
    }
    return {
      status: true,
      message: "",
    };
  };

  quoteItems.forEach((item) => {
    if (item?.type === "add-product") {
      return;
    }
    if (enableAvailableQuantity && !checkAvailableQuantity(item)) {
      errorCollect(
        item,
        _.uniqueId("out-of-stock"),
        t("request-for-quote.detail.action-card.submit-action.out-of-stock", {
          productTitle: `${item.variant?.sku} - ${item.variant?.product?.title}`,
          maxQuantity: item.variant?.inventoryQuantity,
        }),
      );
      return;
    }
    if (enableQuantityRule) {
      const check = checkQuantityRule(item).status;
      if (!check) {
        errorCollect(
          item,
          _.uniqueId("quantity-rule"),
          checkQuantityRule(item).message,
        );
        return;
      }
    }
    successCollect(item);
  });

  return { successLines, errorLines };
};
export const RESUBMIT_QUOTE_ITEMS_STORAGE_KEY = "resubmit-quote-items";

export const getQuoteExistingLineWhenSelectProduct = (
  quoteItems: QuoteWithCustomer["quoteItems"],
  sku: string | undefined | null,
) => {
  return quoteItems.find((item) => item.variant?.sku === sku);
};

export const setNewCloneDataWhileAddProduct = (
  cloneData: QuoteWithCustomer,
  setCloneData: (data: QuoteWithCustomer) => void,
  res: {
    customerPartnerNumberDetails: {
      customerPartnerNumber: string;
    }[];
  },
  lineId: string,
  product: QuickOrderFormSchema["productLines"][string]["product"],
) => {
  const existingLine = getQuoteExistingLineWhenSelectProduct(
    cloneData?.quoteItems || [],
    product?.sku,
  );
  if (existingLine) {
    const newQuantity = getValidQuantity(
      existingLine?.quantity || 0,
      product.quantityRule?.increment || 1,
      true,
    );
    const formattedProduct = cloneData?.quoteItems
      ?.map((item) =>
        item.variant?.sku === product?.sku
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      )
      .filter((item) => item.id !== lineId);
    const newSubtotal = formattedProduct?.reduce(
      (acc, item) => acc + item.offerPrice * item.quantity,
      0,
    );
    setCloneData({
      ...cloneData,
      quoteItems: formattedProduct,
      subtotal: newSubtotal,
    });
    return;
  }

  const formattedProduct = cloneData?.quoteItems?.map((item) => {
    if (item.id === lineId) {
      return {
        id: _.uniqueId("quote-item-"),
        quantity: product?.quantityRule?.minimum || 1,
        originalPrice: product.price?.amount || 0,
        offerPrice: product.price?.amount || 0,
        updatedAt: product.updatedAt,
        offerPriceShow: formatPrice(
          product.price?.amount || 0,
          cloneData?.currencyCode || "USD",
          true,
        ),
        type: "data",
        variant: {
          customerPartnerNumber:
            res?.customerPartnerNumberDetails?.[0]?.customerPartnerNumber,
          id: product.variantId,
          title: product.name,
          sku: product.sku,
          inventoryQuantity: product.quantityAvailable,
          metafield: {
            value: product?.uom?.[0] || "",
          },
          price: product.price,
          quantityRule: product.quantityRule,
          product: {
            id: product.id,
            title: product.name,
            handle: product.handle,
            images: [
              {
                url: product?.image || "",
              },
            ],
          },
        },
      };
    }
    return item;
  });

  const newSubtotal = formattedProduct?.reduce(
    (acc, item) => acc + _.toNumber(item?.offerPrice) * item?.quantity,
    0,
  );

  setCloneData({
    ...cloneData,
    quoteItems: formattedProduct,
    subtotal: newSubtotal,
  });
};
