import { 
  type CreateShoppingListRequest, 
  type CreateShoppingListResponse,
  type UpdateShoppingListRequest, 
  type UpdateShoppingListResponse,
  type DeleteShoppingListRequest,
  type DeleteShoppingListResponse,
  type ShoppingListFilter, 
  type ShoppingListResponse 
} from '../../types/shopping-lists/shopping-lists.schema';
import {
  type FetchShoppingListItemsRequest,
  type ShoppingListWithItems,
  type DeleteShoppingListItemsRequest,
  type DeleteShoppingListItemsResponse,
  type UpdateShoppingListItemRequest,
  type ShoppingListItem,
  type ShoppingListItemsAggregationRequest,
  type ShoppingListItemsAggregationResponse
} from '../../types/shopping-lists/shopping-list-items.schema';
import {
  type ShopData,
  type PriceResult,
  type GetPricesForFetchOperationParams,
  type GetPricesForUpdateOperationParams
} from '../../types/shopping-lists/shopping-list-service.schema';
import {
  type ShoppingListItem as RepositoryShoppingListItem,

} from '../../types/shopping-lists/shopping-list-items-repository.schema';
import { shoppingListRepository } from '../../repositories/shopping-lists/shopping-list.repository';
import { shoppingListItemsRepository } from '../../repositories/shopping-lists/shopping-list-items.repository';
import { priceService } from '../product-variant/price.service';
import { storeCompanyMappingService } from '../product-variant/store-company-mapping.service';
import { loggerService } from '../../lib/logger';
import { GET_SHOP_DEFAULT_CURRENCY_CODE } from '~/lib/shopify/queries';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { ShoppingListError } from '../../lib/errors/shopping-list-errors';

import prisma from '~/db.server';

export class ShoppingListService {
  private readonly repository = shoppingListRepository;
  private readonly itemsRepository = shoppingListItemsRepository;

  // Helper Methods
  private async getShopDefaultCurrencyCode(storeName: string): Promise<string> {
    try {
      const response = await ShopifyClientManager.query<ShopData>(
        GET_SHOP_DEFAULT_CURRENCY_CODE,
        storeName
      );

      const currencyCode = response?.data?.shop?.currencyCode;
      if (!currencyCode) {
        throw new Error('Failed to get shop default currency code');
      }

      return currencyCode;
    } catch (error) {
      loggerService.error('Error getting shop default currency code', { error });
      return 'USD'; // Default to USD if currency code fetch fails
    }
  }

  /**
   * Get prices for shopping list items
   */
  private async getPricesForFetchOperation(params: GetPricesForFetchOperationParams): Promise<Map<string, PriceResult>> {
    const start = Date.now();
    
    try {
      loggerService.info('Starting price fetching for shopping list', {
        shoppingListId: params.shoppingListId,
        itemCount: params.items.length,
        companyLocationId: params.companyLocationId
      });

      // Get prices from cache and db
      const prices = await priceService.getPriceForFetch(
        params.items.map(item => item.productVariantId),
        params.companyLocationId,
        params.storeName
      );

      const duration = Date.now() - start;
      loggerService.info('Price fetching completed for shopping list', {
        shoppingListId: params.shoppingListId,
        totalItems: params.items.length,
        pricesFound: prices.size,
        duration
      });

      return prices;
    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Error fetching prices for shopping list', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        shoppingListId: params.shoppingListId,
        itemCount: params.items.length,
        companyLocationId: params.companyLocationId,
        duration
      });
      
