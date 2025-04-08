import _ from "lodash";
import type { QuickOrderFormSchema } from "~/types/quick-order";
import {
  extractVariantId,
  flatSearchResultV2,
  getExistingLineWhenSelectProduct,
  getValidQuantity,
} from "./quick-order";
import { formatPrice } from "./utils";
import {
  AddRecommendedProductAtFormParams,
  FormatSubscriptionOrderInformationFormData,
} from "~/types/subscription-orders.types";
import Decimal from "decimal.js";
import { SubscriptionOrderInformationFormData } from "./schema/create-subscription.schema";
import { EligibleShippingMethod } from "~/types/shipping/shipping-method.schema";
import { CreateSubscriptionContractRequest } from "~/types/subscription-contracts/subscription-contract-create.schema";
import { format } from "date-fns";
import { UpdateSubscriptionContractRequest } from "~/types/subscription-contracts/subscription-contract-update.schema";
import { TFunction } from "i18next";
import { ProductInfo } from "~/types/subscription-contracts/subscription-contract-get-by-id.schema";
import { SubscriptionContractStatusType } from "~/types/subscription-contracts/subscription-contract.schema";

export const SUBSCRIPTION_RECOMMENDED_PRODUCT_STORAGE_KEY =
  "subscription-recommended-product";

export const SUBSCRIPTION_MAX_END_DATE = "9999-12-31";

const cleanRecommendedProuctSessionStorage = (cleanStorage: boolean) => {
  if (cleanStorage) {
    sessionStorage.removeItem(SUBSCRIPTION_RECOMMENDED_PRODUCT_STORAGE_KEY);
  }
};

export const addRecommendedProductAtForm = ({
  form,
  productVariants,
  storeName,
  config,
}: AddRecommendedProductAtFormParams) => {
  const { addType = "to-the-end", cleanStorage = true } = config;
  // when type is add, only one product will be added
  const storedRecommendedProducts = sessionStorage.getItem(
    SUBSCRIPTION_RECOMMENDED_PRODUCT_STORAGE_KEY,
  );
  if (!storedRecommendedProducts || !productVariants) return;
  const parsedItems = JSON.parse(storedRecommendedProducts);

  const results = flatSearchResultV2(productVariants?.products);
  const datas = results
    .map((product) => {
      const matchedItem = parsedItems.recommendedProducts.find(
        (item: any) => product.sku === item.sku,
      );
      if (matchedItem) {
        const targetPrice = _.toString(matchedItem?.offerPrice);
        const quantity = matchedItem?.quantity;
        return {
          product: {
            id: product.id,
            variantId: product?.variantId,
            name: `${extractVariantId(product?.sku || "")}-${product?.name}`,
            originalName: product?.name,
            sku: product?.sku,
            price: product?.price,
            uom: [...(product?.uom || [])],
            description: product.description,
            quantityAvailable: product?.quantityAvailable,
            image: product?.image,
            updatedAt: product?.updatedAt,
            onlineStoreUrl: product?.onlineStoreUrl
              ? `${storeName}/products/${product?.onlineStoreUrl}`
              : "",
            quantityRule: product?.quantityRule,
          },
          quantity: quantity || product?.quantityRule?.minimum || 1,
          selectedUom: product?.uom?.[0] || "",
          targetPrice: formatPrice(
            _.toNumber(targetPrice || product?.price?.amount || 0),
            product?.price?.currencyCode || "",
            true,
          ),
        };
      }
    })
    .filter((item) => item);

  const lines = {};
  datas.forEach((item) => {
    const lineId = _.uniqueId("product_");
    const array = lines as Record<
      string,
      QuickOrderFormSchema["productLines"][string]
    >;
    array[lineId] = item;
  });
  if (addType === "clean-all") {
    const orderTotal = getSubsciptionProductTotalPrice(lines);
    form.setValue("productLines", lines);
    form.setValue("orderTotal", orderTotal);
    cleanRecommendedProuctSessionStorage(cleanStorage);
    return;
  }
  if (addType === "to-the-end") {
    const product = productVariants?.products?.[0];
    const variant = product?.variants?.nodes?.[0];
    const existingLine = getExistingLineWhenSelectProduct(
      form.getValues("productLines"),
      variant?.sku || "",
    );
    if (existingLine) {
      const [existingLineId, existingLineData] = existingLine;
      const newQuantity = getValidQuantity(
        existingLineData?.quantity || 0,
        variant?.contextualPricing?.quantityRule?.increment || 1,
        true,
      );
      form.setValue("productLines", {
        ...form.getValues("productLines"),
        [existingLineId]: {
          ...existingLineData,
          quantity: newQuantity,
        },
      });
      cleanRecommendedProuctSessionStorage(cleanStorage);
      return;
    }
    const productLines = form.getValues("productLines");
    const firstEmptyLine = Object.entries(productLines).find(
      ([lineId, lineData]) => {
        if (!lineData?.product?.sku || !lineData?.product?.variantId) {
          return true;
        }
      },
    );

    if (firstEmptyLine) {
      form.setValue("productLines", {
        ...productLines,
        [firstEmptyLine[0]]: datas[0],
      });
      cleanRecommendedProuctSessionStorage(cleanStorage);
      return;
    }

    form.setValue("productLines", {
      ...productLines,
      ...lines,
    });
    cleanRecommendedProuctSessionStorage(cleanStorage);
  }
};

