import prisma from '../../db.server';
import { loggerService } from '../../lib/logger';
import { type FetchSubscriptionContractsRequest } from '../../types/subscription-contracts/subscription-contract.schema';
import { type CreateSubscriptionContractRequest } from '../../types/subscription-contracts/subscription-contract-create.schema';
import { SubscriptionContractError } from '../../lib/errors/subscription-contract-error';
import { type GetSubscriptionContractByIdRequest } from '../../types/subscription-contracts/subscription-contract-get-by-id.schema';
import { type UpdateSubscriptionContractRequest } from '../../types/subscription-contracts/subscription-contract-update.schema';

/**
 * Repository for subscription contract operations
 */
export class SubscriptionContractRepository {
  /**
   * Fetch all subscription contracts with filtering and pagination
   */
  public async fetchAll(params: FetchSubscriptionContractsRequest) {
    try {
      const { storeName, companyId, companyLocationId, filter, pagination, sort } = params;
      const { page, pageSize } = pagination;

      // Build where clause
      const where: any = {
        storeName,
        companyLocationId,
      };

      // Add companyId to where clause if provided
      if (companyId) {
        where.companyId = companyId;
      }

      // Add filter conditions
      if (filter) {
        if (filter.name) {
          where.name = { contains: filter.name, mode: 'insensitive' };
        }
        if (filter.status?.length) {
          where.status = { in: filter.status };
        }
        if (filter.approvedByName) {
          where.approvedByName = { contains: filter.approvedByName, mode: 'insensitive' };
        }
        if (filter.startDateFrom || filter.startDateTo) {
          where.startDate = {};
          if (filter.startDateFrom) {
            where.startDate.gte = new Date(filter.startDateFrom);
          }
          if (filter.startDateTo) {
            where.startDate.lte = new Date(filter.startDateTo);
          }
        }
        if (filter.frequencyUnit) {
          where.intervalUnit = { 
            equals: filter.frequencyUnit,
            mode: 'insensitive'
          };
        }
        if (filter.frequencyValue) {
          where.intervalValue = filter.frequencyValue;
        }
        if (filter.poNumber) {
          where.poNumber = { contains: filter.poNumber, mode: 'insensitive' };
        }
        if (filter.orderTotalMin || filter.orderTotalMax) {
          where.orderTotal = {};
          if (filter.orderTotalMin) {
            where.orderTotal.gte = filter.orderTotalMin;
          }
          if (filter.orderTotalMax) {
            where.orderTotal.lte = filter.orderTotalMax;
          }
        }
        if (filter.nextOrderCreationDateFrom || filter.nextOrderCreationDateTo) {
          where.nextOrderCreationDate = {};
          if (filter.nextOrderCreationDateFrom) {
            where.nextOrderCreationDate.gte = new Date(filter.nextOrderCreationDateFrom);
          }
          if (filter.nextOrderCreationDateTo) {
            where.nextOrderCreationDate.lte = new Date(filter.nextOrderCreationDateTo);
          }
        }
        if (filter.orderNumber) {
          where.id = filter.orderNumber;
        }
      }

      // Build order by clause
      const orderBy: any = sort
        ? {
            [sort.field]: sort.order,
          }
        : {
            nextOrderCreationDate: 'desc',
          };

      // Get total count
      const total = await prisma.subscriptionContract.count({ where });

      // Get paginated data
      const data = await prisma.subscriptionContract.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          status: true,
          orderTotal: true,
          currencyCode: true,
          intervalValue: true,
          intervalUnit: true,
          nextOrderCreationDate: true,
          approvedByName: true,
          poNumber: true,
        },
      });

      return {
        total,
        page,
        pageSize,
        data: data.map((item) => ({
          ...item,
          nextOrderCreationDate: item.nextOrderCreationDate.toISOString(),
        })),
      };
    } catch (error) {
      loggerService.error('Error fetching subscription contracts', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get a subscription contract by ID
   */
  public async getById(params: GetSubscriptionContractByIdRequest) {
    try {
      // Get subscription contract by ID
      const subscriptionContract = await prisma.subscriptionContract.findFirst({
        where: {
          id: BigInt(params.id),
          storeName: params.storeName,
        },
      });

      if (!subscriptionContract) {
        return null;
      }

      // Get subscription contract lines
      const subscriptionContractLines = await prisma.subscriptionContractLine.findMany({
        where: {
          subscriptionContractId: subscriptionContract.id,
          storeName: params.storeName,
        },
      });

      // Return the full subscription contract with lines
      return {
        ...subscriptionContract,
        lines: subscriptionContractLines,
      };
    } catch (error) {
      loggerService.error('Error getting subscription contract by ID', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        subscriptionContractId: params.id,
        storeName: params.storeName,
      });

      // Handle specific errors
      if (error instanceof SubscriptionContractError) {
        throw error;
      }

      // Handle Prisma errors
      if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
        throw SubscriptionContractError.notFound(`Database error: ${error.message}`);
      }

      // Handle generic errors
      throw SubscriptionContractError.notFound(
        error instanceof Error ? error.message : 'Failed to get subscription contract by ID'
      );
    }
  }

  /**
   * Create a subscription contract and related contract lines
   * @param params The subscription contract request parameters
   * @param orderTotal Pre-calculated order total
   * @param dateCalculation Pre-calculated dates for the subscription
   * @returns Created subscription contract ID and status
   */
  public async create(
    params: CreateSubscriptionContractRequest,
    orderTotal: number,
    dateCalculation: { startDate: Date; endDate: Date; nextOrderCreationDate: Date }
  ): Promise<{ id: bigint, status: string }> {
    try {
      // Create subscription contract
      const subscriptionContract = await this.createSubscriptionContract(
        params,
        orderTotal,
        dateCalculation.startDate,
        dateCalculation.endDate,
        dateCalculation.nextOrderCreationDate
      );

      // Create subscription contract lines
      await this.createSubscriptionContractLines(
        params.storeName,
        subscriptionContract.id,
        params.subscription.items
      );

      return { id: subscriptionContract.id, status: subscriptionContract.status };
    } catch (error) {
      loggerService.error('Error creating subscription contract', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params: {
          storeName: params.storeName,
          companyId: params.companyId,
          companyLocationId: params.companyLocationId
        }
      });
      
      if (error instanceof SubscriptionContractError) {
        throw error;
      }
      
      // Handle specific error types
      if (error instanceof Error) {
        // Database errors (Prisma)
        if (error.message.includes('Prisma')) {
          throw SubscriptionContractError.creationFailed(`Database error: ${error.message}`);
        }
      }
      
      throw SubscriptionContractError.creationFailed(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * Create the subscription contract in the database
   */
  private async createSubscriptionContract(
    params: CreateSubscriptionContractRequest,
    orderTotal: number,
    startDate: Date,
    endDate: Date,
    nextOrderCreationDate: Date
  ): Promise<{ id: bigint; status: string }> {
    try {
      // Normalize interval unit to lowercase for database storage
      const normalizedIntervalUnit = params.subscription.intervalUnit.toLowerCase();
      
      // Set delivery anchor, defaulting to 1 if not provided
      const deliveryAnchor = params.subscription.deliveryAnchor || 1;
      
      // Create subscription contract
      const subscriptionContract = await prisma.subscriptionContract.create({
        data: {
          storeName: params.storeName,
          name: params.subscription.name,
          status: 'pending',
          note: params.subscription.note,
          sellingPlanId: null,
          companyId: params.companyId,
          companyLocationId: params.companyLocationId,
          customerId: params.customerId,
          approvedById: null,
          approvedByName: null,
          startDate,
          endDate,
          intervalValue: params.subscription.intervalValue,
          intervalUnit: normalizedIntervalUnit, // Store normalized interval unit
          deliveryAnchor, // Add delivery anchor field
          nextOrderCreationDate,
          discountType: params.subscription.discountType,
          discountValue: params.subscription.discountValue,
          currencyCode: params.subscription.currencyCode,
          orderTotal,
          poNumber: params.subscription.poNumber,
          customerPaymentMethodId: null,
          shippingMethodId: params.subscription.shippingMethodId || null,
          shippingMethodName: params.subscription.shippingMethod,
          shippingCost: params.subscription.shippingCost
        }
      });
      
      return { id: subscriptionContract.id, status: subscriptionContract.status };
    } catch (error) {
      loggerService.error('Error creating subscription contract in database', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params: {
          storeName: params.storeName,
          companyId: params.companyId,
          name: params.subscription.name
        }
      });
      
      throw SubscriptionContractError.creationFailed(
        error instanceof Error ? error.message : 'Failed to create subscription contract record'
      );
    }
  }

  /**
   * Create subscription contract lines in the database
   */
  private async createSubscriptionContractLines(
    storeName: string,
    subscriptionContractId: bigint,
    items: Array<{
      variantId: string;
      sku: string;
      quantity: number;
      price: number;
      customerPartnerNumber?: string;
    }>
  ): Promise<void> {
    try {
      for (const item of items) {
        await prisma.subscriptionContractLine.create({
          data: {
            storeName,
            subscriptionContractId,
            variantId: item.variantId,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            customerPartnerNumber: item.customerPartnerNumber || null
          }
        });
      }
    } catch (error) {
      loggerService.error('Error creating subscription contract lines', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionContractId: subscriptionContractId.toString(),
        itemCount: items.length
      });
      
      throw SubscriptionContractError.creationFailed(
        `Failed to create subscription contract lines: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update an existing subscription contract and its related contract lines
   * @param params The update request parameters  
   * @param dateCalculation Pre-calculated dates for the subscription
   * @returns Updated subscription contract ID, status, and message
   */
  public async update(
    params: UpdateSubscriptionContractRequest,
    dateCalculation: { startDate: Date; endDate: Date; nextOrderCreationDate: Date }
  ): Promise<{ id: bigint, status: string, message: string }> {
    try {
      // Find and verify that a subscription contract exists and belongs to the customer
      await this.findAndVerifyContract(params);

      // Start a transaction for updating
      return await prisma.$transaction(async (tx) => {
        // Update subscription contract
        const updatedContract = await tx.subscriptionContract.update({
          where: {
            id: BigInt(params.subscriptionContractId),
          },
          data: {
            name: params.data.name,
            note: params.data.note,
            poNumber: params.data.poNumber,
            startDate: dateCalculation.startDate,
            endDate: dateCalculation.endDate,
            nextOrderCreationDate: dateCalculation.nextOrderCreationDate,
            intervalValue: params.data.intervalValue,
            intervalUnit: params.data.intervalUnit,
            deliveryAnchor: params.data.deliveryAnchor || 1, // Set to 1 if not provided
            shippingMethodId: params.data.shippingMethodId || null,
            shippingMethodName: params.data.shippingMethodName,
            shippingCost: params.data.shippingCost,
            discountType: params.data.discountType,
            discountValue: params.data.discountValue,
            orderTotal: params.data.orderTotal,
            updatedAt: new Date(),
          },
        });

        // Delete all existing contract lines
        await tx.subscriptionContractLine.deleteMany({
          where: {
            subscriptionContractId: BigInt(params.subscriptionContractId),
            storeName: params.storeName,
          },
        });

        // Create new contract lines
        for (const item of params.data.lines) {
          await tx.subscriptionContractLine.create({
            data: {
              storeName: params.storeName,
              subscriptionContractId: BigInt(params.subscriptionContractId),
              variantId: item.variantId,
              sku: item.sku,
              quantity: item.quantity,
              price: item.price,
              customerPartnerNumber: item.customerPartnerNumber || null,
            },
          });
        }

        return {
          id: updatedContract.id,
          status: updatedContract.status,
          message: 'Subscription contract updated successfully',
        };
      });
    } catch (error) {
      loggerService.error('Error updating subscription contract', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        subscriptionContractId: params.subscriptionContractId,
        storeName: params.storeName,
      });

      // Handle specific errors
      if (error instanceof SubscriptionContractError) {
        throw error;
      }

      // Handle Prisma errors
      if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
        throw SubscriptionContractError.updateFailed(`Database error: ${error.message}`);
      }

      // Handle generic errors
      throw SubscriptionContractError.updateFailed(
        error instanceof Error ? error.message : 'Failed to update subscription contract'
      );
    }
  }

  /**
   * Find and verify that a subscription contract exists and belongs to the customer
   * @param params Request parameters with identification information
   * @throws SubscriptionContractError if contract not found
   */
  private async findAndVerifyContract(params: UpdateSubscriptionContractRequest): Promise<void> {
    const whereCondition: any = {
      id: BigInt(params.subscriptionContractId),
      storeName: params.storeName,
    };

    // Add optional filters if provided
    if (params.companyLocationId) {
      whereCondition.companyLocationId = params.companyLocationId;
    }
    
    if (params.customerId) {
      whereCondition.customerId = params.customerId;
    }

    const count = await prisma.subscriptionContract.count({
      where: whereCondition,
    });

    if (count === 0) {
      throw SubscriptionContractError.notFound(`Subscription contract not found or not authorized`);
    }
  }

  /**
   * Update only the nextOrderCreationDate of a subscription contract
   * @param id The subscription contract ID
   * @param storeName The store name
   * @param nextOrderCreationDate The new next order creation date
   * @returns Boolean indicating success or failure
   */
  public async updateNextOrderCreationDate(
    id: string,
    storeName: string,
    nextOrderCreationDate: Date
  ): Promise<boolean> {
    try {
      const contractId = BigInt(id);

      // Update subscription contract
      const updatedContract = await prisma.subscriptionContract.updateMany({
        where: {
          id: contractId,
          storeName,
        },
        data: {
          nextOrderCreationDate,
          updatedAt: new Date(),
        },
      });

      if (updatedContract.count === 0) {
        loggerService.warn('Subscription contract not found for nextOrderCreationDate update', {
          id,
          storeName,
        });
        return false;
      }

      return true;
    } catch (error) {
      loggerService.error('Error updating subscription contract nextOrderCreationDate', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        id,
        storeName,
      });

      throw error;
    }
  }

  /**
   * Update the status of a subscription contract
   * @param id The subscription contract ID
   * @param storeName The store name
   * @param status The new status to set
   * @returns Boolean indicating success or failure
   */
  public async updateStatus(
    id: string,
    storeName: string,
    status: string
  ): Promise<boolean> {
    try {
      const contractId = BigInt(id);

      // Update subscription contract
      const updatedContract = await prisma.subscriptionContract.updateMany({
        where: {
          id: contractId,
          storeName,
        },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      if (updatedContract.count === 0) {
        loggerService.warn('Subscription contract not found for status update', {
          id,
          storeName,
          status,
        });
        return false;
      }

      return true;
    } catch (error) {
      loggerService.error('Error updating subscription contract status', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        id,
        storeName,
        status,
      });

      throw error;
    }
  }

  /**
   * Get multiple subscription contracts by their IDs
   * @param params Object containing IDs and store name
   * @returns Array of subscription contracts
   */
  public async getByIds(params: { ids: number[]; storeName: string }): Promise<any[]> {
    try {
      // 1. First get all subscription contracts
      const contracts = await prisma.subscriptionContract.findMany({
        where: {
          id: {
            in: params.ids.map(id => BigInt(id))
          },
          storeName: params.storeName
        }
      });

      if (!contracts || contracts.length === 0) {
        loggerService.warn('No subscription contracts found with the provided IDs', {
          ids: params.ids,
          storeName: params.storeName
        });
        return [];
      }

      // 2. For each contract, get its lines separately since there's no physical foreign key
      const contractsWithLines = await Promise.all(
        contracts.map(async (contract) => {
          const lines = await prisma.subscriptionContractLine.findMany({
            where: {
              subscriptionContractId: contract.id,
              storeName: params.storeName
            }
          });
          
          // Add lines to the contract
          return {
            ...contract,
            lines
          };
        })
      );

      return contractsWithLines;
    } catch (error) {
      loggerService.error('Error fetching subscription contracts by IDs', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        ids: params.ids,
        storeName: params.storeName
      });

      throw error;
    }
  }

  /**
   * Bulk delete subscription contracts and their lines
   * @param ids Array of subscription contract IDs to delete
   * @param storeName The store name
   * @returns Number of subscription contracts deleted
   */
  public async bulkDelete(ids: number[], storeName: string): Promise<number> {
    try {
      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        let deletedLineCount = 0;
        
        // First delete all subscription contract lines for these contracts
        for (const id of ids) {
          const deleteResult = await tx.subscriptionContractLine.deleteMany({
            where: {
              subscriptionContractId: BigInt(id),
              storeName
            }
          });
          deletedLineCount += deleteResult.count;
        }
        
        loggerService.info('Deleted subscription contract lines', {
          lineCount: deletedLineCount,
          contractIds: ids,
          storeName
        });

        // Then delete the subscription contracts
        const deletedContracts = await tx.subscriptionContract.deleteMany({
          where: {
            id: {
              in: ids.map(id => BigInt(id))
            },
            storeName
          }
        });

        return deletedContracts.count;
      });

      if (result === 0) {
        loggerService.warn('No subscription contracts were deleted', {
          ids,
          storeName
        });
      } else {
        loggerService.info(`Successfully deleted ${result} subscription contracts`, {
          ids,
          storeName
        });
      }

      return result;
    } catch (error) {
      loggerService.error('Error bulk deleting subscription contracts', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        ids,
        storeName
      });

      throw error;
    }
  }

  /**
   * Delete a subscription contract and its lines by ID
   * @param id Subscription contract ID to delete
   * @param storeName The store name
   * @returns Boolean indicating success
   */
  public async deleteById(id: number, storeName: string): Promise<boolean> {
    try {
      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // First delete all subscription contract lines
        const deletedLines = await tx.subscriptionContractLine.deleteMany({
          where: {
            subscriptionContractId: BigInt(id),
            storeName
          }
        });
        
        loggerService.info('Deleted subscription contract lines', {
          lineCount: deletedLines.count,
          contractId: id,
          storeName
        });

        // Then delete the subscription contract
        const deletedContract = await tx.subscriptionContract.deleteMany({
          where: {
            id: BigInt(id),
            storeName
          }
        });

        return deletedContract.count;
      });

      if (result === 0) {
        loggerService.warn('No subscription contract was deleted', {
          id,
          storeName
        });
        return false;
      } else {
        loggerService.info(`Successfully deleted subscription contract`, {
          id,
          storeName
        });
        return true;
      }
    } catch (error) {
      loggerService.error('Error deleting subscription contract', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        id,
        storeName
      });

      throw error;
    }
  }

  /**
   * Update subscription contract with approval information
   * @param id Contract ID
   * @param storeName Store name
   * @param approvedById ID of the approver
   * @param approvedByName Name of the approver
   * @param nextOrderCreationDate Next order creation date
   * @returns True if update was successful, false otherwise
   */
  public async updateApproval(
    id: string,
    storeName: string,
    approvedById: string,
    approvedByName: string,
    nextOrderCreationDate: Date
  ): Promise<boolean> {
    try {
      // Log the operation
      loggerService.info('Updating subscription contract approval status', {
        id,
        storeName,
        approvedById,
        approvedByName,
        nextOrderCreationDate: nextOrderCreationDate.toISOString()
      });

      // Update the contract
      const result = await prisma.subscriptionContract.updateMany({
        where: {
          id: BigInt(id),
          storeName
        },
        data: {
          status: 'active',
          approvedById,
          approvedByName,
          nextOrderCreationDate,
          updatedAt: new Date()
        }
      });

      // Check the result
      if (result.count === 0) {
        loggerService.warn('No subscription contract found to update approval status', {
          id,
          storeName
        });
        return false;
      }

      loggerService.info('Successfully updated subscription contract approval status', {
        id,
        storeName,
        recordsUpdated: result.count
      });

      return true;
    } catch (error) {
      // Log error details
      loggerService.error('Error updating subscription contract approval status', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error,
        id,
        storeName
      });

      // Re-throw the error to be handled by the service
      throw error;
    }
  }

  /**
   * Update subscription contract to declined status
   * @param id Subscription contract ID
   * @param storeName Store name
   * @param approvedById ID of the contact who declined the subscription
   * @param approvedByName Name of the contact who declined the subscription
   * @returns Boolean indicating whether the update was successful
   */
  public async updateDecline(
    id: string,
    storeName: string,
    approvedById: string,
    approvedByName: string
  ): Promise<boolean> {
    try {
      // Log the operation
      loggerService.info('Updating subscription contract decline status', {
        id,
        storeName,
        approvedById,
        approvedByName
      });

      // Update the contract
      const result = await prisma.subscriptionContract.updateMany({
        where: {
          id: BigInt(id),
          storeName
        },
        data: {
          status: 'declined',
          approvedById,
          approvedByName,
          updatedAt: new Date()
        }
      });

      // Check the result
      if (result.count === 0) {
        loggerService.warn('No subscription contract found to update decline status', {
          id,
          storeName
        });
        return false;
      }

      loggerService.info('Successfully updated subscription contract decline status', {
        id,
        storeName,
        recordsUpdated: result.count
      });

      return true;
    } catch (error) {
      // Log error details
      loggerService.error('Error updating subscription contract decline status', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error,
        id,
        storeName
      });

      // Re-throw the error to be handled by the service
      throw error;
    }
  }
}

export const subscriptionContractRepository = new SubscriptionContractRepository(); 