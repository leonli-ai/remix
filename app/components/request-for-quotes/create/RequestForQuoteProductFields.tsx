import { FieldValues, UseFormReturn } from "react-hook-form";
import { RequestForQuoteInformationFormData } from "~/lib/schema/request-for-quote.schema";

import { useTranslation } from "react-i18next";
import { CircleAlert } from "lucide-react";

import _ from "lodash";
import { QuickOrderListActions } from "~/components/quick-order/QuickOrderActions";
import { QuickOrderMobileList } from "~/components/quick-order/QuickOrderMobileList";
import { QuickOrderTable } from "~/components/quick-order/QuickOrderTable";
import {
  createEmptyProductLine,
  extractVariantId,
  getExistingLineWhenSelectProduct,
  getValidQuantity,
  initialProductLines,
} from "~/lib/quick-order";
import { useShopifyInformation } from "~/lib/shopify";
import { formatPrice } from "~/lib/utils";
import { QuickOrderFormSchema } from "~/types/quick-order";

interface ProductLines extends FieldValues {
  productLines: QuickOrderFormSchema["productLines"];
}

interface RequestForQuoteProductFieldsProps {
  form: UseFormReturn<ProductLines>;
  showWarning: boolean;
  isLoadingProductVariants: boolean;
  companyLocationId?: string;
  onTargetPriceChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    lineId: string,
  ) => void;
  onTargetPriceFocus?: (
    e: React.FocusEvent<HTMLInputElement>,
    lineId: string,
  ) => void;
  onTargetPriceBlur?: (
    e: React.FocusEvent<HTMLInputElement>,
    lineId: string,
  ) => void;
  type?: "normal" | "withTargetPrice";
}

export default function RequestForQuoteProductFields({
  form,
  showWarning,
  isLoadingProductVariants,
  companyLocationId,
  onTargetPriceChange,
  onTargetPriceFocus,
  onTargetPriceBlur,
  type = "withTargetPrice",
}: RequestForQuoteProductFieldsProps) {
  const { t } = useTranslation();
  const { storeName } = useShopifyInformation();
  const selectProduct = (
    product: RequestForQuoteInformationFormData["productLines"][string]["product"],
    lineId: string,
  ) => {
    const existingLine = getExistingLineWhenSelectProduct(
      form.getValues("productLines"),
      product?.sku || "",
    );
    if (existingLine) {
      const [existingLineId, existingLineData] = existingLine;
      const newQuantity = getValidQuantity(
        existingLineData?.quantity || 0,
        product.quantityRule?.increment || 1,
        true,
      );
      form.setValue("productLines", {
        ...form.getValues("productLines"),
        [existingLineId]: {
          ...existingLineData,
          quantity: newQuantity,
        },
        [lineId]: createEmptyProductLine(),
      });

      return;
    }
    form.setValue(`productLines.${lineId}`, {
      product: {
        id: product.id,
        variantId: product.variantId,
        name: `${extractVariantId(product.sku || "")}-${product.name}`,
        originalName: product.name,
        sku: product.sku,
        price: product.price,
        uom: product.uom,
        description: product.description,
        quantityAvailable: product.quantityAvailable,
        image: product.image,
        updatedAt: product.updatedAt,
        onlineStoreUrl: product.handle
          ? `${storeName}/products/${product.handle}`
          : "",
        quantityRule: product.quantityRule,
      },
      quantity: product.quantityRule?.minimum || 1,
      selectedUom: product?.uom?.[0] || "",
      targetPrice: formatPrice(
        product.price.amount || 0,
        product.price.currencyCode || "",
      ),
    });
  };

  const addMoreLines = () => {
    const currentLines = form.getValues("productLines");

    const lineId = _.uniqueId("product_");
    form.setValue("productLines", {
      ...currentLines,
      [lineId]: createEmptyProductLine(),
    });
  };

  const removeLine = (id: string) => {
    const currentLines = form.getValues("productLines");
    const { [id]: removed, ...updatedLines } = currentLines;
    form.setValue("productLines", updatedLines);
  };

  const cleanAll = () => {
    form.setValue("productLines", initialProductLines());
  };

  return (
    <div className="">
      <div className="text-lg font-bold my-[10px]">
        {t("request-for-quote.create.table.title")}
      </div>
      {showWarning && (
        <div className="flex items-center gap-2 mb-4">
          <CircleAlert className="w-5 h-5" />
          <span className="text-sm text-warning">
            {t("quick-order.list-head-warning")}
          </span>
        </div>
      )}
      <div className="bg-white lg:border lg:rounded-sm lg:shadow-custom">
        <QuickOrderTable
          type={type}
          form={form}
          selectProduct={selectProduct}
          removeLine={removeLine}
          isLoading={isLoadingProductVariants}
          companyLocationId={companyLocationId}
          onTargetPriceChange={onTargetPriceChange}
          onTargetPriceFocus={onTargetPriceFocus}
          onTargetPriceBlur={onTargetPriceBlur}
        />
        <QuickOrderMobileList
          type={type}
          form={form}
          selectProduct={selectProduct}
          removeLine={removeLine}
          isLoading={isLoadingProductVariants}
          companyLocationId={companyLocationId}
          onTargetPriceChange={onTargetPriceChange}
          onTargetPriceFocus={onTargetPriceFocus}
          onTargetPriceBlur={onTargetPriceBlur}
        />
        <QuickOrderListActions
          form={form}
          onAddMoreLines={addMoreLines}
          cleanAll={cleanAll}
          isLoadingProductVariants={isLoadingProductVariants}
        />
      </div>
    </div>
  );
}
