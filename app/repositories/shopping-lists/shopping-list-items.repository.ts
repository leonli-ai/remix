import prisma from '../../db.server';
import { loggerService } from '../../lib/logger';
import {
  type FindManyParams,
  type FindManyResponse
} from '../../types/shopping-lists/shopping-list-items-repository.schema';

/**
 * Repository class for managing shopping list items
 * Handles database operations for shopping list items including fetching, updating, and deleting
 */
export class ShoppingListItemsRepository {
  /**
   * Find shopping list items by list ID with pagination and filters
   */
  public async findByListId(params: {
    shoppingListId: number;
    page?: number;
    pageSize?: number;
    filters?: {
      productName?: string;
      skuId?: string;
      customerPartnerNumber?: string;
    };
    sort?: Array<{
      field: 'createdAt' | 'productName' | 'skuId' | 'customerPartnerNumber' | 'quantity' | 'price';
      order: 'asc' | 'desc';
    }>;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const sort = params.sort ?? [{ field: 'createdAt', order: 'desc' }];

    const where = {
      shoppingListId: BigInt(params.shoppingListId),
      ...(params.filters?.productName && {
        productName: {
          contains: params.filters.productName,
          mode: 'insensitive' as const
        }
      }),
      ...(params.filters?.skuId && {
        skuId: {
          contains: params.filters.skuId,
          mode: 'insensitive' as const
        }
      }),
      ...(params.filters?.customerPartnerNumber && {
        customerPartnerNumber: {
          contains: params.filters.customerPartnerNumber,
          mode: 'insensitive' as const
        }
      })
    };

    const orderBy = sort.map(({ field, order }) => {
      if (field === 'price') {
        // Price is not stored in the database, skip this sort
        return {};
      }
      return { [field]: order.toLowerCase() };
    }).filter(item => Object.keys(item).length > 0);

    const [items, totalCount] = await Promise.all([
      prisma.shoppingListItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy.length > 0 ? orderBy : [{ createdAt: 'desc' }]
      }),
      prisma.shoppingListItem.count({ where })
    ]);