      return new Map();
    }
  }

  private async getPricesForUpdateOperation(params: GetPricesForUpdateOperationParams): Promise<Map<string, PriceResult>> {
    const start = Date.now();
    try {
      loggerService.info('Starting price fetching for update operation', {
        itemCount: params.items.length,
        companyLocationId: params.companyLocationId
      });

      // Process items in parallel with a limit
      const batchSize = 10;
      const prices = new Map<string, PriceResult>();

      for (let i = 0; i < params.items.length; i += batchSize) {
        const batch = params.items.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async item => {
            const price = await priceService.getPriceForUpdate(
              item.productVariantId,
              params.companyLocationId,
              params.storeName
            );
            return { productVariantId: item.productVariantId, price };
          })
        );

        results.forEach(({ productVariantId, price }) => {
          if (price) {
            prices.set(productVariantId, price);
          }
        });
      }

      const duration = Date.now() - start;
      loggerService.info('Price fetching for update completed', {
        totalItems: params.items.length,
        pricesFound: prices.size,
        duration
      });

      return prices;
    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Error fetching prices for update', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        itemCount: params.items.length,
        companyLocationId: params.companyLocationId,
        duration
      });
      throw error;
    }
  }

  // Shopping List Methods
  public async createShoppingList(params: CreateShoppingListRequest): Promise<CreateShoppingListResponse> {
    try {
      loggerService.info('createShoppingList request parameters:', params);
      
      // No need to convert undefined to null here as the repository handles this internally
      const storeName = params.storeName;
      
      // Check if a shopping list with the same parameters already exists
      const existingList = await this.repository.findByCustomerIdAndName(
        params.customerId, 
        params.data.shoppingListName, 
        params.companyLocationId, 
        storeName
      );
      
      if (existingList) {
        loggerService.warn('Shopping list already exists, throwing error', { 
          customerId: params.customerId,
          name: params.data.shoppingListName,
          companyLocationId: params.companyLocationId,
          storeName: storeName,
          existingListId: existingList.id
        });
        
        // Throw an error instead of returning the existing list
        throw ShoppingListError.alreadyExists(params.data.shoppingListName, params.companyLocationId);
      }
      
      // Check if this is the first shopping list for this customer at this location
      const existingLists = await this.repository.findMany({
        customerId: params.customerId,
        companyLocationId: params.companyLocationId,
        storeName: storeName,
        page: 1,
        pageSize: 1
      });


      loggerService.info('existingLists ===> ', { existingLists });

      // If this is the first list or isDefault is true, ensure it's set as default
      const shouldBeDefault = existingLists.totalCount === 0 || params.data.isDefault;
      
      // Log the create parameters for debugging
      loggerService.info('createShoppingList create parameters:', {
        customerId: params.customerId,
        name: params.data.shoppingListName,
        companyLocationId: params.companyLocationId,
        isDefault: shouldBeDefault,
        storeName: storeName
      });
      
      const result = await this.repository.create({
        customerId: params.customerId,
        name: params.data.shoppingListName,
        companyLocationId: params.companyLocationId,
        description: params.data.description,
        isDefault: shouldBeDefault,
        storeName: storeName
      });

      const formattedResult = {
        id: Number(result.id),
        customerId: result.customerId,
        name: result.name,
        subtotal: 0,
        items: 0,
        companyLocationId: result.companyLocationId,
        description: result.description,
        isDefault: result.isDefault,
        storeName: result.storeName,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      };

      loggerService.info('Shopping list created', { 
        shoppingListId: formattedResult.id,
        isDefault: formattedResult.isDefault,
        isFirstList: existingLists.totalCount === 0,
        storeName: formattedResult.storeName
      });
      return formattedResult;
    } catch (error) {
      loggerService.error('Error in createShoppingList service', { error });
      throw error;
    }
  }

  public async updateShoppingList(params: UpdateShoppingListRequest): Promise<UpdateShoppingListResponse> {
    try {
      const existingList = await this.repository.findById(params.id);
      if (!existingList) {
        throw new Error('Shopping list not found');
      }

      if (existingList.customerId !== params.customerId) {
        throw new Error('Not authorized to update this shopping list');
      }

      // Handle isDefault changes
      if (params.data.isDefault !== undefined) {
        if (params.data.isDefault === false && existingList.isDefault) {
          // If trying to unset default status, ensure there's another list to make default
          const otherLists = await this.repository.findMany({
            customerId: existingList.customerId,
            companyLocationId: existingList.companyLocationId,
            page: 1,
            pageSize: 1,
            filters: {
              isDefault: false
            }
          });

          if (otherLists.lists.length === 0) {
            throw new Error('Cannot remove default status: this is the only shopping list');
          }

          // Set another list as default
          await this.repository.update({
            id: Number(otherLists.lists[0].id),
            isDefault: true
          });
        }
      }

      const result = await this.repository.update({
        id: params.id,
        name: params.data.shoppingListName,
        description: params.data.description,
        isDefault: params.data.isDefault
      });

      if (!result) {
        throw new Error('Failed to update shopping list');
      }

      const itemCount = await prisma.shoppingListItem.count({
        where: { shoppingListId: BigInt(result.id) }
      });

      const formattedResult = {
        id: Number(result.id),
        customerId: result.customerId,
        name: result.name,
        subtotal: 0,
        items: itemCount,
        companyLocationId: result.companyLocationId,
        description: result.description,
        isDefault: result.isDefault,
        storeName: result.storeName || undefined,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      };

      loggerService.info('Shopping list updated', { 
        shoppingListId: formattedResult.id,
        isDefault: formattedResult.isDefault,
        wasDefault: existingList.isDefault
      });
      return formattedResult;
    } catch (error) {
      loggerService.error('Error in updateShoppingList service', { error });
      throw error;
    }
  }

  public async deleteShoppingList(params: DeleteShoppingListRequest): Promise<DeleteShoppingListResponse> {
    try {
      loggerService.info('Deleting shopping list', { id: params.id });
      const existingList = await this.repository.findById(params.id);
      if (!existingList) {
        loggerService.error('Shopping list not found', { id: params.id });
        throw new Error('Shopping list not found');
      }

      if (existingList.customerId !== params.customerId) {
        throw new Error('Not authorized to delete this shopping list');
      }

      // If this is a default list, we need to set another list as default
      if (existingList.isDefault) {
        const otherLists = await this.repository.findMany({
          customerId: existingList.customerId,
          companyLocationId: existingList.companyLocationId,
          page: 1,
          pageSize: 1,
          filters: {
            isDefault: false
          }
        });

        // If there are other lists, set the first one as default
        if (otherLists.lists.length > 0) {
          await this.repository.update({
            id: Number(otherLists.lists[0].id),
            isDefault: true
          });
        }
      }

      const result = await this.repository.delete(params.id);
      if (!result) {
        throw new Error('Failed to delete shopping list');
      }

      const formattedResult = {
        id: Number(result.id),
        customerId: result.customerId,
        name: result.name,
        subtotal: 0,
        items: 0,
        companyLocationId: result.companyLocationId,
        description: result.description,
        isDefault: result.isDefault,
        storeName: result.storeName || undefined,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      };

      loggerService.info('Shopping list deleted', { 
        shoppingListId: formattedResult.id,
        wasDefault: existingList.isDefault
      });
      return formattedResult;
    } catch (error) {
      loggerService.error('Error in deleteShoppingList service', { error });
      throw error;
    }
  }

  public async fetchShoppingLists(params: ShoppingListFilter): Promise<ShoppingListResponse> {
    try {
      const {
        storeName,
        customerId,
        companyLocationId,
        data: {
          filters = {},
          pagination = { page: 1, pageSize: 10 },
          sort = [{ field: 'updatedAt' as const, order: 'desc' as const }],
          currencyCode
        } = {}
      } = params;

      const finalCurrencyCode = currencyCode || await this.getShopDefaultCurrencyCode(storeName);

      const { lists, totalCount, page, pageSize } = await this.repository.findMany({
        customerId,
        companyLocationId,
        storeName,
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters: {
          name: filters?.name,
          description: filters?.description,
          isDefault: filters?.isDefault,
          canEdit: filters?.canEdit,
          createBy: filters?.createBy,
          updateBy: filters?.updateBy,
          createdAt: filters?.createdAt,
          updatedAt: filters?.updatedAt
        },
        sort: sort.map(s => ({
          field: s.field as 'id' | 'customerId' | 'name' | 'description' | 'companyLocationId' | 'isDefault' | 'canEdit' | 'createBy' | 'updateBy' | 'createdAt' | 'updatedAt' | 'subtotal' | 'items',
          order: s.order as 'asc' | 'desc'
        }))
      });

      const uniqueProductVariantIds = [...new Set(
        lists.flatMap(list => 
          list.shoppingListItems.map(item => item.productVariantId)
        )
      )];

      let priceMap = new Map<string, { price: number; currencyCode: string }>();
      if (uniqueProductVariantIds.length > 0) {
        loggerService.info('Fetching prices for all product variants', {
          totalLists: lists.length,
          uniqueProductVariants: uniqueProductVariantIds.length,
          operation: 'fetchShoppingLists'
        });

        priceMap = await priceService.getPriceForFetch(
          uniqueProductVariantIds,
          companyLocationId,
          storeName
        );

        loggerService.info('Successfully fetched prices', {
          pricesFound: priceMap.size,
          operation: 'fetchShoppingLists'
        });
      }

      const shoppingLists = lists.map(list => {
        const itemCount = list.shoppingListItems.length;
        
        if (itemCount === 0) {
          return {
            id: Number(list.id),
            customerId: list.customerId,
            name: list.name,
            subtotal: 0,
            currencyCode: finalCurrencyCode,
            companyLocationId: list.companyLocationId,
            description: list.description,
            items: 0,
            isDefault: list.isDefault,
            storeName: list.storeName || undefined,
            createdAt: list.createdAt.toISOString(),
            updatedAt: list.updatedAt.toISOString()
          };
        }

       
        const subtotal = list.shoppingListItems.reduce((sum, item) => {
          const priceInfo = priceMap.get(item.productVariantId);
          const price = priceInfo?.price ?? 0;
          const quantity = item.quantity || 0;
          return sum + (price * quantity);
        }, 0);

        return {
          id: Number(list.id),
          customerId: list.customerId,
          name: list.name,
          subtotal: Number(subtotal.toFixed(2)),
          currencyCode: finalCurrencyCode,
          items: itemCount,
          companyLocationId: list.companyLocationId,
          description: list.description,
          isDefault: list.isDefault,
          storeName: list.storeName || undefined,
          createdAt: list.createdAt.toISOString(),
          updatedAt: list.updatedAt.toISOString()
        };
      });

      loggerService.info('Shopping lists fetch completed', {
        totalLists: lists.length,
        uniqueProductVariants: uniqueProductVariantIds.length,
        pricesFound: priceMap.size,
        operation: 'fetchShoppingLists'
      });

      return {
        page,
        pageSize,
        totalCount,
        shoppingLists
      };

    } catch (error) {
      loggerService.error('Error in fetchShoppingLists service', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        operation: 'fetchShoppingLists'
      });
      throw error;
    }
  }

  // Shopping List Items Methods
  public async fetchShoppingListItems(params: FetchShoppingListItemsRequest): Promise<ShoppingListWithItems> {
    try {
      // 1. Get shopping list
      const shoppingList = await this.repository.findById(params.shoppingListId);
      if (!shoppingList) {
        throw new Error(`Shopping list not found: ${params.shoppingListId}`);
      }

      // 2. Get items with pagination
      const items = await this.itemsRepository.findMany({
        shoppingListId: params.shoppingListId,
        pagination: params.pagination,
        filters: params.filters,
        sort: params.sort
      });

      // 3. Get prices for items using fetch strategy
      const prices = await this.getPricesForFetchOperation({
        shoppingListId: params.shoppingListId,
        items: items.lists.map((item: RepositoryShoppingListItem) => ({ productVariantId: item.productVariantId })),
        companyLocationId: params.companyLocationId,
        isDefault: shoppingList.isDefault,
        description: shoppingList.description || '',
        name: shoppingList.name,
        page: items.page,
        pageSize: items.pageSize,
        totalCount: items.totalCount,
        listItems: items.lists.map((item: RepositoryShoppingListItem) => ({
          currencyCode: 'USD', // Default currency code
          productVariantId: item.productVariantId,
          url: item.url || ''
        }))
      });

      // Format response
      return {
        page: items.page,
        pageSize: items.pageSize,
        totalCount: items.totalCount,
        shoppingListId: params.shoppingListId,
        name: shoppingList.name,
        description: shoppingList.description || '',
        isDefault: shoppingList.isDefault,
        listItems: items.lists.map((item: RepositoryShoppingListItem) => ({
          id: Number(item.id),
          productId: item.productId,
          productName: item.productName || '',
          skuId: item.skuId,
          productVariantId: item.productVariantId,
          productImageUrl: item.productImageUrl || '',
          url: item.url || '',
          customerPartnerNumber: item.customerPartnerNumber || '',
          quantity: item.quantity || 0,
          price: prices.get(item.productVariantId)?.price || 0,
          currencyCode: prices.get(item.productVariantId)?.currencyCode || 'USD',
          subtotal: (prices.get(item.productVariantId)?.price || 0) * (item.quantity || 0),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        }))
      };
    } catch (error) {
      loggerService.error('Error fetching shopping list items', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        shoppingListId: params.shoppingListId,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId
      });
      throw error;
    }
  }

  public async deleteItems(params: DeleteShoppingListItemsRequest): Promise<DeleteShoppingListItemsResponse> {
    try {
      const existingList = await this.repository.findById(params.shoppingListId);
      if (!existingList) {
        throw new Error('Shopping list not found');
      }

      if (existingList.customerId !== params.customerId) {
        throw new Error('Not authorized to delete items from this shopping list');
      }

      const deletedItems = await this.itemsRepository.deleteItems({
        shoppingListId: params.shoppingListId,
        listItems: params.listItems
      });

      const formattedItems = deletedItems.map(item => ({
        id: Number(item.id),
        shoppingListId: Number(item.shoppingListId),
        productId: item.productId,
        productName: item.productName ?? '',
        skuId: item.skuId ?? '',
        productVariantId: item.productVariantId,
        productImageUrl: item.productImageUrl ?? '',
        url: item.url ?? '',
        customerPartnerNumber: item.customerPartnerNumber ?? '',
        quantity: item.quantity ?? 0,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }));

      loggerService.info('Shopping list items deleted', { 
        shoppingListId: params.shoppingListId,
        itemsCount: formattedItems.length 
      });
      
      return formattedItems;
    } catch (error) {
      loggerService.error('Error in deleteItems service', { error });
      throw error;
    }
  }

  public async updateItems(params: UpdateShoppingListItemRequest): Promise<ShoppingListItem[]> {
    const start = Date.now();
    try {
      loggerService.info('shopping-list.service::updateItems', {
        params
      });
      loggerService.debug('Starting items update', {
        shoppingListId: params.shoppingListId,
        itemCount: params.data.listItems.length
      });

      // 1. Validate required fields and prepare items data
      const itemsData = params.data.listItems.map(item => {
        if (!item.skuId) {
          throw new Error(`SKU ID is required for product ${item.productId}`);
        }
        if (!item.productVariantId) {
          throw new Error(`Product Variant ID is required for product ${item.productId}`);
        }

        return {
          id: item.id || undefined,
          productId: item.productId,
          productName: item.productName ?? '',
          productVariantId: item.productVariantId,
          skuId: item.skuId,
          productImageUrl: item.productImageUrl ?? '',
          url: item.url ?? '',
          customerPartnerNumber: item.customerPartnerNumber ?? '',
          quantity: Number(item.quantity),
          updateBy: params.customerId
        };
      });

      // 1.1 Validate product variants existence in Shopify
      const newItems = itemsData.filter(item => !item.id);
      if (newItems.length > 0) {
        await priceService.validateProductVariants(
          newItems.map(item => item.productVariantId),
          params.companyLocationId,
          params.storeName
        );
      }

      // 2. Execute authorization check and update in parallel
      const [existingList, updatedItems] = await Promise.all([
        this.repository.findById(params.shoppingListId),
        this.itemsRepository.updateItems({
          shoppingListId: params.shoppingListId,
          items: itemsData
        })
      ]);

      // 3. Check authorization after getting the list
      if (!existingList) {
        throw new Error('Shopping list not found');
      }
      if (existingList.customerId !== params.customerId) {
        throw new Error('Not authorized to update items in this shopping list');
      }

      // 4. Start price fetching early using update strategy
      const pricesPromise = this.getPricesForUpdateOperation({
        items: updatedItems.map(item => ({ productVariantId: item.productVariantId })),
        companyLocationId: params.companyLocationId,
        storeName: params.storeName
      });

      // 5. Fetch customer partner numbers for items that need them
      const itemsNeedingPartnerNumber = updatedItems.filter(
        (item) => !item.customerPartnerNumber || item.customerPartnerNumber === ''
      );

      let customerPartnerNumberMap = new Map<string, string>();
      if (itemsNeedingPartnerNumber.length > 0) {
        try {
          loggerService.info('Fetching customer partner numbers', {
            itemCount: itemsNeedingPartnerNumber.length,
            shoppingListId: params.shoppingListId
          });

          const partnerNumbers = await storeCompanyMappingService.batchFetchCustomerNumberDetails({
            storeName: params.storeName,
            companyId: params.companyId,
            skuIds: itemsNeedingPartnerNumber.map(item => item.skuId)
          });

          // Create mapping from SKU to customer partner number
          for (const item of partnerNumbers) {
            if (item.skuId && item.customerPartnerNumber) {
              customerPartnerNumberMap.set(item.skuId, item.customerPartnerNumber);
            }
          }

          // Update items with customer partner numbers
          if (customerPartnerNumberMap.size > 0) {
            await this.itemsRepository.updateCustomerPartnerNumbers({
              shoppingListId: params.shoppingListId,
              updates: Array.from(customerPartnerNumberMap.entries()).map(([skuId, customerPartnerNumber]) => ({
                skuId,
                customerPartnerNumber
              }))
            });

            // Update the updatedItems array with new customer partner numbers
            updatedItems.forEach((item) => {
              const partnerNumber = customerPartnerNumberMap.get(item.skuId);
              if (partnerNumber) {
                item.customerPartnerNumber = partnerNumber;
              }
            });
          }

          loggerService.info('Customer partner numbers updated', {
            totalItems: itemsNeedingPartnerNumber.length,
            updatedCount: customerPartnerNumberMap.size,
            shoppingListId: params.shoppingListId
          });
        } catch (error) {
          loggerService.error('Failed to fetch customer partner numbers', {
            error: error instanceof Error ? {
              message: error.message,
              stack: error.stack,
              name: error.name
            } : 'Unknown error',
            itemCount: itemsNeedingPartnerNumber.length,
            shoppingListId: params.shoppingListId
          });
          // Continue execution even if partner number fetch fails
        }
      }

      // 6. Format items with prices and updated partner numbers
      const formatItem = (item: any, priceInfo: { price: number; currencyCode: string } | undefined) => ({
        id: Number(item.id),
        productId: item.productId,
        productName: item.productName || '',
        skuId: item.skuId,
        productVariantId: item.productVariantId,
        productImageUrl: item.productImageUrl || '',
        url: item.url || '',
        customerPartnerNumber: customerPartnerNumberMap.get(item.skuId) || item.customerPartnerNumber || '',
        quantity: Number(item.quantity),
        price: priceInfo?.price ?? 0,
        currencyCode: priceInfo?.currencyCode ?? '',
        subtotal: Number((Number(priceInfo?.price ?? 0) * Number(item.quantity)).toFixed(2)),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      });

      // 7. Wait for prices and format items
      const prices = await pricesPromise;
      const formattedItems = updatedItems.map(item => 
        formatItem(item, prices.get(item.productVariantId))
      );

      const duration = Date.now() - start;
      loggerService.info('Items update completed', { 
        shoppingListId: params.shoppingListId,
        itemsCount: formattedItems.length,
        duration,
        items: formattedItems.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          customerPartnerNumber: item.customerPartnerNumber
        }))
      });
      
      return formattedItems;
    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Error in updateItems service', { 
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        request: {
          shoppingListId: params.shoppingListId,
          itemCount: params.data.listItems.length
        },
        duration
      });
      throw error;
    }
  }

  // Helper Methods
  private async checkExistingList(customerId: string, name: string, companyLocationId: string, storeName?: string) {
    // Normalize storeName to match the database schema
    const normalizedStoreName = storeName === undefined ? undefined : storeName;
    
    loggerService.info('Checking existing shopping list', { 
      customerId, 
      name, 
      companyLocationId, 
      storeName: normalizedStoreName 
    });
    
    const existingList = await this.repository.findByCustomerIdAndName(customerId, name, companyLocationId, normalizedStoreName);
    if (existingList) {
      loggerService.warn('Shopping list name already exists', { 
        customerId,
        name,
        storeName: normalizedStoreName
      });
      throw new Error(`Shopping list with name "${name}" already exists for this customer at location "${companyLocationId}"${normalizedStoreName ? ` in store "${normalizedStoreName}"` : ''}`);
    }
  }

  /**
   * Get aggregated information for shopping list items
   */
  public async getShoppingListAggregation(params: ShoppingListItemsAggregationRequest): Promise<ShoppingListItemsAggregationResponse> {
    const start = Date.now();
    try {
      loggerService.info('Starting shopping list items aggregation', { params });

      // 1. Get all items for the shopping list and total quantity in parallel
      const [{ items }, totalItemCount] = await Promise.all([
        this.itemsRepository.findByListId({
          shoppingListId: Number(params.shoppingListId)
        }),
        this.itemsRepository.getTotalQuantity(Number(params.shoppingListId))
      ]);

      loggerService.info('Found shopping list items', {
        items,
        totalItemCount
      });

      if (!items || items.length === 0) {
        loggerService.info('No items found for shopping list', {
          shoppingListId: params.shoppingListId
        });
        return {
          summary: {
            totalItemCount: 0,
            subtotal: 0,
            currencyCode: ''
          }
        };
      }

      // 2. Prepare for price calculation
      const productVariantMap = new Map<string, number>();
      items.forEach(item => {
        const quantity = Number(item.quantity) || 0;
        productVariantMap.set(item.productVariantId, quantity);
      });

      // 3. Get prices for all product variants
      const productVariantIds = Array.from(productVariantMap.keys());
      const prices = await priceService.getPriceForFetch(productVariantIds, params.companyLocationId, params.storeName);

      // 4. Calculate subtotal
      let subtotal = 0;
      let currencyCode = '';

      productVariantIds.forEach(variantId => {
        const priceInfo = prices.get(variantId);
        if (priceInfo) {
          const quantity = productVariantMap.get(variantId) || 0;
          subtotal += priceInfo.price * quantity;
          if (!currencyCode) {
            currencyCode = priceInfo.currencyCode;
          }
        }
      });

      // Round subtotal to 2 decimal places
      subtotal = Number(subtotal.toFixed(2));

      const duration = Date.now() - start;
      loggerService.info('Shopping list items aggregation completed', {
        shoppingListId: params.shoppingListId,
        totalItemCount,
        subtotal,
        currencyCode,
        duration
      });

      return {
        summary: {
          totalItemCount,
          subtotal,
          currencyCode
        }
      };
    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Failed to get shopping list items aggregation', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        params,
        duration
      });
      throw error;
    }
  }
}

export const shoppingListService = new ShoppingListService(); 