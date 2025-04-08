import { loggerService } from '../../lib/logger';
import { SubscriptionContractError } from '../../lib/errors/subscription-contract-error';
import { subscriptionScheduleRepository } from '../../repositories/subscription-contracts/subscription-schedule.repository';
import type { 
  SubscriptionContractScheduleRequest, 
  SubscriptionContractScheduleResponse,
  SubscriptionScheduleFailure,
  SubscriptionData,
  SubscriptionCommand
} from '../../types/subscription-contracts/subscription-contract-schedule.schema';
import {
  SubscriptionScheduleLogStatus,
} from '../../types/subscription-contracts/subscription-contract-schedule.schema';
import { SubscriptionContractStatus } from '../../types/subscription-contracts/subscription-contract.schema';
import { subscriptionContractService } from './subscription-contract.service';

/**
 * Service for subscription scheduling operations
 */
export class SubscriptionScheduleService {
  private readonly CLASS_NAME = 'SubscriptionScheduleService';
  
  // Maximum number of subscriptions to process concurrently
  private readonly MAX_CONCURRENT_PROCESSING = 5;

  /**
   * Schedule subscription orders for eligible subscriptions
   * @param params Schedule request parameters
   */
  public async scheduleSubscriptions(
    params: SubscriptionContractScheduleRequest
  ): Promise<SubscriptionContractScheduleResponse> {
    const METHOD = 'scheduleSubscriptions';
    
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting scheduling process`, { 
        storeName: params.storeName 
      });

      // 1. Fetch eligible subscriptions
      const eligibleSubscriptions = await this.fetchEligibleSubscriptions(params.storeName);
      
      if (eligibleSubscriptions.length === 0) {
        return this.createEmptyResponse();
      }
      
      // 2. Create command objects
      const commands = this.createCommands(eligibleSubscriptions, params.storeName);
      
      // 3. Validate commands (validation phase)
      const validatedCommands = await this.validateSubscriptionCommands(commands);
      
      // 4. Process valid commands asynchronously (processing phase)
      const validCommands = validatedCommands.filter(cmd => cmd.status === 'validated');
      
      if (validCommands.length > 0) {
        this.processSubscriptionCommandsAsync(validCommands);
      }
      
      // 5. Build and return response
      const response = this.buildScheduleResponse(validatedCommands);
      
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Completed scheduling process`, {
        storeName: params.storeName,
        summary: response.summary,
      });
      
      return response;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to schedule subscriptions`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : 'Unknown error',
        storeName: params.storeName,
      });
      
      if (error instanceof SubscriptionContractError) {
        throw error;
      }
      
      throw SubscriptionContractError.creationFailed(
        `Failed to schedule subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  /**
   * Fetch eligible subscriptions from repository
   */
  private async fetchEligibleSubscriptions(storeName: string): Promise<SubscriptionData[]> {
    const eligibleSubscriptions = await subscriptionScheduleRepository.fetchEligibleSubscriptions(storeName);
    
    loggerService.info(`${this.CLASS_NAME}.fetchEligibleSubscriptions: Found eligible subscriptions`, {
      storeName,
      count: eligibleSubscriptions.length,
    });
    
    return eligibleSubscriptions;
  }
  
  /**
   * Create command objects from subscriptions
   */
  private createCommands(
    subscriptions: SubscriptionData[], 
    storeName: string
  ): SubscriptionCommand[] {
    return subscriptions.map(subscription => ({
      subscription,
      lines: [],
      storeName,
      status: 'pending'
    }));
  }
  
  /**
   * Create empty response for when no subscriptions are eligible
   */
  private createEmptyResponse(): SubscriptionContractScheduleResponse {
    return {
      success: true,
      summary: {
        total: 0,
        scheduled: 0,
        skipped: 0,
        failed: [],
      },
    };
  }
  
