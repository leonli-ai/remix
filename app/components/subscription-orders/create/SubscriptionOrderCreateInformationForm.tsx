import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import {
  FieldErrors,
  FormProvider,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import RequestForQuoteProductFields from "~/components/request-for-quotes/create/RequestForQuoteProductFields";
import { useGetProductVariantsByApiMutation } from "~/hooks/use-product-search";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import { filterValidLines, initialProductLines } from "~/lib/quick-order";
import {
  SubscriptionOrderInformationSchemaFunction,
  SubscriptionOrderInformationFormData,
} from "~/lib/schema/create-subscription.schema";
import { useShopifyInformation } from "~/lib/shopify";
import {
  addRecommendedProductAtForm,
  formatCreateSubscriptionContractRequest,
  formatUpdateSubscriptionContractRequest,
  SUBSCRIPTION_MAX_END_DATE,
  SUBSCRIPTION_RECOMMENDED_PRODUCT_STORAGE_KEY,
} from "~/lib/subscription-orders";
import SubscriptionOrderCreateCustomerFields from "./SubscriptionOrderCreateCustomerFields";
import SubscriptionOrderCreateFormActions from "./SubscriptionOrderCreateFormActions";
import _ from "lodash";
import { EligibleShippingMethod } from "~/types/shipping/shipping-method.schema";
import { SubscriptionOrderContext } from "~/context/subscription-order.context";
import { AddRecommendedProductAtFormConfig } from "~/types/subscription-orders.types";
import { format } from "date-fns";
import { useCreateSubscriptionOrder } from "~/hooks/use-subscription-orders";
import { useQueryClient } from "@tanstack/react-query";
import {
  QUERY_ALL_SUBSCRIPTION_ORDERS,
  QUERY_SUBSCRIPTION_ORDER_BY_ID,
} from "~/constant/react-query-keys";
import { GetSubscriptionContractByIdResponse } from "~/types/subscription-contracts/subscription-contract-get-by-id.schema";
import { useUpdateSubscriptionOrder } from "~/hooks/use-subscription-orders";
export interface SubscriptionOrderCreateInformationFormRef {
  form: UseFormReturn<SubscriptionOrderInformationFormData>;
  handleAddRecommendedProductAtForm: (
    skus: string[],
    companyLocationId?: string,
    config?: AddRecommendedProductAtFormConfig,
  ) => void;
}

interface SubscriptionOrderCreateInformationFormProps {
  editData?: GetSubscriptionContractByIdResponse;
  type?: "create" | "edit";
}

const SubscriptionOrderCreateInformationForm = forwardRef<
  SubscriptionOrderCreateInformationFormRef,
  SubscriptionOrderCreateInformationFormProps
>(({ type = "create", editData }, ref) => {
  const context = useContext(SubscriptionOrderContext);
  const { t } = useTranslation();
  const { addLocalePath } = useAddLocalePath();
  const navigate = useNavigate();
  const {
    storeName,
    shopifyCustomerId,
    shopifyCompanyLocationId,
    shopifyCompanyId,
  } = useShopifyInformation();

  const handleCancel = () => {
    window.history.back();
  };

  // shipping method modal

  // product variants
  const {
    mutateAsync: getProductVariantsByApi,
    isPending: isLoadingProductVariants,
  } = useGetProductVariantsByApiMutation();

  const SubscriptionOrderInformationSchema =
    SubscriptionOrderInformationSchemaFunction();

  const form = useForm<SubscriptionOrderInformationFormData>({
    resolver: zodResolver(SubscriptionOrderInformationSchema),
  });

  // add recommended product at form, also used to init product while edit form
  const handleAddRecommendedProductAtForm = useCallback(
    (
      skus: string[],
      companyLocationId?: string,
      config: AddRecommendedProductAtFormConfig = {
        addType: "clean-all",
        cleanStorage: true,
      },
    ) => {
      context?.setIsAddingRecommendedProduct(true);
      context?.setIsAddingRecommendedProductSkus(skus);
      getProductVariantsByApi({
        query: skus,
        storeName: storeName,
        customerId: shopifyCustomerId,
        companyLocationId: companyLocationId || shopifyCompanyLocationId,
        companyId: shopifyCompanyId,
      })
        .then((res) => {
          if (_.isEmpty(res?.products)) {
            toast.error(
              t(
                "subscription-orders.recommend-for-you.toast.product-not-found-at-this-location",
              ),
            );
            return;
          }
          addRecommendedProductAtForm({
            form,
            productVariants: res,
            storeName,
            config,
          });
          if (config?.addType === "to-the-end") {
            toast.success(
              t("subscription-orders.recommend-for-you.toast.add-success"),
            );
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error(err?.message);
        })
        .finally(() => {
          context?.setIsAddingRecommendedProduct(false);
          context?.setIsAddingRecommendedProductSkus([]);
        });
    },
    [
      form,
      getProductVariantsByApi,
      storeName,
      shopifyCompanyId,
      shopifyCompanyLocationId,
      shopifyCustomerId,
    ],
  );

  useEffect(() => {
    if (ref && typeof ref === "object") {
      ref.current = {
        form,
        handleAddRecommendedProductAtForm,
      };
    }
  }, [ref, form, handleAddRecommendedProductAtForm]);

  useEffect(() => {
    // for recommended product,when redirect to this page,clean form and add recommended product
    if (type === "create") {
      form.setValue("productLines", initialProductLines());
      const storedQuoteItems = sessionStorage.getItem(
        SUBSCRIPTION_RECOMMENDED_PRODUCT_STORAGE_KEY,
      );
      if (storedQuoteItems) {
        const parsedItems = JSON.parse(storedQuoteItems);
        const skus = parsedItems.recommendedProducts.map(
          (item: any) => item.sku,
        );
        handleAddRecommendedProductAtForm(
          skus,
          context?.companyLocationId || "",
          {
            addType: "clean-all",
            cleanStorage: true,
          },
        );
      }
    } else {
      if (editData) {
        const data = editData?.subscriptionContract;
        const products = data?.lines || [];

        // for edit, init product lines
        const skus = products.map((item: any) => item.variant.sku);
        sessionStorage.setItem(
          SUBSCRIPTION_RECOMMENDED_PRODUCT_STORAGE_KEY,
          JSON.stringify({
            recommendedProducts: products.map((item: any) => {
              const variant = item.variant;
              return {
                sku: variant.sku,
                quantity: variant.quantity,
              };
            }),
          }),
        );

        // name
        form.setValue("name", data?.name);
        // po number
        data?.poNumber && form.setValue("poNumber", data?.poNumber);

        // start delivery date
        form.setValue("startDeliveryDate", new Date(data?.startDate));
        // end delivery date
        if (format(data?.endDate, "yyyy-MM-dd") !== SUBSCRIPTION_MAX_END_DATE) {
          form.setValue("endDeliveryDate", new Date(data?.endDate));
        }

        // for edit, init frequency
        const intervalValue = data?.intervalValue;
        const intervalUnit = data?.intervalUnit;
        if (intervalValue !== 1 || intervalUnit === "daily") {
          form.setValue("frequency", "custom");
          form.setValue("customFrequencyNumber", _.toString(intervalValue));
          form.setValue("customFrequencyUnit", intervalUnit);
        } else {
          form.setValue("frequency", intervalUnit);
        }

        // for edit, init company location id
        data?.companyLocation?.id &&
          form.setValue("companyLocationId", data?.companyLocation?.id);

        // company location id, payment method, shipping address will be set in SubscriptionOrderCreateCustomerFields component
        context?.setEditDataForInit({
          isInit: false,
          companyLocationId: data?.companyLocation?.id || null,
          shippingMethodId: data?.shippingMethodId || null,
        });

        const shippingMethod = {
          id: data?.shippingMethodId || "",
          name: data?.shippingMethodName || "",
          description: data?.shippingMethodName || "",
          active: true,
          rateProvider: {
            type: "DeliveryRateDefinition" as "DeliveryRateDefinition",
            definition: {
              id: "",
              price: {
                amount: _.toString(data?.shippingCost || 0),
                currencyCode: data?.currencyCode || "",
              },
            },
          },
        };

        context?.setShippingMethod(shippingMethod);

        data?.shippingMethodId &&
          form.setValue("shippingMethod", data?.shippingMethodId);

        // for edit, init product lines table
        handleAddRecommendedProductAtForm(skus, data?.companyLocation?.id, {
          addType: "clean-all",
          cleanStorage: true,
        });
      }
    }
  }, []);

  // product lines warning
  const [showWarning, setShowWarning] = useState(false);

  const {
    mutateAsync: createSubscriptionOrder,
    isPending: isCreatingSubscriptionOrder,
  } = useCreateSubscriptionOrder();

  const {
    mutateAsync: updateSubscriptionOrder,
    isPending: isUpdatingSubscriptionOrder,
  } = useUpdateSubscriptionOrder();

  const queryClient = useQueryClient();

  // create subscription order
  const handleCreateSubscriptionOrderAfterSelectShippingMethod = (
    successLines: any,
    values: SubscriptionOrderInformationFormData,
  ) => {
    const params = formatCreateSubscriptionContractRequest({
      successLines,
      values,
      shippingMethod: context?.shippingMethod as EligibleShippingMethod,
      companyLocationId: context?.companyLocationId || "",
      shopifyCustomerId: shopifyCustomerId,
      shopifyCompanyId: shopifyCompanyId,
      storeName: storeName,
    });
    createSubscriptionOrder(params)
      .then((res) => {
        if (res?.success) {
          toast.success(
            res?.message ||
              t(
                "subscription-orders.create.form.toast.create-subscription-order-success",
              ),
          );
          queryClient.invalidateQueries({
            queryKey: [QUERY_ALL_SUBSCRIPTION_ORDERS],
          });
          navigate(addLocalePath("/apps/customer-account/subscription-orders"));
        } else {
          console.error("create subscription order error,res:", res);
          toast.error(
            res?.message ||
              t(
                "subscription-orders.create.form.toast.create-subscription-order-error",
              ),
          );
        }
      })
      .catch((err) => {
        toast.error(
          err?.message ||
            t(
              "subscription-orders.create.form.toast.create-subscription-order-error",
            ),
        );
        console.error("create subscription order error", err);
      });
  };

  const handleUpdateSubsciptionOrder = (
    successLines: any,
    values: SubscriptionOrderInformationFormData,
  ) => {
    if (!editData?.subscriptionContract?.id) {
      console.error("update subscription order error,no subscription order id");
      toast.error(
        t("subscription-orders.create.form.toast.no-subscription-order-id"),
      );
      return;
    }
    const params = formatUpdateSubscriptionContractRequest({
      subscriptionContractId: editData?.subscriptionContract?.id,
      successLines,
      values,
      shippingMethod: context?.shippingMethod as EligibleShippingMethod,
      companyLocationId: context?.companyLocationId || "",
      shopifyCustomerId: shopifyCustomerId,
      shopifyCompanyId: shopifyCompanyId,
      storeName: storeName,
    });

    updateSubscriptionOrder(params)
      .then((res) => {
        if (res?.success) {
          toast.success(
            res?.message ||
              t(
                "subscription-orders.edit.form.toast.update-subscription-order-success",
              ),
          );
          queryClient.invalidateQueries({
            queryKey: [QUERY_ALL_SUBSCRIPTION_ORDERS],
          });
          queryClient.invalidateQueries({
            queryKey: [
              QUERY_SUBSCRIPTION_ORDER_BY_ID,
              { id: editData?.subscriptionContract?.id },
            ],
          });
          navigate(addLocalePath("/apps/customer-account/subscription-orders"));
        } else {
          console.error("update subscription order error,res:", res);
          toast.error(
            res?.message ||
              t(
                "subscription-orders.edit.form.toast.update-subscription-order-error",
              ),
          );
        }
      })
      .catch((err) => {
        console.error("update subscription order error", err);
        toast.error(
          err?.message ||
            t(
              "subscription-orders.edit.form.toast.update-subscription-order-error",
            ),
        );
      });
  };

  // validate form product lines
  const validateLines = (values: SubscriptionOrderInformationFormData) => {
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
              line?.msg ||
              t("subscription-orders.create.form.toast.invalid-quantity"),
          });
        }
      });

      toast.error(t("subscription-orders.create.form.toast.submit-error"));
      return false;
    }

    if (successLines.length === 0) {
      setShowWarning(true);
      toast.error(t("subscription-orders.create.form.toast.submit-warning"));
      return false;
    }

    form.clearErrors();

    return successLines;
  };

  const validateSuccess = (values: SubscriptionOrderInformationFormData) => {
    const successLines = validateLines(values);

    if (!successLines) {
      return false;
    }

    form.clearErrors();

    if (type === "create") {
      // create subscription order when all fields are valid
      handleCreateSubscriptionOrderAfterSelectShippingMethod(
        successLines,
        values,
      );
    } else {
      // update subscription order when all fields are valid
      handleUpdateSubsciptionOrder(successLines, values);
    }
  };

  const validateError = (
    errors: FieldErrors<SubscriptionOrderInformationFormData>,
  ) => {
    console.error("validateError ~ errors:", errors);
  };

  const handleSubmit = () => {
    form.handleSubmit(validateSuccess, validateError)();
  };

  return (
    <div className="mb-5">
      <FormProvider {...form}>
        <form className="flex flex-col gap-y-4">
          <SubscriptionOrderCreateCustomerFields form={form} type={type} />
          <RequestForQuoteProductFields
            form={form}
            showWarning={showWarning}
            isLoadingProductVariants={isLoadingProductVariants}
            companyLocationId={context?.companyLocationId || undefined}
            type="normal"
          />
          <SubscriptionOrderCreateFormActions
            onSubmit={handleSubmit}
            onBack={handleCancel}
            isLoading={
              isCreatingSubscriptionOrder || isUpdatingSubscriptionOrder
            }
            isLoadingProductVariants={isLoadingProductVariants}
            type={type}
          />
        </form>
      </FormProvider>
    </div>
  );
});

SubscriptionOrderCreateInformationForm.displayName =
  "SubscriptionOrderCreateInformationForm";
export default SubscriptionOrderCreateInformationForm;