export const getSubsciptionProductTotalPrice = (
  productLines: QuickOrderFormSchema["productLines"],
) => {
  const total = Object.entries(productLines).reduce((acc, [key, value]) => {
    const reg = /[^0-9.]/g;
    const extractNumber = _.toString(value?.targetPrice || "").replace(reg, "");

    const targetPrice = _.toNumber(_.toString(extractNumber).replace(reg, ""));
    return Decimal.add(
      acc,
      Decimal.mul(
        _.toNumber(targetPrice || 0),
        _.toNumber(value?.quantity || 0),
      ),
    ).toNumber();
  }, 0);
  return total;
};

const baseFormatSubscriptionContractRequest = ({
  successLines,
  values,
  shippingMethod,
  config,
}: FormatSubscriptionOrderInformationFormData & {
  config: {
    productWithProductId?: boolean;
  };
}) => {
  const { productWithProductId } = config;
  const productItems = successLines.map((item: any) => {
    return {
      ...(productWithProductId && {
        id: item.product.id,
      }),
      variantId: item.product.variantId,
      quantity: item.quantity,
      sku: item.product.sku,
      price: _.toNumber(item.product.price?.amount || 0),
    };
  });
  const currencyCode = successLines?.[0]?.product?.price?.currencyCode || "USD";

  let intervalValue = 1;
  let intervalUnit = values?.frequency;
  if (values.frequency === "custom") {
    intervalValue = _.toNumber(values?.customFrequencyNumber || 1);
    intervalUnit = values?.customFrequencyUnit || "weekly";
  }

  const { rateProvider } = shippingMethod || {};
  const { definition, participant } = rateProvider || {};

  const priceObject = definition?.price || participant?.fixedFee;

  const shippingLine = {
    title: shippingMethod?.name || "",
    priceWithCurrency: {
      amount: _.toNumber(priceObject?.amount) || 0,
      currencyCode: priceObject?.currencyCode || "",
    },
  };

  return {
    productItems,
    currencyCode,
    intervalValue,
    intervalUnit,
    shippingLine,
  };
};

export const formatCreateSubscriptionContractRequest = ({
  successLines,
  values,
  shippingMethod,
  companyLocationId,
  shopifyCustomerId,
  shopifyCompanyId,
  storeName,
}: FormatSubscriptionOrderInformationFormData): CreateSubscriptionContractRequest => {
  const {
    productItems,
    currencyCode,
    intervalValue,
    intervalUnit,
    shippingLine,
  } = baseFormatSubscriptionContractRequest({
    successLines,
    values,
    shippingMethod,
    companyLocationId,
    shopifyCustomerId,
    shopifyCompanyId,
    storeName,
    config: {
      productWithProductId: false,
    },
  });

  const createParams: CreateSubscriptionContractRequest = {
    storeName,
    customerId: shopifyCustomerId,
    companyId: shopifyCompanyId,
    companyLocationId: companyLocationId || "",
    subscription: {
      name: values.name,
      poNumber: values?.poNumber,
      currencyCode,
      startDate: format(values.startDeliveryDate, "yyyy-MM-dd"),
      endDate: values.endDeliveryDate
        ? format(values.endDeliveryDate, "yyyy-MM-dd")
        : SUBSCRIPTION_MAX_END_DATE,
      intervalValue,
      intervalUnit: intervalUnit as
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "biannual"
        | "annually",
      shippingMethod: shippingLine.title,
      shippingCost: shippingLine.priceWithCurrency?.amount,
      shippingMethodId: shippingMethod?.id,

      items: productItems,
    },
  };

  return createParams;
};

