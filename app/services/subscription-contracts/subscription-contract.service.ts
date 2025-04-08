import { BaseError } from '../../lib/errors/base-error';
import { loggerService } from '../../lib/logger';
import { subscriptionContractRepository } from '../../repositories/subscription-contracts/subscription-contract.repository';
import {
  type FetchSubscriptionContractsRequest,
} from '../../types/subscription-contracts/subscription-contract.schema';
import {
  type CreateSubscriptionContractRequest,
  type CreateSubscriptionContractResponse,
  createSubscriptionContractSchema,
} from '../../types/subscription-contracts/subscription-contract-create.schema';
import { SubscriptionContractError } from '../../lib/errors/subscription-contract-error';
import { z, ZodError } from 'zod';
import { 
  type GetSubscriptionContractByIdRequest,
  type GetSubscriptionContractByIdResponse,
  type CustomerInfo,
  type CompanyLocationInfo,
  type ProductInfo,
  getSubscriptionContractByIdResponseSchema
} from '../../types/subscription-contracts/subscription-contract-get-by-id.schema';
import {
  type UpdateSubscriptionContractRequest,
  type UpdateSubscriptionContractResponse,
  updateSubscriptionContractSchema,
} from '../../types/subscription-contracts/subscription-contract-update.schema';
import {
  type SubscriptionContractSkipRequest,
  type SubscriptionContractSkipResponse
} from '../../types/subscription-contracts/subscription-contract-skip.schema';
import {
  type SubscriptionContractPauseRequest,
  type SubscriptionContractPauseResponse
} from '../../types/subscription-contracts/subscription-contract-pause.schema';
import { ShopifyClientManager } from '../../lib/shopify/client';
import { GET_CUSTOMER_BY_ID } from '../../lib/shopify/queries/customer';
import { GET_COMPANY_LOCATION_ADDRESS } from '../../lib/shopify/queries/company-location';
import { SEARCH_PRODUCTS } from '../../lib/shopify/queries/product-variant';
import { storeCompanyMappingRepository } from '../../repositories/product-variant/store-company-mapping.repository';
import {
  type SubscriptionContractDeleteRequest,
  type SubscriptionContractDeleteResponse
} from '../../types/subscription-contracts/subscription-contract-delete.schema';
import {
  type SubscriptionContractResumeRequest,
  type SubscriptionContractResumeResponse
} from '../../types/subscription-contracts/subscription-contract-resume.schema';
import {
  type SubscriptionContractApproveRequest,
  type SubscriptionContractApproveResponse
} from '../../types/subscription-contracts/subscription-contract-approve.schema';
import { contactRoleManagmentRepository } from '../../repositories/company-management/contact-role-managment.repository';
import {
  type SubscriptionContractDeclineRequest,
  type SubscriptionContractDeclineResponse
} from '../../types/subscription-contracts/subscription-contract-decline.schema';

/**
 * Interface for frequency calculation results
 */
export interface DateCalculationResult {
  startDate: Date;
  endDate: Date;
  nextOrderCreationDate: Date;
}

/**
 * Service for subscription contract operations
 */
export class SubscriptionContractService {
  private readonly CLASS_NAME = 'SubscriptionContractService';

