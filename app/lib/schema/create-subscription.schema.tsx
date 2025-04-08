import { z } from "zod";
import { useTranslation } from "react-i18next";
import { quickOrderFormSchema } from "~/types/quick-order";
import { EligibleShippingMethod } from "~/types/shipping/shipping-method.schema";
import { SUBSCRIPTION_MAX_END_DATE } from "../subscription-orders";

export const SubscriptionOrderInformationSchemaFunction = () => {
  const { t } = useTranslation();
  return z
    .object({
      name: z
        .string({
          message: t("subscription-orders.create.form.name-required"),
        })
        .min(1, {
          message: t("subscription-orders.create.form.name-required"),
        }),
      startDeliveryDate: z.date({
        message: t(
          "subscription-orders.create.form.start-delivery-date-required",
        ),
      }),
      endDeliveryDate: z
        .date()
        .max(new Date(SUBSCRIPTION_MAX_END_DATE), {
          message: t("subscription-orders.create.form.end-delivery-date-max", {
            max: SUBSCRIPTION_MAX_END_DATE,
          }),
        })
        .optional(),
      frequency: z.string({
        message: t("subscription-orders.create.form.frequency-required"),
      }),
      customFrequencyNumber: z.string().optional(),
      customFrequencyUnit: z.string().optional(),

      poNumber: z.string().optional(),

      companyLocationId: z.string({
        message: t("subscription-orders.create.form.customer-account-required"),
      }),

      shippingMethod: z.string({
        message: t("subscription-orders.create.form.shipping-method-required"),
      }),
      shippingMethodMeta: z.custom<EligibleShippingMethod>().optional(),

      productLines: quickOrderFormSchema.shape.productLines,

      // used to calculate shipping method, avoid reset shipping method when order total is changed and when first time render
      orderTotal: z.number().optional(),
    })
    .refine(
      (data) => {
        if (data.endDeliveryDate && data.startDeliveryDate) {
          return data.endDeliveryDate > data.startDeliveryDate;
        }
        return true;
      },
      {
        message: t("subscription-orders.create.form.end-delivery-date-invalid"),
        path: ["endDeliveryDate"],
      },
    )
    .refine(
      (data) => {
        if (data.frequency === "custom") {
          return data.customFrequencyNumber;
        }
        return true;
      },
      {
        message: t(
          "subscription-orders.create.form.custom-frequency-number-required",
        ),
        path: ["customFrequencyNumber"],
      },
    )
    .refine(
      (data) => {
        if (data.frequency === "custom") {
          return data.customFrequencyUnit;
        }
        return true;
      },
      {
        message: t(
          "subscription-orders.create.form.custom-frequency-unit-required",
        ),
        path: ["customFrequencyUnit"],
      },
    );
};

export type SubscriptionOrderInformationFormData = z.infer<
  ReturnType<typeof SubscriptionOrderInformationSchemaFunction>
>;
