import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CustomerPartnerNumberBySkuType } from "~/types/global";
import type { FilterConfig, FilterType } from "~/types/filter";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) ?? "";
  }
  return "";
}

export function extractShopifyProductId(id: string, type: string = "Product") {
  const productId = id?.replace(`gid://shopify/${type}/`, "");
  return `${productId}`;
}

export function extractShopifyId(id: string, type: string = "Product") {
  const extractedId = id?.replace(`gid://shopify/${type}/`, "");
  return `${extractedId}`;
}

export function extractIdFromGid(gid: string, type = "Product") {
  const prefix = `gid://shopify/${type}/`;

  if (gid.startsWith(prefix)) {
    return gid.replace(prefix, "");
  }

  return gid;
}

export function convertToGid(id: string, type = "Product") {
  return `gid://shopify/${type}/${id}`;
}

export function formatPrice(
  amount: string | number,
  currencyCode: string,
  enableZero: boolean = false,
) {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if ((!amount || !currencyCode) && !enableZero) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function locationReplace(location: string) {
  if (typeof window !== "undefined") {
    window.location.replace(location);
  }
}

export const setUrl = (url: string) => {
  return url.startsWith("http") ? url : `https://${url}`;
};

export const getCustomerPartnerNumberBySku = (
  customerPartnerNumberBySkus: CustomerPartnerNumberBySkuType,
  sku: string,
) =>
  customerPartnerNumberBySkus?.customerPartnerNumberDetails?.find(
    (item) => item.skuId === sku,
  )?.customerPartnerNumber;

export const buildQueryString = (
  filterConfig: Record<FilterType, FilterConfig>,
  params: { [key: string]: string },
) => {
  const validParams = Object.entries(params).filter(([_, value]) => value);
  if (!validParams.length) return "";

  const queryParts = validParams
    .map(([key, value]) => {
      if (key === "status" && value === "COMPLETED") {
        return null;
      }

      const config = filterConfig[key as FilterType];
      if (!config) return null;

      const queryKey = config.queryField || key;

      if (key === "status" && value === "pending_approval") {
        return "NOT tag:rejected";
      }

      if (config.type === "date" && config.operator) {
        return `${queryKey}:${config.operator}${value}`;
      }

      return config.usePrefix ? `${queryKey}:${value}` : value;
    })
    .filter(Boolean);

  return queryParts.join(" AND ");
};

export const switchLocationDialog = (
  setIsLocationDialogOpen: (value: boolean) => void,
) => {
  try {
    const locationDropdown = document.querySelector(
      ".header-location-dropdown",
    );

    if (locationDropdown) {
      const locationIcon = document.querySelector(".header-location-icon");
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.height = "100vh";
      (locationDropdown as HTMLElement).style.display = "block";
      if (locationIcon) {
        (locationIcon as HTMLElement).style.transform = "rotate(0deg)";
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLocationDialogOpen(false);
  }
};

export const handlePrint = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    @media print {
      @page { size: portrait; }
      body * { visibility: hidden; }
      .print-section, .print-section * { visibility: visible; }
      .print-section { position: absolute; left: 0; top: 0; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      .print-relative { position: relative !important; }
      .print-grid-cols { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
      .print-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .print-avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .print-avoid-word-hidden {
        overflow: auto !important;
        -webkit-line-clamp: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  window.print();
  document.head.removeChild(style);
};

export const dateFormatter = (date: Date, timezone: string) => {
  const formattedDate = format(
    new TZDate(new Date(date), timezone),
    "MM/dd/yyyy",
  );

  return formattedDate;
};

export function scrollToTop() {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 0);
}
