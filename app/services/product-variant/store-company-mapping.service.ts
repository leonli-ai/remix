import { loggerService } from '../../lib/logger';
import { storeCompanyMappingRepository } from '../../repositories/product-variant/store-company-mapping.repository';
import { ShopifyClientManager } from '../../lib/shopify/client';
import { GET_PRODUCT_VARIANT } from '../../lib/shopify/queries/product-variant';
import type { ProductVariantResponse } from '../../lib/shopify/types/product-variant';
import type { 
  CustomerPartnerNumberFetchRequest,
  CustomerPartnerNumberDetail,
  CustomerPartnerNumberSearchRequest,
  CustomerPartnerNumberSearchSchemaType,
  SkuFetchRequest
} from '../../types/product-variant/customer-partner-number-search.schema';
import type { 
  CustomerPartnerNumberUploadRequest, 
  CustomerPartnerNumberUploadResponse, 
  ValidationResult,
  CustomerPartnerNumberRecord,
  FailedRecord
} from '../../types/product-variant/customer-partner-number-upload.schema';
import type { 
  StoreCompanyMappingQuery,
  BulkDeleteMappingRequest, 
  ExportMappingRequest 
} from '~/types/product-variant/store-company-mapping.schema';
import { ExportService } from '../../lib/export/export.service';
import type { ExportResult } from '../../lib/export/types';
import { ShopifyError } from '~/lib/shopify/errors';
import { 
  GET_COMPANY_LOCATIONS_AND_CATALOGS,
  GET_CATALOG_PRODUCTS 
} from '~/lib/shopify/queries/export';
import { ValidationError, ValidationErrorCodes } from '../../lib/errors/validation-error';
import { GET_COMPANY } from '~/lib/shopify/queries/company';
import type { CompanyResponse } from '~/lib/shopify/types/company';

export class StoreCompanyMappingService {
  private readonly CLASS_NAME = 'StoreCompanyMappingService';

  /**
   * Get search URL with store specific domain
   */
  private getSearchUrl(query: string, storeName: string): string {
    return `https://${storeName}/search?q=${encodeURIComponent(query)}&storeName=${encodeURIComponent(storeName)}`;
  }

  /**
   * Get product URL with store specific domain
   */
  private getProductUrl(handle: string, storeName: string): string {
    return `https://${storeName}/products/${handle}`;
  }

  /**
   * Batch fetch SKU details
   */
  async batchFetchSkuDetails(params: CustomerPartnerNumberFetchRequest): Promise<CustomerPartnerNumberDetail[]> {
    try {
      loggerService.info('Processing batch SKU details fetch', { params });
      const results = await storeCompanyMappingRepository.batchFetchDetails(params);
      
      loggerService.info('SKU details batch fetch completed', {
        found: results.length,
        requested: params.data.length
      });

      return results;
    } catch (error) {
      loggerService.error('Failed to batch fetch SKU details', error);
      throw error;
    }
  }


    /**
   * Batch fetch SKU details
   */
    async batchFetchCustomerNumberDetails(params: SkuFetchRequest): Promise<CustomerPartnerNumberDetail[]> {
      try {
        loggerService.info('Processing batch customer number details fetch', { params });
        const results = await storeCompanyMappingRepository.batchFetchCustomerNumberDetails(params);
        
        loggerService.info('Customer number details batch fetch completed', {
          found: results.length,
          requested: params.skuIds.length
        });
  
        return results;
      } catch (error) {
        console.log('error', error);
        loggerService.error('Failed to batch fetch customer number details', error);
        throw error;
      }
    }

