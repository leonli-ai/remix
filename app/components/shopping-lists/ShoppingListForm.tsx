import { forwardRef, useImperativeHandle } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "../ui/textarea";
import { useTranslation } from "react-i18next";
const maxDescriptionLength = 200;
const errorMsg = "Shopping list name must be between 3 and 50 characters";
const formSchema = z.object({
  shoppingListName: z
    .string()
    .nonempty("Shopping list name is required")
    .min(3, errorMsg)
    .max(50, errorMsg),
  shoppingListDescription: z
    .string()
    .max(
      maxDescriptionLength,
      `Description must be ${maxDescriptionLength} characters or less`,
    )
    .optional(),
  isDefault: z.boolean().default(false),
});

export type ShoppingListFormValues = z.infer<typeof formSchema>;

export interface ShoppingListFormRef {
  setError: (name: keyof ShoppingListFormValues, error: FieldError) => void;
}

interface ShoppingListFormProps {
  onSubmit: (values: ShoppingListFormValues) => void;
  onCancel: () => void;
  initialValues?: ShoppingListFormValues;
  isLoading?: boolean;
  submitText?: string;
  type?: "create" | "edit";
  title?: string;
}

export const ShoppingListForm = forwardRef<
  ShoppingListFormRef,
  ShoppingListFormProps
>(
  (
    {
      onSubmit,
      onCancel,
      initialValues,
      isLoading,
      submitText = "Submit",
      type = "create",
      title = "Create New List",
    }: ShoppingListFormProps,
    ref,
  ) => {
    const { t } = useTranslation();
    const formSchema = z.object({
      shoppingListName: z
        .string()
        .nonempty(t("shopping-list.dialog.shopping-list-name-required"))
        .min(3, t("shopping-list.dialog.shopping-list-name-length"))
        .max(50, t("shopping-list.dialog.shopping-list-name-length")),
      shoppingListDescription: z
        .string()
        .max(
          maxDescriptionLength,
          `Description must be ${maxDescriptionLength} characters or less`,
        )
        .optional(),
      isDefault: z.boolean().default(false),
    });
    const form = useForm<ShoppingListFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialValues || {
        shoppingListName: "",
        shoppingListDescription: "",
      },
      mode: "onChange",
    });

    const setError = (
      name: keyof ShoppingListFormValues,
      error: FieldError,
    ) => {
      form.setError(name, error);
    };

    useImperativeHandle(ref, () => ({
      setError: setError,
    }));

    return (
      <div className="flex flex-col gap-6 px-8 pb-2 pt-5 max-w-[398px]">
        <div className="text-lg font-bold self-center text-text-color">
          {title}
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-[44px]"
            id="shopping-list-form"
          >
            <div className="space-y-6 mb-8">
              <FormField
                control={form.control}
                name="shoppingListName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal mb-1 block text-text-color">
                      {t("shopping-list.dialog.shopping-list-form-name-label")}{" "}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "shopping-list.dialog.shopping-list-form-name-placeholder",
                        )}
                        className="!mt-0 border-gray-middle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shoppingListDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal mb-1 block text-text-color">
                      {t(
                        "shopping-list.dialog.shopping-list-form-description-label",
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col relative !mt-0">
                        <Textarea
                          placeholder={t(
                            "shopping-list.dialog.shopping-list-form-description-placeholder",
                          )}
                          rows={4}
                          className="max-h-36 border-gray-middle"
                          {...field}
                        />
                        {/* <div className="self-end text-xs text-muted-foreground mt-2">
                          {field.value?.length || 0}/{maxDescriptionLength}
                        </div> */}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* {type === "create" && ( */}
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        className="w-6 h-6 border border-gray-400 rounded-sm bg-white data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 shadow-none data-[state=checked]:text-white"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal text-text-color">
                      {t(
                        "shopping-list.dialog.shopping-list-form-is-default-label",
                      )}
                    </FormLabel>
                  </FormItem>
                )}
              />
              {/* )} */}
            </div>

            <div className="flex flex-col gap-4 items-center">
              <Button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }}
                className="w-full h-12"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  submitText
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full h-12"
              >
                {t("shopping-list.dialog.shopping-list-form-cancel-button")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  },
);

ShoppingListForm.displayName = "ShoppingListForm";
