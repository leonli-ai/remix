import { ShopifyClientManager } from '~/lib/shopify/client';
import { GET_ORDERS, GET_ORDER_DETAILS } from '~/lib/shopify/queries/order';
import { loggerService } from '~/lib/logger';
import type { OrderListRequest, OrderListResponse } from '~/types/order-management/order-list.schema';
import type { OrderDetail } from '~/types/order-management/order-detail.schema';
import { OrderDetailSchema } from '~/types/order-management/order-detail.schema';
import { GET_CUSTOMER_BY_ID, GET_CUSTOMER_EMAIL } from '~/lib/shopify/queries/customer';
import { GET_DRAFT_ORDER_METAFIELDS } from '~/lib/shopify/queries/draft-order';
import { BATCH_GET_DRAFT_ORDER_METAFIELDS, BATCH_GET_CUSTOMERS } from '~/lib/shopify/queries/batch';
import type { OrderNode, OrderEdge } from '~/types/order-management/order.schema';
import { GET_COMPANY_LOCATION_ADDRESS, GET_COMPANY_LOCATION_PAYMENT_TERMS } from '~/lib/shopify/queries/company-location';
import { BaseError, HttpStatusCode } from '~/lib/errors/base-error';
import { draftOrderService } from './draft-order.service';
import type { CreateDraftOrderInput } from '~/types/quotes/quote-draft-order.schema';
import type { CreateOrderRequest, CreateOrderResponse } from '~/types/order-management/create-order.schema';
import { ORDER_CREATE } from '~/lib/shopify/mutation/order';

export class OrderService {
  /**
   * Extract draft order ID from order metafields
   */
  private extractDraftOrderId(order: OrderNode): string | null {
    try {
      const draftOrderMetafield = order.metafields?.edges?.find(
        (edge) => edge.node.key === 'draftOrder'
      )?.node;

      if (!draftOrderMetafield) {
        return null;
      }

      const parsedValue = JSON.parse(draftOrderMetafield.value);
      return parsedValue.draftOrderId;
    } catch (e) {
      loggerService.error('Failed to extract draft order ID', { error: e, order });
      return null;
    }
  }

  /**
   * Batch get draft order metafields
   */
  private async batchGetDraftOrderMetafields(ids: string[], storeName: string) {
    try {
      const response = await ShopifyClientManager.query(
        BATCH_GET_DRAFT_ORDER_METAFIELDS,
        storeName,
        { variables: { ids } }
      );

      return new Map(
        response.data.nodes
          .filter(Boolean)
          .map((node: any) => [node.id, node.metafield])
      );
    } catch (error) {
      loggerService.error('Failed to batch get draft order metafields', { error, ids });
      return new Map();
    }
  }

  /**
   * Batch get customers
   */
  private async batchGetCustomers(ids: string[], storeName: string) {
    try {
      const response = await ShopifyClientManager.query(
        BATCH_GET_CUSTOMERS,
        storeName,
        { variables: { ids } }
      );

      return new Map(
        response.data.nodes
          .filter(Boolean)
          .map((node: any) => [node.id, node])
      );
    } catch (error) {
      loggerService.error('Failed to batch get customers', { error, ids });
      return new Map();
    }
  }

