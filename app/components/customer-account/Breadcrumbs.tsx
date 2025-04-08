import { Fragment } from "react";
import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { useRouteBreadcrumbs } from "~/hooks/use-route-breadcrumbs";
import { useTranslation } from "react-i18next";
import _ from "lodash";

export default function Breadcrumbs() {
  const { t } = useTranslation();
  const goBack = () => {
    try {
      const storeName = localStorage.getItem("store-name") ?? "";
      window.location.href = `https://${storeName}`;
    } catch (error) {
      console.error(error);
    }
  };

  const breadcrumbs = useRouteBreadcrumbs().slice(2);

  return (
    <div className="flex items-center gap-2 text-sm px-4 py-[10px] max-w-7xl mx-auto text-[13px] w-full">
      <div
        className="text-main-color hover:underline cursor-pointer text-[13px]"
        onClick={goBack}
      >
        {t("breadcrumbs.home")}
      </div>

      {breadcrumbs.map((breadcrumb, index) => {
        const decodedLabel = decodeURIComponent(breadcrumb.label);
        const i18nKey = `breadcrumbs.${_.kebabCase(decodedLabel)}`;
        const i18nLabel = t(i18nKey);

        const finalLabel = i18nLabel === i18nKey ? decodedLabel : i18nLabel;

        const breadcrumbLabel =
          breadcrumb.label === t("breadcrumbs.customer")
            ? t("breadcrumbs.users")
            : finalLabel;
        const isBreadcrumbCompanyMG =
          breadcrumb.label === t("breadcrumbs.company-management");

        return (
          <Fragment key={breadcrumb.path}>
            <span className="text-gray-500 text-[13px]">{">"}</span>
            {isBreadcrumbCompanyMG ? (
              <div
                className={cn(
                  "text-main-color text-[13px] max-w-[200px] truncate",
                  index === breadcrumbs.length - 1 && "font-bold",
                )}
              >
                {breadcrumbLabel}
              </div>
            ) : (
              <Link
                to={breadcrumb.path}
                className={cn(
                  "text-main-color hover:underline text-[13px] max-w-[200px] truncate",
                  index === breadcrumbs.length - 1 &&
                    "text-gray-700 hover:no-underline font-bold cursor-default",
                )}
              >
                {breadcrumbLabel}
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
