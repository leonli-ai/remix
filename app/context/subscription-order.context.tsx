import React, { createContext, useState, ReactNode } from "react";
import { CompanyLocationItem, shippingAddress } from "~/types/ship-to-location";
import { EligibleShippingMethod } from "~/types/shipping/shipping-method.schema";

type EditDataForInit = {
  isInit: boolean;
  companyLocationId: string | null;
  shippingMethodId: string | null;
};
interface SubscriptionOrderContextProps {
  companyLocationId: string | null;
  setCompanyLocationId: (companyLocationId: string | null) => void;
  shippingMethod: EligibleShippingMethod | null;
  setShippingMethod: (shippingMethod: EligibleShippingMethod | null) => void;
  shippingAddress: shippingAddress | null;
  setShippingAddress: (shippingAddress: shippingAddress | null) => void;
  paymentMethod: string | null;
  setPaymentMethod: (paymentMethod: string | null) => void;
  isAddingRecommendedProduct: boolean;
  setIsAddingRecommendedProduct: (isAddingRecommendedProduct: boolean) => void;
  isAddingRecommendedProductSkus: string[];
  setIsAddingRecommendedProductSkus: (
    isAddingRecommendedProductSkus: string[],
  ) => void;
  editDataForInit: EditDataForInit;
  setEditDataForInit: (editDataForInit: EditDataForInit) => void;
}

export const SubscriptionOrderContext = createContext<
  SubscriptionOrderContextProps | undefined
>(undefined);

export const SubscriptionOrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [companyLocationId, setCompanyLocationId] = useState<string | null>(
    null,
  );
  const [shippingMethod, setShippingMethod] =
    useState<EligibleShippingMethod | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<shippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isAddingRecommendedProduct, setIsAddingRecommendedProduct] =
    useState<boolean>(false);
  const [isAddingRecommendedProductSkus, setIsAddingRecommendedProductSkus] =
    useState<string[]>([]);
  const [editDataForInit, setEditDataForInit] = useState<EditDataForInit>({
    isInit: false,
    companyLocationId: null,
    shippingMethodId: null,
  });

  return (
    <SubscriptionOrderContext.Provider
      value={{
        companyLocationId,
        setCompanyLocationId,
        shippingMethod,
        setShippingMethod,
        shippingAddress,
        setShippingAddress,
        paymentMethod,
        setPaymentMethod,
        isAddingRecommendedProduct,
        setIsAddingRecommendedProduct,
        isAddingRecommendedProductSkus,
        setIsAddingRecommendedProductSkus,
        editDataForInit,
        setEditDataForInit,
      }}
    >
      {children}
    </SubscriptionOrderContext.Provider>
  );
};
