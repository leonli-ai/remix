/**
 * Purchase order data structure
 */
export interface PurchaseOrderData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  billingAddress: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    company: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    province: string | null;
    zip: string | null;
    country: string | null;
    phone?: string | null;
    countryCode?: string | null;
    provinceCode?: string | null;
  };
  shippingAddress: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    company: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    province: string | null;
    zip: string | null;
    country: string | null;
    phone?: string | null;
    countryCode?: string | null;
    provinceCode?: string | null;
  };
  items: Array<{
    customerPartNumber: string | null;
    sku: string | null;
    name: string;
    quantity: number;
    price: number;
    taxable: boolean | null;
    properties?: Array<{
      name: string;
      value: string;
    }>;
  }>;
  currency: string | null;
  taxExempt: boolean | null;
  poNumber: string | null;
  note: string | null;
  shippingMethod: string | null;
  paymentTerms: string | null;
  subtotalPrice: number;
  totalTax: number;
  totalShipping: number;
  totalDiscounts: number;
  totalPrice: number;
} 