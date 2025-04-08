import { createContext, useContext } from "react";
import { getLocalStorage } from "./utils";
import Cookies from "js-cookie";

const map = {
  companyId: "company-id",
  companyLocationId: "company-location-id",
  customerId: "customer-id",
};

export const shopifyInformation = {
  storeName: getLocalStorage("store-name"),
  companyId: getLocalStorage(map.companyId),
  companyLocationId: getLocalStorage(map.companyLocationId),
  customerId: getLocalStorage(map.customerId),
  shopifyCompanyId: `gid://shopify/Company/${getLocalStorage(map.companyId)}`,
  shopifyCompanyLocationId: `gid://shopify/CompanyLocation/${getLocalStorage(map.companyLocationId)}`,
  shopifyCustomerId: `gid://shopify/Customer/${getLocalStorage(map.customerId)}`,
  cartCurrency: Cookies.get("cart_currency") || "USD",
};

export const shopifyInformationContext = createContext(shopifyInformation);
export const useShopifyInformation = () =>
  useContext(shopifyInformationContext);
