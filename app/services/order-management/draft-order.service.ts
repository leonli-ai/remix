import { ShopifyClientManager } from '~/lib/shopify/client';
import { GET_DRAFT_ORDERS, GET_DRAFT_ORDER_DETAILS } from '~/lib/shopify/queries/draft-order';
import { loggerService } from '~/lib/logger';
import type { DraftOrderListRequest, DraftOrderListResponse } from '~/types/order-management/draft-order-list.schema';
import type { DraftOrderDetailsRequest, DraftOrderDetailsResponse } from '~/types/order-management/draft-order-details.schema';
import { DRAFT_ORDER_COMPLETE,DRAFT_ORDER_BULK_DELETE, UPDATE_DRAFT_ORDER_TAGS_AND_METAF, DRAFT_ORDER_CREATE } from '~/lib/shopify/mutation/draft-order';
import type { DraftOrderApproveRequest, DraftOrderApproveResponse } from '~/types/order-management/draft-order-approve.schema';
import { DraftOrderError, DraftOrderErrorCodes } from '~/lib/errors/draft-order-errors';
import type { DraftOrderRejectRequest, DraftOrderRejectResponse } from '~/types/order-management/draft-order-reject.schema';
import type { DraftOrderBulkDeleteRequest, DraftOrderBulkDeleteResponse } from '~/types/order-management/draft-order-bulk-delete.schema';
import { UPDATE_ORDER_METAFIELD } from '~/lib/shopify/mutation/order';
import { GET_CUSTOMERS_BY_IDS } from '~/lib/shopify/queries/customer';
import type {  CreateDraftOrderResponse } from '~/types/quotes/quote-draft-order.schema';

interface OperatorInfo {
  rejectedBy: any | null;
  approvedBy: any | null;
}

interface ShopifyUserError {
  field: string[];
  message: string;
}

