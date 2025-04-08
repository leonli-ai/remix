import { loggerService } from '~/lib/logger';
import prisma from '../../db.server';
import {
  type FindManyParams,
  type CreateParams,
  type UpdateParams,
  type ShoppingListWithCount
} from '../../types/shopping-lists/shopping-list-repository.schema';

export class ShoppingListRepository {
  public async findById(id: number): Promise<ShoppingListWithCount | null> {
    const result = await prisma.shoppingList.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: { shoppingListItems: true }
        }
      }
    });

    if (!result) {
      return null;
    }

    return {
      ...result,
      id: Number(result.id),
      description: result.description ?? undefined,
      createBy: result.createBy ?? undefined,
      updateBy: result.updateBy ?? undefined,
      storeName: result.storeName ?? undefined,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    };
  }

  public async findByCustomerIdAndName(customerId: string, name: string, companyLocationId: string, storeName?: string) {
    // Normalize storeName to match the database schema
    const normalizedStoreName = storeName === undefined ? null : storeName;
    
    return await prisma.shoppingList.findFirst({
      where: { 
        customerId, 
        name, 
        companyLocationId,
        storeName: normalizedStoreName
      }
    });
  }

  public async findMany(params: FindManyParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    const where = {
      customerId: params.customerId,
      companyLocationId: params.companyLocationId,
      storeName: params.storeName === undefined ? null : params.storeName,
      ...(params.filters?.name && {
        name: {
          contains: params.filters.name,
          mode: 'insensitive' as const
        }
      }),
      ...(params.filters?.description && {
        description: {
          contains: params.filters.description,
          mode: 'insensitive' as const
        }
      }),
      ...(params.filters?.isDefault !== undefined && {
        isDefault: params.filters.isDefault
      }),
      ...(params.filters?.canEdit !== undefined && {
        canEdit: params.filters.canEdit
      }),
      ...(params.filters?.createBy && {
        createBy: params.filters.createBy
      }),
      ...(params.filters?.updateBy && {
        updateBy: params.filters.updateBy
      }),
      ...(params.filters?.createdAt && {
        createdAt: {
          gte: new Date(params.filters.createdAt)
        }
      }),
      ...(params.filters?.updatedAt && {
        updatedAt: {
          gte: new Date(params.filters.updatedAt)
        }
      })
    };

    loggerService.info('where ===> ', { where });

    const orderBy = params.sort?.map(sortItem => ({
      [sortItem.field]: sortItem.order
    })) ?? [{
      updatedAt: 'desc' as const
    }];

    const [lists, totalCount] = await Promise.all([
      prisma.shoppingList.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          _count: {
            select: { shoppingListItems: true }
          },
          shoppingListItems: {
            select: {
              quantity: true,
              productVariantId: true
            }
          }
        }
      }),
      prisma.shoppingList.count({ where })
    ]);

    return {
      lists,
      totalCount,
      page,
      pageSize
    };
  }

  public async create(params: CreateParams) {
    // Normalize storeName to match the database schema
    const normalizedStoreName = params.storeName === undefined ? null : params.storeName;
    
    return await prisma.$transaction(async (tx) => {
      // If this is set as default, unset any existing default list
      if (params.isDefault) {
        await tx.shoppingList.updateMany({
          where: {
            customerId: params.customerId,
            companyLocationId: params.companyLocationId,
            isDefault: true
          },
          data: {
            isDefault: false,
            updatedAt: new Date()
          }
        });
      }

      return await tx.shoppingList.create({
        data: {
          customerId: params.customerId,
          name: params.name,
          companyLocationId: params.companyLocationId,
          description: params.description,
          isDefault: params.isDefault,
          storeName: normalizedStoreName
        }
      });
    });
  }

  public async update(params: UpdateParams) {
    return await prisma.$transaction(async (tx) => {
      const list = await tx.shoppingList.findUnique({
        where: { id: BigInt(params.id) },
        select: {
          customerId: true,
          companyLocationId: true
        }
      });

      if (!list) {
        return null;
      }

      // If this is set as default, unset any existing default list
      if (params.isDefault) {
        await tx.shoppingList.updateMany({
          where: {
            customerId: list.customerId,
            companyLocationId: list.companyLocationId,
            isDefault: true,
            id: { not: BigInt(params.id) }
          },
          data: {
            isDefault: false,
            updatedAt: new Date()
          }
        });
      }

      // Normalize storeName to match the database schema
      const normalizedStoreName = params.storeName === undefined ? undefined : params.storeName;

      return await tx.shoppingList.update({
        where: { id: BigInt(params.id) },
        data: {
          name: params.name,
          description: params.description,
          isDefault: params.isDefault,
          storeName: normalizedStoreName,
          updatedAt: new Date()
        }
      });
    });
  }

  public async delete(id: number) {
    return await prisma.$transaction(async (tx) => {
      const list = await tx.shoppingList.findUnique({
        where: { id: BigInt(id) }
      });

      if (!list) {
        return null;
      }

      await tx.shoppingListItem.deleteMany({
        where: { shoppingListId: BigInt(id) }
      });

      return await tx.shoppingList.delete({
        where: { id: BigInt(id) }
      });
    });
  }
}

export const shoppingListRepository = new ShoppingListRepository(); 