  /**
   * Get redirect URL based on search parameters
   * @param params Validated required parameters
   * @param allSearchParams All original search parameters from the request
   */
  public async getRedirectUrl(
    params: CustomerPartnerNumberSearchRequest,
    allSearchParams: Record<string, string>
  ): Promise<string> {
    loggerService.info('Starting redirect URL lookup', { params, allSearchParams });    
    const searchParams: CustomerPartnerNumberSearchSchemaType = {
      storeName: params.storeName,
      companyId: params.companyId,
      customerPartnerNumber: params.q
    };

    try {
      // Find SKU ID from database
      loggerService.info('Searching for SKU ID in database', { searchParams });
      const skuId = await storeCompanyMappingRepository.findSkuId(searchParams);
      
      if (!skuId) {
        const searchUrl = this.constructUrlWithParams(
          this.getSearchUrl(params.q, params.storeName),
          allSearchParams
        );
        loggerService.info('SKU not found, redirecting to search page', { 
          searchParams,
          redirectUrl: searchUrl
        });
        return searchUrl;
      }

      loggerService.info('SKU found, querying Shopify API', { skuId });

      // Query Shopify GraphQL API with SKU
      const response = await ShopifyClientManager.query<ProductVariantResponse>(
        GET_PRODUCT_VARIANT,
        params.storeName,
        { variables: { query: `sku:${skuId}` } }
      );
      loggerService.info('Shopify GraphQL response', { response });
      
      const handle = response.data?.productVariants?.edges?.[0]?.node?.product?.handle;
      if (!handle) {
        const searchUrl = this.constructUrlWithParams(
          this.getSearchUrl(params.q, params.storeName),
          allSearchParams
        );
        loggerService.warn('Product handle not found, redirecting to search page', { 
          skuId,
          response: response.data,
          redirectUrl: searchUrl
        });
        return searchUrl;
      }

      const baseProductUrl = this.getProductUrl(handle, params.storeName);
      const productUrl = this.constructUrlWithParams(baseProductUrl, allSearchParams);
      
      loggerService.info('Successfully found product URL', { 
        skuId,
        handle,
        productUrl,
        originalParams: allSearchParams
      });

      return productUrl;

    } catch (error) {
      loggerService.error('Failed to get redirect URL', {
        error,
        params,
        searchParams,
        allSearchParams
      });
      throw error;
    }
  }

