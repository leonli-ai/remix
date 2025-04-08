import { z } from "zod";
import { useTranslation } from "react-i18next";
import { quickOrderFormSchema } from "~/types/quick-order";
export const RequestForQuoteInformationSchemaFunction = () => {
  const { t } = useTranslation();
  return z.object({
    notes: z.string().optional(),
    poNumber: z.string().optional(),
    expirationDate: z.date({
      message: t("request-for-quote.create.form.expiration-date-required"),
    }),
    productLines: quickOrderFormSchema.shape.productLines,
  });
};

export const QuoteDetailInformationSchemaFunction = () => {
  const { t } = useTranslation();
  return z.object({
    notes: z.string().optional(),
    poNumber: z.string().optional(),
    expirationDate: z.date({
      message: t("request-for-quote.create.form.expiration-date-required"),
    }),
  });
};

export type RequestForQuoteInformationFormData = z.infer<
  ReturnType<typeof RequestForQuoteInformationSchemaFunction>
>;

export type QuoteDetailInformationFormData = z.infer<
  ReturnType<typeof QuoteDetailInformationSchemaFunction>
>;
