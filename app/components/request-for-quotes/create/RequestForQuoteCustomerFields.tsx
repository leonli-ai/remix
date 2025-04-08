import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { RequestForQuoteInformationFormData } from "~/lib/schema/request-for-quote.schema";

import { useMemo } from "react";
import { Separator } from "~/components/ui/separator";
import { useCustomerInformation } from "~/hooks/use-users";
import { useShopifyInformation } from "~/lib/shopify";
import { DatePicker } from "~/components/ui/custom/date-picker";
interface RequestForQuoteCustomerFieldsProps {
  control: Control<RequestForQuoteInformationFormData>;
}
export default function RequestForQuoteCustomerFields({
  control,
}: RequestForQuoteCustomerFieldsProps) {
  const { shopifyCompanyLocationId } = useShopifyInformation();
  const { t } = useTranslation();
  const { data } = useCustomerInformation();

  const matchCompany = useMemo(() => {
    return (data?.roles || [])?.find(
      (role) => role.companyLocationId === shopifyCompanyLocationId,
    )?.companyLocationName;
  }, [data, shopifyCompanyLocationId]);

  return (
    <div className="p-5 bg-gray-base rounded-md text-primary-text">
      <div className="flex flex-col gap-5 pb-6">
        <h2 className="text-base font-bold">
          {t("request-for-quote.create.form.information")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-sm space-y-1">
            <div className="font-bold">
              {t("request-for-quote.create.form.first-name")}
            </div>
            <p>{data?.customer?.firstName || "-"}</p>
          </div>
          <div className="text-sm space-y-1">
            <div className="font-bold">
              {t("request-for-quote.create.form.last-name")}
            </div>
            <p>{data?.customer?.lastName || "-"}</p>
          </div>
          <div className="text-sm space-y-1">
            <div className="font-bold">
              {t("request-for-quote.create.form.email-address")}
            </div>
            <p>{data?.customer?.email || "-"}</p>
          </div>
          <div className="text-sm space-y-1">
            <div className="font-bold">
              {t("request-for-quote.create.form.phone-number")}
            </div>
            <p>{data?.customer?.phone || "-"}</p>
          </div>
          <div className="text-sm space-y-1">
            <div className="font-bold">
              {t("request-for-quote.create.form.company")}
            </div>
            <p>{matchCompany || "-"}</p>
            {/* <p>{data?.company?.name || "-"}</p> */}
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <FormField
          control={control}
          name="poNumber"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-black font-normal">
                {t("request-for-quote.create.form.po-number")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-white"
                  placeholder={t(
                    "request-for-quote.create.form.po-number-placeholder",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-black font-normal">
                {t("request-for-quote.create.form.expiration-date")} *
              </FormLabel>
              <FormControl>
                <DatePicker
                  {...field}
                  className="bg-white border-input text-primary-text"
                  dateFormat="MM/dd/yyyy"
                  placeholder={t(
                    "request-for-quote.create.form.expiration-date-placeholder",
                  )}
                  minDate={new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-black font-normal">
                {t("request-for-quote.create.form.notes")}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="bg-white"
                  rows={4}
                  placeholder={t(
                    "request-for-quote.create.form.notes-placeholder",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