export class DraftOrderService {
  private async getOperatorInfo(draftOrders: any[], storeName: string): Promise<Map<string, OperatorInfo>> {
    const start = Date.now();
    const operatorInfoMap = new Map<string, OperatorInfo>();

    try {
      // 1. Collect all unique customerIds
      const customerIds = new Set<string>();
      draftOrders.forEach(draftOrder => {
        const operatorInfoMetafield = draftOrder.metafields?.edges?.find(
          (metafieldEdge: any) => metafieldEdge.node.key === 'operator_info'
        );

        if (operatorInfoMetafield) {
          try {
            const operatorInfo = JSON.parse(operatorInfoMetafield.node.value);
            if (operatorInfo?.customerId) {
              customerIds.add(operatorInfo.customerId);
            }
          } catch (error) {
            loggerService.error('Error parsing operator_info metafield:', error);
          }
        }
      });

      // 2. If there are customer IDs, fetch customer information in batch
      if (customerIds.size > 0) {
        const customerResponse = await ShopifyClientManager.query(
          GET_CUSTOMERS_BY_IDS,
          storeName,
          {
            variables: {
              customerIds: Array.from(customerIds)
            }
          }
        );

        // 3. Create customer information lookup table
        const customersMap = new Map(
          customerResponse?.data?.nodes?.map((customer: any) => [customer.id, customer]) || []
        );

        // 4. Assign operator information for each draft order
        draftOrders.forEach(draftOrder => {
          const operatorInfoMetafield = draftOrder.metafields?.edges?.find(
            (metafieldEdge: any) => metafieldEdge.node.key === 'operator_info'
          );

          if (operatorInfoMetafield) {
            try {
              const operatorInfo = JSON.parse(operatorInfoMetafield.node.value);
              const customer = operatorInfo?.customerId ? customersMap.get(operatorInfo.customerId) : null;

              operatorInfoMap.set(draftOrder.id, {
                rejectedBy: draftOrder.tags.includes('rejected') ? customer : null,
                approvedBy: draftOrder.tags.includes('approved') ? customer : null
              });
            } catch (error) {
              loggerService.error('Error processing operator info:', error);
              operatorInfoMap.set(draftOrder.id, { rejectedBy: null, approvedBy: null });
            }
          } else {
            operatorInfoMap.set(draftOrder.id, { rejectedBy: null, approvedBy: null });
          }
        });
      }

      const duration = Date.now() - start;
      loggerService.info('Batch fetched operator info', {
        totalDraftOrders: draftOrders.length,
        uniqueCustomers: customerIds.size,
        duration
      });

      return operatorInfoMap;
    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Error in batch fetching operator info:', {
        error,
        duration,
        totalDraftOrders: draftOrders.length
      });
      return operatorInfoMap;
    }
  }

  public async fetchDraftOrders(params: DraftOrderListRequest): Promise<DraftOrderListResponse> {
    try {
      const { pagination } = params;
      
      loggerService.info('Starting draft orders fetch', {
        storeName: params.storeName,
        pagination
      });
      
      const response = await ShopifyClientManager.query(
        GET_DRAFT_ORDERS,
        params.storeName,
        {
          variables: {
            first: pagination?.first || 50,
            after: pagination?.after,
            query: pagination?.query,
            sortKey: pagination?.sortKey,
            reverse: pagination?.reverse
          }
        }
      );
      
      loggerService.info('Draft orders query completed', {
        hasData: !!response.data?.draftOrders,
        edgesCount: response.data?.draftOrders?.edges?.length
      });

      if (!response.data?.draftOrders) {
        throw new Error('Failed to fetch draft orders');
      }

      const { edges, pageInfo } = response.data.draftOrders;
      const draftOrders = edges.map(({ node }: { node: any }) => node);

      // Batch fetch operator information
      const operatorInfoMap = await this.getOperatorInfo(draftOrders, params.storeName);

      const draftOrdersWithOperatorInfo = edges.map(({ node, cursor }: { node: any; cursor: any }) => {
        const { metafields, ...nodeWithoutMetafields } = node;
        const operatorInfo = operatorInfoMap.get(node.id) || { rejectedBy: null, approvedBy: null };
        
        return {
          ...nodeWithoutMetafields,
          cursor,
          ...operatorInfo
        };
      });

      const totalCount = 0;

      return {
        draftOrders: draftOrdersWithOperatorInfo,
        pagination: {
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
          cursor: edges[edges.length - 1]?.cursor,
          totalCount
        }
      };

    } catch (error) {
      loggerService.error('Failed to fetch draft orders', { error });
      throw error;
    }
  }

  public async getDraftOrderDetails(params: DraftOrderDetailsRequest): Promise<DraftOrderDetailsResponse> {
    try {
      const response = await ShopifyClientManager.query(
        GET_DRAFT_ORDER_DETAILS,
        params.storeName,
        {
          variables: {
            draftOrderId: params.draftOrderId,
            companyLocationId: params.companyLocationId
          }
        }
      );
      loggerService.info('getDraftOrderDetails', { response });

      if (!response.data?.draftOrder) {
        const error = new Error('Draft order not found');
        error.name = 'NotFoundError';
        throw error;
      }

      const draftOrder = response.data.draftOrder;
      const operatorInfoMap = await this.getOperatorInfo([draftOrder], params.storeName);
      const operatorInfo = operatorInfoMap.get(draftOrder.id) || { rejectedBy: null, approvedBy: null };

      return {
        draftOrder: {
          ...draftOrder,
          ...operatorInfo
        }
      };

    } catch (error) {
      loggerService.error('Failed to get draft order details', { error });
      throw error;
    }
  }

  public async approveDraftOrder(params: DraftOrderApproveRequest): Promise<DraftOrderApproveResponse> {
    try {
      // 1. Complete draft order
      const completeResponse = await ShopifyClientManager.mutation(
        DRAFT_ORDER_COMPLETE,
        params.storeName,
        {
          variables: {
            id: params.draftOrderId
          }
        },
        
      );

      loggerService.info('start complete draft order', { params });

      if (completeResponse.data?.draftOrderComplete?.userErrors?.length > 0) {
        const error = completeResponse.data.draftOrderComplete.userErrors[0];
        if (error.message.includes('has been paid')) {
          throw new DraftOrderError('This order has already been paid', DraftOrderErrorCodes.ALREADY_PAID);
        }
        throw new DraftOrderError(`Failed to complete draft order: ${error.message}`, DraftOrderErrorCodes.COMPLETION_FAILED);
      }
      loggerService.info('end complete draft order', { completeResponse });

      const completedDraftOrder = completeResponse.data?.draftOrderComplete?.draftOrder;
      if (!completedDraftOrder) {
        throw new DraftOrderError('Failed to get completed draft order details', DraftOrderErrorCodes.COMPLETION_FAILED);
      }

      loggerService.info('start update tags and metafield', { params });
      // 2. Update tags if completion was successful
      const updateResponse = await ShopifyClientManager.mutation(
        UPDATE_DRAFT_ORDER_TAGS_AND_METAF,
        params.storeName,
        {
          variables: {
            input: {
              tags: ['approved'],
              metafields:[
                {
                  namespace: '$app:custom',
                  key: 'operator_info',
                  type: 'json',
                  value: JSON.stringify({customerId: params?.customerId})
                }
              ]
            },
            ownerId: params.draftOrderId
          }
        }
      );

      loggerService.info('end update tags and metafield', { updateResponse });

      if (updateResponse.data?.draftOrderUpdate?.userErrors?.length > 0) {
        const error = updateResponse.data.draftOrderUpdate.userErrors[0];
        loggerService.error('Failed to update draft order tags', { error });
      }

      // 3. Update order metafield
      const orderId = completedDraftOrder.order?.id;
      const draftOrderId = completedDraftOrder.id;
      loggerService.info('start update order metafield', { orderId, draftOrderId });


      // Get metafields from completed draft order
      const draftOrderMetafields = completedDraftOrder.metafields?.edges?.find(
        (edge: any) => edge.node.key === 'custom_po_images_draft_order'
      )?.node || null;

      loggerService.info('Draft order metafields retrieved', { draftOrderMetafields });


      const metafields = [{
        namespace: '$app:custom',
        key: 'draftOrder',
        type: 'json',
        value: JSON.stringify({draftOrderId: draftOrderId})
      }];

      let input: any = {
        id: orderId,
        metafields
      };


      if (draftOrderMetafields) {
        metafields.push({
          namespace: '$app:custom',
          key: 'custom_po_images_order',
          type: 'json',
          value: draftOrderMetafields.value
        });
        input.tags = ['po automation'];
      }

      loggerService.info('UPDATE_ORDER_METAFIELD input: ',{input})
      const updateOrderMetafieldResponse = await ShopifyClientManager.mutation(
        UPDATE_ORDER_METAFIELD,
        params.storeName,
        {
          variables: { input }
        }
      );
      loggerService.info('end update order metafield', { updateOrderMetafieldResponse });

      return {
        success: true,
        draftOrder: {
          id: completedDraftOrder.id,
          status: completedDraftOrder.status,
          order: completedDraftOrder.order ? {
            id: completedDraftOrder.order.id
          } : null
        }
      };

    } catch (error) {
      loggerService.error('Failed to approve draft order', { error, params });
      throw error;
    }
  }

  public async rejectDraftOrder(params: DraftOrderRejectRequest): Promise<DraftOrderRejectResponse> {
    try {
      const updateResponse = await ShopifyClientManager.mutation(
        UPDATE_DRAFT_ORDER_TAGS_AND_METAF,
        params.storeName,
        {
          variables: {
            input: {
              tags: ['rejected'],
              note: params.note,
              metafields:[
                {
                  namespace: '$app:custom',
                  key: 'operator_info',
                  type: 'json',
                  value: JSON.stringify({customerId: params?.customerId})
                }
              ]
            },
            ownerId: params.draftOrderId
          }
        }
      );
      
      loggerService.info('rejectDraftOrder updateResponse', { updateResponse });

      if (updateResponse.data?.draftOrderUpdate?.userErrors?.length > 0) {
        const error = updateResponse.data.draftOrderUpdate.userErrors[0];
        throw new DraftOrderError(`Failed to reject draft order: ${error.message}`, DraftOrderErrorCodes.REJECTION_FAILED);
      }

      return { success: true };

    } catch (error) {
      loggerService.error('Failed to reject draft order', { error, params });
      throw error;
    }
  }

  public async bulkDeleteDraftOrders(params: DraftOrderBulkDeleteRequest): Promise<DraftOrderBulkDeleteResponse> {
    try {
      const response = await ShopifyClientManager.mutation(
        DRAFT_ORDER_BULK_DELETE,
        params.storeName,
        {
          variables: {
            ids: params.ids,
            search: params.search
          }
        }
      );
      
      loggerService.info('bulkDeleteDraftOrders response', { response });

      if (response.data?.draftOrderBulkDelete?.userErrors?.length > 0) {
        const error = response.data.draftOrderBulkDelete.userErrors[0];
        throw new DraftOrderError(`Failed to bulk delete pending approval orders.s: ${error.message}`, DraftOrderErrorCodes.BULK_DELETE_FAILED);
      }

      return { success: true };

    } catch (error) {
      loggerService.error('Failed to bulk delete pending approval orders.s', { error, params });
      throw error;
    }
  }

  /**
   * Create a draft order
   */
  public async createDraftOrder(storeName: string, input: any): Promise<CreateDraftOrderResponse> {
    const METHOD = 'createDraftOrder';
    try {
      loggerService.info(`${METHOD}: Creating draft order`, {
        storeName,
        input
      });

      const response = await ShopifyClientManager.mutation(
        DRAFT_ORDER_CREATE,
        storeName,
        {
          variables: {
            input
          }
        }
      );

      loggerService.info(`${METHOD}: Shopify API response`, {
        response,
        hasErrors: response.data?.draftOrderCreate?.userErrors?.length > 0
      });

      if (response.data?.draftOrderCreate?.userErrors?.length > 0) {
        const errors = response.data.draftOrderCreate.userErrors as ShopifyUserError[];
        loggerService.error(`${METHOD}: Shopify API returned errors`, { errors });
        throw new DraftOrderError(
          `Failed to create draft order: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          DraftOrderErrorCodes.CREATION_FAILED
        );
      }

      const draftOrder = response.data?.draftOrderCreate?.draftOrder;
      if (!draftOrder) {
        loggerService.error(`${METHOD}: No draft order returned in response`, { response });
        throw new DraftOrderError('Failed to get created draft order details', DraftOrderErrorCodes.CREATION_FAILED);
      }

      loggerService.info(`${METHOD}: Draft order created successfully`, {
        draftOrderId: draftOrder.id
      });

      return { draftOrder };
    } catch (error) {
      loggerService.error(`${METHOD}: Failed to create draft order`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        input
      });
      throw error;
    }
  }
}

export const draftOrderService = new DraftOrderService(); 