    return {
      items,
      totalCount,
      page,
      pageSize
    };
  }

  /**
   * Delete multiple items from a shopping list
   */
  public async deleteItems(params: { shoppingListId: number; listItems: number[] }) {
    return await prisma.$transaction(async (tx) => {
      const itemsToDelete = await tx.shoppingListItem.findMany({
        where: {
          id: { in: params.listItems.map(id => BigInt(id)) },
          shoppingListId: BigInt(params.shoppingListId)
        }
      });

      await tx.shoppingListItem.deleteMany({
        where: {
          id: { in: params.listItems.map(id => BigInt(id)) },
          shoppingListId: BigInt(params.shoppingListId)
        }
      });

      await tx.shoppingList.update({
        where: {
          id: BigInt(params.shoppingListId)
        },
        data: {
          updatedAt: new Date()
        }
      });

      return itemsToDelete;
    });
  }

  /**
   * Update existing items or add new items to a shopping list
   */
  public async updateItems(params: {
    shoppingListId: number;
    items: Array<{
      id?: number;
      productId: string;
      productName?: string;
      productVariantId: string;
      skuId: string;
      productImageUrl?: string;
      url?: string;
      customerPartnerNumber?: string;
      quantity: number;
      updateBy?: string;
    }>;
  }) {

    const start = Date.now();
    try {
      const bigIntShoppingListId = BigInt(params.shoppingListId);

      // Pre-process: Merge items with same productId and productVariantId
      const mergedItemsMap = new Map<string, typeof params.items[0]>();
      
      params.items.forEach(item => {
        const key = `${item.productId}-${item.productVariantId}`;
        const existingItem = mergedItemsMap.get(key);
        
        if (existingItem) {
          // If item already exists, add quantities
          existingItem.quantity += item.quantity;
        } else {
          // If item doesn't exist, add it to map
          mergedItemsMap.set(key, { ...item });
        }
      });

      const mergedItems = Array.from(mergedItemsMap.values());

      loggerService.info('Starting items update', {
        shoppingListId: params.shoppingListId,
        originalItemCount: params.items.length,
        mergedItemCount: mergedItems.length
      });

      return await prisma.$transaction(async (tx) => {
        // Optimize: Pre-filter items and create batch operations
        const itemsWithId = mergedItems.filter(item => item.id);
        const itemsWithoutId = mergedItems.filter(item => !item.id);

        // Optimize: Single query to get all existing items
        const [existingItemsById, existingItemsByProduct] = await Promise.all([
          itemsWithId.length > 0 ? tx.shoppingListItem.findMany({
            where: {
              shoppingListId: bigIntShoppingListId,
              id: { in: itemsWithId.map(item => BigInt(item.id!)) }
            }
          }) : Promise.resolve([]),
          itemsWithoutId.length > 0 ? tx.shoppingListItem.findMany({
            where: {
              shoppingListId: bigIntShoppingListId,
              OR: itemsWithoutId.map(item => ({
                productId: item.productId,
                productVariantId: item.productVariantId
              }))
            }
          }) : Promise.resolve([])
        ]);
 


         const idMap = new Map(
          existingItemsById.map(item => {
            const idString = typeof item.id === 'bigint' ? item.id.toString() : String(item.id);
            loggerService.debug('Creating idMap entry', {
              originalId: item.id,
              idString,
              item: {
                id: idString,
                productId: item.productId
              }
            });
            return [idString, item];
          })
        );

        const productMap = new Map(
          existingItemsByProduct.map(item => {
            const key = `${item.productId}-${item.productVariantId}`;
            loggerService.debug('Creating productMap entry', {
              key,
              item: {
                id: typeof item.id === 'bigint' ? item.id.toString() : item.id,
                productId: item.productId
              }
            });
            return [key, item];
          })
        );


        // Prepare batch operations
        const updateOperations: any[] = [];
        const createOperations: any[] = [];
        const results: any[] = [];
      

        // Process items with ID
        for (const item of itemsWithId) {
          const existingItem = idMap.get(item.id!.toString());
          if (!existingItem) {
            throw new Error(`Item with ID ${item.id} not found in shopping list ${params.shoppingListId}`);
          }
          updateOperations.push({
            id: BigInt(item.id!),
            quantity: item.quantity,
            updatedAt: new Date()
          });
        }

        loggerService.info('Update operations', {
          updateOperations
        });


        // Process items without ID
        for (const item of itemsWithoutId) {
          loggerService.info('process item without id', {
            item
          });
          const key = `${item.productId}-${item.productVariantId}`;
          const existingItem = productMap.get(key);
          loggerService.info('process item without id::existingItem', {
            existingItem
          });

          if (existingItem) {
            updateOperations.push({
              id: existingItem.id,
              quantity: (existingItem.quantity ?? 0) + item.quantity,
              updatedAt: new Date()
            });
          } else {
            createOperations.push({
              ...this.createBaseItemData(item),
              shoppingListId: bigIntShoppingListId
            });
          }
        }

        loggerService.info('Create operations', {
          createOperations
        });

        // Optimize: Execute batch operations
        const [updatedItems, createdItems] = await Promise.all([
          updateOperations.length > 0 ? Promise.all(
            updateOperations.map(op => 
              tx.shoppingListItem.update({
                where: { id: op.id },
                data: { quantity: op.quantity, updatedAt: op.updatedAt }
              })
            )
          ) : Promise.resolve([]),
          createOperations.length > 0 ? tx.shoppingListItem.createMany({
            data: createOperations
          }).then(() => 
            tx.shoppingListItem.findMany({
              where: {
                shoppingListId: bigIntShoppingListId,
                productId: { in: createOperations.map(op => op.productId) },
                productVariantId: { in: createOperations.map(op => op.productVariantId) }
              },
              orderBy: { createdAt: 'desc' }
            })
          ) : Promise.resolve([])
        ]);
      
        loggerService.info('batch operations', {
          updatedItems,
          createdItems
        });

        // Optimize: Single timestamp update
        await tx.shoppingList.update({
          where: { id: bigIntShoppingListId },
          data: { updatedAt: new Date() }
        });

        results.push(...updatedItems, ...createdItems);

        const duration = Date.now() - start;
        loggerService.info('Items update completed', {
          processedItems: results.length,
          shoppingListId: params.shoppingListId,
          duration
        });
        loggerService.info('Results', {
          results
        });

        return results;
      }, {
        maxWait: 5000,
        timeout: 10000
      });
    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Items update failed', {
        shoppingListId: params.shoppingListId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      throw error;
    }
  }

  private createBaseItemData(item: any) {
    return {
      productId: item.productId,
      productName: item.productName ?? '',
      productVariantId: item.productVariantId,
      skuId: item.skuId ?? '',
      productImageUrl: item.productImageUrl ?? '',
      url: item.url ?? '',
      customerPartnerNumber: item.customerPartnerNumber ?? '',
      quantity: item.quantity
    };
  }

  public async getTotalQuantity(shoppingListId: number): Promise<number> {
    try {
      const result = await prisma.shoppingListItem.aggregate({
        where: {
          shoppingListId: BigInt(shoppingListId)
        },
        _sum: {
          quantity: true
        }
      });
      
      return result._sum.quantity || 0;
    } catch (error) {
      loggerService.error('Error getting total quantity', {
        error,
        shoppingListId
      });
      throw error;
    }
  }

  /**
   * Update customer partner numbers for shopping list items
   */
  public async updateCustomerPartnerNumbers(params: {
    shoppingListId: number;
    updates: Array<{
      skuId: string;
      customerPartnerNumber: string;
    }>;
  }): Promise<void> {
    const start = Date.now();
    try {
      loggerService.info('Starting customer partner number update', {
        shoppingListId: params.shoppingListId,
        updateCount: params.updates.length
      });

      await prisma.$transaction(async (tx) => {
        // Update each item in parallel
        await Promise.all(
          params.updates.map(update => 
            tx.shoppingListItem.updateMany({
              where: {
                shoppingListId: BigInt(params.shoppingListId),
                skuId: update.skuId
              },
              data: {
                customerPartnerNumber: update.customerPartnerNumber,
                updatedAt: new Date()
              }
            })
          )
        );

        // Update shopping list timestamp
        await tx.shoppingList.update({
          where: { id: BigInt(params.shoppingListId) },
          data: { updatedAt: new Date() }
        });
      });

      const duration = Date.now() - start;
      loggerService.info('Customer partner number update completed', {
        shoppingListId: params.shoppingListId,
        updateCount: params.updates.length,
        duration
      });
    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Failed to update customer partner numbers', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        shoppingListId: params.shoppingListId,
        updateCount: params.updates.length,
        duration
      });
      throw error;
    }
  }

  public async findMany(params: FindManyParams): Promise<FindManyResponse> {
    const page = params.pagination?.page ?? 1;
    const pageSize = params.pagination?.pageSize ?? 10;

    const where = {
      shoppingListId: BigInt(params.shoppingListId),
      ...(params.filters?.productName && {
        productName: {
          contains: params.filters.productName,
          mode: 'insensitive' as const
        }
      }),
      ...(params.filters?.skuId && {
        skuId: {
          contains: params.filters.skuId,
          mode: 'insensitive' as const
        }
      }),
      ...(params.filters?.customerPartnerNumber && {
        customerPartnerNumber: {
          contains: params.filters.customerPartnerNumber,
          mode: 'insensitive' as const
        }
      })
    };

    const orderBy = params.sort?.map(sortItem => ({
      [sortItem.field]: sortItem.order
    })) ?? [{
      createdAt: 'desc' as const
    }];

    const [lists, totalCount] = await Promise.all([
      prisma.shoppingListItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy
      }),
      prisma.shoppingListItem.count({ where })
    ]);

    return {
      lists: lists.map(item => ({
        ...item,
        id: Number(item.id),
        shoppingListId: Number(item.shoppingListId),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      totalCount,
      page,
      pageSize
    };
  }
}

export const shoppingListItemsRepository = new ShoppingListItemsRepository(); 