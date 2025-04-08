import { CustomDialog } from "~/components/common/CustomDialog";
import { ReactNode, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { CompanyLocationItem } from "~/types/ship-to-location";
import { useGetShippingMethods } from "~/hooks/use-shipping-method";
import { useShopifyInformation } from "~/lib/shopify";
import { EligibleShippingMethod } from "~/types/shipping/shipping-method.schema";
import _ from "lodash";
import { Loader2 } from "lucide-react";
interface ChooseShippingMethodModalProps {
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (shippingMethod: EligibleShippingMethod) => void;
  onCancel?: () => void;
  selectedCompanyLocation: CompanyLocationItem;
  orderTotal: number;
}
export default function ChooseShippingMethodModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  selectedCompanyLocation,
  orderTotal,
}: ChooseShippingMethodModalProps) {
  const { storeName } = useShopifyInformation();
  // shipping method
  // todo: mock data
  const { data: shippingMethods, isLoading: isShippingMethodsLoading } =
    useGetShippingMethods(
      {
        storeName: storeName,
        countryCode:
          selectedCompanyLocation?.shippingAddress?.countryCode || "",
        provinceCode: selectedCompanyLocation?.shippingAddress?.zoneCode || "",
        orderTotal: orderTotal || 0,
      },
      open,
    );

  const shippingMethodsOptions = useMemo(() => {
    const data =
      _.isArray(shippingMethods) && shippingMethods?.length > 0
        ? shippingMethods
        : [];
    return data?.map((item) => {
      return {
        label: item?.name,
        value: item?.id,
      };
    });
  }, [shippingMethods]);

  const { t } = useTranslation();

  const FormSchema = z.object({
    shippingMethod: z.enum(
      shippingMethodsOptions.map((option) => option.value) as [
        string,
        ...string[],
      ],
      {
        required_error: t(
          "subscription-orders.create.form.shipping-method-modal.required",
        ),
      },
    ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const shippingMethod = shippingMethods?.find(
      (item) => item.id === data.shippingMethod,
    );
    if (shippingMethod) {
      onConfirm?.(shippingMethod);
    }
  };

  const handleConfirm = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const RenderShippingMethods = ({ field }: { field: any }) => {
    if (shippingMethodsOptions.length === 0) {
      return (
        <div className="text-sm text-gray-middle">
          {t(
            "subscription-orders.create.form.shipping-method-modal.no-shipping-methods",
          )}
        </div>
      );
    }
    return (
      <RadioGroup
        onValueChange={field.onChange}
        defaultValue={field.value}
        className="flex flex-col border rounded-md border-grey-light gap-0"
      >
        {shippingMethodsOptions.map((option, index) => (
          <FormItem
            key={option.value}
            className={cn(
              "flex items-center space-x-2 space-y-0 px-2 py-[10px] border-b border-grey-light",
              field.value === option.value && "bg-secondary-light",
              index === shippingMethodsOptions.length - 1 && "border-b-0",
            )}
          >
            <FormControl>
              <RadioGroupItem
                value={option.value}
                className={cn(
                  "w-6 h-6 [&>span>svg]:w-5 [&>span>svg]:h-5",
                  field.value === option.value
                    ? "border-outline"
                    : "border-gray-middle",
                )}
              />
            </FormControl>
            <FormLabel className="text-sm font-semibold text-primary-text">
              {option.label}
            </FormLabel>
          </FormItem>
        ))}
      </RadioGroup>
    );
  };

  return (
    <CustomDialog
      className="max-w-md gap-0 text-primary-text w-fit"
      titleClassName="pt-5 !block"
      content={
        <div className="flex w-[318px] flex-col gap-6 px-3 pb-3">
          <div className="text-lg font-bold text-gray-middle">
            {t("subscription-orders.create.form.shipping-method-modal.title")}
          </div>

          <FormProvider {...form}>
            <FormField
              control={form.control}
              name="shippingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    {isShippingMethodsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <RenderShippingMethods field={field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormProvider>

          <div className="flex gap-5">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-11 w-full"
            >
              {t(
                "subscription-orders.create.form.shipping-method-modal.cancel",
              )}
            </Button>
            <Button
              onClick={handleConfirm}
              className="h-11 w-full"
              disabled={
                shippingMethodsOptions.length === 0 || isShippingMethodsLoading
              }
            >
              {t(
                "subscription-orders.create.form.shipping-method-modal.confirm",
              )}
            </Button>
          </div>
        </div>
      }
      trigger={null}
      title={<></>}
      open={open}
      onOpenChange={onOpenChange}
    ></CustomDialog>
  );
}

ChooseShippingMethodModal.displayName = "ChooseShippingMethodModal";
