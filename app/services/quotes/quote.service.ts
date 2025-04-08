import { BaseError, HttpStatusCode } from '~/lib/errors/base-error';
import { QuoteError } from '~/lib/errors/quote-errors';
import { loggerService } from '~/lib/logger';
import { ShopifyClientManager } from '~/lib/shopify/client';
import { ORDER_CREATE } from '~/lib/shopify/mutation/order';
import { BATCG_GET_COMPANYLOCATIONS, BATCH_GET_CUSTOMERS, BATCH_GET_VARIANT_PRICES } from '~/lib/shopify/queries/batch';
import { GET_COMPANY_LOCATION_ADDRESS, GET_COMPANY_LOCATION_PAYMENT_TERMS } from '~/lib/shopify/queries/company-location';
import { GET_CUSTOMER_EMAIL, SEARCH_CUSTOMERS } from '~/lib/shopify/queries/customer';
import { quoteRepository } from '~/repositories/quotes/quote.repository';
import { draftOrderService } from '~/services/order-management/draft-order.service';
import { orderService } from '~/services/order-management/order.service';
import { storeCompanyMappingService } from '~/services/product-variant/store-company-mapping.service';
import type { ApproveQuoteRequest } from '~/types/quotes/quote-approve.schema';
import type { CancelQuoteRequest } from '~/types/quotes/quote-cancel.schema';
import type { ConvertQuoteToOrderRequest, ConvertQuoteToOrderResponse } from '~/types/quotes/quote-convert-order.schema';
import { convertQuoteToOrderSchema } from '~/types/quotes/quote-convert-order.schema';
import type { BulkDeleteDraftQuotesRequest, BulkDeleteQuotesRequest } from '~/types/quotes/quote-delete.schema';
import { bulkDeleteDraftQuotesSchema, bulkDeleteQuotesSchema } from '~/types/quotes/quote-delete.schema';
import type { DraftQuoteDetailsRequest, DraftQuoteDetailsWithNewParamsRequest, QuoteDetailsRequest } from '~/types/quotes/quote-details.schema';
import { draftQuoteDetailsRequestSchema, draftQuoteDetailsWithNewParamsRequestSchema, quoteDetailsRequestSchema } from '~/types/quotes/quote-details.schema';
import type { ExpireQuoteRequest } from '~/types/quotes/quote-expire.schema';
import type { UpdateDraftQuoteItemsWithNewParamsRequest, UpdateQuoteItemsRequest } from '~/types/quotes/quote-items-update.schema';
import { updateDraftQuoteItemsWithNewParamsSchema, updateQuoteItemsSchema } from '~/types/quotes/quote-items-update.schema';
import type { RejectQuoteRequest } from '~/types/quotes/quote-reject.schema';
import type { SubmitDraftQuoteRequest, SubmitDraftQuoteWithNewParamsRequest } from '~/types/quotes/quote-submit.schema';
import { submitDraftQuoteSchema } from '~/types/quotes/quote-submit.schema';
import type {
  CreateDraftQuoteWithNewParamsInput,
  CreateQuoteInput,
  CustomerInfo,
  DraftQuoteListResponse,
  FetchDraftQuotesParams,
  FetchQuotesParams,
  QuoteListResponse,
  QuoteResponse,
  QuoteStatusType,
  QuoteWithCustomer,
  UpdateQuoteStatusInput,
} from '~/types/quotes/quote.schema';
import {
  QuoteStatus,
  createDraftQuoteWithNewParamsSchema,
  fetchDraftQuotesSchema,
  fetchQuotesSchema,
  updateQuoteStatusSchema,
} from '~/types/quotes/quote.schema';

/**
 * Service class for managing quotes
 * Handles business logic for quote operations
 *
 * Design principles:
 * 1. Separation of concerns: Draft quotes and regular quotes have separate methods
 * 2. Status validation: Methods for specific statuses validate the status
 * 3. Clear error messages: Business rule violations provide clear error messages
 */
export class QuoteService {
  private readonly CLASS_NAME = 'QuoteService';

