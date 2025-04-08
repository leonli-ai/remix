import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import type { UserFormData } from "~/lib/schema/users.schema";
import { userSchemaFunction } from "~/lib/schema/users.schema";
import { CustomerInfoFields } from "./CustomerInfoFields";
import { CompanyLocationFields } from "./CompanyLocationFields";
import { useCreateUser } from "~/hooks/use-users";
import { useShopifyInformation } from "~/lib/shopify";
import { useLoading } from "~/hooks/use-global-loading";
import { useNavigate } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_USER_LIST } from "~/constant/react-query-keys";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {useAddLocalePath} from '~/hooks/utils.hooks';

export function UserForm() {
  const { t } = useTranslation();
  const { storeName, shopifyCustomerId, shopifyCompanyId } =
    useShopifyInformation();
  const { setLoading } = useLoading();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {addLocalePath} = useAddLocalePath()
  const UserSchema = userSchemaFunction();

  const form = useForm<UserFormData>({
    resolver: zodResolver(UserSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      companyLocations: [],
    },
  });
  const { mutate: createUser } = useCreateUser();

  const onSubmit = (data: UserFormData) => {
    const isAllSelectedRole = data.companyLocations.every(
      (location) => location.roleId !== "",
    );
    if (isAllSelectedRole) {
      setLoading(true);
      createUser(
        {
          storeName,
          customerId: shopifyCustomerId,
          companyId: shopifyCompanyId,
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            companyLocations: data.companyLocations as any,
          },
        },
        {
          onSuccess: () => {
            setLoading(false);
            navigate(addLocalePath("/apps/customer-account/company-management/customer"));
            queryClient.invalidateQueries({ queryKey: [QUERY_USER_LIST] });
            toast.success(t("user.add.success"));
          },
          onError: (error) => {
            setLoading(false);
            toast.error(error.message);
          },
        },
      );
    } else {
      form.setError("companyLocations", {
        message: t("user.add.select-role"),
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomerInfoFields control={form.control} />
        <CompanyLocationFields
          control={form.control}
          getValues={form.getValues}
          setValue={form.setValue}
        />

        <div className="flex justify-center space-x-4">
          <Button className="w-[240px]" type="submit">
            {t("user.add.create")}
          </Button>
          <Button
            className="w-[240px]"
            type="button"
            variant="outline"
            onClick={() =>
              navigate(addLocalePath("/apps/customer-account/company-management/customer"))
            }
          >
            {t("user.add.cancel")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