  /**
   * Validate subscription commands
   * This phase checks if subscriptions are valid for processing
   */
  private async validateSubscriptionCommands(
    commands: SubscriptionCommand[]
  ): Promise<SubscriptionCommand[]> {
    const validatedCommands: SubscriptionCommand[] = [];
    
    for (const command of commands) {
      try {
        // 1. Check if subscription is past its end date
        if (this.isSubscriptionCompleted(command.subscription)) {
          // Mark as skipped due to being completed
          await this.markSubscriptionCompleted(command);
          command.status = 'skipped';
          command.reason = 'Subscription has reached its end date';
          validatedCommands.push(command);
          continue;
        }
        
        // 2. Fetch subscription lines
        command.lines = await subscriptionScheduleRepository.fetchSubscriptionLines(
          command.subscription.id,
          command.storeName
        );
        
        // 3. Validate subscription data
        if (!this.validateSubscriptionData(command)) {
          // Mark as failed due to invalid data
          command.status = 'failed';
          command.reason = 'Invalid subscription data or missing required fields';
          
          // Log the validation failure
          await this.logSubscriptionResult(command);
          
          validatedCommands.push(command);
          continue;
        }
        
        // 4. If validation passes, mark as validated
        command.status = 'validated';
        validatedCommands.push(command);
        
      } catch (error) {
        // Handle validation errors
        command.status = 'failed';
        command.error = error;
        command.reason = error instanceof Error ? error.message : 'Unknown error during validation';
        
        loggerService.error(`${this.CLASS_NAME}.validateSubscriptionCommands: Error validating subscription`, {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
          } : 'Unknown error',
          subscriptionId: command.subscription.id.toString(),
          storeName: command.storeName,
        });
        
        // Log the validation failure
        await this.logSubscriptionResult(command);
        
        validatedCommands.push(command);
      }
    }
    
    loggerService.info(`${this.CLASS_NAME}.validateSubscriptionCommands: Validation phase completed`, {
      totalValidated: validatedCommands.length,
      validCount: validatedCommands.filter(cmd => cmd.status === 'validated').length,
      skippedCount: validatedCommands.filter(cmd => cmd.status === 'skipped').length,
      failedCount: validatedCommands.filter(cmd => cmd.status === 'failed').length,
    });
    