export const formatUpdateSubscriptionContractRequest = ({
  subscriptionContractId,
  successLines,
  values,
  shippingMethod,
  companyLocationId,
  shopifyCustomerId,
  shopifyCompanyId,
  storeName,
}: FormatSubscriptionOrderInformationFormData & {
  subscriptionContractId: number;
}): UpdateSubscriptionContractRequest => {
  const { productItems, intervalValue, intervalUnit, shippingLine } =
    baseFormatSubscriptionContractRequest({
      successLines,
      values,
      shippingMethod,
      companyLocationId,
      shopifyCustomerId,
      shopifyCompanyId,
      storeName,
      config: {
        productWithProductId: false,
      },
    });

  const updateParams: UpdateSubscriptionContractRequest = {
    storeName,
    subscriptionContractId,
    companyLocationId: companyLocationId || "",
    customerId: shopifyCustomerId,
    data: {
      name: values.name,
      poNumber: values?.poNumber,
      startDate: format(values.startDeliveryDate, "yyyy-MM-dd"),
      endDate: values.endDeliveryDate
        ? format(values.endDeliveryDate, "yyyy-MM-dd")
        : SUBSCRIPTION_MAX_END_DATE,
      intervalValue,
      intervalUnit: intervalUnit as
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "biannual"
        | "annually",
      shippingMethodName: shippingLine.title,
      shippingCost: shippingLine.priceWithCurrency?.amount,
      shippingMethodId: shippingMethod?.id,

      lines: productItems,
    },
  };

  return updateParams;
};

export const formatSubscriptionListFrequency = (
  intervalUnit: string,
  intervalValue: number,
  t: TFunction,
) => {
  const i18nPrefix = "subscription-orders.list.table.frequency-options";
  const map = {
    daily: t(`${i18nPrefix}.daily`),
    weekly: t(`${i18nPrefix}.weekly`),
    monthly: t(`${i18nPrefix}.monthly`),
    quarterly: t(`${i18nPrefix}.quarterly`),
    biannual: t(`${i18nPrefix}.biannual`),
    annually: t(`${i18nPrefix}.annually`),
    days: t(`${i18nPrefix}.days`),
    weeks: t(`${i18nPrefix}.weeks`),
    months: t(`${i18nPrefix}.months`),
    years: t(`${i18nPrefix}.years`),
  };
  const multipMap = {
    daily: map.days,
    weekly: map.weeks,
    monthly: map.months,
    annually: map.years,
  };
  let text = map[intervalUnit as keyof typeof map];
  if (intervalValue > 1) {
    text = `${intervalValue} ${multipMap[intervalUnit as keyof typeof multipMap]}`;
  }
  return text;
};

export const computedSubscriptionOrderTotal = (
  lines: ProductInfo[],
  shippingCost: number,
) => {
  const productsTotal = lines.reduce((acc, curr) => {
    const variant = curr.variant;
    const price = variant?.price || 0;
    const quantity = variant?.quantity || 0;
    return Decimal.add(acc, Decimal.mul(price, quantity)).toNumber();
  }, 0);
  const Total = Decimal.add(productsTotal, shippingCost).toNumber();

  return {
    subtotal: productsTotal,
    total: Total,
    shipping: shippingCost,
  };
};

export const shouldShowButton = (
  status: SubscriptionContractStatusType,
  applyStatusArray: SubscriptionContractStatusType[],
) => {
  return applyStatusArray.includes(status);
};