  /**
   * Fetch orders with pagination
   */
  public async fetchOrders(params: OrderListRequest): Promise<OrderListResponse> {
    loggerService.info('OrderService::Fetching orders', { params });
    try {
      // Get orders first to extract draft order IDs
      const ordersResponse = await ShopifyClientManager.query(
        GET_ORDERS,
        params.storeName,
        {
          variables: {
            ...params.pagination,
            reverse: params.pagination.reverse ?? true,
            sortKey: params.pagination.sortKey ?? "CREATED_AT"
          }
        }
      );

      const { orders, ordersCount } = ordersResponse.data;
      const edges = (orders.edges || []) as OrderEdge[];

      // Extract draft order IDs from the current results
      const draftOrderIds = edges
        .map(({ node }) => this.extractDraftOrderId(node))
        .filter(Boolean) as string[];

      // Parallel fetch of draft orders and customers
      const preloadedData = await (async () => {
        try {
          if (draftOrderIds.length === 0) {
            return {
              draftOrdersMap: new Map(),
              customersMap: new Map()
            };
          }

          // Batch get draft orders
          const draftOrdersMap = await this.batchGetDraftOrderMetafields(
            draftOrderIds,
            params.storeName
          );

          // Extract customer IDs from draft orders
          const customerIds = Array.from(draftOrdersMap.values())
            .map(meta => {
              try {
                return meta && JSON.parse(meta.value).customerId;
              } catch {
                return null;
              }
            })
            .filter(Boolean) as string[];

          // Batch get customers
          const customersMap = await this.batchGetCustomers(
            customerIds,
            params.storeName
          );

          return {
            draftOrdersMap,
            customersMap
          };
        } catch (error) {
          loggerService.error('Failed to preload data', { error });
          return {
            draftOrdersMap: new Map(),
            customersMap: new Map()
          };
        }
      })();

      // Process orders with pre-loaded data
      const ordersWithApprovers = edges.map(({ node, cursor }: OrderEdge) => {
        const draftOrderId = this.extractDraftOrderId(node);
        const approverMeta = draftOrderId 
          ? preloadedData.draftOrdersMap.get(draftOrderId)
          : null;

        let approver = null;
        if (approverMeta) {
          try {
            const customerId = JSON.parse(approverMeta.value).customerId;
            approver = customerId ? preloadedData.customersMap.get(customerId) : null;
          } catch (e) {
            loggerService.error('Failed to parse approver meta', { error: e, meta: approverMeta });
          }
        }

        return {
          ...node,
          cursor,
          status: this.determineOrderStatus(node),
          approver,
          paymentTerms: node.paymentTerms ? {
            ...node.paymentTerms,
            paymentSchedules: {
              edges: node.paymentTerms.paymentSchedules?.edges || []
            }
          } : null
        };
      });

      return {
        orders: ordersWithApprovers,
        pagination: {
          hasNextPage: orders.pageInfo.hasNextPage,
          hasPreviousPage: orders.pageInfo.hasPreviousPage,
          endCursor: orders.pageInfo.endCursor,
          startCursor: orders.pageInfo.startCursor,
          totalCount: ordersCount.count
        }
      };

    } catch (error) {
      loggerService.error('OrderService::Failed to fetch orders', { error, params });
      throw error;
    }
  }