  /**
   * Constructs a URL with all original search parameters
   * @param baseUrl The base URL to append parameters to
   * @param params All search parameters to append
   * @returns The constructed URL with all parameters
   */
  private constructUrlWithParams(baseUrl: string, params: Record<string, string>): string {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      // Skip the required parameters as they are handled differently
      if (!['q', 'companyId', 'storeName'].includes(key)) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  private transformUploadRecord(record: Record<string, string>) {
    return {
      customerPartnerNumber: record['Customer Partner Number'],
      productName: record['Product Title'],
      skuId: String(record['SKU ID']),
      companyId: record['Company ID']
    };
  }

  /**
   * Validates upload data and separates valid and invalid records
   * @param records Array of records to validate
   * @returns Validation result containing valid and failed records
   */
  private validateUploadData(records: (CustomerPartnerNumberRecord & { rowNumber: number })[]): ValidationResult {
    const METHOD = 'validateUploadData';
    const validRecords: (CustomerPartnerNumberRecord & { rowNumber: number })[] = [];
    const failedRecords: FailedRecord[] = [];
    const skuMap = new Map<string, number>();
    
    // Map to store all rows for each customer partner number
    const customerPartnerNumberMap = new Map<string, { rows: number[]; firstRow: number }>();

    loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting validation`, {
      totalRecords: records.length
    });

    // Process records in original order
    records.forEach((record) => {
      const errors: string[] = [];

      // Convert values to string and validate
      const skuIdStr = String(record.skuId || '').trim();
      const customerPartnerNumberStr = String(record.customerPartnerNumber || '').trim();
      const productNameStr = String(record.productName || '').trim();
      const companyIdStr = String(record.companyId || '').trim();

      // Validate SKU ID
      if (!skuIdStr) {
        errors.push('SKU ID is required');
      }

      // Validate Customer Partner Number
      if (!customerPartnerNumberStr) {
        errors.push('Customer Partner Number is empty');
      }

      // Validate Product Name
      if (!productNameStr) {
        errors.push('Product Name is empty');
      }

      // Validate Company ID
      if (!companyIdStr) {
        errors.push('Company ID is required and cannot be empty');
      }

      // Check for duplicate SKUs
      if (skuIdStr && skuMap.has(skuIdStr)) {
        errors.push(`Duplicate SKU ID, first appeared in row ${skuMap.get(skuIdStr)}`);
      }

      // Track customer partner numbers for duplicate checking
      if (customerPartnerNumberStr && companyIdStr) {
        const customerPartnerNumberKey = `${customerPartnerNumberStr}:${companyIdStr}`;
        const existing = customerPartnerNumberMap.get(customerPartnerNumberKey);
        
        if (existing) {
          // Add current row to the list of rows for this customer partner number
          existing.rows.push(record.rowNumber);
          // Update firstRow if current row is smaller
          existing.firstRow = Math.min(existing.firstRow, record.rowNumber);
          customerPartnerNumberMap.set(customerPartnerNumberKey, existing);
        } else {
          customerPartnerNumberMap.set(customerPartnerNumberKey, {
            rows: [record.rowNumber],
            firstRow: record.rowNumber
          });
        }
      }

      if (errors.length === 0) {
        // Temporarily store valid records, we'll check for duplicates later
        validRecords.push({
          ...record,
          skuId: skuIdStr,
          customerPartnerNumber: customerPartnerNumberStr,
          productName: productNameStr,
          companyId: companyIdStr
        });
        if (skuIdStr) {
          skuMap.set(skuIdStr, record.rowNumber);
        }
      } else {
        failedRecords.push({
          record,
          row: record.rowNumber,
          errors
        });
      }
    });

    // Process duplicate customer partner numbers
    const finalValidRecords: (CustomerPartnerNumberRecord & { rowNumber: number })[] = [];
    const duplicateFailedRecords: FailedRecord[] = [];

    validRecords.forEach(record => {
      const customerPartnerNumberKey = `${record.customerPartnerNumber}:${record.companyId}`;
      const mapping = customerPartnerNumberMap.get(customerPartnerNumberKey);

      if (mapping && mapping.rows.length > 1) {
        // This is a duplicate record
        duplicateFailedRecords.push({
          record,
          row: record.rowNumber,
          errors: [`Duplicate Customer Partner Number within same company, first appeared in row ${mapping.firstRow}`]
        });
      } else {
        finalValidRecords.push(record);
      }
    });

    // Combine all failed records
    const allFailedRecords = [...failedRecords, ...duplicateFailedRecords];

    loggerService.info(`${this.CLASS_NAME}.${METHOD}: Validation completed`, {
      totalRecords: records.length,
      validCount: finalValidRecords.length,
      failedCount: allFailedRecords.length,
      duplicateCount: duplicateFailedRecords.length
    });

    // Return records in original order (no need to reverse anymore)
    return { 
      validRecords: finalValidRecords, 
      failedRecords: allFailedRecords 
    };
  }

  /**
   * Processes customer partner number upload
   */
  public async uploadCustomerPartnerNumbers(
    params: CustomerPartnerNumberUploadRequest
  ): Promise<CustomerPartnerNumberUploadResponse> {
    const METHOD = 'uploadCustomerPartnerNumbers';
    const start = Date.now();
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting upload process`, {
        fileName: params.file.name,
        fileSize: params.file.size,
        storeName: params.storeName,
        format: params.format
      });

      // Parse file contents with row numbers
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Parsing file contents`, {
        fileName: params.file.name,
        format: params.format || 'xlsx'
      });
      const rawRecords = await ExportService.parseFile<Record<string, string>>(
        params.file,
        params.format || 'xlsx'
      );
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: File parsed successfully`, {
        rawRecordCount: rawRecords.length
      });

