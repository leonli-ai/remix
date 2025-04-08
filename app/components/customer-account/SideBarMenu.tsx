import { Link, useLocation, useNavigate, useParams } from "@remix-run/react";
import {
  Building2Icon,
  CalendarSync,
  FileCheck2,
  FileClock,
  Files,
  FileText,
  HomeIcon,
  List,
  ListOrderedIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomerRole } from "~/hooks/use-customer-role";
import { cn } from "~/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAddLocalePath } from "~/hooks/utils.hooks";

export default function SideBarMenu(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { addLocalePath } = useAddLocalePath();
  const navigate = useNavigate();
  const { companyRole } = useCustomerRole();
  const { locale } = useParams();
  const [openItem, setOpenItem] = useState<string>("");

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const menuItems = useMemo(
    () => [
      ...(companyRole === "Admin"
        ? [
            {
              label: t("sidebar.company-management"),
              icon: <Building2Icon />,
              subItems: [
                {
                  icon: <HomeIcon />,
                  label: t("sidebar.ship-to-locations"),
                  path: addLocalePath(
                    `/apps/customer-account/company-management/ship-to-locations`,
                  ),
                },
                {
                  icon: <UserIcon />,
                  label: t("sidebar.users"),
                  path: addLocalePath(
                    `/apps/customer-account/company-management/customer`,
                  ),
                },
              ],
            },
          ]
        : []),
      {
        icon: <ListOrderedIcon />,
        label: t("sidebar.quick-order"),
        path: addLocalePath(`/apps/customer-account/quick-order`),
      },
      {
        icon: <List />,
        label: t("sidebar.shopping-lists"),
        path: addLocalePath(`/apps/customer-account/shopping-lists`),
      },
      {
        icon: <FileCheck2 />,
        label: t("sidebar.request-for-quote"),
        path: addLocalePath(`/apps/customer-account/request-for-quote`),
      },
      {
        icon: <Files />,
        label: t("sidebar.quotes"),
        path: addLocalePath(`/apps/customer-account/quotes`),
      },
      {
        icon: <FileText />,
        label: t("sidebar.orders-pending-approval"),
        path: addLocalePath(`/apps/customer-account/orders-pending-approval`),
      },
      {
        icon: <FileClock />,
        label: t("sidebar.order-history"),
        path: addLocalePath(`/apps/customer-account/order-history`),
      },
      {
        icon: <CalendarSync />,
        label: t("sidebar.subscription-orders"),
        path: addLocalePath(`/apps/customer-account/subscription-orders`),
      },
    ],
    [companyRole, t],
  );

  const renderMenuItem = (item: any) => {
    if (item.subItems) {
      return (
        <AccordionItem
          key={item.label}
          value={item.label}
          className="px-3 text-outline"
        >
          <AccordionTrigger>
            <div className="flex items-center gap-2 text-outline font-normal">
              {item.icon}
              <span
                className={cn(
                  isActive(item.path) ? "text-white" : "text-primary-text",
                )}
              >
                {item.label}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-4">
              {item.subItems.map((subItem: any) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 border-b px-3 py-4 text-sm",
                    isActive(subItem.path)
                      ? "bg-secondary-main text-white"
                      : "text-outline hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {subItem.icon}
                    <span
                      className={cn(
                        isActive(subItem.path)
                          ? "text-white"
                          : "text-primary-text",
                      )}
                    >
                      {subItem.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex cursor-pointer items-center gap-2 border-b px-3 py-4 text-sm last:border-b-0",
          isActive(item.path)
            ? "bg-secondary-main text-white"
            : "text-outline hover:bg-gray-50",
        )}
      >
        {item.icon}
        <span
          className={cn(
            isActive(item.path) ? "text-white" : "text-primary-text",
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  const hasNestedItems = menuItems.some((item) => item.subItems);

  useEffect(() => {
    menuItems.forEach((item) => {
      item.subItems?.forEach((subItem) => {
        if (subItem.path === pathname) {
          setOpenItem(item.label);
        }
      });
    });
  }, [menuItems, pathname]);

  const handleValueChange = (value: string) => {
    navigate(value);
  };

  const mobileContent = (
    <Select onValueChange={handleValueChange} defaultValue={pathname}>
      <SelectTrigger className="flex lg:hidden">
        <SelectValue placeholder="Select a menu item" />
      </SelectTrigger>
      <SelectContent>
        {menuItems.map((item) => {
          if (item.subItems) {
            return item.subItems.map((subItem) => (
              <SelectItem key={subItem.path} value={subItem.path}>
                {subItem.label}
              </SelectItem>
            ));
          }

          return (
            <SelectItem key={item.path} value={item.path ?? ""}>
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const desktopContent = (
    <div
      className={cn(
        "app-hidden h-full flex-shrink-0 flex-col overflow-y-auto rounded-lg border lg:flex w-[257px]",
        props.className,
      )}
    >
      {hasNestedItems ? (
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
        >
          {menuItems.map(renderMenuItem)}
        </Accordion>
      ) : (
        <div className="flex flex-col">{menuItems.map(renderMenuItem)}</div>
      )}
    </div>
  );

  return (
    <>
      {mobileContent}
      {desktopContent}
    </>
  );
}
