import { Input } from "~/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { cn, formatPrice } from "~/lib/utils";
import { ProductSearchField } from "./ProductSearchField";
import type { QuickOrderFormSchema } from "~/types/quick-order";
import { type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import _ from "lodash";

interface FieldProps {
  control: any;
  lineId: string;
  line: QuickOrderFormSchema["productLines"][string];
  label?: string;
  form: UseFormReturn<QuickOrderFormSchema>;
  valueClassName?: string;
}

interface SearchFieldProps extends FieldProps {
  onSelect: (
    product: QuickOrderFormSchema["productLines"][string]["product"],
    lineId: string,
  ) => void;
  companyLocationId?: string;
}

export function ProductNameField({
  control,
  lineId,
  onSelect,
  label,
  form,
  companyLocationId,
}: SearchFieldProps) {
  return (
    <FormField
      control={control}
      name={`productLines.${lineId}.product.name`}
      render={({ field }) => (
        <ProductSearchField
          field={field}
          lineId={lineId}
          onSelect={onSelect}
          label={label}
          form={form}
          companyLocationId={companyLocationId}
        />
      )}
    />
  );
}

export function QuantityField({ control, lineId, label, form }: FieldProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={control}
      name={`productLines.${lineId}.quantity`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="space-y-1">
              {label && (
                <label className="text-sm text-gray-500">{label}</label>
              )}
              <Input
                type="number"
                step="1"
                placeholder={t("quick-order.table.qty-placeholder")}
                {...field}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white h-11"
                onChange={(e) => {
                  if (e.target.value === "") {
                    return field.onChange(null);
                  }
                  form.clearErrors(`productLines.${lineId}.quantity`);
                  return field.onChange(Math.floor(Number(e.target.value)));
                }}
              />
            </div>
          </FormControl>
          <FormMessage className="text-warning" />
        </FormItem>
      )}
    />
  );
}

export function UomField({
  control,
  lineId,
  label,
  line,
  valueClassName,
}: FieldProps) {
  return (
    <FormField
      control={control}
      name={`productLines.${lineId}.selectedUom`}
      render={({}) => (
        <FormItem>
          <FormControl>
            <div className="space-y-1">
              {label && (
                <label className="text-sm text-gray-500">{label}</label>
              )}
              <div className={`text-sm ${valueClassName}`}>
                {line.selectedUom || "-"}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function PriceField(
  props: {
    line: QuickOrderFormSchema["productLines"][string];
    label?: string;
    valueClassName?: string;
    type?: "view" | "edit";
    name?: string; // used for edit mode
    onBlur?: (e: React.FocusEvent<HTMLInputElement>, lineId: string) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>, lineId: string) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>, lineId: string) => void;
  } & FieldProps,
) {
  const {
    control,
    lineId,
    label,
    valueClassName,
    type,
    line,
    name,
    form,
    onBlur,
    onFocus,
    onChange,
  } = props;
  const { t } = useTranslation();

  if (type === "edit" && line.product?.price?.amount) {
    return (
      <FormField
        control={control}
        name={`productLines.${lineId}.${name}`}
        render={({ field }) => {
          return (
            <FormItem>
              <FormControl>
                <div className="space-y-1">
                  {label && (
                    <label className="text-sm text-gray-500">{label}</label>
                  )}
                  <Input
                    placeholder={t(
                      "request-for-quote.create.table.target-price-placeholder",
                    )}
                    {...field}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white h-11"
                    onFocus={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9.]/g,
                        "",
                      );
                      form.clearErrors(`productLines.${lineId}.${name}`);
                      if (onFocus) {
                        onFocus(e, lineId);
                      }
                      return field.onChange(numericValue);
                    }}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9.]/g,
                        "",
                      );
                      form.clearErrors(`productLines.${lineId}.${name}`);
                      if (onChange) {
                        onChange(e, lineId);
                      }
                      return field.onChange(numericValue);
                    }}
                    onBlur={(e) => {
                      const numericValue = _.toNumber(e.target.value);
                      if (_.isNaN(numericValue)) {
                        const price = formatPrice(
                          line.product?.price?.amount || 0,
                          line.product?.price?.currencyCode || "",
                          true,
                        );
                        if (onBlur) {
                          onBlur(e, lineId);
                        }
                        return field.onChange(price);
                      }

                      form.clearErrors(`productLines.${lineId}.${name}`);
                      const price = formatPrice(
                        numericValue,
                        line.product?.price?.currencyCode || "",
                        true,
                      );
                      if (onBlur) {
                        onBlur(e, lineId);
                      }
                      return field.onChange(price);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  return (
    <div>
      {label && <label className={cn("text-sm text-gray-500")}>{label}</label>}
      <div className={cn(valueClassName)}>
        {formatPrice(
          line.product?.price?.amount || 0,
          line.product?.price?.currencyCode || "",
        )}
      </div>
    </div>
  );
}
