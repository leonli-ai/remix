import { UseFormReturn } from "react-hook-form";
import { ProductSearchResponse } from "./product-variant/product-variant-search.schema";
import { SubscriptionOrderInformationFormData } from "~/lib/schema/create-subscription.schema";
import { EligibleShippingMethod } from "./shipping/shipping-method.schema";

export type AddRecommendedProductAtFormConfig = {
  addType: "to-the-end" | "clean-all";
  cleanStorage?: boolean;
};

export interface AddRecommendedProductAtFormParams {
  form: UseFormReturn<any>;
  productVariants: ProductSearchResponse;
  storeName: string;
  config: AddRecommendedProductAtFormConfig;
}

export type FormatSubscriptionOrderInformationFormData = {
  successLines: any;
  values: SubscriptionOrderInformationFormData;
  shippingMethod: EligibleShippingMethod;
  companyLocationId: string;
  shopifyCustomerId: string;
  shopifyCompanyId: string;
  storeName: string;
};