  /**
   * Get order details by ID
   */
  public async getOrderById(orderId: string, storeDomain: string, companyLocationId: string): Promise<OrderDetail> {
    try {
      loggerService.info('OrderService::Getting order details', { orderId, storeDomain, companyLocationId });

      const response = await ShopifyClientManager.query(
        GET_ORDER_DETAILS,
        storeDomain,
        {
          variables: { 
            orderId,
            companyLocationId 
          }
        }
      );

      // Log the raw response for debugging
      loggerService.info('OrderService::Raw Shopify response', { 
        orderId,
        response: JSON.stringify(response, null, 2)
      });



      // Check for GraphQL errors
      if (response?.errors) {
        const errorMessage = typeof response.errors === 'string' 
          ? response.errors 
          : Array.isArray(response.errors)
            ? response.errors.map(e => e.message).join(', ')
            : JSON.stringify(response.errors);

        loggerService.error('OrderService::Shopify query errors', {
          orderId,
          errors: response.errors,
          errorMessage
        });
        throw new Error(`Shopify query failed: ${errorMessage}`);
      }

      if (!response?.data) {
        loggerService.error('OrderService::Invalid response from Shopify', { 
          orderId,
          response: JSON.stringify(response, null, 2)
        });
        throw new Error('Invalid response from Shopify');
      }

      const { order } = response.data;
      if (!order) {
        loggerService.warn('OrderService::Order not found', { orderId });
        throw new Error('Order not found');
      }

      // Transform the response to match our schema
      const transformedOrder = {
        ...order,
        status: this.determineOrderStatus(order),
        lineItems: order.lineItems?.edges?.map((edge: any) => edge.node) || [],
        shippingLines: order.shippingLines?.edges?.map((edge: any) => edge.node) || [],
        metafields: order.metafields?.edges?.map((edge: any) => edge.node) || []
      };

      const validatedOrder = OrderDetailSchema.parse(transformedOrder);
      loggerService.info('OrderService::Order details retrieved successfully', { 
        orderId
      });

      return validatedOrder;
    } catch (error: any) {
      // Enhanced error logging
      loggerService.error('OrderService::Failed to get order details', { 
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError,
          response: error.response ? JSON.stringify(error.response, null, 2) : undefined
        }, 
        orderId 
      });
      throw error;
    }
  }

  private determineOrderStatus(order: { closed: boolean; cancelledAt: string | null }): 'OPEN' | 'CANCELLED' {
    if (order.cancelledAt) {
      return 'CANCELLED';
    }
    if (!order.closed) {
      return 'OPEN';
    }
    return 'OPEN'; // Default case
  }

  /**
   * Get approver information for an order
   */
  private async getOrderApprover(order: any, storeName: string): Promise<any | null> {
    try {
      // Find the draftOrder metafield
      const draftOrderMetafield = order.metafields?.edges?.find(
        (edge: any) => edge.node.key === 'draftOrder'
      )?.node;
      if (!draftOrderMetafield) {
        loggerService.info('OrderService::Draft order metafield not found', { order });
        return null;
      }
      loggerService.info('OrderService::Draft order metafield', { draftOrderMetafield });

      // Extract draft order ID from the metafield value
      let draftOrderId: string | null = null;
      try {
        const parsedValue = JSON.parse(draftOrderMetafield.value);
        draftOrderId = parsedValue.draftOrderId;
      } catch (e) {
        loggerService.info('OrderService::Invalid draft order format', { value: draftOrderMetafield.value });
        return null;
      }

      if (!draftOrderId) {
        loggerService.info('OrderService::Draft order ID not found', { value: draftOrderMetafield.value });
        return null;
      }

      loggerService.info('OrderService::Draft order ID', { draftOrderId });

      // Get draft order metafields
      const draftOrderResponse = await ShopifyClientManager.query(
        GET_DRAFT_ORDER_METAFIELDS,
        storeName,
        {
          variables: { 
            ownerId: draftOrderId
          }
        }
      );
      loggerService.info('OrderService::Draft order response', { draftOrderResponse });
      
      // Get approver metafield directly from the response
      const approverMetafield = draftOrderResponse.data.draftOrder?.metafield;
      loggerService.info('OrderService::Approver metafield', { approverMetafield });
      
      if (!approverMetafield) {
        loggerService.info('OrderService::Approver metafield not found', { approverMetafield });
        return null;
      }

      // Parse the approver value
      try {
        const approverValue = JSON.parse(approverMetafield.value);
        const customerId = approverValue.customerId;
        loggerService.info('OrderService::Customer ID', { customerId });

        const customerResponse = await ShopifyClientManager.query(
          GET_CUSTOMER_BY_ID,
          storeName,
          {
            variables: { 
              customerId
            }
          }
        );
        loggerService.info('OrderService::Customer response', { customerResponse });
        return customerResponse.data.customer;
      } catch (e) {
        loggerService.error('OrderService::Failed to parse approver value', { 
          error: e, 
          value: approverMetafield.value 
        });
        return null;
      }
    } catch (error) {
      loggerService.error('OrderService::Failed to get order approver', { error, orderId: order.id });
      return null;
    }
  }

  /**
   * Transform shipping/billing address to Shopify format for draft orders
   */
  private formatDraftOrderAddress(address: any): any {
    return {
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      company: address.companyName,
      countryCode: address.countryCode,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      provinceCode: address.zoneCode,
      zip: address.zip,
    };
  }

  /**
   * Transform shipping/billing address to Shopify format for direct orders
   */
  private formatDirectOrderAddress(address: any): any {
    return {
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      country: address.country,
      zip: address.zip
    };
  }

  /**
   * Process payment terms based on template
   */
  private processPaymentTerms(paymentTermsTemplate: any): any {
    if (!paymentTermsTemplate?.id) {
      return undefined;
    }

    const now = new Date();
    const issuedAt = now.toISOString();
    let dueAt: string | undefined;

    switch (paymentTermsTemplate.paymentTermsType) {
      case 'NET':
        if (paymentTermsTemplate.dueInDays) {
          const dueDate = new Date(now);
          dueDate.setDate(dueDate.getDate() + paymentTermsTemplate.dueInDays);
          dueAt = dueDate.toISOString();
        }
        break;
      case 'RECEIPT':
        dueAt = issuedAt; // Due immediately upon receipt
        break;
      case 'FULFILLMENT':
        // Due date will be set when order is fulfilled
        break;
      case 'FIXED':
        // For FIXED type, dueAt should be provided by the template
        break;
      case 'UNKNOWN':
      default:
        // Skip payment terms for unknown types
        break;
    }

    if (paymentTermsTemplate.paymentTermsType === 'UNKNOWN') {
      return undefined;
    }

    return {
      paymentTermsTemplateId: paymentTermsTemplate.id,
      paymentSchedules: dueAt ? [
        {
          issuedAt,
          dueAt
        }
      ] : undefined
    };
  }

  /**
   * Create PO link metafield
   */
  private createPoLinkMetafield(poLink: any, keyPrefix: string): Array<{
    namespace: string;
    key: string;
    type: string;
    value: string;
  }> {
    const metafields: Array<{
      namespace: string;
      key: string;
      type: string;
      value: string;
    }> = [];

    if (poLink) {
      metafields.push({
        namespace: '$app:custom',
        key: `custom_po_images_${keyPrefix}`,
        type: 'json',
        value: JSON.stringify({
          url: poLink.url,
          fileType: poLink.fileType,
          uploadedAt: new Date().toISOString()
        })
      });
    }

    return metafields;
  }

  /**
   * Prepare draft order input from common parameters
   */
  public prepareDraftOrderInput(
    params: {
      note?: string;
      poNumber?: string;
      email?: string;
      phone?: string;
      purchasingEntity: any;
      shippingAddress: any;
      billingAddress: any;
      items: Array<{ variantId: string; quantity: number; price: number }>;
      currencyCode: string;
      poLink?: { url: string; fileType: string };
      paymentTermsTemplate?: any;
      shippingLine?: any;
    }
  ): CreateDraftOrderInput {
    // Process PO link
    const metafields = this.createPoLinkMetafield(params.poLink, 'draft_order');
    const tags = params.poLink ? ['po automation'] : [];

    // Process payment terms
    const paymentTerms = this.processPaymentTerms(params.paymentTermsTemplate);

    // Prepare draft order input
    return {
      note: params.note || 'Order created via API',
      poNumber: params.poNumber,
      email: params.email,
      phone: params.phone,
      purchasingEntity: params.purchasingEntity,
      shippingAddress: this.formatDraftOrderAddress(params.shippingAddress),
      billingAddress: this.formatDraftOrderAddress(params.billingAddress),
      lineItems: params.items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        priceOverride: {
          amount: item.price,
          currencyCode: params.currencyCode
        }
      })),
      metafields,
      tags,
      ...(paymentTerms && { paymentTerms }),
      ...(params.shippingLine && { shippingLine: params.shippingLine })
    };
  }

  /**
   * Prepare direct order input from common parameters
   */
  public prepareDirectOrderInput(
    params: {
      note?: string;
      poNumber?: string;
      email?: string;
      phone?: string;
      customerId: string;
      companyLocationId: string;
      shippingAddress: any;
      billingAddress: any;
      items: Array<{ variantId: string; quantity: number; price: number }>;
      currencyCode: string;
      poLink?: { url: string; fileType: string };
    }
  ): any {
    // Process PO link
    const metafields = this.createPoLinkMetafield(params.poLink, 'order');
    const tags = params.poLink ? ['po automation'] : [];

    // Prepare order input
    return {
      note: params.note || 'Order created via API',
      email: params.email,
      phone: params.phone,
      companyLocationId: params.companyLocationId,
      poNumber: params.poNumber,
      currency: params.currencyCode,
      customerId: params.customerId,
      shippingAddress: this.formatDraftOrderAddress(params.shippingAddress),
      billingAddress: this.formatDraftOrderAddress(params.billingAddress),
      lineItems: params.items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        priceSet: {
          shopMoney: {
            amount: item.price,
            currencyCode: params.currencyCode
          }
        }
      })),
      metafields,
      tags
    };
  }

  /**
   * Create an order from request parameters
   * This method will check company location configuration and decide whether to create a draft order or a direct order
   */
  public async createOrder(params: CreateOrderRequest): Promise<CreateOrderResponse> {
    const METHOD = 'createOrder';
    try {
      loggerService.info(`OrderService::${METHOD}: Creating order`, {
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId,
        shippingLine: params.shippingLine
      });



      // Get customer email and company contact info
      const customerResponse = await ShopifyClientManager.query(
        GET_CUSTOMER_EMAIL,
        params.storeName,
        {
          variables: {
            customerId: params.customerId,
          }
        }
      );

      if (!customerResponse.data?.customer?.email) {
        throw new BaseError(
          'Customer email not found',
          HttpStatusCode.NOT_FOUND,
          'CUSTOMER_EMAIL_NOT_FOUND'
        );
      }

      // Get company location addresses
      const locationResponse = await ShopifyClientManager.query(
        GET_COMPANY_LOCATION_ADDRESS,
        params.storeName,
        {
          variables: {
            companyLocationId: params.companyLocationId
          }
        }
      );

      const companyLocation = locationResponse.data?.companyLocation;
      if (!companyLocation?.shippingAddress) {
        throw new BaseError(
          'Company location shipping address not found',
          HttpStatusCode.NOT_FOUND,
          'SHIPPING_ADDRESS_NOT_FOUND'
        );
      }

      // Get company location configuration to determine if we should create a draft order
      const configResponse = await ShopifyClientManager.query(
        GET_COMPANY_LOCATION_PAYMENT_TERMS,
        params.storeName,
        {
          variables: {
            companyLocationId: params.companyLocationId
          }
        }
      );

      const checkoutToDraft = configResponse.data?.companyLocation?.buyerExperienceConfiguration?.checkoutToDraft ?? true;
      
      loggerService.info(`OrderService::${METHOD}: Company location configuration`, {
        checkoutToDraft,
        companyLocationId: params.companyLocationId
      });

      // Use shipping address as billing address if billing address is not available
      const billingAddress = companyLocation.billingAddress || companyLocation.shippingAddress;

      // Get company contact information
      const companyContactProfile = customerResponse.data.customer.companyContactProfiles?.[0];
      const companyInfo = companyContactProfile?.company;
      const companyContactId = companyContactProfile?.id;

      // Prepare purchasingEntity based on company contact information
      const purchasingEntity = companyContactId && companyInfo?.id 
        ? { purchasingCompany: {
            companyContactId,
            companyId: companyInfo.id,
            companyLocationId: params.companyLocationId
          }}
        : { customerId: params.customerId };

      if (checkoutToDraft) {


        // Create draft order
        return this.createDraftOrderFromParams(
          params,
          customerResponse.data.customer,
          companyLocation,
          billingAddress,
          purchasingEntity
        );
      } else {
        // Create order directly
        return this.createDirectOrderFromParams(
          params,
          customerResponse.data.customer,
          companyLocation,
          billingAddress
        );
      }
    } catch (error) {
      loggerService.error(`OrderService::${METHOD}: Failed to create order`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        params
      });

      if (error instanceof BaseError) {
        throw error;
      }

      throw new BaseError(
        'Failed to create order',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        'ORDER_CREATION_FAILED'
      );
    }
  }

  /**
   * Create a draft order from parameters
   */
  private async createDraftOrderFromParams(
    params: any,
    customer: any,
    companyLocation: any,
    billingAddress: any,
    purchasingEntity: any
  ): Promise<CreateOrderResponse> {
    const METHOD = 'createDraftOrderFromParams';
    try {
      loggerService.info(`OrderService::${METHOD}: Creating draft order`, {
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId,
        shippingLine: params.shippingLine
      });


      // Prepare draft order input
      const draftOrderInput = this.prepareDraftOrderInput({
        note: params.note,
        poNumber: params.poNumber,
        email: customer?.email,
        phone: customer?.phone,
        purchasingEntity,
        shippingAddress: companyLocation.shippingAddress,
        billingAddress,
        items: params.items,
        currencyCode: params.currencyCode,
        poLink: params.poLink,
        paymentTermsTemplate: companyLocation?.buyerExperienceConfiguration?.paymentTermsTemplate,
        shippingLine: params.shippingLine
      });


      loggerService.info('Draft Order Input', {
        draftOrderInput
      });

      // Create draft order
      const result = await draftOrderService.createDraftOrder(params.storeName, draftOrderInput);

      loggerService.info(`OrderService::${METHOD}: Draft order created successfully`, {
        draftOrderId: result.draftOrder.id,
        hasPoLink: !!params.poLink
      });

      return {
        code: 200,
        message: 'Order created successfully',
        data: {
          draftOrderId: result.draftOrder.id
        }
      };
    } catch (error) {
      loggerService.error(`OrderService::${METHOD}: Failed to create draft order`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        params
      });
      throw error;
    }
  }

  /**
   * Create a direct order from parameters
   */
  private async createDirectOrderFromParams(
    params: CreateOrderRequest,
    customer: any,
    companyLocation: any,
    billingAddress: any
  ): Promise<CreateOrderResponse> {
    const METHOD = 'createDirectOrderFromParams';
    try {
      loggerService.info(`OrderService::${METHOD}: Creating direct order`, {
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId
      });

      // Prepare order input
      const orderInput = this.prepareDirectOrderInput({
        note: params.note,
        poNumber: params.poNumber,
        email: customer?.email,
        phone: customer?.phone,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId,
        shippingAddress: companyLocation.shippingAddress,
        billingAddress,
        items: params.items,
        currencyCode: params.currencyCode,
        poLink: params.poLink
      });

      // Create order
      const response = await ShopifyClientManager.query(
        ORDER_CREATE,
        params.storeName,
        {
          variables: {
            order: orderInput
          }
        }
      );

      if (response.data?.orderCreate?.userErrors?.length > 0) {
        throw new BaseError(
          `Failed to create order: ${response.data.orderCreate.userErrors.map((e: any) => e.message).join(', ')}`,
          HttpStatusCode.BAD_REQUEST,
          'ORDER_CREATION_FAILED'
        );
      }

      const orderId = response.data?.orderCreate?.order?.id;
      loggerService.info(`OrderService::${METHOD}: Order created successfully`, {
        orderId,
        hasPoLink: !!params.poLink
      });

      return {
        code: 200,
        message: 'Order created successfully',
        data: {
          orderId
        }
      };
    } catch (error) {
      loggerService.error(`OrderService::${METHOD}: Failed to create direct order`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        params
      });
      throw error;
    }
  }
}

export const orderService = new OrderService(); 