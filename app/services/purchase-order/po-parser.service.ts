import { loggerService } from '~/lib/logger';
import { vercelAiService } from '~/lib/vercel-ai/services/vercel-ai.service';
import type { PoParserRequest, PoParserResponse } from '~/types/purchase-order/po-parser.schema';
import { PoParserError } from '~/lib/errors/po-parser-errors';
import { poFileRepository } from '~/repositories/po-automation/po-file.repository';
import type { PoFileStatus } from '@prisma/client';
import { pdfParser } from '~/lib/pdf/pdf-parser';
import type { PurchaseOrderData } from '~/types/purchase-order/purchase-order.types';
import { PurchaseOrderValidationService } from './po-validation.service';
import { ShippingMethodService } from './shipping-method.service';
import type { EligibleShippingMethod } from '~/types/shipping/shipping-method.schema';

/**
 * Service for parsing purchase orders
 */
class PoParserService {
  private readonly CLASS_NAME = 'PoParserService';
  private readonly SUPPORTED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/bmp'
  ] as const;

  private readonly validationService: PurchaseOrderValidationService;
  private readonly shippingMethodService: ShippingMethodService;

  constructor() {
    this.validationService = new PurchaseOrderValidationService();
    this.shippingMethodService = new ShippingMethodService();
  }

  /**
   * Parse purchase order from request
   * @param params - Parse request parameters
   * @returns Parse result
   */
  public async parseOrder(params: PoParserRequest): Promise<PoParserResponse> {
    const METHOD = 'parseOrder';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting order parse`, {
        storeName: params.storeName,
        fileType: params.fileType,
        hasUrl: !!params.url,
        hasFile: !!params.file
      });

      // Validate file type
      if (!this.SUPPORTED_FILE_TYPES.includes(params.fileType as any)) {
        throw PoParserError.unsupportedFileType(params.fileType);
      }

      // Get content for parsing
      const content = await this.getContentForParsing(params);

      // Parse content
      const parseResult = await this.parseContent(content, params.fileType);

      // Convert items to line items
      const lineItems = parseResult.items.map(item => ({
        sku: item.sku || '',  // Keep SKU separate
        customerPartNumber: item.customerPartNumber || '',  // Keep customer partner number
        title: item.name || '',
        quantity: item.quantity || 0,
        price: item.price || 0,
        taxable: item.taxable || false,
        properties: item.properties || []
      }));

      // Prepare data for validation
      const validationData = {
        storeName: params.storeName,
        orderNumber: parseResult.orderNumber || '',
        email: parseResult.customerEmail || '',
        poNumber: parseResult.poNumber || undefined,
        date: parseResult.date || '',
        customerName: parseResult.customerName || '',
        customerEmail: parseResult.customerEmail || '',
        shippingAddress: {
          address1: parseResult.shippingAddress.address1!,
          address2: parseResult.shippingAddress.address2 || '',
          city: parseResult.shippingAddress.city || '',
          province: parseResult.shippingAddress.province || '',
          zip: parseResult.shippingAddress.zip || '',
          country: parseResult.shippingAddress.country || '',
          firstName: parseResult.shippingAddress.firstName || '',
          lastName: parseResult.shippingAddress.lastName || '',
          name: parseResult.shippingAddress.name || '',
          company: parseResult.shippingAddress.company || '',
          phone: parseResult.shippingAddress.phone || '',
          countryCode: parseResult.shippingAddress.countryCode || '',
          provinceCode: parseResult.shippingAddress.provinceCode || ''
        },
        lineItems
      };

      // Validate parse result
      const validationResult = await this.validationService.parsePurchaseOrder(
        params.storeName,
        validationData
      );

      // Try to fetch shipping methods if validation is successful and we have valid address
      let shippingMethods: EligibleShippingMethod[] = [];
      if (validationResult.success && 
          validationResult.data.isValid && 
          validationResult.data.companyContactProfiles?.[0]?.company?.locations?.[0]?.shippingAddress) {
        try {
          const validatedAddress = validationResult.data.companyContactProfiles[0].company.locations[0].shippingAddress;
          loggerService.info(`${this.CLASS_NAME}.${METHOD}: Fetching shipping methods`, {
            storeName: params.storeName,
            countryCode: validatedAddress.countryCode,
            zoneCode: validatedAddress.zoneCode
          });
          const orderTotal = lineItems.reduce((total, item) => total + (item.price * item.quantity), 0);
          shippingMethods = await this.shippingMethodService.getEligibleShippingMethods({
            storeName: params.storeName,
            countryCode: validatedAddress.countryCode,
            provinceCode: validatedAddress.zoneCode || undefined,
            orderTotal
          });
        } catch (error) {
          loggerService.warn(`${this.CLASS_NAME}.${METHOD}: Failed to fetch shipping methods`, {
            error,
            storeName: params.storeName,
            shippingAddress: validationResult.data.companyContactProfiles[0].company.locations[0].shippingAddress
          });
          // Don't fail the whole parse operation if shipping methods fetch fails
        }
      }

      // Update file status if needed
      if (params.url) {
        await this.updateFileStatus(params.url, {
          parseResult,
          validationResult,
          shippingMethods
        });
      }
      
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Order parsing completed`, {
        storeName: params.storeName,
        isValid: validationResult.data.isValid,
        errorCount: validationResult.validationErrors?.length || 0,
        shippingMethodsCount: shippingMethods.length
      });

      // Return response with shipping methods
      return {
        success: validationResult.success,
        message: validationResult.message,
        validationErrors: validationResult.validationErrors,
        data: {
          ...validationResult.data,
          shippingMethods
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to parse order`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        params: {
          storeName: params.storeName,
          fileType: params.fileType,
          hasUrl: !!params.url,
          hasFile: !!params.file
        }
      });

      if (error instanceof PoParserError) {
        return {
          success: false,
          message: error.message,
          error: {
            code: error.code,
            message: error.message
          }
        };
      }

      const parserError = PoParserError.parseFailed(
        error instanceof Error ? error : new Error('Unknown error')
      );

      return {
        success: false,
        message: errorMessage,
        error: {
          code: parserError.code,
          message: parserError.message
        }
      };
    }
  }

  /**
   * Get content for parsing from either URL or file
   */
  private async getContentForParsing(params: PoParserRequest): Promise<Buffer> {
    if (params.url) {
      const response = await fetch(params.url);
      if (!response.ok) {
        throw PoParserError.fileDownloadFailed(response.statusText);
      }
      return Buffer.from(await response.arrayBuffer());
    }

    if (params.file) {
      return Buffer.from(params.file, 'base64');
    }

    throw PoParserError.invalidRequest('Either url or file must be provided');
  }

  /**
   * Parse content using AI service
   */
  private async parseContent(content: Buffer, fileType: string): Promise<PurchaseOrderData> {
    const METHOD = 'parseContent';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting content parsing`, {
        fileType,
        contentLength: content.length
      });

      if (fileType === 'application/pdf') {
        // Convert PDF pages to images for better structure recognition
        const { images, info } = await pdfParser.convert(content, {
          density: 300, // Higher density for better quality
          format: 'png',
          width: 2480,  // A4 size at 300 DPI
          height: 3508
        });

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: PDF conversion completed`, {
          pageCount: info.pageCount,
          imagesCount: images.length,
          hasImages: images.length > 0,
          imagesSizes: images.map(img => img.length)
        });

        if (!images || images.length === 0) {
          throw new Error('PDF conversion failed: No images generated');
        }

        // Process all pages together with AI service to maintain context
        const result = await vercelAiService.extractPurchaseOrder(images);

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Raw extraction result`, {
          fileType,
          pageCount: info.pageCount,
          resultLength: result ? JSON.stringify(result).length : 0
        });

        return this.ensureValidData(result);
      } else {
        // For single image files, use direct image analysis
        const result = await vercelAiService.extractPurchaseOrder(content);

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Raw extraction result for image`, {
          fileType,
          resultLength: result ? JSON.stringify(result).length : 0
        });

        return this.ensureValidData(result);
      }
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to parse content`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        fileType
      });
      throw error;
    }
  }

  /**
   * Ensure data meets PurchaseOrderData requirements
   */
  private ensureValidData(result: any): PurchaseOrderData {
    return {
      ...result,
      subtotalPrice: result.subtotalPrice || 0,
      totalTax: result.totalTax || 0,
      totalShipping: result.totalShipping || 0,
      totalDiscounts: result.totalDiscounts || 0,
      totalPrice: result.totalPrice || 0,
      poNumber: result.poNumber || null,
      items: (result.items || []).map((item: any) => ({
        ...item,
        quantity: item.quantity || 0,
        price: item.price || 0,
        taxable: item.taxable || false,
        properties: item.properties || []
      }))
    } as PurchaseOrderData;
  }

  /**
   * Update file status in database
   */
  private async updateFileStatus(fileUrl: string, parseResult: any) {
    await poFileRepository.updateByFileUrl(fileUrl, {
      status: 'COMPLETED' as PoFileStatus,
      metadata: {
        parseResult,
        parsedAt: new Date().toISOString()
      }
    });
  }
}

export const poParserService = new PoParserService(); 