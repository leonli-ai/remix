import { useLocation } from "@remix-run/react";
import { useMemo } from "react";

interface Breadcrumb {
  path: string;
  label: string;
}

export function useRouteBreadcrumbs(): Breadcrumb[] {
  const { pathname, search } = useLocation();

  return useMemo(() => {
    const paths = pathname
      .replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, "/") // Replace the language part
      .replace(/\/{2,}/g, "/")
      .replace(/^\/|\/$/g, "")
      .split("/");
    const searchParams = new URLSearchParams(search);
    const routeName = searchParams.get("routeName");

    return paths.map((path, index) => {
      const fullPath = "/" + paths.slice(0, index + 1).join("/");
      const prevPath = index > 0 ? paths[index - 1] : "";

      if (/^\d+$/.test(path) || path.startsWith("gid")) {
        const pathMap: Record<string, string> = {
          customer: routeName ? decodeURIComponent(routeName) : "Details",
          "shopping-lists": routeName
            ? decodeURIComponent(routeName)
            : "Details",
          "orders-pending-approval": routeName
            ? decodeURIComponent(routeName)
            : "Details",
          "order-history": "Order Details",
          quotes: "Quote Details",
          "subscription-orders": routeName
            ? decodeURIComponent(routeName)
            : "Details",
          "edit-subscription": routeName
            ? decodeURIComponent(routeName)
            : "Details",
        };

        return {
          path: `${fullPath}${search}`,
          label: pathMap[prevPath] || "Details",
        };
      }

      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        path: fullPath,
        label: label || "Home",
      };
    });
  }, [pathname, search]);
}
