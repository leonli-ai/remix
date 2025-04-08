import * as z from "zod";
import { useTranslation } from "react-i18next";

export const userSchemaFunction = () => {
  const { t } = useTranslation();
  return z.object({
    firstName: z
      .string()
      .min(1, { message: t("user.add.form.first-name-required") }),
    lastName: z
      .string()
      .min(1, { message: t("user.add.form.last-name-required") }),
    email: z
      .string()
      .min(1, { message: t("user.add.form.email-required") })
      .email({ message: t("user.add.form.email-invalid") }),
    companyLocations: z
      .array(
        z.object({
          locationId: z.string(),
          roleId: z.string(),
        }),
      )
      .nonempty({ message: t("user.add.form.company-locations-required") }),
  });
};

export type UserFormData = z.infer<ReturnType<typeof userSchemaFunction>>;