      // Transform and validate records
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Transforming and validating records`);
      const records = rawRecords.map(record => ({
        ...this.transformUploadRecord(record),
        rowNumber: record.rowNumber
      }));
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Records transformed`, {
        transformedCount: records.length,
        sampleRecord: records[0] // Log first record as sample
      });

      const { validRecords, failedRecords } = this.validateUploadData(records);

      // Process valid records if any exist
      if (validRecords.length > 0) {
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Processing valid records`, {
          validCount: validRecords.length,
          failedCount: failedRecords.length,
          validationFailures: failedRecords.map(f => ({
            row: f.row,
            errors: f.errors
          }))
        });

        // Get unique company IDs
        const uniqueCompanyIds = [...new Set(validRecords.map(record => record.companyId))];
        let companyName = '';
        
        // Only fetch company name if we have valid company IDs
        if (uniqueCompanyIds.length > 0) {
          try {
            const formattedCompanyId = `gid://shopify/Company/${uniqueCompanyIds[0]}`;
            const response = await ShopifyClientManager.query<CompanyResponse>(
              GET_COMPANY,
              params.storeName,
              { variables: { companyId: formattedCompanyId } }
            );

            if (response.data?.company?.name) {
              companyName = response.data.company.name;
            }
          } catch (error) {
            loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to fetch company name`, {
              companyIds: uniqueCompanyIds,
              error
            });
          }
        }

        // Add company name to all records
        const enrichedRecords = validRecords.map(record => ({
          ...record,
          companyName
        }));

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting bulk create operation`, {
          storeName: params.storeName,
          recordCount: enrichedRecords.length,
          companyName
        });

        const result = await storeCompanyMappingRepository.bulkCreateCustomerPartnerNumbers({
          storeName: params.storeName,
          records: enrichedRecords
        });

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Bulk create completed`, {
          successCount: result.successCount,
          failureCount: result.failedRecords?.length || 0
        });

        // Combine validation failures with processing failures
        const allFailedRecords = [
          ...failedRecords,
          ...(result.failedRecords || []).map(failure => ({
            record: failure?.record,
            row: failure?.record?.rowNumber || -1,
            errors: [failure?.error || 'Failed to process record']
          }))
        ];

        const duration = Date.now() - start;
        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Upload process completed`, {
          duration,
          totalProcessed: records.length,
          successCount: result.successCount,
          failureCount: allFailedRecords.length,
          validationFailures: failedRecords.length,
          processingFailures: result.failedRecords?.length || 0
        });

        return {
          success: result.successCount > 0,
          message: this.generateUploadResultMessage(records.length, result.successCount, allFailedRecords.length),
          totalProcessed: records.length,
          successCount: result.successCount,
          failureCount: allFailedRecords.length,
          failedRecords: allFailedRecords
        };
      }

      // Return early if no valid records
      const duration = Date.now() - start;
      loggerService.warn(`${this.CLASS_NAME}.${METHOD}: No valid records to process`, {
        duration,
        totalRecords: records.length,
        failedRecords: failedRecords.map(f => ({
          row: f.row,
          errors: f.errors
        }))
      });

      return {
        success: false,
        message: 'No valid records found in the file',
        totalProcessed: records.length,
        successCount: 0,
        failureCount: records.length,
        failedRecords
      };

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Upload failed`, {
        error,
        duration,
        fileName: params.file.name,
        storeName: params.storeName,
        errorDetails: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Generates user-friendly upload result message
   */
  private generateUploadResultMessage(total: number, success: number, failed: number): string {
    if (success === 0) {
      return 'Upload failed: No records were processed successfully';
    }
    if (failed === 0) {
      return `Upload completed successfully: All ${total} records were processed`;
    }
    return `Upload completed with some failures: ${success} succeeded, ${failed} failed`;
  }

  /**
   * Fetch all store company mappings with pagination and filters
   */
  async fetchAllWithFilters(params: StoreCompanyMappingQuery) {
    try {
      const result = await storeCompanyMappingRepository.findAllWithFilters({
        storeName: params.storeName,
        skip: (params.pagination.page - 1) * params.pagination.pageSize,
        take: params.pagination.pageSize,
        skuId: params.filter?.skuId,
        customerPartnerNumber: params.filter?.customerPartnerNumber,
        productTitle: params.filter?.productTitle,
        companyId: params.filter?.companyId,
        companyName: params.filter?.companyName,
        sortBy: params.sort?.sortBy,
        sortOrder: params.sort?.sortOrder
      });

      return {
        page: params.pagination.page,
        pageSize: params.pagination.pageSize,
        totalCount: result.total,
        items: result.items
      };
    } catch (error) {
      loggerService.error('Failed to fetch store company mappings', {
        error,
        params
      });
      throw error;
    }
  }

  /**
   * Bulk delete store company mappings
   */
  async bulkDelete(params: BulkDeleteMappingRequest) {
    try {
      loggerService.info('Starting bulk delete operation', {
        storeName: params.storeName,
        idCount: params.ids.length
      });

      const deletedCount = await storeCompanyMappingRepository.bulkDelete({
        storeName: params.storeName,
        ids: params.ids
      });

      loggerService.info('Bulk delete completed', {
        storeName: params.storeName,
        requestedCount: params.ids.length,
        deletedCount
      });

      return {
        success: true,
        deletedCount
      };
    } catch (error) {
      loggerService.error('Failed to bulk delete mappings', {
        error,
        params
      });
      throw error;
    }
  }

  /**
   * Export store company mappings
   */
  async exportMappings(params: ExportMappingRequest): Promise<ExportResult> {
    const start = Date.now();
    try {
      loggerService.info('Starting export process', { 
        storeName: params.storeName,
        companyId: params.companyId,
        format: params.format
      });

      // 1. Get all locations and catalogs
      loggerService.info('Fetching company locations and catalogs', {
        storeName: params.storeName,
        companyId: params.companyId
      });

      const locationsResponse = await ShopifyClientManager.query(
        GET_COMPANY_LOCATIONS_AND_CATALOGS,
        params.storeName,
        { variables: { companyId: params.companyId } }
      );

      if (!locationsResponse.data?.company?.locations) {
        loggerService.warn('No locations found', {
          companyId: params.companyId,
          storeName: params.storeName
        });
        throw new Error(
          JSON.stringify({
            code: 400,
            message: 'No locations found for the company',
            details: {
              companyId: params.companyId,
              storeName: params.storeName
            }
          })
        );
      }

      // Validate if any location has catalogs
      const locations = locationsResponse.data.company.locations.edges;
      let hasCatalog = false;
      for (const location of locations) {
        if (location.node.catalogs?.edges?.length > 0) {
          hasCatalog = true;
          break;
        }
      }

      if (!hasCatalog) {
        loggerService.warn('No catalogs found', {
          companyId: params.companyId,
          storeName: params.storeName,
          locationCount: locations.length
        });
        throw new ValidationError(
          'No catalog is associated with any company location under the selected company. Please associate at least one company location with a catalog to proceed.',
          ValidationErrorCodes.BUSINESS_RULE_VIOLATION,
          {
            companyId: params.companyId,
            storeName: params.storeName,
            locationCount: locations.length
          }
        );
      }

      // 2. Get unique catalogs
      const catalogMap = new Map();
      locationsResponse.data.company.locations.edges.forEach(location => {
        location.node.catalogs.edges.forEach(catalog => {
          if (!catalogMap.has(catalog.node.id)) {
            catalogMap.set(catalog.node.id, catalog.node);
          }
        });
      });
      const uniqueCatalogs = Array.from(catalogMap.values());

      loggerService.info('Unique catalogs extracted', {
        uniqueCatalogCount: uniqueCatalogs.length
      });

      // 3. Get all products from each catalog
      const variantMap = new Map();
      let processedCatalogs = 0;

      for (const catalog of uniqueCatalogs) {
        loggerService.debug('Processing catalog', {
          catalogId: catalog.id,
          progress: `${processedCatalogs + 1}/${uniqueCatalogs.length}`
        });

        const productsResponse = await ShopifyClientManager.query(
          GET_CATALOG_PRODUCTS,
          params.storeName,
          { variables: { catalogId: catalog.id } }
        );

        const products = productsResponse.data?.catalog?.publication?.products?.edges || [];
        products.forEach(product => {
          const variants = product.node.variants.edges || [];
          variants.forEach(variant => {
            if (variant.node.sku && !variantMap.has(variant.node.sku)) {
              variantMap.set(variant.node.sku, {
                storeName: params.storeName,
                companyId: params.companyId,
                skuId: variant.node.sku,
                productTitle: product.node.title,
                customerPartnerNumber: ''
              });
            }
          });
        });
      }

      // 4. Get all SKUs and fetch their customer partner numbers
      const allSkus = Array.from(variantMap.keys());
      loggerService.info('Fetching customer partner numbers', {
        skuCount: allSkus.length
      });

      const mappings = await storeCompanyMappingRepository.batchFetchCustomerNumberDetails({
        storeName: params.storeName,
        companyId: params.companyId,
        skuIds: allSkus
      });

      loggerService.info('Customer partner numbers fetched', {
        totalMappings: mappings.length,
        mappedCount: mappings.filter(m => m.customerPartnerNumber).length
      });

      // Create a map for quick lookup
      const customerPartnerNumberMap = new Map(
        mappings.map(m => [m.skuId, m.customerPartnerNumber])
      );

      // 5. Prepare export data with customer partner numbers
      const exportData = Array.from(variantMap.values()).map(variant => {
        const customerPartnerNumber = customerPartnerNumberMap.get(variant.skuId) || '';
        return {
          'Store Name': variant.storeName,
          'Company ID': variant.companyId.split('/').pop() || variant.companyId,
          'SKU ID': variant.skuId,
          'Product Title': variant.productTitle,
          'Customer Partner Number': customerPartnerNumber
        };
      });

      // 6. Sort the data
      loggerService.debug('Sorting export data', {
        totalRecords: exportData.length
      });

      // Separate data into two groups and sort each by skuId
      const withoutCustomerPartnerNumber = exportData
        .filter(item => !item['Customer Partner Number'])
        .sort((a, b) => a['SKU ID'].localeCompare(b['SKU ID']));

      const withCustomerPartnerNumber = exportData
        .filter(item => item['Customer Partner Number'])
        .sort((a, b) => a['SKU ID'].localeCompare(b['SKU ID']));

      // Combine the sorted groups - without customer partner number first
      const sortedData = [...withoutCustomerPartnerNumber, ...withCustomerPartnerNumber];

      loggerService.debug('Data sorted', {
        withoutCustomerPartnerNumber: withoutCustomerPartnerNumber.length,
        withCustomerPartnerNumber: withCustomerPartnerNumber.length,
        totalRecords: sortedData.length
      });

      loggerService.debug('Generating export file', {
        format: params.format,
        recordCount: sortedData.length
      });

      const result = await ExportService.generateExport({
        format: params.format,
        filename: `store_company_mappings_${params.storeName}`,
        data: sortedData,
        columns: [
          { key: 'Store Name', header: 'Store Name' },
          { key: 'Company ID', header: 'Company ID' },
          { key: 'Product Title', header: 'Product Title' },
          { key: 'SKU ID', header: 'SKU ID' },
          { key: 'Customer Partner Number', header: 'Customer Partner Number' }
        ]
      });

      const duration = Date.now() - start;
      loggerService.info('Export completed successfully', {
        storeName: params.storeName,
        companyId: params.companyId,
        totalRecords: exportData.length,
        mappedRecords: mappings.filter(m => m.customerPartnerNumber).length,
        format: params.format,
        duration
      });

      return result;

    } catch (error) {
      const duration = Date.now() - start;
      loggerService.error('Export failed', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          code: error instanceof ShopifyError ? error.code : undefined,
          stack: error.stack
        } : 'Unknown error',
        params,
        duration
      });
      throw error;
    }
  }
}

export const storeCompanyMappingService = new StoreCompanyMappingService();
