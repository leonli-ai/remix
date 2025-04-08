import { loggerService } from '~/lib/logger';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { GET_CUSTOMER_BY_IDENTIFIER } from '~/lib/shopify/queries/customer';
import { GET_PRODUCTS_BY_SKUS } from '~/lib/shopify/queries/products';
import type { DraftOrderLineItem } from '~/types/purchase-order';
import type {
  Product,
  ProductVariant
} from '~/types/purchase-order/parse-order.types';
import type { MailingAddress } from '~/types/purchase-order/mailing-address.schema';
import { storeCompanyMappingRepository } from '~/repositories/product-variant/store-company-mapping.repository';

// Constants
const VALIDATION_CONSTANTS = {
  REQUIRED_ADDRESS_FIELDS: ['address1', 'city', 'zip'] as const,
  QUANTITY_RULE_FIELDS: ['minimum', 'maximum', 'increment'] as const
} as const;

export interface ValidationData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  email: string;
  poNumber?: string;
  shippingAddress: MailingAddress;
  lineItems: DraftOrderLineItem[];
}

export interface ValidationResult {
  success: boolean;
  message: string;
  validationErrors?: string[];
  data: {
    isValid: boolean;
    customer: any;
    companyContactProfiles: any[];
    products: Product[];
    poNumber?: string;
  };
}

interface ValidationState {
  customerData: any | null;
  companyContactProfilesData: any[];
  productsData: Product[];
  errors: string[];
}

/**
 * Service for purchase order validation
 */
export class PurchaseOrderValidationService {
  private readonly CLASS_NAME = 'PurchaseOrderValidationService';
  private state: ValidationState;

  constructor() {
    this.state = this.initializeState();
  }

  /**
   * Initialize validation state
   */
  private initializeState(): ValidationState {
    return {
      customerData: null,
      companyContactProfilesData: [],
      productsData: [],
      errors: []
    };
  }

  /**
   * Reset validation state
   */
  private resetValidation(): void {
    this.state = this.initializeState();
  }

  /**
   * Add validation error
   */
  private addError(message: string): void {
    this.state.errors.push(message);
  }

  /**
   * Get all validation errors
   */
  private getErrors(): string[] {
    return this.state.errors;
  }

