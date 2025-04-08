import prisma from '../../db.server';
import { loggerService } from '../../lib/logger';
import type { Prisma } from '@prisma/client';
import { SubscriptionContractStatus } from '../../types/subscription-contracts/subscription-contract.schema';

/**
 * Repository for subscription scheduling operations
 */
class SubscriptionScheduleRepository {
  /**
   * Fetch all subscription contracts eligible for scheduling
   * @param storeName Store to fetch eligible subscriptions for
   */
  public async fetchEligibleSubscriptions(storeName: string): Promise<any[]> {
    try {
      const currentDate = new Date();
      loggerService.info('Fetching eligible subscriptions for scheduling', {
        storeName,
        currentDate: currentDate.toISOString(),
      });

      return await prisma.subscriptionContract.findMany({
        where: {
          storeName,
          status: SubscriptionContractStatus.ACTIVE,
          nextOrderCreationDate: {
            lte: currentDate,
          },
          startDate: {
            lte: currentDate,
          },
          OR: [
            {
              endDate: {
                equals: undefined, 
              },
            },
            {
              endDate: {
                gte: currentDate, 
              },
            },
          ],
        }
      });
    } catch (error) {
      loggerService.error('Error fetching eligible subscriptions', {
        error: error instanceof Error ? { 
          message: error.message, 
          stack: error.stack,
        } : 'Unknown error',
        storeName,
      });
      throw error;
    }
  }

  /**
   * Fetch subscription contract lines for a given subscription
   * @param subscriptionContractId Subscription contract ID
   * @param storeName Store name
   */
  public async fetchSubscriptionLines(subscriptionContractId: bigint, storeName: string): Promise<any[]> {
    try {
      return await prisma.subscriptionContractLine.findMany({
        where: {
          subscriptionContractId,
          storeName,
        },
      });
    } catch (error) {
      loggerService.error('Error fetching subscription lines', {
        error: error instanceof Error ? { 
          message: error.message, 
          stack: error.stack,
        } : 'Unknown error',
        subscriptionContractId: subscriptionContractId.toString(),
        storeName,
      });
      throw error;
    }
  }

  /**
   * Update subscription contract with new nextOrderCreationDate and optionally status
   * @param subscriptionContractId Subscription contract ID
   * @param storeName Store name
   * @param nextOrderCreationDate Next order creation date
   * @param status Optional new status
   */
  public async updateSubscriptionNextDate(
    subscriptionContractId: bigint, 
    storeName: string, 
    nextOrderCreationDate: Date,
    status?: string
  ): Promise<any> {
    try {
      const updateData: Prisma.SubscriptionContractUpdateInput = {
        nextOrderCreationDate,
      };

      if (status) {
        updateData.status = status;
      }

      return await prisma.subscriptionContract.update({
        where: {
          id: subscriptionContractId,
          storeName,
        },
        data: updateData,
      });
    } catch (error) {
      loggerService.error('Error updating subscription next order date', {
        error: error instanceof Error ? { 
          message: error.message, 
          stack: error.stack,
        } : 'Unknown error',
        subscriptionContractId: subscriptionContractId.toString(),
        storeName,
        nextOrderCreationDate: nextOrderCreationDate.toISOString(),
        status,
      });
      throw error;
    }
  }

  /**
   * Create a schedule log entry in the database
   */
  public async createScheduleLog(logEntry: {
    storeName: string;
    subscriptionContractId: number;
    scheduledAt: Date;
    status: string;
    message?: string;
  }): Promise<any> {
    try {
     
      return await prisma.subscriptionScheduleLog.create({
        data: {
          storeName: logEntry.storeName,
          subscriptionContractId: BigInt(logEntry.subscriptionContractId),
          scheduledAt: logEntry.scheduledAt,
          status: logEntry.status,
          message: logEntry.message,
        },
      });
    } catch (error) {
      loggerService.error('Error creating subscription schedule log', {
        error: error instanceof Error ? { 
          message: error.message, 
          stack: error.stack,
        } : 'Unknown error',
        logEntry: {
          ...logEntry,
          scheduledAt: logEntry.scheduledAt.toISOString(),
          subscriptionContractId: logEntry.subscriptionContractId.toString(),
        },
      });
      throw error;
    }
  }

  /**
   * Create multiple schedule log entries in batch
   */
  public async createScheduleLogBulk(logEntries: Array<{
    storeName: string;
    subscriptionContractId: number;
    scheduledAt: Date;
    status: string;
    message?: string;
  }>): Promise<any> {
    try {
     
      return await prisma.$transaction(
        logEntries.map((entry) => 
          prisma.subscriptionScheduleLog.create({
            data: {
              storeName: entry.storeName,
              subscriptionContractId: BigInt(entry.subscriptionContractId),
              scheduledAt: entry.scheduledAt,
              status: entry.status,
              message: entry.message,
            },
          })
        )
      );
    } catch (error) {
      loggerService.error('Error creating subscription schedule logs in bulk', {
        error: error instanceof Error ? { 
          message: error.message, 
          stack: error.stack,
        } : 'Unknown error',
        logEntriesCount: logEntries.length,
      });
      throw error;
    }
  }
}

export const subscriptionScheduleRepository = new SubscriptionScheduleRepository(); 