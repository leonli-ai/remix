export interface MailingAddress {
  firstName?: string;
  lastName?: string;
  name?: string;
  company?: string;
  address1: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  phone?: string;
  countryCode?: string;
  provinceCode?: string;
}

export interface DraftOrderLineItem {
  sku: string;
  customerPartNumber: string;
  title: string;
  quantity: number;
  price: number;
  taxable?: boolean;
  properties?: any[];
}

export interface ValidateResult {
  isValid: boolean;
  errorMessage?: string;
  validationErrors?: string[];
  poNumber?: string;
  data?: {
    customer?: any;
    products: any[];
    draftOrderInput?: any;
    companyContactProfiles?: any[];
  };
}

export interface ProductVariant {
  sku: string;
  variantId: string;
  price: number;
  inventoryQuantity: number;
  title: string;
  productId: string;
  productTitle: string;
}

export interface CompanyLocation {
  id: string;
  name: string;
  buyerExperienceConfiguration?: {
    editableShippingAddress: boolean;
  };
  shippingAddress?: MailingAddress;
}

export interface Company {
  id: string;
  name: string;
  locations?: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        buyerExperienceConfiguration?: {
          editableShippingAddress: boolean;
        };
        shippingAddress?: MailingAddress;
      };
    }>;
  };
}

export interface CompanyContact {
  id: string;
  title?: string;
  locale?: string;
}

export interface CompanyContactProfile {
  id: string;
  isMainContact?: boolean;
  company: Company;
  companyContact: CompanyContact;
}

export interface ShopifyCustomer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  state?: string;
  companyContactProfiles?: CompanyContactProfile[];
}