  /**
   * Create validation result
   */
  private createValidationResult(isValid: boolean, message: string, poNumber?: string): ValidationResult {
    return {
      success: isValid,
      message,
      validationErrors: isValid ? undefined : this.getErrors(),
      data: {
        isValid,
        customer: this.state.customerData,
        companyContactProfiles: this.state.companyContactProfilesData,
        products: this.state.productsData,
        poNumber
      }
    };
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(data: ValidationData): boolean {
    const METHOD = 'validateRequiredFields';
    let isValid = true;

    // Validate email
    if (!data.email) {
      this.addError('Missing required fields: email');
      this.logValidationError(METHOD, 'Missing email field');
      isValid = false;
    }

    // Validate line items
    if (!this.validateLineItems(data.lineItems, METHOD)) {
      isValid = false;
    }

    // Validate shipping address
    if (!this.validateShippingAddress(data.shippingAddress, METHOD)) {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validate line items
   */
  private validateLineItems(lineItems: DraftOrderLineItem[], method: string): boolean {
    let isValid = true;

    if (!lineItems?.length) {
      this.addError('Missing required fields: lineItems');
      this.logValidationError(method, 'Missing lineItems field');
      isValid = false;
    }

    if (Array.isArray(lineItems) && lineItems.length === 0) {
      this.addError('lineItems must be a non-empty array');
      this.logValidationError(method, 'lineItems is empty or not an array');
      isValid = false;
    }

    if (Array.isArray(lineItems)) {
      lineItems.forEach((item, index) => {
        if (!item.quantity || typeof item.price !== 'number') {
          this.addError(`Missing required fields in lineItem[${index}]: quantity or price`);
          this.logValidationError(method, `Missing quantity or price in lineItem ${index}`);
          isValid = false;
        }
      });
    }

    return isValid;
  }

  /**
   * Validate shipping address
   */
  private validateShippingAddress(address: MailingAddress, method: string): boolean {
    if (!address) {
      this.addError('Missing shipping address information');
      this.logValidationError(method, 'Missing shippingAddress');
      return false;
    }

    if (!address.address1) {
      this.addError('Shipping address is incomplete');
      this.logValidationError(method, 'Missing address1 in shippingAddress');
      return false;
    }

    return true;
  }

  /**
   * Query customer information
   */
  private async queryCustomer(storeName: string, email: string) {
    const METHOD = 'queryCustomer';
    
    this.logValidationStart(METHOD, { storeName, email });

    const queryString = `email:${email}`;
    const response = await ShopifyClientManager.query(GET_CUSTOMER_BY_IDENTIFIER, storeName, {
      variables: { email: queryString }
    });

    const customer = response?.data?.customers?.edges?.[0]?.node;
    if (!customer) {
      this.logValidationError(METHOD, 'Customer not found', { email });
      return null;
    }

    this.logValidationSuccess(METHOD, 'Customer found', {
      customerId: customer.id,
      email: customer.email,
      hasCompanyProfiles: !!customer.companyContactProfiles?.length
    });

    return customer;
  }

  /**
   * Format address as an array
   */
  private formatAddress(address: any): string[] {
    if (!address) return [];
    
    const formattedAddress = [];
    
    if (address.address1) formattedAddress.push(address.address1);
    if (address.address2) formattedAddress.push(address.address2);
    
    const cityLine = [
      address.city,
      address.province || address.provinceCode,
      address.zip
    ].filter(Boolean).join(' ');
    
    if (cityLine) formattedAddress.push(cityLine);
    if (address.country) formattedAddress.push(address.country);
    
    return formattedAddress;
  }

  /**
   * Check if addresses match
   */
  private isAddressMatching(customerAddress: any, orderAddress: MailingAddress): boolean {
    if (!customerAddress || !orderAddress) return false;

    const normalize = (str?: string) => str?.toLowerCase().trim() || '';
    
    return VALIDATION_CONSTANTS.REQUIRED_ADDRESS_FIELDS.every(field => 
      normalize(customerAddress[field]) === normalize(orderAddress[field])
    );
  }

  /**
   * Process customer data
   */
  private processCustomerData(customer: any): any {
    if (!customer) return null;
    
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      state: customer.state
    };
  }

  /**
   * Process company contact profiles
   */
  private processCompanyProfiles(customer: any, shippingAddress: MailingAddress): any[] {
    if (!customer?.companyContactProfiles?.length) return [];
    
    return customer.companyContactProfiles.map((profile: any) => {
      const company = profile.company;
      const locations = company?.locations?.edges || [];
      
      const enhancedLocations = locations.map(({ node }: any) => {
        const isMatchingAddress = this.isAddressMatching(node.shippingAddress, shippingAddress);
        
        return {
          id: node.id,
          name: node.name,
          isEditable: node.buyerExperienceConfiguration?.editableShippingAddress,
          isDefault: false,
          isSelected: isMatchingAddress,
          shippingAddress: {
            ...node.shippingAddress,
            formattedAddress: this.formatAddress(node.shippingAddress)
          }
        };
      });
      
      return {
        id: profile.id,
        isMainContact: profile.isMainContact,
        company: {
          id: company.id,
          name: company.name,
          locations: enhancedLocations
        },
        companyContact: profile.companyContact ? {
          id: profile.companyContact.id,
          title: profile.companyContact.title,
          locale: profile.companyContact.locale
        } : null
      };
    });
  }

  /**
   * Query product information
   */
  private async queryProducts(storeName: string, skuQuery: string, limit: number, companyLocationId?: string) {
    const METHOD = 'queryProducts';
    
    this.logValidationStart(METHOD, { storeName, skuQuery, limit, companyLocationId });

    const response = await ShopifyClientManager.query(GET_PRODUCTS_BY_SKUS, storeName, {
      variables: { 
        query: skuQuery, 
        first: limit,
        companyLocationId
      }
    });


    loggerService.info(`${this.CLASS_NAME}.queryProducts: ${JSON.stringify(response?.data?.products?.nodes)}`);

    return response?.data?.products?.nodes || [];
  }

  /**
   * Transform products data
   * Only return variants that match the line items
   */
  private transformProducts(products: any[], lineItems: DraftOrderLineItem[]): Product[] {
    const transformedProducts: Product[] = [];
    
    products.forEach((product) => {
      // Process only variants that match line items
      product.variants.nodes.forEach((variant: any) => {
        // Check if this variant matches any line item
        const matchingLineItem = this.findMatchingOrderItem(variant, lineItems);
        
        if (matchingLineItem) {
          const image = product.images.nodes[0];
          const shopifyPrice = variant.contextualPricing?.price?.amount || variant.price;
          
          transformedProducts.push(this.createProductObject(product, variant, image, matchingLineItem, shopifyPrice));
        }
      });
    });

    return transformedProducts;
  }

  /**
   * Find matching order item for a variant
   */
  private findMatchingOrderItem(variant: any, lineItems: DraftOrderLineItem[]): DraftOrderLineItem | undefined {
    return lineItems.find(item => 
      (item.sku && item.sku === variant.sku) || 
      (item.customerPartNumber && item.customerPartNumber === variant.sku)
    );
  }

  /**
   * Create product object
   */
  private createProductObject(
    product: any,
    variant: any,
    image: any,
    orderItem: DraftOrderLineItem | undefined,
    shopifyPrice: string
  ): Product {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      onlineStoreUrl: product.onlineStoreUrl,
      updatedAt: product.updatedAt,
      image: image ? {
        id: image.id,
        url: image.url
      } : null,
      variant: {
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        price: Number(shopifyPrice),
        parsedPrice: Number(orderItem?.price) || 0,
        currencyCode: variant.contextualPricing?.price?.currencyCode,
        inventoryQuantity: variant.sellableOnlineQuantity,
        availableForSale: variant.availableForSale,
        customUom: variant.metafield?.value,
        quantityRule: variant.contextualPricing?.quantityRule || null,
        quantity: orderItem?.quantity || 0
      }
    };
  }

  /**
   * Validate customer and address
   */
  async validateCustomerAndAddress(storeName: string, email: string, shippingAddress: MailingAddress): Promise<ValidationResult> {
    const METHOD = 'validateCustomerAndAddress';

    this.logValidationStart(METHOD, { storeName, email, shippingAddress });

    const customer = await this.queryCustomer(storeName, email);
    this.state.customerData = this.processCustomerData(customer);
    
    if (!customer) {
      this.addError(`Customer not found: ${email}`);
      return this.createValidationResult(false, 'Customer not found');
    }

    this.state.companyContactProfilesData = this.processCompanyProfiles(customer, shippingAddress);
    
    if (!customer.companyContactProfiles || customer.companyContactProfiles.length === 0) {
      this.addError('No company profiles found for customer');
      this.logValidationError(METHOD, 'No company profiles found', { email });
      return this.createValidationResult(false, 'No company profiles found for customer');
    }

    const hasMatchingAddress = this.state.companyContactProfilesData.some((profile: any) => 
      profile.company.locations.some((location: any) => location.isSelected)
    );

    if (!hasMatchingAddress) {
      this.addError('No matching shipping address found for customer');
      this.logValidationError(METHOD, 'No matching location found', { email, shippingAddress });
      return this.createValidationResult(false, 'No matching shipping address found for customer');
    }

    this.logValidationSuccess(METHOD, 'Found matching location for customer', {
      email,
      profiles: this.state.companyContactProfilesData
    });

    return this.createValidationResult(true, 'Customer and address validation successful');
  }

  /**
   * Validate products
   */
  async validateProducts(storeName: string, lineItems: DraftOrderLineItem[], companyLocationId?: string): Promise<ValidationResult> {
    const METHOD = 'validateProducts';

    this.logValidationStart(METHOD, { storeName, lineItems, companyLocationId });

    const searchQuery = this.buildProductSearchQuery(lineItems);
    const products = await this.queryProducts(storeName, searchQuery, lineItems.length, companyLocationId);
    
    this.state.productsData = this.transformProducts(products, lineItems);
    const variants = this.state.productsData.map(product => product.variant);

    if (!variants.length) {
      this.addError('No product variants found');
      this.logValidationError(METHOD, 'No variants found', { searchQuery });
      return this.createValidationResult(false, 'No product variants found');
    }

    this.logValidationSuccess(METHOD, `Found ${variants.length} variants`);

    const isValid = await this.validateLineItemsWithVariants(lineItems, variants, METHOD);

    return this.createValidationResult(
      isValid, 
      isValid ? 'Products validation successful' : 'Products validation failed'
    );
  }

  /**
   * Build product search query
   */
  private buildProductSearchQuery(lineItems: DraftOrderLineItem[]): string {
    return lineItems
      .map(item => {
        const conditions = [];
        if (item.sku) conditions.push(`sku:${item.sku}`);
        if (item.customerPartNumber) conditions.push(`sku:${item.customerPartNumber}`);
        return conditions.join(' OR ');
      })
      .filter(query => query)
      .join(' OR ');
  }

  /**
   * Validate line items with product variants
   * @param lineItems - Line items to validate
   * @param variants - Product variants from Shopify
   * @param method - Method name for logging
   * @returns Promise<boolean> indicating validation success
   */
  private async validateLineItemsWithVariants(
    lineItems: DraftOrderLineItem[],
    variants: ProductVariant[],
    method: string
  ): Promise<boolean> {
    // Create a map to store all variants by SKU
    const variantMap = new Map<string, ProductVariant>();
    
    // Log the input data for debugging
    this.logValidationStart(method, {
      lineItemCount: lineItems.length,
      variantCount: variants.length,
      lineItems: lineItems.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      })),
      variants: variants.map(variant => ({
        sku: variant.sku,
        quantity: variant.inventoryQuantity
      }))
    });

    // Process all variants and add them to the map
    variants.forEach(variant => {
      if (variant.sku) {
        variantMap.set(variant.sku, variant);
        this.logValidationSuccess(method, 'Added variant to map', {
          sku: variant.sku,
          inventoryQuantity: variant.inventoryQuantity,
          availableForSale: variant.availableForSale
        });
      }
    });

    let isValid = true;

    // Validate each line item
    for (const item of lineItems) {
      if (!item.sku) {
        this.addError('SKU is required for product validation');
        this.logValidationError(method, 'Missing SKU', { item });
        isValid = false;
        continue;
      }

      const variant = variantMap.get(item.sku);
      if (!variant) {
        this.addError(`Product variant not found: ${item.sku}`);
        this.logValidationError(method, 'Variant not found', { 
          sku: item.sku,
          availableSkus: Array.from(variantMap.keys())
        });
        isValid = false;
        continue;
      }

      if (!this.validateVariantAvailability(item, variant, method)) {
        isValid = false;
        continue;
      }

      if (!this.validateQuantityRules(item, variant, method)) {
        isValid = false;
        continue;
      }

      this.logValidationSuccess(method, 'Validated item successfully', {
        sku: item.sku,
        quantity: item.quantity,
        inventoryQuantity: variant.inventoryQuantity
      });
    }

    this.logValidationSuccess(method, `Validated ${lineItems.length} line items with ${variantMap.size} variants`);

    return isValid;
  }

  /**
   * Validate variant availability
   */
  private validateVariantAvailability(item: DraftOrderLineItem, variant: ProductVariant, method: string): boolean {
    if (!variant.availableForSale || variant.inventoryQuantity < item.quantity) {
      this.addError(`Insufficient inventory for product ${item.title || variant.title}`);
      this.logValidationError(method, 'Insufficient inventory', {
        sku: variant.sku,
        customerPartNumber: variant.customerPartNumber,
        requested: item.quantity,
        available: variant.inventoryQuantity,
        availableForSale: variant.availableForSale
      });
      return false;
    }
    return true;
  }

  /**
   * Validate quantity rules
   */
  private validateQuantityRules(item: DraftOrderLineItem, variant: ProductVariant, method: string): boolean {
    if (!variant.quantityRule) return true;

    const { minimum, maximum, increment } = variant.quantityRule;
    
    if (minimum && item.quantity < minimum) {
      this.addError(`Quantity must be at least ${minimum} for product ${item.title || variant.title}`);
      return false;
    }
    
    if (maximum && item.quantity > maximum) {
      this.addError(`Quantity must not exceed ${maximum} for product ${item.title || variant.title}`);
      return false;
    }
    
    if (increment && item.quantity % increment !== 0) {
      this.addError(`Quantity must be in increments of ${increment} for product ${item.title || variant.title}`);
      return false;
    }

    return true;
  }

  /**
   * Get customer partner numbers for SKUs
   */
  private async getCustomerPartnerNumbers(storeName: string, skus: string[], companyId: string): Promise<Map<string, string | null>> {
    const METHOD = 'getCustomerPartnerNumbers';
    
    try {
      const formattedCompanyId = `gid://shopify/Company/${companyId}`;
      const response = await storeCompanyMappingRepository.batchFetchCustomerNumberDetails({
        storeName,
        companyId: formattedCompanyId,
        skuIds: skus
      });

      const skuToPartnerNumber = new Map<string, string | null>();
      response.forEach(item => {
        skuToPartnerNumber.set(item.skuId as string, item.customerPartnerNumber);
      });

      this.logValidationSuccess(METHOD, 'Retrieved customer partner numbers', {
        storeName,
        companyId,
        skuCount: skus.length,
        mappedCount: response.length
      });

      return skuToPartnerNumber;
    } catch (error) {
      this.logValidationError(METHOD, 'Failed to get customer partner numbers', {
        error,
        storeName,
        companyId,
        skus
      });
      return new Map();
    }
  }

  /**
   * Parse purchase order
   */
  async parsePurchaseOrder(storeName: string, data: ValidationData): Promise<ValidationResult> {
    const METHOD = 'parsePurchaseOrder';
    
    this.logValidationStart(METHOD, {
      storeName,
      orderNumber: data.orderNumber,
      email: data.email
    });

    this.resetValidation();
    
    const requiredFieldsValid = this.validateRequiredFields(data);
    if (!requiredFieldsValid) {
      this.logValidationError(METHOD, 'Required fields validation failed', {
        errors: this.getErrors()
      });
      
      return this.createValidationResult(false, 'Required fields validation failed', data.poNumber);
    }

    // First validate customer and address to get companyLocationId
    const customerValidation = await this.validateCustomerAndAddress(
      storeName, 
      data.email, 
      data.shippingAddress
    );

    // Get companyLocationId from the matching location
    const companyLocationId = this.getMatchingLocationId(this.state.companyContactProfilesData);

    const productsValidation = await this.validateProducts(storeName, data.lineItems, companyLocationId);
    if (!productsValidation.success) {
      return {
        ...productsValidation,
        success: false,
        data: {
          ...productsValidation.data,
          isValid: false,
          poNumber: data.poNumber
        }
      };
    }

    await this.processCompanyProfilesAndPartnerNumbers(customerValidation, storeName, data.poNumber);
    
    return this.handleCustomerValidationResult(customerValidation, data.poNumber);
  }

  /**
   * Process company profiles and partner numbers
   */
  private async processCompanyProfilesAndPartnerNumbers(customerValidation: ValidationResult, storeName: string, poNumber?: string) {
    if (customerValidation.success || (this.getErrors().length === 1 && 
        this.getErrors()[0].includes('No matching shipping address found for customer'))) {
      
      this.state.companyContactProfilesData = this.state.companyContactProfilesData.map((profile: any) => {
        const selectedLocations = profile.company.locations.filter((location: any) => location.isSelected);
        
        return {
          id: profile.id,
          isMainContact: profile.isMainContact,
          company: {
            id: profile.company.id,
            name: profile.company.name,
            locations: selectedLocations.length > 0 ? selectedLocations : profile.company.locations
          },
          companyContact: profile.companyContact
        };
      });

      const companyId = this.state.companyContactProfilesData[0]?.company?.id?.split('/').pop();
      
      if (companyId) {
        const skus = this.state.productsData.map(product => product.variant.sku);
        const skuToPartnerNumber = await this.getCustomerPartnerNumbers(storeName, skus, companyId);
        
        this.state.productsData = this.state.productsData.map(product => ({
          ...product,
          variant: {
            ...product.variant,
            customerPartnerNumber: skuToPartnerNumber.get(product.variant.sku) || null
          }
        }));
      }
    }
  }

  /**
   * Handle customer validation result
   */
  private handleCustomerValidationResult(customerValidation: ValidationResult, poNumber?: string): ValidationResult {
    const METHOD = 'handleCustomerValidationResult';
    
    if (!customerValidation.success) {
      const isOnlyAddressValidationFailed = this.getErrors().length === 1 && 
        this.getErrors()[0].includes('No matching shipping address found for customer');

      return {
        ...customerValidation,
        success: isOnlyAddressValidationFailed,
        data: {
          ...customerValidation.data,
          isValid: false,
          products: this.state.productsData,
          poNumber
        }
      };
    }

    const result = this.createValidationResult(true, 'Purchase order parsed successfully', poNumber);

    this.logValidationSuccess(METHOD, 'Purchase order parsing completed', {
      result: {
        isValid: result.data.isValid,
        errorCount: result.validationErrors?.length || 0,
        hasData: !!result.data
      }
    });
    
    return result;
  }

  /**
   * Get matching location ID from company contact profiles
   */
  private getMatchingLocationId(profiles: any[]): string | undefined {
    for (const profile of profiles) {
      const matchingLocation = profile.company.locations.find((location: any) => location.isSelected);
      if (matchingLocation) {
        return matchingLocation.id;
      }
    }
    return undefined;
  }

  // Logging methods
  private logValidationStart(method: string, data: Record<string, any>): void {
    loggerService.info(`${this.CLASS_NAME}.${method}: Starting validation`, data);
  }

  private logValidationSuccess(method: string, message: string, data?: Record<string, any>): void {
    loggerService.info(`${this.CLASS_NAME}.${method}: ${message}`, data);
  }

  private logValidationError(method: string, message: string, data?: Record<string, any>): void {
    loggerService.error(`${this.CLASS_NAME}.${method}: ${message}`, data);
  }
} 