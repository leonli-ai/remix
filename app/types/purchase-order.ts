export interface MailingAddress {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

export interface DraftOrderLineItem {
  customerPartNumber?: string;
  quantity: number;
  price: number;
  sku?: string;
  variantId?: string;
  title?: string;
  taxable?: boolean;
  properties?: any[];
}

export interface PurchaseOrderData {
  note?: string;
  email: string;
  lineItems: DraftOrderLineItem[];
  shippingLine?: {
    price?: number;
    title?: string;
  };
  shippingAddress: MailingAddress;
  billingAddress?: MailingAddress;
  customerId?: string;
  taxExempt?: boolean;
  tags?: string[];
  phone?: string;
  poNumber?: string;
  useCustomerDefaultAddress?: boolean;
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface CompanyLocationResponse {
  id: string;
  name: string;
  billingAddress?: MailingAddress;
  shippingAddress?: MailingAddress;
}

export interface ProductVariant {
  sku: string;
  price: number;
  inventoryQuantity: number;
  title: string;
}

export interface ValidateResult {
  isValid: boolean;
  errorMessage?: string;
} 

export interface ShopifyCustomer {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    state: 'ENABLED' | 'DISABLED' | 'INVITED' | 'DECLINED';
    verifiedEmail: boolean;
    taxExempt: boolean;
    tags: string[];
    addresses: MailingAddress[];
    defaultAddress?: MailingAddress;
    companyContactProfiles?: CompanyContactProfile[];
  }
  
  export interface CompanyContactProfile {
    company?: {
      locations?: {
        edges: Array<{
          node: {
            buyerExperienceConfiguration?: {
              editableShippingAddress: boolean;
            };
            shippingAddress?: MailingAddress;
          };
        }>;
      };
    };
  }
  
  export interface CustomerQueryResponse {
    data?: {
      customers?: {
        edges: Array<{
          node: ShopifyCustomer;
        }>;
      };
    };
  }