    return validatedCommands;
  }
  
  /**
   * Check if subscription has reached its end date
   */
  private isSubscriptionCompleted(subscription: SubscriptionData): boolean {
    const currentDate = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    
    return !!endDate && currentDate > endDate;
  }
  
  /**
   * Mark subscription as completed
   */
  private async markSubscriptionCompleted(command: SubscriptionCommand): Promise<void> {
    const currentDate = new Date();
    
    await subscriptionScheduleRepository.updateSubscriptionNextDate(
      command.subscription.id,
      command.storeName,
      currentDate,
      SubscriptionContractStatus.COMPLETED
    );
    
    // Log the result
    await this.logSubscriptionResult(command);
  }
  
  /**
   * Validate subscription data
   */
  private validateSubscriptionData(command: SubscriptionCommand): boolean {
    const { subscription, lines } = command;
    
    // Check if subscription has required fields
    if (!subscription.intervalValue || !subscription.intervalUnit) {
      return false;
    }
    
    // Check if subscription has at least one line item
    if (!lines || lines.length === 0) {
      return false;
    }
    
    // Check if subscription has required financial details
    if (!subscription.currencyCode || !subscription.orderTotal) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Process validated subscription commands asynchronously
   */
  private processSubscriptionCommandsAsync(commands: SubscriptionCommand[]): void {
    this.processBatchesAsync(commands)
      .then(processedCount => {
        loggerService.info(`${this.CLASS_NAME}.processBatchesAsync: Async processing completed`, {
          processedCount,
          totalCommands: commands.length,
        });
      })
      .catch(error => {
        loggerService.error(`${this.CLASS_NAME}.processBatchesAsync: Error in async processing`, {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
          } : 'Unknown error',
          commandsCount: commands.length,
        });
      });
  }
  
  /**
   * Process commands in batches asynchronously
   */
  private async processBatchesAsync(commands: SubscriptionCommand[]): Promise<number> {
    let processedCount = 0;
    
    try {
      // Process in batches to control concurrency
      for (let i = 0; i < commands.length; i += this.MAX_CONCURRENT_PROCESSING) {
        const batch = commands.slice(i, i + this.MAX_CONCURRENT_PROCESSING);
        
        loggerService.info(`${this.CLASS_NAME}.processBatchesAsync: Processing batch ${Math.floor(i/this.MAX_CONCURRENT_PROCESSING) + 1}`, {
          batchSize: batch.length,
          remainingCount: commands.length - i - batch.length,
          totalCount: commands.length
        });
        
        // Process current batch concurrently
        const batchResults = await Promise.all(
          batch.map(command => this.processSubscriptionCommand(command))
        );
        
        // Count successful results
        processedCount += batchResults.filter(result => result).length;
      }
      
      return processedCount;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.processBatchesAsync: Error processing batches`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : 'Unknown error',
      });
      
      return processedCount;
    }
  }
  
  /**
   * Process a single subscription command
   */
  private async processSubscriptionCommand(command: SubscriptionCommand): Promise<boolean> {
    try {
      const { subscription, storeName } = command;
      
      //TODO 1. Create Shopify Order
      // Mock successful order creation for now
      const mockOrderId = `gid://shopify/Order/${Date.now()}`;
      const mockOrderNumber = Math.floor(1000 + Math.random() * 9000).toString();
      
      loggerService.info(`${this.CLASS_NAME}.processSubscriptionCommand: Mock order created`, {
        subscriptionId: subscription.id.toString(),
        storeName,
        mockOrderId,
        mockOrderNumber
      });
      
      // 2. Calculate next order date
      const nextOrderDate = this.calculateNextOrderDate(subscription);
      
      // 3. Update subscription with new next order date
      await subscriptionScheduleRepository.updateSubscriptionNextDate(
        subscription.id,
        storeName,
        nextOrderDate
      );
      
      // 4. Update command status and result
      command.status = 'completed';
      command.result = {
        success: true,
        message: 'Order scheduled successfully',
        nextOrderDate,
        orderId: mockOrderId,
        orderNumber: mockOrderNumber
      };
      
      // 5. Log successful scheduling
      await this.logSubscriptionResult(command);
      
      return true;
    } catch (error) {
      // Handle processing errors
      command.status = 'failed';
      command.error = error;
      command.reason = error instanceof Error ? error.message : 'Unknown error during processing';
      
      loggerService.error(`${this.CLASS_NAME}.processSubscriptionCommand: Error processing subscription`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : 'Unknown error',
        subscriptionId: command.subscription.id.toString(),
        storeName: command.storeName,
      });
      
      // Log the failure
      await this.logSubscriptionResult(command);
      
      return false;
    }
  }
  
  /**
   * Calculate the next order date based on the subscription's interval
   */
  private calculateNextOrderDate(subscription: SubscriptionData): Date {
    // Use the existing service method to calculate the next date
    return subscriptionContractService.calculateNextBillingDate({
      startDate: subscription.startDate,
      endDate: subscription.endDate || new Date(2099, 11, 31), // Far future date if no end date
      intervalValue: subscription.intervalValue,
      intervalUnit: subscription.intervalUnit,
      deliveryAnchor: subscription.deliveryAnchor,
      currentDate: new Date(),
    });
  }
  
  /**
   * Build the schedule response from validated commands
   */
  private buildScheduleResponse(commands: SubscriptionCommand[]): SubscriptionContractScheduleResponse {
    const failedItems: SubscriptionScheduleFailure[] = commands
      .filter(cmd => cmd.status === 'failed')
      .map(cmd => ({
        subscriptionContractId: Number(cmd.subscription.id),
        reason: cmd.reason || 'Unknown error',
      }));
    
    return {
      success: true,
      summary: {
        total: commands.length,
        scheduled: commands.filter(cmd => cmd.status === 'completed').length,
        skipped: commands.filter(cmd => cmd.status === 'skipped').length,
        failed: failedItems,
      },
    };
  }
  
  /**
   * Log subscription processing result
   */
  private async logSubscriptionResult(command: SubscriptionCommand): Promise<void> {
    let status: SubscriptionScheduleLogStatus;
    let message: string | undefined;
    
    switch (command.status) {
      case 'completed':
        status = SubscriptionScheduleLogStatus.SUCCESS;
        message = command.result?.message || 'Order scheduled successfully';
        break;
      case 'skipped':
        status = SubscriptionScheduleLogStatus.SKIPPED;
        message = command.reason || 'Subscription skipped';
        break;
      case 'failed':
        status = SubscriptionScheduleLogStatus.FAILED;
        message = command.reason || 'Unknown error';
        break;
      default:
        // Should not reach here in normal operation
        status = SubscriptionScheduleLogStatus.FAILED;
        message = 'Unexpected command status';
    }
    
    try {
      await subscriptionScheduleRepository.createScheduleLog({
        storeName: command.storeName,
        subscriptionContractId: Number(command.subscription.id),
        scheduledAt: new Date(),
        status,
        message,
      });
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.logSubscriptionResult: Failed to log schedule result`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : 'Unknown error',
        subscriptionId: command.subscription.id.toString(),
        storeName: command.storeName,
        status,
      });
    }
  }
}

export const subscriptionScheduleService = new SubscriptionScheduleService(); 