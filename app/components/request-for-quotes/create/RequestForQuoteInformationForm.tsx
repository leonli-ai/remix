import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";

import { useNavigate } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { QUERY_QUOTES_LIST } from "~/constant/react-query-keys";
import { useGetProductVariantsByApi } from "~/hooks/use-product-search";
import { useCreateQuote } from "~/hooks/use-quotes";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import {
  extractVariantId,
  filterValidLines,
  flatSearchResultV2,
  initialProductLines,
} from "~/lib/quick-order";
import { RESUBMIT_QUOTE_ITEMS_STORAGE_KEY } from "~/lib/quote";
import type { RequestForQuoteInformationFormData } from "~/lib/schema/request-for-quote.schema";
import { RequestForQuoteInformationSchemaFunction } from "~/lib/schema/request-for-quote.schema";
import { useShopifyInformation } from "~/lib/shopify";
import { formatPrice } from "~/lib/utils";
import type { QuickOrderFormSchema } from "~/types/quick-order";
import type { CreateQuoteInput } from "~/types/quotes/quote.schema";
import RequestForQuoteCreateFormActions from "./RequestForQuoteCreateFormActions";
import RequestForQuoteCustomerFields from "./RequestForQuoteCustomerFields";
import RequestForQuoteProductFields from "./RequestForQuoteProductFields";

const RequestForQuoteInformationForm: React.FC = () => {
  const {
    storeName,
    shopifyCustomerId,
    shopifyCompanyLocationId,
    shopifyCompanyId,
  } = useShopifyInformation();

  const { t } = useTranslation();
  const { addLocalePath } = useAddLocalePath();
  const RequestForQuoteInformationSchema =
    RequestForQuoteInformationSchemaFunction();

  const form = useForm<RequestForQuoteInformationFormData>({
    resolver: zodResolver(RequestForQuoteInformationSchema),
    mode: "onBlur",
    defaultValues: {
      notes: "",
      poNumber: "",
      expirationDate: undefined,
      productLines: {},
    },
  });

  useEffect(() => {
    form.setValue("productLines", initialProductLines());

    // for resubmit quote
    const storedQuoteItems = sessionStorage.getItem(
      RESUBMIT_QUOTE_ITEMS_STORAGE_KEY,
    );
    if (storedQuoteItems) {
      const parsedItems = JSON.parse(storedQuoteItems);
      const skus = parsedItems.quoteItems.map((item) => item.sku);
      setSessionParams(skus);
    }
  }, []);

  const [sessionParams, setSessionParams] = useState<string[]>([]);

  const { data: productVariants, isLoading: isLoadingProductVariants } =
    useGetProductVariantsByApi({
      query: sessionParams,
      storeName: storeName,
      customerId: shopifyCustomerId,
      companyLocationId: shopifyCompanyLocationId,
      companyId: shopifyCompanyId,
    });

  useEffect(() => {
    const storedQuoteItems = sessionStorage.getItem(
      RESUBMIT_QUOTE_ITEMS_STORAGE_KEY,
    );
    if (!storedQuoteItems || !productVariants) return;
    const parsedItems = JSON.parse(storedQuoteItems);

    const results = flatSearchResultV2(productVariants?.products);
    const datas = results
      .map((product) => {
        const matchedItem = parsedItems.quoteItems.find(
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
            quantity: quantity || 1,
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
    form.setValue("notes", parsedItems?.notes || "");
    form.setValue("poNumber", parsedItems?.poNumber || "");
    form.setValue("productLines", lines);
  }, [productVariants]);

  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  const validateLines = (values: RequestForQuoteInformationFormData) => {
    setShowWarning(false);
    const { successLines, errorLines } = filterValidLines(values, {
      enableQuantityRule: true,
      enableAvailableQuantity: true,
    });

    if (errorLines.length > 0) {
      errorLines.forEach((line) => {
        if (line.product.variantId) {
          form.setError(`productLines.${line.lineId}.quantity`, {
            message:
              line?.msg || t("request-for-quote.create.form.invalid-quantity"),
          });
        }
      });

      toast.error(t("request-for-quote.create.form.submit-error-description"));
      return false;
    }

    if (successLines.length === 0) {
      setShowWarning(true);
      toast.error(t("request-for-quote.create.form.submit-warning"));
      return false;
    }

    form.clearErrors();

    return successLines;
  };

  const { mutateAsync: createQuote, isPending: isCreatingQuote } =
    useCreateQuote();
  const queryClient = useQueryClient();

  const handleCreateQuote = (lines: any, values: any) => {
    const currencyCode = lines[0].product.price.currencyCode;
    const quoteItems = lines.map((line: any) => {
      return {
        productId: line.product.id,
        variantId: line.product.variantId,
        quantity: line.quantity,
        originalPrice: _.toNumber(line.product.price.amount),
        offerPrice: _.toNumber(
          _.toString(line.targetPrice).replace(/[^0-9.]/g, ""),
        ),
        description: line.product.description,
      };
    });

    const input: CreateQuoteInput = {
      storeName: storeName,
      quote: {
        requestNote: values.notes,
        poNumber: values.poNumber,
        expirationDate: values.expirationDate?.toISOString(),
        customerId: shopifyCustomerId,
        companyLocationId: shopifyCompanyLocationId,
        currencyCode: currencyCode,
        quoteItems: quoteItems,
      },
    };

    createQuote(input)
      .then((res) => {
        toast.success(t("request-for-quote.create.success"));
        sessionStorage.removeItem(RESUBMIT_QUOTE_ITEMS_STORAGE_KEY);
        navigate(addLocalePath(`/apps/customer-account/quotes/${res.id}`));
        queryClient.invalidateQueries({
          queryKey: [QUERY_QUOTES_LIST],
        });
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const validateSuccess = (values: RequestForQuoteInformationFormData) => {
    const successLines = validateLines(values);

    if (!successLines) {
      return false;
    }

    form.clearErrors();
    handleCreateQuote(successLines, values);
  };

  const validateError = (
    errors: FieldErrors<RequestForQuoteInformationFormData>,
  ) => {
    console.error("validateError ~ errors:", errors);
  };

  const handleSubmit = () => {
    form.handleSubmit(validateSuccess, validateError)();
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <RequestForQuoteCustomerFields control={form.control} />
        <RequestForQuoteProductFields
          form={form}
          showWarning={showWarning}
          isLoadingProductVariants={isLoadingProductVariants}
        />
        <RequestForQuoteCreateFormActions
          onSubmit={handleSubmit}
          onBack={handleBack}
          isLoading={isCreatingQuote}
          isLoadingProductVariants={isLoadingProductVariants}
        />
      </form>
    </FormProvider>
  );
};

export default RequestForQuoteInformationForm;
