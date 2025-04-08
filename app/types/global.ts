export interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
  }

export interface CustomerPartnerNumberBySkuType {
  customerPartnerNumberDetails: Array<{
    skuId: string;
    customerPartnerNumber: string;
  }>;
}