  /**
   * Update quote status
   */
  public async updateQuoteStatus(id: number, params: UpdateQuoteStatusInput): Promise<QuoteResponse> {
    const METHOD = 'updateQuoteStatus';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Updating quote status`, {
        quoteId: id,
        status: params.status,
      });

      // Validate input
      const validatedData = updateQuoteStatusSchema.parse(params);

      // Check if quote exists
      const existingQuote = await quoteRepository.findById(id);
      if (!existingQuote) {
        throw new BaseError(`Quote with ID ${id} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Validate status transition
      this.validateStatusTransition(existingQuote.status, validatedData.status);

      // Update status
      const updatedQuote = await quoteRepository.updateStatus(id, validatedData);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote status updated successfully`, {
        quoteId: id,
        newStatus: validatedData.status,
      });

      return updatedQuote;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to update quote status`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        quoteId: id,
        params,
      });
      throw error;
    }
  }

  /**
   * Get quote by ID
   */
  public async getQuoteById(params: QuoteDetailsRequest): Promise<QuoteWithCustomer> {
    const METHOD = 'getQuoteById';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Getting quote details`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
        customerId: params.customerId,
      });

      // Validate input
      const validatedParams = quoteDetailsRequestSchema.parse(params);
      const { storeName, quoteId } = validatedParams;
      const locationId = validatedParams.companyLocationId;

      // Get quote from database
      const quote = await quoteRepository.getQuoteById(validatedParams);

      if (!quote) {
        throw new BaseError(`Quote with ID ${quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Extract variant IDs from quote items
      const variantIds = quote.quoteItems.map((item: any) => item.variantId);

      // Parallel data fetching for all required information
      const [customerResponse, companyLocationResponse, variantResponse] = await Promise.all([
        // Get customer details
        ShopifyClientManager.query(BATCH_GET_CUSTOMERS, storeName, {
          variables: {
            ids: [quote.createdBy],
          },
        }),

        // Get company location details
        ShopifyClientManager.query(BATCG_GET_COMPANYLOCATIONS, storeName, {
          variables: {
            companyLocationIds: [locationId],
          },
        }),

        // Get variant details
        ShopifyClientManager.query(BATCH_GET_VARIANT_PRICES, storeName, {
          variables: {
            variantIds,
            companyLocationId: locationId,
          },
        }),
      ]);

      // Extract data from responses
      const customerDetails = customerResponse.data?.nodes?.[0];
      const companyLocationDetails = companyLocationResponse.data?.nodes?.[0];
      const variantDetails = variantResponse.data?.nodes || [];

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Variant details`, {
        variantDetails,
      });
      // Create a map of variant details for efficient lookup
      const variantDetailsMap = new Map();
      variantDetails.forEach((variant: any) => {
        if (variant) {
          variantDetailsMap.set(variant.id, variant);
        }
      });

      // Get SKU IDs from variant details
      const skuIds = variantDetails.filter((variant: any) => variant && variant.sku).map((variant: any) => variant.sku);

      // Get company ID from company location details
      const companyId = companyLocationDetails?.company?.id;

      // Fetch customer partner numbers if we have both SKUs and company ID
      let customerPartnerNumberMap = new Map();
      if (skuIds.length > 0 && companyId) {
        try {
          const customerPartnerNumbers = await storeCompanyMappingService.batchFetchCustomerNumberDetails({
            storeName,
            companyId,
            skuIds,
          });

          // Create a map for efficient lookup
          customerPartnerNumberMap = new Map(customerPartnerNumbers.map((item) => [item.skuId, item.customerPartnerNumber]));

          loggerService.info(`${this.CLASS_NAME}.${METHOD}: Customer partner numbers fetched`, {
            totalSkus: skuIds.length,
            mappedSkus: customerPartnerNumbers.length,
          });
        } catch (error) {
          loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to fetch customer partner numbers`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            skuIds,
            companyId,
          });
        }
      }

      // Enhance quote items with variant details and customer partner numbers
      const enhancedQuoteItems = quote.quoteItems.map((item: any) => {
        const variantDetail = variantDetailsMap.get(item.variantId);
        const { quoteId, productId, variantId, ...itemWithoutIds } = item;
        return {
          ...itemWithoutIds,
          variant: variantDetail
            ? {
                id: variantDetail.id,
                title: variantDetail.title,
                sku: variantDetail.sku,
                inventoryQuantity: variantDetail.inventoryQuantity,
                customerPartnerNumber: customerPartnerNumberMap.get(variantDetail.sku) || null,
                metafield: variantDetail.metafield,
                price: variantDetail.contextualPricing?.price,
                quantityRule: variantDetail.contextualPricing?.quantityRule,
                image: variantDetail.image,
                product: {
                  id: variantDetail.product?.id,
                  title: variantDetail.product?.title,
                  handle: variantDetail.product?.handle,
                  images: variantDetail.product?.images?.nodes,
                },
              }
            : null,
        };
      });

      // Create a formatted response with the enhanced data
      const { customerId, companyLocationId, ...quoteWithoutIds } = quote;
      const formattedResponse = {
        ...quoteWithoutIds,
        customer: customerDetails
          ? {
              id: customerDetails.id,
              firstName: customerDetails.firstName,
              lastName: customerDetails.lastName,
              email: customerDetails.email,
              phone: customerDetails.phone,
              state: customerDetails.state,
            }
          : null,
        companyLocationDetails: companyLocationDetails
          ? {
              id: companyLocationDetails.id,
              name: companyLocationDetails.name,
              company: {
                id: companyLocationDetails.company.id,
                name: companyLocationDetails.company.name,
              },
              shippingAddress: companyLocationDetails.shippingAddress,
              billingAddress: companyLocationDetails.billingAddress,
            }
          : null,
        quoteItems: enhancedQuoteItems,
      };

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote details retrieved successfully`, {
        quoteId: quote.id,
      });

      return formattedResponse as QuoteWithCustomer;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to get quote details`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Validate quote status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      Draft: ['Submitted'],
      Submitted: ['Approved', 'Declined', 'Cancelled', 'Expired', 'Ordered'],
      Approved: ['Ordered', 'Expired'],
      Declined: [],
      Cancelled: [],
      Expired: [],
      Ordered: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw QuoteError.invalidStatusTransition(currentStatus, newStatus);
    }
  }

  /**
   * Create a new quote
   */
  public async createQuote(params: CreateQuoteInput & { createdBy: string }): Promise<QuoteResponse> {
    const METHOD = 'createQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Creating new quote`, {
        customerId: params.quote.customerId,
        storeName: params.storeName,
      });

      // Validate expiration date
      if (!params.quote.expirationDate) {
        throw new BaseError('Expiration date is required', HttpStatusCode.BAD_REQUEST, 'INVALID_EXPIRATION_DATE');
      }

      if (new Date(params.quote.expirationDate) <= new Date()) {
        throw new BaseError('Expiration date must be greater than the current date', HttpStatusCode.BAD_REQUEST, 'INVALID_EXPIRATION_DATE');
      }

      // Create quote with note
      const quote = await quoteRepository.create({
        storeName: params.storeName,
        quote: params.quote,
        status: QuoteStatus.SUBMITTED,
        requestNote: params.quote.requestNote ?? undefined,
        expirationDate: params.quote.expirationDate,
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote created successfully`, {
        quoteId: quote.id,
      });

      return quote;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to create quote`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId: params.quote.customerId,
      });
      throw error;
    }
  }

  /**
   * Fetch all draft quotes for a store and company location
   */
  public async fetchDraftQuotes(params: FetchDraftQuotesParams): Promise<DraftQuoteListResponse> {
    const METHOD = 'fetchDraftQuotes';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Fetching draft quotes`, {
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
        customerId: params?.customerId,
      });

      // Validate input
      const validatedParams = fetchDraftQuotesSchema.parse(params);

      const result = await quoteRepository.findDraftQuotes(validatedParams);

      // Transform the response to change quoteItems to draftQuoteItems
      const transformedResult = {
        ...result,
        draftQuotes: result.draftQuotes.map((draftQuote) => {
          const { quoteItems, ...rest } = draftQuote;
          return {
            ...rest,
            draftQuoteItems: quoteItems,
          };
        }),
      };

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quotes fetched successfully`, {
        totalCount: transformedResult.totalCount,
        page: transformedResult.page,
        pageSize: transformedResult.pageSize,
      });

      return transformedResult;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to fetch draft quotes`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get draft quote details
   */
  public async getDraftQuoteDetails(
    params: DraftQuoteDetailsRequest,
  ): Promise<Omit<QuoteResponse, 'quoteItems'> & { draftQuoteItems: QuoteResponse['quoteItems'] }> {
    const METHOD = 'getDraftQuoteDetails';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Getting draft quote details`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        customerId: params.customerId,
      });

      // Validate input
      const validatedParams = draftQuoteDetailsRequestSchema.parse(params);

      // First check if quote exists with any status
      const existingQuote = await quoteRepository.findById(validatedParams.quoteId);
      if (!existingQuote) {
        throw QuoteError.notFound(validatedParams.quoteId);
      }

      // Then check if it's in Draft status
      if (existingQuote.status !== QuoteStatus.DRAFT) {
        throw QuoteError.draftNotFound(validatedParams.quoteId);
      }

      // If it passes both checks, get the full details
      const quote = await quoteRepository.getDraftQuoteById(validatedParams);

      // Transform the response to change quoteItems to draftQuoteItems
      const { quoteItems, ...rest } = quote;
      const transformedQuote = {
        ...rest,
        draftQuoteItems: quoteItems,
      };

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quote details retrieved successfully`, {
        quoteId: transformedQuote.id,
      });

      return transformedQuote;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to get draft quote details`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Reject a quote that is in Submitted status
   */
  public async rejectQuote(params: RejectQuoteRequest): Promise<{ code: number; message: string }> {
    const METHOD = 'rejectQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Rejecting quote`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
      });

      // Get existing quote
      const existingQuote = await quoteRepository.findById(params.quoteId);
      if (!existingQuote) {
        throw new BaseError(`Quote with ID ${params.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Verify quote is in Submitted status
      if (existingQuote.status !== QuoteStatus.SUBMITTED) {
        throw new BaseError(
          `Invalid status transition from ${existingQuote.status} to ${QuoteStatus.DECLINED}. Only Submitted quotes can be rejected.`,
          HttpStatusCode.BAD_REQUEST,
          'INVALID_STATUS_TRANSITION',
        );
      }

      // Reject quote and create note in a single transaction
      await quoteRepository.rejectQuote(params);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote rejected successfully`, {
        quoteId: params.quoteId,
      });

      return {
        code: 200,
        message: 'Quote rejected successfully',
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to reject quote`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Create a draft order from an approved quote
   */
  private async createDraftOrderFromQuote(quote: any, storeName: string, approveNote?: string,params?: any): Promise<void> {
    const METHOD = 'createDraftOrderFromQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Creating draft order from quote`, {
        quoteId: quote.id,
        storeName,
        quoteItems: quote.quoteItems,
      });

      if (!quote || !quote.customerId || !quote.companyLocationId) {
        throw new BaseError(`Invalid quote data for ID ${quote.id}`, HttpStatusCode.BAD_REQUEST, 'INVALID_QUOTE_DATA');
      }

      // Get customer email and company contact info
      const customerResponse = await ShopifyClientManager.query(GET_CUSTOMER_EMAIL, storeName, {
        variables: {
          customerId: quote.customerId,
        },
      });
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Customer response`, {
        customerResponse,
      });

      if (!customerResponse.data?.customer?.email) {
        throw new BaseError('Customer email not found', HttpStatusCode.NOT_FOUND, 'CUSTOMER_EMAIL_NOT_FOUND');
      }

      // Get company location addresses
      const locationResponse = await ShopifyClientManager.query(GET_COMPANY_LOCATION_ADDRESS, storeName, {
        variables: {
          companyLocationId: quote.companyLocationId,
        },
      });

      const companyLocation = locationResponse.data?.companyLocation;
      if (!companyLocation?.shippingAddress) {
        throw new BaseError('Company location shipping address not found', HttpStatusCode.NOT_FOUND, 'SHIPPING_ADDRESS_NOT_FOUND');
      }

      // Use shipping address as billing address if billing address is not available
      const billingAddress = companyLocation.billingAddress || companyLocation.shippingAddress;

      // Validate quote items
      if (!quote.quoteItems?.length) {
        throw new BaseError('Quote items not found', HttpStatusCode.BAD_REQUEST, 'QUOTE_ITEMS_NOT_FOUND');
      }

      // Get company contact information
      const companyContactProfile = customerResponse.data.customer.companyContactProfiles?.[0];
      const companyInfo = companyContactProfile?.company;
      const companyContactId = companyContactProfile?.id;

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Company contact information`, {
        companyContactId,
        companyInfo,
      });

      // Prepare purchasingEntity based on company contact information
      const purchasingEntity =
        companyContactId && companyInfo?.id
          ? {
              purchasingCompany: {
                companyContactId,
                companyId: companyInfo.id,
                companyLocationId: quote.companyLocationId,
              },
            }
          : { customerId: quote.customerId };

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Purchasing entity`, {
        purchasingEntity,
      });

      // Get payment terms configuration
      const configResponse = await ShopifyClientManager.query(GET_COMPANY_LOCATION_PAYMENT_TERMS, storeName, {
        variables: {
          companyLocationId: quote.companyLocationId,
        },
      });

      // Prepare draft order input using orderService
      const draftOrderInput = orderService.prepareDraftOrderInput({
        note: approveNote || 'Quote approved',
        poNumber: quote.poNumber,
        email: customerResponse.data.customer.email,
        phone: customerResponse.data.customer.phone,
        purchasingEntity,
        shippingAddress: companyLocation.shippingAddress,
        billingAddress,
        items: quote.quoteItems.map((item: any) => {
          if (!item.variantId) {
            throw new BaseError(`Product variant ID not found for quote item ${item.id}`, HttpStatusCode.BAD_REQUEST, 'PRODUCT_VARIANT_ID_NOT_FOUND');
          }
          return {
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.offerPrice
          };
        }),
        currencyCode: quote.currencyCode,
        paymentTermsTemplate: configResponse.data?.companyLocation?.buyerExperienceConfiguration?.paymentTermsTemplate,
        shippingLine: params.shippingLine
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft order input prepared`, {
        quoteId: quote.id,
        draftOrderInput,
      });

      // Create draft order
      await draftOrderService.createDraftOrder(storeName, draftOrderInput);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft order created successfully`, {
        quoteId: quote.id,
      });
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to create draft order`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        quoteId: quote.id,
      });
      throw error;
    }
  }

  /**
   * Approve a quote
   */
  public async approveQuote(params: ApproveQuoteRequest): Promise<{ code: number; message: string }> {
    const METHOD = 'approveQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Approving quote`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
      });

      // 1. Get current quote to verify it exists
      const currentQuote = await quoteRepository.findById(params.quoteId);
      if (!currentQuote) {
        throw new BaseError(`Quote not found with ID ${params.quoteId}`, HttpStatusCode.NOT_FOUND, 'QUOTE_NOT_FOUND');
      }

      // 2. Validate status transition
      this.validateStatusTransition(currentQuote.status, QuoteStatus.APPROVED);

      // 3. Update quote status to approved
      await quoteRepository.approveQuote(params);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote approved successfully`, {
        quoteId: params.quoteId,
      });

      return {
        code: 200,
        message: 'Quote approved successfully',
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to approve quote`, {
        error,
        params,
      });

      if (error instanceof BaseError) {
        throw error;
      }

      throw new BaseError('Failed to approve quote', HttpStatusCode.INTERNAL_SERVER_ERROR, 'QUOTE_APPROVAL_FAILED');
    }
  }

  /**
   * Convert a quote to order
   * Only quotes in SUBMITTED or APPROVED status can be converted to order
   */
  public async convertToOrder(params: ConvertQuoteToOrderRequest): Promise<ConvertQuoteToOrderResponse> {
    const METHOD = 'convertToOrder';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Converting quote to order`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
      });

      // Validate input
      const validatedParams = convertQuoteToOrderSchema.parse(params);

      // 1. Get current quote to verify it exists
      const currentQuote = await quoteRepository.findById(validatedParams.quoteId);
      if (!currentQuote) {
        throw QuoteError.notFound(validatedParams.quoteId);
      }

      // 2. Validate quote status
      const status = currentQuote.status as QuoteStatusType;
      if (status !== QuoteStatus.APPROVED) {
        throw QuoteError.invalidStatusForOrder(status);
      }

      try {
        // 3. Get company location configuration
        const configResponse = await ShopifyClientManager.query(GET_COMPANY_LOCATION_PAYMENT_TERMS, validatedParams.storeName, {
          variables: {
            companyLocationId: currentQuote.companyLocationId,
          },
        });

        const checkoutToDraft = configResponse.data?.companyLocation?.buyerExperienceConfiguration?.checkoutToDraft ?? true;

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Company location configuration`, {
          checkoutToDraft,
          companyLocationId: currentQuote.companyLocationId,
        });

        if (checkoutToDraft) {
          // Create draft order
          await this.createDraftOrderFromQuote(currentQuote, validatedParams.storeName, validatedParams.note || undefined,params);
        } else {
          // Create order directly
          await this.createOrderFromQuote(currentQuote, validatedParams.storeName, validatedParams.note || undefined);
        }

        // 4. Update quote status to ORDERED and save note in a single transaction
        await quoteRepository.convertQuoteToOrder({
          quoteId: validatedParams.quoteId,
          storeName: validatedParams.storeName,
          companyLocationId: validatedParams.companyLocationId,
          customerId: validatedParams.customerId,
          note: validatedParams.note || undefined,
          actionBy: validatedParams.customerId,
          status: QuoteStatus.ORDERED
        });

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote converted to order successfully`, {
          quoteId: validatedParams.quoteId,
          checkoutToDraft,
        });

        return {
          code: 200,
          message: 'Quote converted to order successfully',
        };
      } catch (conversionError) {
        const errorMessage = conversionError instanceof Error ? conversionError.message : 'Unknown error';
        throw QuoteError.orderConversionFailed(validatedParams.quoteId, errorMessage);
      }
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to convert quote to order`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });

      if (error instanceof BaseError) {
        throw error;
      }

      throw new BaseError('Failed to convert quote to order', HttpStatusCode.INTERNAL_SERVER_ERROR, 'QUOTE_ORDER_CONVERSION_FAILED');
    }
  }

  /**
   * Create an order directly from a quote
   */
  private async createOrderFromQuote(quote: any, storeName: string, note?: string): Promise<void> {
    const METHOD = 'createOrderFromQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Creating order from quote`, {
        quoteId: quote.id,
        storeName,
      });

      if (!quote || !quote.customerId || !quote.companyLocationId) {
        throw new BaseError(`Invalid quote data for ID ${quote.id}`, HttpStatusCode.BAD_REQUEST, 'INVALID_QUOTE_DATA');
      }

      // Get customer email and company contact info
      const customerResponse = await ShopifyClientManager.query(GET_CUSTOMER_EMAIL, storeName, {
        variables: {
          customerId: quote.customerId,
          query: quote.companyLocationId.split('/').pop(),
        },
      });

      if (!customerResponse.data?.customer?.email) {
        throw new BaseError('Customer email not found', HttpStatusCode.NOT_FOUND, 'CUSTOMER_EMAIL_NOT_FOUND');
      }

      // Get company location addresses
      const locationResponse = await ShopifyClientManager.query(GET_COMPANY_LOCATION_ADDRESS, storeName, {
        variables: {
          companyLocationId: quote.companyLocationId,
        },
      });

      const companyLocation = locationResponse.data?.companyLocation;
      if (!companyLocation?.shippingAddress) {
        throw new BaseError('Company location shipping address not found', HttpStatusCode.NOT_FOUND, 'SHIPPING_ADDRESS_NOT_FOUND');
      }

      // Use shipping address as billing address if billing address is not available
      const billingAddress = companyLocation.billingAddress || companyLocation.shippingAddress;

      // Validate quote items
      if (!quote.quoteItems?.length) {
        throw new BaseError('Quote items not found', HttpStatusCode.BAD_REQUEST, 'QUOTE_ITEMS_NOT_FOUND');
      }

      // Prepare order input using orderService
      const orderInput = orderService.prepareDirectOrderInput({
        note: note || 'Order created from quote',
        email: customerResponse.data.customer.email,
        customerId: quote.customerId,
        companyLocationId: quote.companyLocationId,
        poNumber: quote.poNumber,
        shippingAddress: companyLocation.shippingAddress,
        billingAddress,
        items: quote.quoteItems.map((item: any) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.offerPrice
        })),
        currencyCode: quote.currencyCode
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Order input prepared`, {
        quoteId: quote.id,
        orderInput,
      });

      // Create order
      const response = await ShopifyClientManager.query(ORDER_CREATE, storeName, {
        variables: {
          order: orderInput,
        },
      });

      if (response.data?.orderCreate?.userErrors?.length > 0) {
        throw new BaseError(
          `Failed to create order: ${response.data.orderCreate.userErrors.map((e: any) => e.message).join(', ')}`,
          HttpStatusCode.BAD_REQUEST,
          'ORDER_CREATION_FAILED',
        );
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Order created successfully`, {
        quoteId: quote.id,
        orderId: response.data?.orderCreate?.order?.id,
      });
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to create order`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        quoteId: quote.id,
      });
      throw error;
    }
  }

  /**
   * Bulk delete quotes
   */
  public async bulkDeleteQuotes(params: BulkDeleteQuotesRequest): Promise<number> {
    const METHOD = 'bulkDeleteQuotes';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Bulk deleting quotes`, {
        quoteIds: params.quoteIds,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
        customerId: params.customerId,
      });

      // Validate input
      const validatedParams = bulkDeleteQuotesSchema.parse(params);

      // Verify quotes exist and belong to the customer
      const existingQuotes = await Promise.all(validatedParams.quoteIds.map((id) => quoteRepository.findById(id)));

      const notFoundQuotes = existingQuotes
        .map((quote, index) => ({ quote, id: validatedParams.quoteIds[index] }))
        .filter(({ quote }) => !quote)
        .map(({ id }) => id);

      if (notFoundQuotes.length > 0) {
        throw new BaseError(`Quotes with IDs ${notFoundQuotes.join(', ')} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      const unauthorizedQuotes = existingQuotes.filter((quote) => quote?.customerId !== validatedParams.customerId).map((quote) => quote?.id);

      if (unauthorizedQuotes.length > 0) {
        throw new BaseError(`Unauthorized to delete quotes with IDs ${unauthorizedQuotes.join(', ')}`, HttpStatusCode.FORBIDDEN, 'UNAUTHORIZED');
      }

      const deletedCount = await quoteRepository.bulkDelete(validatedParams);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quotes deleted successfully`, {
        deletedCount,
      });

      return deletedCount;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to bulk delete quotes`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Bulk delete draft quotes
   * This method is specifically for deleting quotes with Draft status
   */
  public async bulkDeleteDraftQuotes(params: BulkDeleteQuotesRequest): Promise<number> {
    const METHOD = 'bulkDeleteDraftQuotes';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Bulk deleting draft quotes`, {
        quoteIds: params.quoteIds,
        customerId: params.customerId,
      });

      // Validate input
      const validatedParams = bulkDeleteQuotesSchema.parse(params);

      // Get existing quotes to verify ownership and status
      const existingQuotes = await quoteRepository.findByIds(validatedParams.quoteIds);

      // Check if all quotes exist
      if (existingQuotes.length !== validatedParams.quoteIds.length) {
        const foundIds = existingQuotes.map((quote) => quote.id);
        const missingIds = validatedParams.quoteIds.filter((id) => !foundIds.includes(id));
        throw QuoteError.notFound(missingIds);
      }

      // Verify all quotes are in Draft status
      const nonDraftQuotes = existingQuotes.filter((quote) => quote.status !== QuoteStatus.DRAFT);
      if (nonDraftQuotes.length > 0) {
        const nonDraftIds = nonDraftQuotes.map((quote) => quote.id);
        throw QuoteError.draftNotFound(nonDraftIds);
      }

      // Verify quote ownership for all quotes
      const unauthorizedQuotes = existingQuotes.filter((quote) => quote.customerId !== validatedParams.customerId);
      if (unauthorizedQuotes.length > 0) {
        const unauthorizedIds = unauthorizedQuotes.map((quote) => quote.id);
        throw QuoteError.unauthorizedAccess(unauthorizedIds);
      }

      // Delete quotes
      const deletedCount = await quoteRepository.bulkDelete(validatedParams);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quotes deleted successfully`, {
        deletedCount,
      });

      return deletedCount;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to bulk delete draft quotes`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Update quote items
   * This method can be used for both draft and non-draft quotes
   */
  public async updateQuoteItems(params: UpdateQuoteItemsRequest): Promise<QuoteResponse> {
    const METHOD = 'updateQuoteItems';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Updating quote items`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
        customerId: params.customerId,
        itemCount: params.quoteItems.length,
      });

      // Validate input
      const validatedParams = updateQuoteItemsSchema.parse(params);

      // Get existing quote to verify ownership
      const existingQuote = await quoteRepository.findById(validatedParams.quoteId);
      if (!existingQuote) {
        throw new BaseError(`Quote with ID ${validatedParams.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Validate expiration date if provided
      if (validatedParams.expirationDate) {
        const expirationDate = new Date(validatedParams.expirationDate);
        const currentDate = new Date();

        if (expirationDate <= currentDate) {
          throw new BaseError(
            'Expiration date must be greater than the current date',
            HttpStatusCode.BAD_REQUEST,
            'INVALID_EXPIRATION_DATE'
          );
        }
      }

      // Update quote items and expiration date
      const updatedQuote = await quoteRepository.updateQuoteItems({
        ...validatedParams,
        expirationDate: validatedParams.expirationDate,
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote items updated successfully`, {
        quoteId: updatedQuote.id,
        itemCount: updatedQuote.itemCount,
      });

      return updatedQuote;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to update quote items`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Update draft quote items
   * This method is specifically for updating items of quotes with Draft status
   */
  public async updateDraftQuoteItems(
    params: UpdateQuoteItemsRequest,
  ): Promise<Omit<QuoteResponse, 'quoteItems'> & { quoteItems: QuoteResponse['quoteItems']; draftQuoteItems: QuoteResponse['quoteItems'] }> {
    const METHOD = 'updateDraftQuoteItems';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Updating draft quote items`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
        customerId: params.customerId,
        itemCount: params.quoteItems.length,
      });

      // Validate input
      const validatedParams = updateQuoteItemsSchema.parse(params);

      // Get existing quote to verify ownership and status
      const existingQuote = await quoteRepository.findById(validatedParams.quoteId);
      if (!existingQuote) {
        throw new BaseError(`Quote with ID ${validatedParams.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Verify quote is in Draft status
      if (existingQuote.status !== QuoteStatus.DRAFT) {
        throw new BaseError(`Quote with ID ${validatedParams.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Verify quote ownership
      if (existingQuote.customerId !== validatedParams.customerId) {
        throw new BaseError('Unauthorized to update this quote', HttpStatusCode.FORBIDDEN, 'UNAUTHORIZED');
      }

      // Update quote items
      const updatedQuote = await quoteRepository.updateQuoteItems(validatedParams);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quote items updated successfully`, {
        quoteId: updatedQuote.id,
        itemCount: updatedQuote.itemCount,
      });

      return updatedQuote;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to update draft quote items`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Bulk delete draft quotes with new parameter names
   * This method accepts the new parameter names draftQuoteIds and maps them to the existing method
   */
  public async bulkDeleteDraftQuotesWithNewParams(params: BulkDeleteDraftQuotesRequest): Promise<number> {
    const METHOD = 'bulkDeleteDraftQuotesWithNewParams';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Bulk deleting draft quotes with new parameter names`, {
        draftQuoteIds: params.draftQuoteIds,
        customerId: params.customerId,
      });

      // Validate input
      const validatedParams = bulkDeleteDraftQuotesSchema.parse(params);

      // Map to the existing method
      const result = await this.bulkDeleteDraftQuotes({
        storeName: validatedParams.storeName,
        companyLocationId: validatedParams.companyLocationId,
        customerId: validatedParams.customerId,
        quoteIds: validatedParams.draftQuoteIds,
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quotes deleted successfully`, {
        deletedCount: result,
      });

      return result;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to bulk delete draft quotes`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Update draft quote items with new parameter names
   * This method accepts the new parameter names draftQuoteId and draftQuoteItems and maps them to the existing method
   */
  public async updateDraftQuoteItemsWithNewParams(
    params: UpdateDraftQuoteItemsWithNewParamsRequest,
  ): Promise<Omit<QuoteResponse, 'quoteItems'> & { quoteItems: QuoteResponse['quoteItems']; draftQuoteItems: QuoteResponse['quoteItems'] }> {
    const METHOD = 'updateDraftQuoteItemsWithNewParams';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Updating draft quote items with new parameter names`, {
        draftQuoteId: params.draftQuoteId,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
        customerId: params.customerId,
        itemCount: params.draftQuoteItems.length,
      });

      // Validate input
      const validatedParams = updateDraftQuoteItemsWithNewParamsSchema.parse(params);

      // Map to the existing method
      const result = await this.updateDraftQuoteItems({
        storeName: validatedParams.storeName,
        companyLocationId: validatedParams.companyLocationId,
        customerId: validatedParams.customerId,
        quoteId: validatedParams.draftQuoteId,
        quoteItems: validatedParams.draftQuoteItems,
      });

      // Transform the response to change quoteItems to draftQuoteItems
      const { quoteItems, ...rest } = result;
      const transformedResult = {
        ...rest,
        quoteItems,
        draftQuoteItems: quoteItems,
      };

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quote items updated successfully`, {
        quoteId: transformedResult.id,
        itemCount: transformedResult.itemCount,
      });

      return transformedResult;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to update draft quote items`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get draft quote details with new parameter names
   */
  public async getDraftQuoteDetailsWithNewParams(
    params: DraftQuoteDetailsWithNewParamsRequest,
  ): Promise<Omit<QuoteResponse, 'quoteItems'> & { draftQuoteItems: QuoteResponse['quoteItems'] }> {
    const METHOD = 'getDraftQuoteDetailsWithNewParams';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Getting draft quote details with new params`, {
        draftQuoteId: params.draftQuoteId,
        storeName: params.storeName,
        customerId: params.customerId,
      });

      // Validate input
      const validatedParams = draftQuoteDetailsWithNewParamsRequestSchema.parse(params);

      // Map to the existing method parameters
      const mappedParams: DraftQuoteDetailsRequest = {
        storeName: validatedParams.storeName,
        customerId: validatedParams.customerId,
        quoteId: validatedParams.draftQuoteId,
        companyLocationId: validatedParams.companyLocationId,
      };

      // Call the existing method
      const result = await this.getDraftQuoteDetails(mappedParams);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quote details retrieved successfully`, {
        quoteId: result.id,
      });

      return result;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to get draft quote details`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Create a new draft quote with new parameter names
   */
  public async createDraftQuoteWithNewParams(
    params: CreateDraftQuoteWithNewParamsInput & { createdBy: string },
  ): Promise<Omit<QuoteResponse, 'quoteItems'> & { draftQuoteItems: QuoteResponse['quoteItems'] }> {
    const METHOD = 'createDraftQuoteWithNewParams';

    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Creating new draft quote with new parameters`, {
        customerId: params.draftQuote.customerId,
        storeName: params.storeName,
      });

      // Validate input
      const validatedData = createDraftQuoteWithNewParamsSchema.parse({
        storeName: params.storeName,
        draftQuote: params.draftQuote,
      });

      // Directly create the draft quote using repository
      const quote = await quoteRepository.create({
        storeName: validatedData.storeName,
        quote: {
          customerId: validatedData.draftQuote.customerId,
          companyLocationId: validatedData.draftQuote.companyLocationId,
          currencyCode: validatedData.draftQuote.currencyCode,
          quoteItems: validatedData.draftQuote.draftQuoteItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            originalPrice: item.originalPrice,
            offerPrice: item.offerPrice,
            description: item.description,
          })),
        },
        status: QuoteStatus.DRAFT,
      });

      // Transform the response to use draftQuoteItems instead of quoteItems
      const transformedResult = {
        ...quote,
        draftQuoteItems: quote.quoteItems,
      };

      // Remove the quoteItems property
      delete (transformedResult as any).quoteItems;

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quote created successfully`, {
        quoteId: quote.id,
      });

      return transformedResult;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to create draft quote`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Submit draft quote
   */
  public async submitDraftQuote(params: SubmitDraftQuoteRequest): Promise<{ code: number; message: string }> {
    const METHOD = 'submitDraftQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Submitting draft quote`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        customerId: params.customerId,
      });

      // Validate input
      const validatedParams = submitDraftQuoteSchema.parse(params);

      // Check if quote exists
      const existingQuote = await quoteRepository.findById(validatedParams.quoteId);
      if (!existingQuote) {
        throw new BaseError(`Quote with ID ${validatedParams.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Check if quote is in Draft status
      if (existingQuote.status !== QuoteStatus.DRAFT) {
        throw new BaseError(`Quote with ID ${validatedParams.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Check if quote belongs to the customer
      if (existingQuote.customerId !== validatedParams.customerId) {
        throw new BaseError('Unauthorized to submit this quote', HttpStatusCode.FORBIDDEN, 'UNAUTHORIZED');
      }

      // Use customerId as actionBy
      await quoteRepository.submitDraftQuote({
        ...validatedParams,
        actionBy: validatedParams.customerId,
      } as SubmitDraftQuoteRequest & { actionBy: string });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quote submitted successfully`, {
        quoteId: params.quoteId,
      });

      return {
        code: 200,
        message: 'Draft quote submitted successfully',
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to submit draft quote`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        quoteId: params.quoteId,
      });
      throw error;
    }
  }

  /**
   * Submit draft quote with new parameter names
   */
  public async submitDraftQuoteWithNewParams(params: SubmitDraftQuoteWithNewParamsRequest): Promise<{ code: number; message: string }> {
    const METHOD = 'submitDraftQuoteWithNewParams';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Submitting draft quote with new params`, {
        draftQuoteId: params.draftQuoteId,
        storeName: params.storeName,
        customerId: params.customerId,
      });

      // Map to the existing method parameters
      const mappedParams: SubmitDraftQuoteRequest = {
        storeName: params.storeName,
        customerId: params.customerId,
        quoteId: params.draftQuoteId,
        companyLocationId: params.companyLocationId,
      };

      // Call the existing method
      const result = await this.submitDraftQuote(mappedParams);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Draft quote submitted successfully`, {
        quoteId: params.draftQuoteId,
      });

      return result;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to submit draft quote`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Fetch quotes with pagination and filters
   */
  public async fetchQuotes(params: FetchQuotesParams): Promise<QuoteListResponse> {
    const CLASS_METHOD = 'fetchQuotes';
    try {
      const validatedParams = fetchQuotesSchema.parse(params);
      let customerIds: string[] = [];

      // If customer search query is provided, get customer IDs from Shopify
      if (validatedParams.filter?.customer) {
        try {
          const searchResults = await ShopifyClientManager.query(SEARCH_CUSTOMERS, validatedParams.storeName, {
            variables: {
              query: validatedParams.filter.customer,
            },
          });

          if (searchResults.data?.customers?.edges) {
            customerIds = searchResults.data.customers.edges.map((edge: any) => edge.node.id).filter(Boolean);

            loggerService.info(`${this.CLASS_NAME}.${CLASS_METHOD}: Found Shopify customers`, {
              searchQuery: validatedParams.filter.customer,
              count: customerIds.length,
              customerIds,
            });

            // If customer search specified but no results found, return empty result set
            if (customerIds.length === 0) {
              loggerService.info(`${this.CLASS_NAME}.${CLASS_METHOD}: No customers found for search query`, {
                searchQuery: validatedParams.filter.customer,
              });

              return {
                quotes: [],
                page: validatedParams.pagination.page,
                pageSize: validatedParams.pagination.pageSize,
                totalCount: 0,
              };
            }
          }
        } catch (error) {
          loggerService.error(`${this.CLASS_NAME}.${CLASS_METHOD}: Error searching Shopify customers`, {
            error,
            searchQuery: validatedParams.filter.customer,
          });
          throw error;
        }
      }
      // Add customerIds to internal filter
      const internalFilter = {
        ...validatedParams.filter,
        customer: undefined,
        customerIds: customerIds.length > 0 ? customerIds : validatedParams.filter?.customerIds,
      };

      loggerService.info(`${this.CLASS_NAME}.${CLASS_METHOD}: Searching quotes with customer IDs`, {
        customerIds,
        filter: internalFilter,
      });

      const result = await quoteRepository.findQuotes({
        ...validatedParams,
        filter: {
          ...internalFilter,
          expirationDate: validatedParams.filter?.expirationDate,
        },
      });

      // Extract customer IDs from the repository response
      const uniqueCustomerIds = [
        ...new Set(
          result.quotes.map((quote) => {
            const quoteResponse = quote as unknown as QuoteResponse;
            return quoteResponse.customerId;
          }),
        ),
      ].filter(Boolean);

      // Batch fetch customer information
      let customerMap: Record<string, CustomerInfo> = {};
      if (uniqueCustomerIds.length > 0) {
        try {
          const customerResponse = await ShopifyClientManager.query(BATCH_GET_CUSTOMERS, params.storeName, {
            variables: {
              ids: uniqueCustomerIds,
            },
          });

          // Process customer data
          customerMap =
            customerResponse.data?.nodes?.reduce((acc: Record<string, CustomerInfo>, node: any) => {
              if (node) {
                acc[node.id] = {
                  id: node.id,
                  firstName: node.firstName,
                  lastName: node.lastName,
                  email: node.email,
                  phone: node.phone,
                  state: node.state,
                };
              }
              return acc;
            }, {}) || {};
        } catch (error) {
          loggerService.error(`${this.CLASS_NAME}.${CLASS_METHOD}: Error fetching customer details`, {
            error,
            customerIds: uniqueCustomerIds,
          });
        }
      }

      // Transform QuoteResponse[] to QuoteWithCustomer[]
      const quotesWithCustomer: QuoteWithCustomer[] = [];
      for (const quote of result.quotes as unknown as QuoteResponse[]) {
        const { customerId, ...quoteWithoutCustomerId } = quote;
        const quoteWithCustomer: QuoteWithCustomer = {
          ...quoteWithoutCustomerId,
          customer: customerMap[customerId] || null,
          companyLocationDetails: null, // Add the missing property with null as default value
          // Transform quoteItems to match the expected structure in QuoteWithCustomer
          quoteItems: quote.quoteItems.map((item) => ({
            quantity: item.quantity,
            originalPrice: item.originalPrice,
            offerPrice: item.offerPrice,
            description: item.description,
            variant: {
              id: item.variantId,
              title: '', // Add default or fetch from product data if available
              sku: null,
              inventoryQuantity: null,
              customerPartnerNumber: null,
              product: {
                id: item.productId,
                title: '',
                handle: null,
                images: null,
              },
            },
          })),
        };
        quotesWithCustomer.push(quoteWithCustomer);
      }

      loggerService.info(`${this.CLASS_NAME}.${CLASS_METHOD}: Quotes fetched successfully`, {
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
        customersFound: Object.keys(customerMap).length,
      });

      return {
        quotes: quotesWithCustomer,
        page: result.page,
        pageSize: result.pageSize,
        totalCount: result.totalCount,
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${CLASS_METHOD}: Failed to fetch quotes`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Cancel a quote that is in Submitted status
   */
  public async cancelQuote(params: CancelQuoteRequest): Promise<{ code: number; message: string }> {
    const METHOD = 'cancelQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Cancelling quote`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
      });

      // Get existing quote
      const existingQuote = await quoteRepository.findById(params.quoteId);
      if (!existingQuote) {
        throw new BaseError(`Quote with ID ${params.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Validate status transition
      this.validateStatusTransition(existingQuote.status, QuoteStatus.CANCELLED);

      // Cancel quote and create note in a single transaction
      await quoteRepository.cancelQuote(params);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote cancelled successfully`, {
        quoteId: params.quoteId,
      });

      return {
        code: 200,
        message: 'Quote cancelled successfully',
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to cancel quote`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Expire a quote that is in Submitted or Approved status
   */
  public async expireQuote(params: ExpireQuoteRequest): Promise<{ code: number; message: string }> {
    const METHOD = 'expireQuote';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Expiring quote`, {
        quoteId: params.quoteId,
        storeName: params.storeName,
        companyLocationId: params.companyLocationId,
      });

      // Get existing quote
      const existingQuote = await quoteRepository.findById(params.quoteId);
      if (!existingQuote) {
        throw new BaseError(`Quote with ID ${params.quoteId} not found`, HttpStatusCode.NOT_FOUND, 'RESOURCE_NOT_FOUND');
      }

      // Validate status transition
      this.validateStatusTransition(existingQuote.status, QuoteStatus.EXPIRED);

      // Expire quote and create note in a single transaction
      await quoteRepository.expireQuote(params);

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Quote expired successfully`, {
        quoteId: params.quoteId,
      });

      return {
        code: 200,
        message: 'Quote expired successfully',
      };
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to expire quote`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Scan and expire quotes that have passed their expiration date
   * Returns the IDs of quotes that were expired
   */
  public async scanAndExpireQuotes(): Promise<{ expiredQuoteIds: number[] }> {
    const METHOD = 'scanAndExpireQuotes';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting expired quotes scan`);

      const now = new Date();

      // Find all quotes that are expired but not yet marked as expired
      const expiredQuotes = await quoteRepository.findMany({
        where: {
          AND: [
            { expirationDate: { lt: now } },
            {
              status: {
                not: QuoteStatus.CANCELLED
              },
            },
          ],
        },
        select: {
          id: true,
          expirationDate: true,
          status: true,
        },
      });

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Found ${expiredQuotes.length} expired quotes`);

      if (expiredQuotes.length === 0) {
        return { expiredQuoteIds: [] };
      }

      const batchSize = 100;
      const batches = Math.ceil(expiredQuotes.length / batchSize);
      const expiredQuoteIds: number[] = [];

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min((i + 1) * batchSize, expiredQuotes.length);
        const batch = expiredQuotes.slice(start, end);
        const quoteIds: any[] = batch.map((quote) => quote.id);

        // Update quotes to expired status
        const result = await quoteRepository.updateMany({
          where: {
            id: { in: quoteIds },
            AND: [
              { expirationDate: { lt: now } },
              {
                status: {
                  in: [QuoteStatus.SUBMITTED, QuoteStatus.APPROVED],
                },
              },
            ],
          },
          data: {
            status: QuoteStatus.EXPIRED,
            updatedAt: now,
          },
        });

        // Create notes for expired quotes
        await quoteRepository.createNotes(
          quoteIds.map((quoteId: number) => ({
            quoteId: quoteId,
            note: 'Quote automatically expired by system',
            createdAt: now,
            updatedAt: now,
          })),
        );

        expiredQuoteIds.push(...quoteIds);
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Processed batch ${i + 1}/${batches}, updated ${result.count} quotes`);
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Successfully expired ${expiredQuoteIds.length} quotes`, {
        expiredQuoteIds,
      });

      return { expiredQuoteIds };

    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to scan and expire quotes`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error'
      });
      throw error;
    }
  }
}

export const quoteService = new QuoteService();