  /**
   * Fetch all subscription contracts with filtering and pagination
   */
  public async fetchAll(params: FetchSubscriptionContractsRequest) {
    const METHOD = 'fetchAll';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Fetching subscription contracts`, {
        storeName: params.storeName,
        companyId: params.companyId || 'not specified',
        companyLocationId: params.companyLocationId,
      });

      // Validate input - already validated in route handler
      // Skip re-validation here as we've already validated in the route handler
      
      // Fetch subscription contracts
      const result = await subscriptionContractRepository.fetchAll(params);

      // Transform data for serialization - convert BigInt to string and Decimal to number
      const serializedResult = {
        ...result,
        data: result.data.map(item => ({
          ...item,
          id: Number(item.id),
          orderTotal: Number(item.orderTotal)
        })),
      };

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully fetched subscription contracts`, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });

      return serializedResult;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to fetch subscription contracts`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params: {
          storeName: params.storeName,
          companyId: params.companyId,
          companyLocationId: params.companyLocationId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Use appropriate error type for fetch operation
      throw SubscriptionContractError.notFound(
        `Failed to fetch subscription contracts: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate the next billing date based on subscription parameters
   * This is a public method that can be used by different parts of the application
   * to calculate the next billing date for a subscription
   *
   * @param params Object containing subscription parameters
   * @param params.startDate Either Date object or ISO date string for subscription start
   * @param params.endDate Either Date object or ISO date string for subscription end
   * @param params.intervalValue The frequency value (e.g., 1, 2, 3)
   * @param params.intervalUnit The frequency unit (e.g., 'daily', 'weekly', 'monthly')
   * @param params.deliveryAnchor Optional anchor day for delivery (e.g., day of month for monthly subscriptions)
   * @param params.currentDate Optional current date for calculations (defaults to now)
   * @returns The calculated next billing date
   */
  public calculateNextBillingDate(params: {
    startDate: Date | string;
    endDate: Date | string;
    intervalValue: number;
    intervalUnit: string;
    deliveryAnchor?: number;
    currentDate?: Date | string;
  }): Date {
    const METHOD = 'calculateNextBillingDate';
    
    // Parse dates if they're strings
    const startDate = params.startDate instanceof Date 
      ? params.startDate 
      : new Date(params.startDate);
    
    const endDate = params.endDate instanceof Date 
      ? params.endDate 
      : new Date(params.endDate);
    
    const now = params.currentDate 
      ? (params.currentDate instanceof Date ? params.currentDate : new Date(params.currentDate))
      : new Date();
    
    // Normalize interval unit
    const normalizedIntervalUnit = params.intervalUnit.toLowerCase();
    
    // Calculate initial next billing date based on start date and frequency
    let nextBillingDate = this.calculateNextOrderCreationDate(
      startDate,
      params.intervalValue,
      normalizedIntervalUnit,
      endDate,
      params.deliveryAnchor
    );

    // Adjust if the calculated date is in the past
    if (nextBillingDate < now) {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Calculated next billing date is in the past, adjusting to future date`, {
        originalNextBillingDate: nextBillingDate.toISOString(),
        now: now.toISOString()
      });
      
      // Find the next valid billing date by repeatedly adding the interval
      let adjustedDate = new Date(nextBillingDate);
      while (adjustedDate < now) {
        // Use our improved addInterval for proper month-end fallback handling
        adjustedDate = this.addInterval(adjustedDate, params.intervalValue, normalizedIntervalUnit);
        
        // If deliveryAnchor is provided, adjust the date
        if (params.deliveryAnchor) {
          adjustedDate = this.calculateNextOrderCreationDate(
            adjustedDate,
            0, // No additional interval, just adjust the date
            normalizedIntervalUnit,
            endDate,
            params.deliveryAnchor
          );
        }
        
        // Ensure we don't go past the end date
        if (adjustedDate > endDate) {
          loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Cannot find suitable future billing date before end date`, {
            endDate: endDate.toISOString(),
            now: now.toISOString()
          });
          adjustedDate = endDate;
          break;
        }
      }
      
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Adjusted next billing date to ${adjustedDate.toISOString()}`, {
        originalDate: nextBillingDate.toISOString(),
        adjustedDate: adjustedDate.toISOString()
      });
      
      // Use the adjusted date
      nextBillingDate = adjustedDate;
    }
    
    return nextBillingDate;
  }

  /**
   * Process and validate dates, and calculate the next order creation date
   * @param startDateStr Start date string in YYYY-MM-DD format
   * @param endDateStr End date string in YYYY-MM-DD format 
   * @param intervalValue Frequency value
   * @param intervalUnit Frequency unit
   * @param deliveryAnchor Optional delivery anchor day
   * @returns Object with processed dates
   */
  public calculateSubscriptionDates(
    startDateStr: string,
    endDateStr: string, 
    intervalValue: number,
    intervalUnit: string,
    deliveryAnchor?: number
  ): DateCalculationResult {
    // Parse dates
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Initial date validation already done in validateSubscriptionDates
    
    // Use the reusable calculateNextBillingDate method
    const nextOrderCreationDate = this.calculateNextBillingDate({
      startDate,
      endDate,
      intervalValue,
      intervalUnit,
      deliveryAnchor
    });
    
    return { startDate, endDate, nextOrderCreationDate };
  }

  /**
   * Create subscription contract
   * Creates a subscription contract record and related subscription contract lines
   */
  public async create(params: CreateSubscriptionContractRequest): Promise<CreateSubscriptionContractResponse> {
    const METHOD = 'create';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Creating subscription contract`, {
        storeName: params.storeName,
        companyId: params.companyId,
        companyLocationId: params.companyLocationId,
        customerId: params.customerId,
        name: params.subscription.name,
      });

      // Validate request parameters
      try {
        createSubscriptionContractSchema.parse(params);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Validation error`, {
            errors: validationError.errors,
            params: {
              storeName: params.storeName,
              companyId: params.companyId
            }
          });
          
          throw SubscriptionContractError.validationError('Invalid subscription contract data');
        }
        throw validationError;
      }

      // Perform business validation
      this.validateSubscriptionContractBusinessRules(params);

      // Calculate subscription dates including next order creation date
      const dateCalculationResult = this.calculateSubscriptionDates(
        params.subscription.startDate,
        params.subscription.endDate,
        params.subscription.intervalValue,
        params.subscription.intervalUnit,
        params.subscription.deliveryAnchor
      );

      // Validate that the next order creation date is not beyond the end date
      this.validateNextOrderDate(
        dateCalculationResult.nextOrderCreationDate,
        dateCalculationResult.endDate,
        METHOD,
        {
          storeName: params.storeName,
          companyId: params.companyId,
          subscriptionName: params.subscription.name
        }
      );

      // Calculate order total
      const orderTotal = this.calculateOrderTotal(params.subscription.items, params.subscription.shippingCost);

      // Create subscription contract and related lines using pre-calculated values
      const result = await subscriptionContractRepository.create(
        params,
        orderTotal,
        dateCalculationResult
      );

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully created subscription contract`, {
        subscriptionContractId: result.id.toString(),
      });

      // Transform to response format
      return {
        success: true,
        subscriptionContractId: Number(result.id),
        status: result.status
      };
    } catch (error) {
      // Log the error
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to create subscription contract`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params: {
          storeName: params.storeName,
          companyId: params.companyId,
          companyLocationId: params.companyLocationId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Throw standardized error
      throw SubscriptionContractError.creationFailed(
        `Failed to create subscription contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get subscription contract by ID
   * Retrieves a single subscription contract by its ID and transforms the data
   */
  public async getById(params: GetSubscriptionContractByIdRequest): Promise<GetSubscriptionContractByIdResponse> {
    const METHOD = 'getById';
    try {
      // Log request details
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Getting subscription contract by ID`, {
        storeName: params.storeName,
        subscriptionContractId: params.id,
        customerId: params.customerId,
      });

      // Get subscription contract by ID
      const result = await subscriptionContractRepository.getById(params);

      if (!result) {
        loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Subscription contract not found`, {
          subscriptionContractId: params.id,
          storeName: params.storeName,
        });
        throw SubscriptionContractError.notFound(`Subscription contract with ID ${params.id} not found`);
      }

      // Get unique SKUs from subscription contract lines
      const skus = [...new Set(result.lines?.map(line => line.sku) || [])];
      const skuQuery = skus.map(sku => `sku:${sku}`).join(' OR ');

      // Fetch all data in parallel (Shopify API calls + customer partner numbers)
      const [customerResponse, companyLocationResponse, productsResponse, customerPartnerNumbersResponse] = await Promise.all([
        ShopifyClientManager.query(GET_CUSTOMER_BY_ID, params.storeName, {
          variables: { customerId: result.customerId }
        }),
        ShopifyClientManager.query(GET_COMPANY_LOCATION_ADDRESS, params.storeName, {
          variables: { companyLocationId: result.companyLocationId }
        }),
        ShopifyClientManager.query(SEARCH_PRODUCTS, params.storeName, {
          variables: { query: skuQuery }
        }),
        // Get customer partner numbers for all SKUs from our database (in parallel)
        this.getCustomerPartnerNumbersForSkus(params.storeName, result.companyId, skus)
      ]);

      // Transform data
      const customer = this.transformCustomerData(customerResponse);
      const companyLocation = this.transformCompanyLocationData(companyLocationResponse);
      const lines = this.transformProductData(productsResponse, result.lines || [], customerPartnerNumbersResponse);
      const responseData = this.transformSubscriptionContractData(result, customer, companyLocation, lines);

      // Validate response data against schema
      return getSubscriptionContractByIdResponseSchema.parse(responseData);
    } catch (error) {
      // Log error
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to get subscription contract by ID`, {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        subscriptionContractId: params.id,
        storeName: params.storeName,
      });

      // Handle specific errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof z.ZodError) {
        throw SubscriptionContractError.validationError(
          `Invalid response data: ${error.errors.map(e => e.message).join(', ')}`
        );
      }

      // Handle generic errors
      throw SubscriptionContractError.notFound(
        `Failed to get subscription contract by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update an existing subscription contract and its related line items
   * 
   * @param params The update request parameters
   * @returns Response with the updated subscription contract ID and status
   */
  public async update(params: UpdateSubscriptionContractRequest): Promise<UpdateSubscriptionContractResponse> {
    const METHOD = 'update';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Updating subscription contract`, {
        subscriptionContractId: params.subscriptionContractId,
        storeName: params.storeName,
        customerId: params.customerId
      });

      // Validate request parameters
      try {
        updateSubscriptionContractSchema.parse(params);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Validation error`, {
            errors: validationError.errors,
            params: {
              subscriptionContractId: params.subscriptionContractId,
              storeName: params.storeName
            }
          });
          
          throw SubscriptionContractError.validationError('Invalid subscription contract update data');
        }
        throw validationError;
      }

      // Validate business rules
      this.validateUpdateContractBusinessRules(params);

      // Calculate subscription dates including next order creation date
      const dateCalculationResult = this.calculateSubscriptionDates(
        params.data.startDate,
        params.data.endDate,
        params.data.intervalValue,
        params.data.intervalUnit,
        params.data.deliveryAnchor
      );

      // Validate that the next order creation date is not beyond the end date
      this.validateNextOrderDate(
        dateCalculationResult.nextOrderCreationDate,
        dateCalculationResult.endDate,
        METHOD,
        {
          subscriptionContractId: params.subscriptionContractId,
          storeName: params.storeName
        }
      );

      // Update subscription contract and related lines
      const result = await subscriptionContractRepository.update(
        params,
        dateCalculationResult
      );

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully updated subscription contract`, {
        subscriptionContractId: result.id.toString(),
        status: result.status
      });

      // Transform to response format
      return {
        success: true,
        subscriptionContractId: Number(result.id),
        message: result.message
      };
    } catch (error) {
      // Log the error
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to update subscription contract`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params: {
          subscriptionContractId: params.subscriptionContractId,
          storeName: params.storeName
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Throw standardized error
      throw SubscriptionContractError.updateFailed(
        `Failed to update subscription contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Test method for interval calculation logic (for internal testing only)
   * This method allows testing the interval calculation logic with different parameters
   * 
   * @param startDateStr The start date in YYYY-MM-DD format
   * @param intervalValue The interval value
   * @param intervalUnit The interval unit
   * @returns The calculated next date in YYYY-MM-DD format
   */
  public testIntervalCalculation(
    startDateStr: string,
    intervalValue: number,
    intervalUnit: string
  ): string {
    const startDate = new Date(startDateStr);
    const nextDate = this.addInterval(startDate, intervalValue, intervalUnit);
    
    // Format as YYYY-MM-DD
    return nextDate.toISOString().split('T')[0];
  }


  /**
   * Validate subscription contract business rules
   * Centralizes all business validation for subscription contracts
   * @param params The subscription contract parameters to validate
   * @throws SubscriptionContractError if validation fails
   */
  private validateSubscriptionContractBusinessRules(params: CreateSubscriptionContractRequest): void {
    // Validate dates
    this.validateSubscriptionDates(
      params.subscription.startDate,
      params.subscription.endDate
    );

    // Validate interval
    this.validateSubscriptionInterval(
      params.subscription.intervalValue,
      params.subscription.intervalUnit
    );

    // Additional business validation can be added here if needed
  }

  /**
   * Validate subscription date rules
   * @param startDateStr Start date string in YYYY-MM-DD format
   * @param endDateStr End date string in YYYY-MM-DD format
   * @throws SubscriptionContractError if validation fails
   */
  private validateSubscriptionDates(startDateStr: string, endDateStr: string): void {
    const METHOD = 'validateSubscriptionDates';
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
    
    // Validate startDate is today or in the future
    if (startDate < today) {
      loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Start date validation error`, {
        startDate: startDateStr,
        today: today.toISOString().split('T')[0]
      });
      throw SubscriptionContractError.validationError('Start date must be today or in the future');
    }
    
    // Validate endDate is after startDate
    if (endDate <= startDate) {
      loggerService.warn(`${this.CLASS_NAME}.${METHOD}: End date validation error`, {
        startDate: startDateStr,
        endDate: endDateStr
      });
      throw SubscriptionContractError.validationError('End date must be after start date');
    }
  }

  /**
   * Validate subscription interval rules
   * @param intervalValue The frequency value
   * @param intervalUnit The frequency unit
   * @throws SubscriptionContractError if validation fails
   */
  private validateSubscriptionInterval(intervalValue: number, intervalUnit: string): void {
    const METHOD = 'validateSubscriptionInterval';
    
    // Validate intervalValue is greater than 0
    // This is already validated by the Zod schema, but we include it here for completeness
    // and to keep all business validation in one place
    if (intervalValue <= 0) {
      loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Interval value validation error`, {
        intervalValue,
      });
      throw SubscriptionContractError.validationError('Interval value must be greater than 0');
    }
    
    // Normalize interval unit to lowercase
    const normalizedIntervalUnit = intervalUnit.toLowerCase();
    
    // Check if interval unit is valid
    const validIntervalUnits = ['daily', 'weekly', 'weeks', 'monthly', 'months', 'quarterly', 'biannual', 'annually', 'yearly'];
    if (!validIntervalUnits.includes(normalizedIntervalUnit)) {
      loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Interval unit validation error`, {
        intervalUnit,
      });
      throw SubscriptionContractError.invalidFrequency(intervalUnit);
    }
    
    // Additional interval validation rules can be added here
  }

  /**
   * Add a time interval to a date based on the interval unit and value
   * This method implements specific business rules for each interval type:
   * 
   * 1. Daily: Adds exact number of days (startDate + intervalValue days)
   *    Example: 2025-01-15 + 10 days = 2025-01-25
   * 
   * 2. Weekly: Adds weeks as 7-day periods (startDate + intervalValue × 7 days)
   *    Example: 2025-01-15 + 2 weeks = 2025-01-29
   * 
   * 3. Monthly: Adds months with month-end fallback for dates that don't exist in target month
   *    Example: 2025-01-31 + 1 month = 2025-02-28 (February has no 31st day)
   *    Example: 2025-01-31 + 3 months = 2025-04-30 (April has no 31st day)
   * 
   * 4. Quarterly: Adds 3-month intervals with month-end fallback (startDate + intervalValue × 3 months)
   *    Example: 2025-01-31 + 1 quarter = 2025-04-30
   * 
   * 5. Biannual: Adds 6-month intervals with month-end fallback (startDate + intervalValue × 6 months)
   *    Example: 2025-01-31 + 1 biannual = 2025-07-31
   * 
   * 6. Annually: Adds years with special handling for Feb 29 in leap years
   *    Example: 2024-02-29 + 1 year = 2025-02-28 (2025 is not a leap year)
   *    Example: 2024-02-29 + 4 years = 2028-02-29 (2028 is a leap year)
   * 
   * @param date The base date to add the interval to
   * @param intervalValue The number of units to add
   * @param intervalUnit The unit type (daily, weekly, monthly, etc.)
   * @returns A new date with the interval added
   */
  private addInterval(date: Date, intervalValue: number, intervalUnit: string): Date {
    const METHOD = 'addInterval';
    
    // Ensure interval unit is lowercase for consistent handling
    const unit = intervalUnit.toLowerCase();
    
    // Handle each interval type with proper calculation logic
    switch (unit) {
      case 'daily':
        // Daily: Add exact number of days
        const resultDaily = new Date(date);
        resultDaily.setDate(resultDaily.getDate() + intervalValue);
        return resultDaily;
        
      case 'weekly':
      case 'weeks':
        // Weekly: Add weeks (7 days per week)
        const resultWeekly = new Date(date);
        resultWeekly.setDate(resultWeekly.getDate() + (7 * intervalValue));
        return resultWeekly;
        
      case 'monthly':
      case 'months': {
        // Monthly: Add months with proper handling of month-end dates
        // Store the original day to check for month-end fallback
        const originalDay = date.getDate();
        const originalMonth = date.getMonth();
        
        // Create new date object to avoid modifying the input
        const result = new Date(date);
        
        // First set to first day of month to avoid issues when adding months
        // (e.g., Jan 31 + 1 month can't be Feb 31)
        result.setDate(1);
        result.setMonth(originalMonth + intervalValue);
        
        // Get the last day of the target month
        const lastDayOfMonth = this.getDaysInMonth(result);
        
        // Restore the original day or use the last day of month if original day exceeds it
        result.setDate(Math.min(originalDay, lastDayOfMonth));
        
        return result;
      }
        
      case 'quarterly': {
        // Quarterly: Add 3-month intervals with month-end fallback
        const originalDay = date.getDate();
        const originalMonth = date.getMonth();
        
        // Create new date object
        const result = new Date(date);
        
        // Move to first day of month, add months, then adjust day
        result.setDate(1);
        result.setMonth(originalMonth + (3 * intervalValue));
        
        // Get the last day of the target month
        const lastDayOfMonth = this.getDaysInMonth(result);
        
        // Restore the original day or use the last day of month if original day exceeds it
        result.setDate(Math.min(originalDay, lastDayOfMonth));
        
        return result;
      }
        
      case 'biannual': {
        // Biannual: Add 6-month intervals with month-end fallback
        const originalDay = date.getDate();
        const originalMonth = date.getMonth();
        
        // Create new date object
        const result = new Date(date);
        
        // Move to first day of month, add months, then adjust day
        result.setDate(1);
        result.setMonth(originalMonth + (6 * intervalValue));
        
        // Get the last day of the target month
        const lastDayOfMonth = this.getDaysInMonth(result);
        
        // Restore the original day or use the last day of month if original day exceeds it
        result.setDate(Math.min(originalDay, lastDayOfMonth));
        
        return result;
      }
        
      case 'annually':
      case 'yearly': {
        // Annually: Add years with month-end fallback for leap years
        const originalDay = date.getDate();
        const originalMonth = date.getMonth();
        const originalYear = date.getFullYear();
        
        // Create new date object
        const result = new Date(date);
        
        // Special handling for Feb 29 in leap years
        if (originalMonth === 1 && originalDay === 29) {
          // First move to March 1 of target year
          result.setFullYear(originalYear + intervalValue, 2, 1);
          
          // Then move back one day to get Feb 28/29 depending on leap year
          result.setDate(0);
          return result;
        }
        
        // For all other dates, set the year and keep same month/day
        result.setFullYear(originalYear + intervalValue);
        
        // Feb 29 to Feb 28 adjustment (for non-leap years)
        if (originalMonth === 1 && originalDay > result.getDate()) {
          result.setDate(this.getDaysInMonth(result));
        }
        
        return result;
      }
        
      default:
        // Default to monthly if intervalUnit is not recognized
        loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Unrecognized interval unit: ${intervalUnit}, defaulting to monthly`, {
          date: date.toISOString(),
          intervalValue,
          intervalUnit
        });
        
        // Use the monthly logic by default
        const defaultResult = new Date(date);
        const originalDay = date.getDate();
        defaultResult.setDate(1);
        defaultResult.setMonth(defaultResult.getMonth() + intervalValue);
        defaultResult.setDate(Math.min(originalDay, this.getDaysInMonth(defaultResult)));
        return defaultResult;
    }
  }

  /**
   * Get the number of days in a specific month
   * @param date Date object containing the month to check
   * @returns Number of days in the month
   */
  private getDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months start from 0
    return new Date(year, month, 0).getDate();
  }

  /**
   * Calculate the next order creation date based on start date and frequency
   * @param startDate Base date for calculation
   * @param intervalValue Frequency value
   * @param intervalUnit Frequency unit
   * @param endDate Subscription end date
   * @param deliveryAnchor Optional day of delivery anchor
   * @returns Calculated next order creation date
   */
  private calculateNextOrderCreationDate(
    startDate: Date,
    intervalValue: number,
    intervalUnit: string,
    endDate: Date,
    deliveryAnchor?: number
  ): Date {
    const METHOD = 'calculateNextOrderCreationDate';
    
    // Ensure intervalUnit is normalized to lowercase
    const normalizedIntervalUnit = intervalUnit.toLowerCase();
    
    // Add the interval to the start date using our improved addInterval method
    // This ensures proper handling of month-end dates 
    const nextDate = this.addInterval(startDate, intervalValue, normalizedIntervalUnit);
    
    // If deliveryAnchor is provided, adjust the date based on interval type
    if (deliveryAnchor) {
      const adjustedDate = new Date(nextDate);
      
      switch (normalizedIntervalUnit) {
        case 'weekly':
        case 'weeks':
          // For weekly intervals, deliveryAnchor is 1-7 (Monday to Sunday)
          // In JavaScript, 0 is Sunday, 1 is Monday, so we need to adjust
          const targetDayOfWeek = deliveryAnchor % 7; // Ensure value is in 0-6 range
          const currentDayOfWeek = adjustedDate.getDay();
          const daysToAdd = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
          
          adjustedDate.setDate(adjustedDate.getDate() + daysToAdd);
          break;
          
        case 'monthly':
        case 'months':
          // For monthly intervals, deliveryAnchor is 1-31 (day of month)
          const currentDate = adjustedDate.getDate();
          const targetDate = Math.min(deliveryAnchor, this.getDaysInMonth(adjustedDate));
          
          if (currentDate !== targetDate) {
            adjustedDate.setDate(targetDate);
          }
          break;
          
        case 'quarterly':
          // For quarterly intervals, consider the month within the quarter
          // and apply the deliveryAnchor to the specific day
          const quarterlyTargetDate = Math.min(deliveryAnchor, this.getDaysInMonth(adjustedDate));
          adjustedDate.setDate(quarterlyTargetDate);
          break;
          
        case 'biannual':
          // For biannual intervals, consider the month within the half-year
          // and apply the deliveryAnchor to the specific day
          const biannualTargetDate = Math.min(deliveryAnchor, this.getDaysInMonth(adjustedDate));
          adjustedDate.setDate(biannualTargetDate);
          break;
          
        case 'annually':
        case 'yearly':
          // For annual intervals, maintain the same day but adjust according to deliveryAnchor
          // deliveryAnchor here represents the day of the month for the yearly renewal
          const annualTargetDate = Math.min(deliveryAnchor, this.getDaysInMonth(adjustedDate));
          adjustedDate.setDate(annualTargetDate);
          break;
      }
      
      // Use the adjusted date if it's later than the next date
      if (adjustedDate > nextDate) {
        return adjustedDate;
      }
    }
    
    // Ensure nextDate is not after endDate
    if (nextDate > endDate) {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Next order creation date (${nextDate.toISOString()}) is after end date (${endDate.toISOString()}), using end date instead`, {
        startDate: startDate.toISOString(),
        nextDate: nextDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return endDate;
    }
    
    return nextDate;
  }

  /**
   * Calculate the total order amount from items and shipping cost
   * @param items Array of subscription items with price and quantity
   * @param shippingCost Shipping cost amount
   * @returns Total order amount
   */
  private calculateOrderTotal(items: Array<{ price: number; quantity: number }>, shippingCost: number): number {
    const itemsTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return itemsTotal + shippingCost;
  }

  /**
   * Transform customer data from Shopify response
   */
  private transformCustomerData(customerData: any): CustomerInfo | null {
    if (!customerData?.data?.customer) {
      return null;
    }

    const { customer } = customerData.data;
    return {
      id: customer.id,
      firstName: customer.firstName || null,
      lastName: customer.lastName || null,
      email: customer.email,
      phone: customer.phone || null,
      state: customer.state || null,
      createdAt: customer.createdAt || null,
      updatedAt: customer.updatedAt || null
    };
  }

  /**
   * Transform company location data from Shopify response
   */
  private transformCompanyLocationData(companyLocationData: any): CompanyLocationInfo | null {
    if (!companyLocationData?.data?.companyLocation) {
      return null;
    }

    const { companyLocation } = companyLocationData.data;
    const paymentTerms = companyLocation.buyerExperienceConfiguration?.paymentTermsTemplate;

    return {
      id: companyLocation.id,
      name: companyLocation.name,
      externalId: companyLocation.externalId || null,
      paymentTerms: paymentTerms ? {
        description: paymentTerms.description,
        dueInDays: paymentTerms.dueInDays,
        name: paymentTerms.name,
        paymentTermsType: paymentTerms.paymentTermsType,
        id: paymentTerms.id,
        translatedName: paymentTerms.translatedName
      } : null,
      billingAddress: companyLocation.billingAddress ? {
        firstName: companyLocation.billingAddress.firstName,
        lastName: companyLocation.billingAddress.lastName,
        address1: companyLocation.billingAddress.address1,
        address2: companyLocation.billingAddress.address2,
        city: companyLocation.billingAddress.city,
        companyName: companyLocation.billingAddress.companyName,
        country: companyLocation.billingAddress.country,
        countryCode: companyLocation.billingAddress.countryCode,
        zip: companyLocation.billingAddress.zip,
        province: companyLocation.billingAddress.province,
        recipient: companyLocation.billingAddress.recipient,
        zoneCode: companyLocation.billingAddress.zoneCode,
        phone: companyLocation.billingAddress.phone
      } : null,
      shippingAddress: companyLocation.shippingAddress ? {
        firstName: companyLocation.shippingAddress.firstName,
        lastName: companyLocation.shippingAddress.lastName,
        address1: companyLocation.shippingAddress.address1,
        address2: companyLocation.shippingAddress.address2,
        city: companyLocation.shippingAddress.city,
        companyName: companyLocation.shippingAddress.companyName,
        country: companyLocation.shippingAddress.country,
        countryCode: companyLocation.shippingAddress.countryCode,
        zip: companyLocation.shippingAddress.zip,
        province: companyLocation.shippingAddress.province,
        recipient: companyLocation.shippingAddress.recipient,
        zoneCode: companyLocation.shippingAddress.zoneCode,
        phone: companyLocation.shippingAddress.phone
      } : null
    };
  }

  /**
   * Transform product data for API response
   */
  private transformProductData(
    productsResponse: any, 
    lineItems: any[], 
    customerPartnerNumbers: Map<string, string>
  ): ProductInfo[] {
    const products = productsResponse?.data?.products?.nodes || [];
    
    return lineItems.map(lineItem => {
      // Find product for this line item
      const matchingSku = lineItem.sku;
      const matchingProduct = products.find((product: any) => 
        product.variants?.nodes?.some((v: any) => v.sku === matchingSku)
      );

      // Get customer partner number from our database
      const customerPartnerNumber = customerPartnerNumbers.get(matchingSku) || lineItem.customerPartnerNumber || null;
      
      if (!matchingProduct) {
        return {
          id: '',
          title: 'Product not found',
          description: '',
          handle: '',
          image: [],
          variant: {
            id: lineItem.variantId || '',
            title: 'Variant not found',
            sku: lineItem.sku || null,
            customerPartnerNumber,
            quantity: lineItem.quantity || 0,
            price: Number(lineItem.price) || 0,
            metafield: null
          }
        };
      }
      
      // Find the specific variant
      const matchingVariant = matchingProduct.variants?.nodes?.find((v: any) => 
        v.sku === matchingSku
      ) || null;
      
      return {
        id: matchingProduct.id,
        title: matchingProduct.title,
        description: matchingProduct.description || '',
        handle: matchingProduct.handle || '',
        image: matchingProduct.images?.nodes || [],
        variant: matchingVariant ? {
          id: matchingVariant.id,
          title: matchingVariant.title,
          sku: matchingVariant.sku || null,
          customerPartnerNumber,
          metafield: matchingVariant.metafield || null,
          quantity: lineItem?.quantity,
          price: Number(lineItem?.price) || 0
        } : null
      };
    });
  }

  /**
   * Transform subscription contract data for response
   */
  private transformSubscriptionContractData(
    result: any,
    customer: CustomerInfo | null,
    companyLocation: CompanyLocationInfo | null,
    lines: ProductInfo[]
  ) {
    return {
      subscriptionContract: {
        // Basic information
        id: Number(result.id),
        name: result.name,
        status: result.status,
        currencyCode: result.currencyCode,
        
        // Time information
        startDate: result.startDate.toISOString(),
        endDate: result.endDate.toISOString(),
        nextOrderDate: result.nextOrderCreationDate.toISOString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        
        // Subscription information
        intervalValue: result.intervalValue,
        intervalUnit: result.intervalUnit,
        shippingCost: result.shippingCost ? Number(result.shippingCost) : 0,
        shippingMethodName: result.shippingMethodName || '',
        shippingMethodId: result.shippingMethodId || '',
        
        // Business information
        note: result.note || null,
        poNumber: result.poNumber || null,
        customer,
        companyLocation,
        
        // Line items information
        lines
      }
    };
  }

  /**
   * Get customer partner numbers for specified SKUs
   * @param storeName Store name
   * @param companyId Company ID
   * @param skus Array of SKU identifiers
   * @returns Map of SKU to customer partner number
   */
  private async getCustomerPartnerNumbersForSkus(
    storeName: string,
    companyId: string,
    skus: string[]
  ): Promise<Map<string, string>> {
    try {
      // Format company ID to match the expected format in repository
      const formattedCompanyId = companyId.startsWith('gid://') 
        ? companyId 
        : `gid://shopify/Company/${companyId}`;

      // Use batchFetchCustomerNumberDetails to get customer partner numbers
      const mappings = await storeCompanyMappingRepository.batchFetchCustomerNumberDetails({
        storeName,
        companyId: formattedCompanyId,
        skuIds: skus
      });

      // Create a map for quick lookup
      const skuToCPNMap = new Map<string, string>();
      
      // Process each mapping, checking for null values
      for (const mapping of mappings) {
        if (mapping.skuId && mapping.customerPartnerNumber) {
          skuToCPNMap.set(mapping.skuId, mapping.customerPartnerNumber);
        }
      }

      return skuToCPNMap;
    } catch (error) {
      loggerService.error('Failed to get customer partner numbers for SKUs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        storeName,
        companyId,
        skuCount: skus.length
      });
      return new Map(); // Return empty map on error to avoid breaking main flow
    }
  }

  /**
   * Validate business rules for subscription contract update
   * @param params The update request parameters
   * @throws SubscriptionContractError if validation fails
   */
  private validateUpdateContractBusinessRules(params: UpdateSubscriptionContractRequest): void {
    // Validate dates
    this.validateSubscriptionDates(
      params.data.startDate,
      params.data.endDate
    );
    
    // Validate interval
    this.validateSubscriptionInterval(
      params.data.intervalValue,
      params.data.intervalUnit
    );

    // Additional update-specific validation can be added here
  }

  /**
   * Validate that the next order creation date does not exceed the end date
   * @param nextOrderCreationDate The calculated next order creation date
   * @param endDate The subscription end date
   * @param methodName The calling method name for logging
   * @param contextParams Additional context parameters for logging
   * @throws SubscriptionContractError if the next order date exceeds the end date
   */
  private validateNextOrderDate(
    nextOrderCreationDate: Date,
    endDate: Date,
    methodName: string,
    contextParams: Record<string, any>
  ): void {
    if (nextOrderCreationDate >= endDate) {
      loggerService.warn(`${this.CLASS_NAME}.${methodName}: Next order creation date exceeds end date`, {
        nextOrderCreationDate: nextOrderCreationDate.toISOString(),
        endDate: endDate.toISOString(),
        params: contextParams
      });
      
      throw SubscriptionContractError.validationError(
        'The calculated next order date exceeds the subscription end date. Please adjust your subscription parameters.'
      );
    }
  }

  /**
   * Skip the current subscription cycle and update the next order creation date to the next cycle
   * @param params Request parameters including subscription ID and context info
   * @returns Response with success status, message, and new next order creation date
   */
  public async skip(params: SubscriptionContractSkipRequest): Promise<SubscriptionContractSkipResponse> {
    const METHOD = 'skip';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Skipping subscription cycle`, {
        subscriptionId: params.subscriptionContractId,
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId
      });

      // 1. Get the subscription contract by ID
      const subscriptionContract = await subscriptionContractRepository.getById({
        id: params.subscriptionContractId,
        storeName: params.storeName
      });

      if (!subscriptionContract) {
        throw SubscriptionContractError.notFound(`Subscription contract with ID ${params.subscriptionContractId} not found`);
      }

      // 2. Validate permissions and contract state
      this.validateSkipPermissions(subscriptionContract, params);
      
      // 3. Calculate the new next order creation date
      const nextOrderCreationDate = new Date(subscriptionContract.nextOrderCreationDate);
      const newNextOrderCreationDate = this.addInterval(
        nextOrderCreationDate,
        subscriptionContract.intervalValue,
        subscriptionContract.intervalUnit.toLowerCase()
      );

      // 4. Validate the new date doesn't exceed end date
      const endDate = new Date(subscriptionContract.endDate);
      this.validateNextOrderDate(
        newNextOrderCreationDate, 
        endDate, 
        METHOD,
        { subscriptionId: params.subscriptionContractId }
      );
      
      // 5. Update the subscription contract with the new next order creation date
      const result = await subscriptionContractRepository.updateNextOrderCreationDate(
        String(params.subscriptionContractId),
        params.storeName,
        newNextOrderCreationDate
      );

      if (!result) {
        throw SubscriptionContractError.internalServerError(
          'Failed to update subscription contract next order creation date'
        );
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully skipped subscription cycle`, {
        subscriptionId: params.subscriptionContractId,
        oldNextOrderCreationDate: nextOrderCreationDate.toISOString(),
        newNextOrderCreationDate: newNextOrderCreationDate.toISOString()
      });

      return {
        success: true,
        message: `Subscription skipped. Next delivery moved to ${newNextOrderCreationDate.toISOString().split('T')[0]}.`,
        nextOrderCreationDate: newNextOrderCreationDate.toISOString()
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to skip subscription cycle`, {
        error: error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : 'Unknown error',
        params: {
          subscriptionId: params.subscriptionContractId,
          storeName: params.storeName,
          customerId: params.customerId,
          companyLocationId: params.companyLocationId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Handle other errors
      throw SubscriptionContractError.internalServerError(
        `Failed to skip subscription cycle: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate if the skip operation is allowed based on permissions and subscription state
   * @param subscriptionContract The subscription contract to validate
   * @param params The request parameters
   * @throws SubscriptionContractError if validation fails
   */
  private validateSkipPermissions(
    subscriptionContract: any, 
    params: SubscriptionContractSkipRequest
  ): void {
    // 1. Check if the subscription contract is owned by the company location
    if (subscriptionContract.companyLocationId !== params.companyLocationId) {
      throw SubscriptionContractError.unauthorized(
        'You do not have permission to modify this subscription contract'
      );
    }

    // 2. Check if the subscription is in active status
    if (subscriptionContract.status !== 'active') {
      throw SubscriptionContractError.badRequest(
        `Cannot skip a subscription that is not active. Current status: ${subscriptionContract.status}`
      );
    }

    // 3. Check if current date is before or equal to the next order creation date
    const now = new Date();
    const nextOrderCreationDate = new Date(subscriptionContract.nextOrderCreationDate);
    
    // Set to start of day for comparison
    now.setHours(0, 0, 0, 0);
    nextOrderCreationDate.setHours(0, 0, 0, 0);

    if (now > nextOrderCreationDate) {
      throw SubscriptionContractError.badRequest(
        'Cannot skip a subscription after its next order creation date has passed'
      );
    }
  }

  /**
   * Pause a subscription contract
   * @param params Request parameters including subscription ID and context info
   * @returns Response with success status, message, and status
   */
  public async pause(params: SubscriptionContractPauseRequest): Promise<SubscriptionContractPauseResponse> {
    const METHOD = 'pause';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Pausing subscription contract`, {
        subscriptionId: params.subscriptionContractId,
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId
      });

      // 1. Get the subscription contract by ID
      const subscriptionContract = await subscriptionContractRepository.getById({
        id: params.subscriptionContractId,
        storeName: params.storeName
      });

      if (!subscriptionContract) {
        throw SubscriptionContractError.notFound(`Subscription contract with ID ${params.subscriptionContractId} not found`);
      }

      // 2. Validate permissions and ownership
      if (subscriptionContract.companyLocationId !== params.companyLocationId) {
        throw SubscriptionContractError.unauthorized(
          'You do not have permission to modify this subscription contract'
        );
      }

      // 3. Check if the subscription is already paused (idempotency)
      if (subscriptionContract.status === 'paused') {
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Subscription is already paused`, {
          subscriptionId: params.subscriptionContractId
        });
        
        return {
          success: true,
          message: "Subscription is already paused.",
          subscriptionContractId: Number(params.subscriptionContractId),
          status: 'paused'
        };
      }

      // 4. Check if the subscription can be paused (must be active)
      if (subscriptionContract.status !== 'active') {
        throw SubscriptionContractError.badRequest(
          `Only active subscriptions can be paused. Current status: ${subscriptionContract.status}`
        );
      }
      
      // 5. Update the subscription contract with status = paused
      const result = await subscriptionContractRepository.updateStatus(
        String(params.subscriptionContractId),
        params.storeName,
        'paused'
      );

      if (!result) {
        throw SubscriptionContractError.internalServerError(
          'Failed to pause subscription contract'
        );
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully paused subscription contract`, {
        subscriptionId: params.subscriptionContractId
      });

      return {
        success: true,
        message: "Subscription paused successfully.",
        subscriptionContractId: Number(params.subscriptionContractId),
        status: 'paused'
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to pause subscription contract`, {
        error: error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : 'Unknown error',
        params: {
          subscriptionId: params.subscriptionContractId,
          storeName: params.storeName,
          customerId: params.customerId,
          companyLocationId: params.companyLocationId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Handle other errors
      throw SubscriptionContractError.internalServerError(
        `Failed to pause subscription contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Resume a paused subscription contract
   * @param params Request parameters including subscription ID and context info
   * @returns Response with success status, message, status, next order date, and whether it was rescheduled
   */
  public async resume(params: SubscriptionContractResumeRequest): Promise<SubscriptionContractResumeResponse> {
    const METHOD = 'resume';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Resuming subscription contract`, {
        subscriptionId: params.subscriptionContractId,
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId
      });

      // 1. Get the subscription contract by ID
      const subscriptionContract = await subscriptionContractRepository.getById({
        id: params.subscriptionContractId,
        storeName: params.storeName
      });

      if (!subscriptionContract) {
        throw SubscriptionContractError.notFound(`Subscription contract with ID ${params.subscriptionContractId} not found`);
      }

      // 2. Validate permissions and ownership
      if (subscriptionContract.companyLocationId !== params.companyLocationId) {
        throw SubscriptionContractError.unauthorized(
          'You do not have permission to modify this subscription contract'
        );
      }

      // 3. Check if the subscription is already active (idempotency)
      if (subscriptionContract.status === 'active') {
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Subscription is already active`, {
          subscriptionId: params.subscriptionContractId
        });
        
        return {
          success: true,
          message: "Subscription is already active.",
          subscriptionContractId: Number(params.subscriptionContractId),
          status: 'active',
          nextOrderCreationDate: subscriptionContract.nextOrderCreationDate.toISOString().split('T')[0],
          rescheduled: false
        };
      }

      // 4. Check if the subscription can be resumed (must be paused)
      if (subscriptionContract.status !== 'paused') {
        throw SubscriptionContractError.badRequest(
          `Only paused subscriptions can be resumed. Current status: ${subscriptionContract.status}`
        );
      }

      // 5. Determine if we need to reschedule the next order date
      const currentDate = new Date();
      const nextOrderCreationDate = new Date(subscriptionContract.nextOrderCreationDate);
      let rescheduled = false;
      let newNextOrderCreationDate = nextOrderCreationDate;

      // If the next order creation date has passed, reschedule it
      if (nextOrderCreationDate <= currentDate) {
        // Calculate the new next order creation date from today
        newNextOrderCreationDate = this.addInterval(
          currentDate,
          subscriptionContract.intervalValue,
          subscriptionContract.intervalUnit.toLowerCase()
        );
        rescheduled = true;

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Rescheduling next order creation date`, {
          subscriptionId: params.subscriptionContractId,
          oldDate: nextOrderCreationDate.toISOString(),
          newDate: newNextOrderCreationDate.toISOString()
        });

        // Update the next order creation date in the repository
        const nextDateUpdateResult = await subscriptionContractRepository.updateNextOrderCreationDate(
          String(params.subscriptionContractId),
          params.storeName,
          newNextOrderCreationDate
        );

        if (!nextDateUpdateResult) {
          throw SubscriptionContractError.internalServerError(
            'Failed to update next order creation date'
          );
        }
      }
      
      // 6. Update the subscription contract with status = active
      const result = await subscriptionContractRepository.updateStatus(
        String(params.subscriptionContractId),
        params.storeName,
        'active'
      );

      if (!result) {
        throw SubscriptionContractError.internalServerError(
          'Failed to resume subscription contract'
        );
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully resumed subscription contract`, {
        subscriptionId: params.subscriptionContractId,
        rescheduled: rescheduled
      });

      // 7. Prepare the response message based on whether rescheduled
      const message = rescheduled 
        ? "Subscription resumed. Next order has been rescheduled."
        : "Subscription resumed successfully.";

      // 8. Format the date consistently
      const formattedNextOrderDate = rescheduled
        ? newNextOrderCreationDate.toISOString().split('T')[0]
        : nextOrderCreationDate.toISOString().split('T')[0];

      return {
        success: true,
        message,
        subscriptionContractId: Number(params.subscriptionContractId),
        status: 'active',
        nextOrderCreationDate: formattedNextOrderDate,
        rescheduled
      };
    } catch (error) {
      // Log the error
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to resume subscription contract`, {
        error: error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : 'Unknown error',
        params: {
          subscriptionId: params.subscriptionContractId,
          storeName: params.storeName,
          customerId: params.customerId,
          companyLocationId: params.companyLocationId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Handle other errors
      throw SubscriptionContractError.internalServerError(
        `Failed to resume subscription contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a subscription contract by ID
   * @param params Request parameters including subscription ID and context info
   * @returns Response with success status, message, and deleted ID
   */
  public async deleteById(params: SubscriptionContractDeleteRequest): Promise<SubscriptionContractDeleteResponse> {
    const METHOD = 'deleteById';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Deleting subscription contract`, {
        subscriptionId: params.subscriptionContractId,
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId
      });

      // 1. Get the subscription contract by ID
      const subscriptionContract = await subscriptionContractRepository.getById({
        id: params.subscriptionContractId,
        storeName: params.storeName
      });

      if (!subscriptionContract) {
        throw SubscriptionContractError.notFound(`Subscription contract with ID ${params.subscriptionContractId} not found`);
      }

      // 2. Validate permissions and contract state
      this.validateDeletePermissions(subscriptionContract, params);

      // 3. Delete the subscription contract using repository
      const result = await subscriptionContractRepository.deleteById(
        params.subscriptionContractId,
        params.storeName
      );

      if (!result) {
        throw SubscriptionContractError.internalServerError(
          'Failed to delete subscription contract'
        );
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully deleted subscription contract`, {
        deletedId: params.subscriptionContractId
      });

      return {
        success: true,
        message: `Successfully deleted subscription contract.`,
        deletedId: params.subscriptionContractId
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to delete subscription contract`, {
        error: error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : 'Unknown error',
        params: {
          subscriptionId: params.subscriptionContractId,
          storeName: params.storeName,
          customerId: params.customerId,
          companyLocationId: params.companyLocationId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Handle other errors
      throw SubscriptionContractError.internalServerError(
        `Failed to delete subscription contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate if the delete operation is allowed based on permissions and subscription state
   * @param subscriptionContract The subscription contract to validate
   * @param params The request parameters
   * @throws SubscriptionContractError if validation fails
   */
  private validateDeletePermissions(
    subscriptionContract: any, 
    params: SubscriptionContractDeleteRequest
  ): void {
    // 1. Check if the subscription belongs to the current customer
    if (subscriptionContract.customerId !== params.customerId) {
      throw SubscriptionContractError.unauthorized(
        'You do not have permission to delete this subscription contract'
      );
    }

    // 2. Check if the subscription belongs to the company location
    if (subscriptionContract.companyLocationId !== params.companyLocationId) {
      throw SubscriptionContractError.unauthorized(
        'You do not have permission to delete this subscription contract'
      );
    }

    // 3. Check if the subscription is in 'pending' status (only pending status can be deleted)
    if (subscriptionContract.status !== 'pending') {
      throw SubscriptionContractError.badRequest(
        `Cannot delete this subscription. Only pending subscriptions can be deleted. Current status: ${subscriptionContract.status}`
      );
    }
  }

  /**
   * Approve a subscription contract
   * @param params Request parameters including subscription ID and context info
   * @returns Response with success status, message, and next order date
   */
  public async approve(params: SubscriptionContractApproveRequest): Promise<SubscriptionContractApproveResponse> {
    const METHOD = 'approve';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Approving subscription contract`, {
        subscriptionId: params.subscriptionContractId,
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId,
        approverId: params.approverId
      });

      // 1. Get the subscription contract by ID
      const subscriptionContract = await subscriptionContractRepository.getById({
        id: params.subscriptionContractId,
        storeName: params.storeName
      });

      if (!subscriptionContract) {
        throw SubscriptionContractError.notFound(`Subscription contract with ID ${params.subscriptionContractId} not found`);
      }

      // 2. Validate permissions and contract state
      await this.validateApprovePermissions(subscriptionContract, params);
      
      // 3. Check if already approved (idempotency support)
      if (subscriptionContract.status === 'active') {
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Subscription is already approved`, {
          subscriptionId: params.subscriptionContractId
        });
        
        return {
          success: true,
          message: "Subscription is already approved.",
          nextOrderDate: subscriptionContract.nextOrderCreationDate.toISOString().split('T')[0]
        };
      }

      // 4. Calculate the next order creation date
      const nextOrderDate = this.calculateNextBillingDate({
        startDate: subscriptionContract.startDate,
        endDate: subscriptionContract.endDate,
        intervalValue: subscriptionContract.intervalValue,
        intervalUnit: subscriptionContract.intervalUnit
      });
      
      // 5. Update the subscription contract
      const result = await subscriptionContractRepository.updateApproval(
        String(params.subscriptionContractId),
        params.storeName,
        params.approverId,
        params.approverName,
        nextOrderDate
      );

      if (!result) {
        throw SubscriptionContractError.internalServerError(
          'Failed to approve subscription contract'
        );
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully approved subscription contract`, {
        subscriptionId: params.subscriptionContractId,
        nextOrderDate: nextOrderDate.toISOString()
      });

      return {
        success: true,
        message: "Subscription approved successfully.",
        nextOrderDate: nextOrderDate.toISOString().split('T')[0]
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to approve subscription contract`, {
        error: error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : 'Unknown error',
        params: {
          subscriptionId: params.subscriptionContractId,
          storeName: params.storeName,
          customerId: params.customerId,
          companyLocationId: params.companyLocationId,
          approverId: params.approverId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Handle other errors
      throw SubscriptionContractError.internalServerError(
        `Failed to approve subscription contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate if the approval operation is allowed based on permissions and subscription state
   * @param subscriptionContract The subscription contract to validate
   * @param params The request parameters
   * @throws SubscriptionContractError if validation fails
   */
  private async validateApprovePermissions(
    subscriptionContract: any, 
    params: SubscriptionContractApproveRequest
  ): Promise<void> {
    // 1. Check if the subscription contract is owned by the company location
    if (subscriptionContract.companyLocationId !== params.companyLocationId) {
      throw SubscriptionContractError.unauthorized(
        'You do not have permission to modify this subscription contract'
      );
    }

    // 2. Check if the subscription is in pending status
    if (subscriptionContract.status !== 'pending') {
      throw SubscriptionContractError.badRequest(
        `Cannot approve a subscription that is not in pending status. Current status: ${subscriptionContract.status}`
      );
    }

    // 3. Check if the approver has the required role (roleId 1 or 3)
    const hasApprovalPermission = await contactRoleManagmentRepository.hasApprovalPermission(
      params.storeName,
      params.companyLocationId,
      params.approverId
    );

    

    if (!hasApprovalPermission) {
      throw SubscriptionContractError.unauthorized(
        'Approver does not have the required permission to approve subscription contracts'
      );
    }
  }

  /**
   * Decline a subscription contract
   * @param params The request parameters for declining a subscription contract
   * @returns Response object indicating success or failure
   */
  public async decline(params: SubscriptionContractDeclineRequest): Promise<SubscriptionContractDeclineResponse> {
    const METHOD = 'decline';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Declining subscription contract`, {
        subscriptionId: params.subscriptionContractId,
        storeName: params.storeName,
        customerId: params.customerId,
        companyLocationId: params.companyLocationId,
        approverId: params.approverId
      });

      // 1. Get the subscription contract by ID
      const subscriptionContract = await subscriptionContractRepository.getById({
        id: params.subscriptionContractId,
        storeName: params.storeName
      });

      if (!subscriptionContract) {
        throw SubscriptionContractError.notFound(`Subscription contract with ID ${params.subscriptionContractId} not found`);
      }

      // 2. Validate permissions and contract state
      await this.validateDeclinePermissions(subscriptionContract, params);
      
      // 3. Check if already declined (idempotency support)
      if (subscriptionContract.status === 'declined') {
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Subscription is already declined`, {
          subscriptionId: params.subscriptionContractId
        });
        
        return {
          success: true,
          message: "Subscription is already declined."
        };
      }

      // 4. Update the subscription contract
      const result = await subscriptionContractRepository.updateDecline(
        String(params.subscriptionContractId),
        params.storeName,
        params.approverId,
        params.approverName
      );

      if (!result) {
        throw SubscriptionContractError.internalServerError(
          'Failed to decline subscription contract'
        );
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully declined subscription contract`, {
        subscriptionId: params.subscriptionContractId
      });

      return {
        success: true,
        message: "Subscription declined successfully."
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to decline subscription contract`, {
        error: error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : 'Unknown error',
        params: {
          subscriptionId: params.subscriptionContractId,
          storeName: params.storeName,
          customerId: params.customerId,
          companyLocationId: params.companyLocationId,
          approverId: params.approverId
        }
      });

      // Pass through already formatted errors
      if (error instanceof SubscriptionContractError || error instanceof BaseError) {
        throw error;
      }

      // Handle other errors
      throw SubscriptionContractError.internalServerError(
        `Failed to decline subscription contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate if the decline operation is allowed based on permissions and subscription state
   * @param subscriptionContract The subscription contract to validate
   * @param params The request parameters
   * @throws SubscriptionContractError if validation fails
   */
  private async validateDeclinePermissions(
    subscriptionContract: any, 
    params: SubscriptionContractDeclineRequest
  ): Promise<void> {
    // 1. Check if the subscription contract is owned by the company location
    if (subscriptionContract.companyLocationId !== params.companyLocationId) {
      throw SubscriptionContractError.unauthorized(
        'You do not have permission to modify this subscription contract'
      );
    }

    // 2. Check if the subscription is in pending status
    if (subscriptionContract.status !== 'pending') {
      throw SubscriptionContractError.badRequest(
        `Cannot decline a subscription that is not in pending status. Current status: ${subscriptionContract.status}`
      );
    }

    // 3. Check if the approver has the required role (roleId 1 or 3)
    const hasApprovalPermission = await contactRoleManagmentRepository.hasApprovalPermission(
      params.storeName,
      params.companyLocationId,
      params.approverId
    );

    if (!hasApprovalPermission) {
      throw SubscriptionContractError.unauthorized(
        'Approver does not have the required permission to decline subscription contracts'
      );
    }
  }
}

// Export a singleton instance of the service
export const subscriptionContractService = new SubscriptionContractService(); 