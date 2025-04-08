import type { CustomerPartnerNumberRecord } from '~/types/product-variant/customer-partner-number-upload.schema';
import prisma from '../../db.server';
import { loggerService } from '../../lib/logger';
import type {
  CustomerPartnerNumberFetchRequest,
  CustomerPartnerNumberDetail,
  CustomerPartnerNumberSearchSchemaType,
  SkuFetchRequest
} from '../../types/product-variant/customer-partner-number-search.schema';
import type{ Prisma } from '@prisma/client';


/**
 * Store Company Mapping Repository
 * Handles database operations related to store and company mapping
 */
class StoreCompanyMappingRepository {
  /**
   * Find SKU ID by store name, company ID and customer partner number
   * @param params - Query parameters containing store name, company ID and customer partner number
   * @returns Matching SKU ID if found, null otherwise
   * @throws When database query fails
   */
  async findSkuId(params: CustomerPartnerNumberSearchSchemaType): Promise<string | null> {
    try {
      const result = await prisma.storeCompanyMapping.findFirst({
        where: {
          storeName: params.storeName,
          companyId: `gid://shopify/Company/${params.companyId}`,
          customerPartnerNumber: params.customerPartnerNumber
        },
        select: {
          skuId: true
        }
      })
      return result?.skuId ?? null
    } catch (error) {
      loggerService.error('Failed to search store company mapping', error)
      throw error
    }
  }

  /**
   * Batch fetch SKU details by customer partner numbers
   */
  async batchFetchDetails(params: CustomerPartnerNumberFetchRequest): Promise<CustomerPartnerNumberDetail[]> {
    try {
      const results = await prisma.storeCompanyMapping.findMany({
        where: {
          storeName: params.storeName,
          companyId: params.companyId,
          customerPartnerNumber: {
            in: params.data
          }
        },
        select: {
          storeName: true,
          skuId: true,
          companyId: true,
          customerPartnerNumber: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Ensure all requested customer partner numbers are in the response
      const response = params.data.map(cpn => {
        const found = results.find(r => r.customerPartnerNumber === cpn);
        return found || {
          storeName: params.storeName,
          skuId: null,
          companyId: params.companyId,
          customerPartnerNumber: cpn,
          createdAt: null,
          updatedAt: null
        };
      });

      return response;
    } catch (error) {
      loggerService.error('Failed to batch fetch store company mappings', error);
      throw error;
    }
  }

    /**
   * Batch fetch customer partner numbers by SKU
   */
  async batchFetchCustomerNumberDetails(params: SkuFetchRequest): Promise<CustomerPartnerNumberDetail[]> {
    try {
      const results = await prisma.storeCompanyMapping.findMany({
        where: {
            storeName: params.storeName,
            companyId: params.companyId,
            skuId: {
              in: params.skuIds
          }
        },
        select: {
          storeName: true,
          skuId: true,
          companyId: true,
          customerPartnerNumber: true,
          createdAt: true,
          updatedAt: true
        }
      });

        // Ensure all requested customer partner numbers are in the response
      const response = params.skuIds.map(skuId => {
        const found = results.find(r => r.skuId === skuId);
        return found || {
            storeName: params.storeName,
            skuId: skuId,
            companyId: params.companyId,
            customerPartnerNumber: null,
            createdAt: null,
            updatedAt: null
        };
      });

      return response;
    } catch (error) {
        loggerService.error('Failed to batch fetch customer number details', error);
        throw error;
    }
  }

  /**
   * Check for duplicate customer partner number within the same store and company
   */
  private async checkDuplicateCustomerPartnerNumber(params: {
    storeName: string;
    companyId: string;
    customerPartnerNumber: string;
    excludeId?: number;
  }): Promise<{ isDuplicate: boolean; duplicateRecord?: any }> {
    const where: any = {
      storeName: params.storeName,
      companyId: params.companyId,
      customerPartnerNumber: params.customerPartnerNumber
    };

    if (params.excludeId) {
      where.NOT = { id: params.excludeId };
    }

    const duplicateRecord = await prisma.storeCompanyMapping.findFirst({
      where,
      select: {
        id: true,
        skuId: true,
        customerPartnerNumber: true
      }
    });

    return {
      isDuplicate: !!duplicateRecord,
      duplicateRecord
    };
  }

  /**
   * Log duplicate customer partner number warning
   */
  private logDuplicateWarning(params: {
    storeName: string;
    skuId: string;
    existingRecord: any;
    newCustomerPartnerNumber: string;
    rowNumber: number;
    isNewRecord?: boolean;
  }): void {
    loggerService.warn(
      params.isNewRecord ? 'Duplicate customer partner number found for new record' : 'Duplicate customer partner number found',
      {
        storeName: params.storeName,
        skuId: params.skuId,
        existingCustomerPartnerNumber: params.existingRecord.customerPartnerNumber,
        newCustomerPartnerNumber: params.newCustomerPartnerNumber,
        existingSkuId: params.existingRecord.skuId,
        rowNumber: params.rowNumber
      }
    );
  }

  /**
   * Bulk create or update customer partner number mappings
   * @param params Object containing store name and array of records to process
   * @returns Object containing success count, failure count, and failed records
   */
  public async bulkCreateCustomerPartnerNumbers(params: {
    storeName: string;
    records: (CustomerPartnerNumberRecord & { rowNumber: number })[];
  }): Promise<{
    successCount: number;
    failureCount: number;
    failedRecords: Array<{
      record: CustomerPartnerNumberRecord & { rowNumber: number };
      error: string;
    }>;
  }> {
    const failedRecords: Array<{
      record: CustomerPartnerNumberRecord & { rowNumber: number };
      error: string;
    }> = [];
    const batchSize = 100;
    let totalSuccessCount = 0;

    try {
      // Process records in batches to optimize performance
      for (let i = 0; i < params.records.length; i += batchSize) {
        const batch = params.records.slice(i, i + batchSize);
        
        try {
          // Create a reference object to store success count
          const successCountRef = { count: 0 };

          // Process batch with transaction
          await prisma.$transaction(async (tx) => {
            // Process each record individually within the transaction
            for (const record of batch) {
              try {
                const formattedCompanyId = `gid://shopify/Company/${record.companyId}`;

                // Step 1: Check for existing record by store name, SKU ID, and company ID
                const existingRecord = await tx.storeCompanyMapping.findFirst({
                  where: {
                    storeName: params.storeName,
                    companyId: formattedCompanyId,
                    skuId: record.skuId
                  },
                  select: {
                    id: true,
                    customerPartnerNumber: true,
                    companyName: true,
                    productTitle: true,
                    skuId: true
                  }
                });

                // Step 2 & 3: Handle cases where record exists
                if (existingRecord) {
                  // Skip if exact match found (no update needed)
                  if (existingRecord.customerPartnerNumber === record.customerPartnerNumber) {
                    loggerService.info('Skipped processing - exact match found', {
                      storeName: params.storeName,
                      skuId: record.skuId,
                      companyId: record.companyId,
                      customerPartnerNumber: record.customerPartnerNumber,
                      rowNumber: record.rowNumber
                    });
                    successCountRef.count += 1;
                    continue;
                  }

                  // Check for duplicate customer partner number before updating
                  const { isDuplicate, duplicateRecord } = await this.checkDuplicateCustomerPartnerNumberInTransaction(tx, {
                    storeName: params.storeName,
                    companyId: formattedCompanyId,
                    customerPartnerNumber: record.customerPartnerNumber,
                    excludeId: existingRecord.id
                  });

                  if (isDuplicate) {
                    this.logDuplicateWarning({
                      storeName: params.storeName,
                      skuId: record.skuId,
                      existingRecord: duplicateRecord,
                      newCustomerPartnerNumber: record.customerPartnerNumber,
                      rowNumber: record.rowNumber
                    });
                    throw new Error(`Customer Partner Number '${record.customerPartnerNumber}' already exists with SKU '${duplicateRecord.skuId}'`);
                  }

                  // Update existing record if no duplicates found
                  await tx.storeCompanyMapping.update({
                    where: { id: existingRecord.id },
                    data: {
                      customerPartnerNumber: record.customerPartnerNumber,
                      companyName: record.companyName || existingRecord.companyName,
                      productTitle: record.productName
                    }
                  });
                  loggerService.info('Updated existing mapping', {
                    id: existingRecord.id,
                    skuId: record.skuId,
                    customerPartnerNumber: record.customerPartnerNumber,
                    companyName: record.companyName || existingRecord.companyName,
                    rowNumber: record.rowNumber
                  });
                  successCountRef.count += 1;
                  continue;
                }

                // Step 4: Handle new record creation
                const { isDuplicate, duplicateRecord } = await this.checkDuplicateCustomerPartnerNumberInTransaction(tx, {
                  storeName: params.storeName,
                  companyId: formattedCompanyId,
                  customerPartnerNumber: record.customerPartnerNumber
                });

                if (isDuplicate) {
                  this.logDuplicateWarning({
                    storeName: params.storeName,
                    skuId: record.skuId,
                    existingRecord: duplicateRecord,
                    newCustomerPartnerNumber: record.customerPartnerNumber,
                    rowNumber: record.rowNumber,
                    isNewRecord: true
                  });
                  throw new Error(`Customer Partner Number '${record.customerPartnerNumber}' already exists with SKU '${duplicateRecord.skuId}'`);
                }

                // Create new record if no duplicates found
                const newMapping = await tx.storeCompanyMapping.create({
                  data: {
                    storeName: params.storeName,
                    companyId: formattedCompanyId,
                    skuId: record.skuId,
                    productTitle: record.productName,
                    customerPartnerNumber: record.customerPartnerNumber,
                    companyName: record.companyName || 'Unknown Company'
                  }
                });
                loggerService.info('Created new mapping', {
                  id: newMapping.id,
                  customerPartnerNumber: record.customerPartnerNumber,
                  companyName: record.companyName,
                  rowNumber: record.rowNumber
                });
                successCountRef.count += 1;
              } catch (error) {
                // Log and track individual record processing failures
                loggerService.error('Failed to process record', {
                  error,
                  record,
                  rowNumber: record.rowNumber,
                  errorDetails: error instanceof Error ? error.message : 'Unknown error'
                });
                failedRecords.push({
                  record,
                  error: error instanceof Error ? error.message : 'Unknown error'
                });
              }
            }
          }, {
            timeout: 30000, // Transaction timeout: 30 seconds
            isolationLevel: 'ReadCommitted' // Use string literal instead of enum
          });

          // Update total success count after transaction completes
          totalSuccessCount += successCountRef.count;

        } catch (batchError) {
          // Handle batch-level errors
          loggerService.error('Failed to process batch', {
            error: batchError,
            batchSize: batch.length,
            errorDetails: batchError instanceof Error ? batchError.message : 'Unknown error'
          });
          failedRecords.push(...batch.map(record => ({
            record,
            error: batchError instanceof Error ? batchError.message : 'Failed to process batch'
          })));
        }
      }

      return {
        successCount: totalSuccessCount,
        failureCount: failedRecords.length,
        failedRecords
      };

    } catch (error) {
      // Handle overall operation failures
      loggerService.error('Bulk create operation failed', {
        error,
        errorDetails: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Check for duplicate customer partner number within a transaction
   * @param tx Transaction client for ensuring data consistency
   * @param params Parameters for duplicate check
   * @returns Object containing duplicate status and record if found
   */
  private async checkDuplicateCustomerPartnerNumberInTransaction(
    tx: Prisma.TransactionClient,
    params: {
      storeName: string;
      companyId: string;
      customerPartnerNumber: string;
      excludeId?: number;
    }
  ): Promise<{ isDuplicate: boolean; duplicateRecord?: any }> {
    const where: any = {
      storeName: params.storeName,
      companyId: params.companyId,
      customerPartnerNumber: params.customerPartnerNumber
    };

    // Exclude current record when checking for duplicates during update
    if (params.excludeId) {
      where.NOT = { id: params.excludeId };
    }

    const duplicateRecord = await tx.storeCompanyMapping.findFirst({
      where,
      select: {
        id: true,
        skuId: true,
        customerPartnerNumber: true
      }
    });

    return {
      isDuplicate: !!duplicateRecord,
      duplicateRecord
    };
  }

  /**
   * Fetch all store company mappings with pagination and filters
   */
  async findAllWithFilters(params: {
    storeName: string
    skip?: number
    take?: number
    skuId?: string
    customerPartnerNumber?: string
    productTitle?: string
    companyId?: string
    companyName?: string
    sort?: Array<{ field: string; order: 'asc' | 'desc' }> | { sortBy?: string; sortOrder?: 'asc' | 'desc' }
  }) {
    try {
      const where: Prisma.StoreCompanyMappingWhereInput = {
        storeName: params.storeName
      };
      
      if (params.skuId) {
        where.skuId = { 
          contains: params.skuId,
          mode: 'insensitive'
        };
      }
      if (params.customerPartnerNumber) {
        where.customerPartnerNumber = { 
          contains: params.customerPartnerNumber,
          mode: 'insensitive'
        };
      }
      if (params.productTitle) {
        where.productTitle = { 
          contains: params.productTitle,
          mode: 'insensitive'
        };
      }
      if (params.companyId) {
        where.companyId = { 
          contains: params.companyId,
          mode: 'insensitive'
        };
      }
      if (params.companyName) {
        where.companyName = {
          contains: params.companyName,
          mode: 'insensitive'
        };
      }

      // Handle both old and new sorting formats
      let orderBy: Prisma.StoreCompanyMappingOrderByWithRelationInput[] = [];
      
      if (Array.isArray(params.sort)) {
        // New format: array of sort items
        orderBy = params.sort.map(item => ({
          [item.field]: item.order
        })) as Prisma.StoreCompanyMappingOrderByWithRelationInput[];
      } else if (params.sort?.sortBy) {
        // Old format: single sort object
        orderBy = [{
          [params.sort.sortBy]: params.sort.sortOrder || 'desc'
        }] as Prisma.StoreCompanyMappingOrderByWithRelationInput[];
      } else {
        // Default sorting
        orderBy = [
          { companyName: 'asc' as Prisma.SortOrder },
          { skuId: 'asc' as Prisma.SortOrder }
        ];
      }

      const [total, items] = await Promise.all([
        prisma.storeCompanyMapping.count({ where }),
        prisma.storeCompanyMapping.findMany({
          where,
          select: {
            id: true,
            storeName: true,
            skuId: true,
            customerPartnerNumber: true,
            productTitle: true,
            companyId: true,
            companyName: true,
            createdAt: true,
            updatedAt: true,
            createdBy: true,
            updatedBy: true
          },
          skip: params.skip,
          take: params.take,
          orderBy
        })
      ]);

      // Transform the items to remove the GID prefix from companyId
      const transformedItems = items.map(item => ({
        ...item,
        companyId: item.companyId.split('/').pop() || item.companyId
      }));

      return {
        total,
        items: transformedItems
      };
    } catch (error) {
      loggerService.error('Failed to fetch store company mappings with filters', error);
      throw error;
    }
  }

  /**
   * Bulk delete store company mappings
   */
  async bulkDelete(params: {
    storeName: string
    ids: number[]
  }): Promise<number> {
    try {
      const result = await prisma.storeCompanyMapping.deleteMany({
        where: {
          AND: [
            { storeName: params.storeName },
            { id: { in: params.ids } }
          ]
        }
      });

      return result.count;
    } catch (error) {
      loggerService.error('Failed to bulk delete store company mappings', {
        error,
        storeName: params.storeName,
        ids: params.ids
      });
      throw error;
    }
  }

  /**
   * Search by customer partner number with fuzzy matching
   * @param params - Query parameters containing store name, company ID and search query
   * @returns Array of matching records with skuId and customerPartnerNumber
   */
  async searchByCustomerPartnerNumber(params: { 
    storeName: string, 
    companyId?: string, 
    query: string 
  }): Promise<Array<{ skuId: string; customerPartnerNumber: string }>> {
    try {
      const where: Prisma.StoreCompanyMappingWhereInput = {
        storeName: params.storeName,
        customerPartnerNumber: {
          contains: params.query,
          mode: 'insensitive'
        }
      };

      if (params.companyId) {
        where.companyId = params.companyId;
      }

      const results = await prisma.storeCompanyMapping.findMany({
        where,
        select: {
          skuId: true,
          customerPartnerNumber: true
        }
      });

      loggerService.info('Fuzzy search by customer partner number completed', {
        query: params.query,
        resultsCount: results.length
      });

      return results;
    } catch (error) {
      loggerService.error('Failed to search by customer partner number', {
        error,
        params
      });
      throw error;
    }
  }

  /**
   * Search by exact customer partner numbers
   */
  async searchByExactCustomerPartnerNumbers(params: { 
    storeName: string, 
    companyId?: string, 
    customerPartnerNumbers: string[] 
  }): Promise<Array<{ skuId: string; customerPartnerNumber: string }>> {
    try {
      const where: Prisma.StoreCompanyMappingWhereInput = {
        storeName: params.storeName,
        customerPartnerNumber: {
          in: params.customerPartnerNumbers
        }
      };

      if (params.companyId) {
        where.companyId = params.companyId;
      }

      const results = await prisma.storeCompanyMapping.findMany({
        where,
        select: {
          skuId: true,
          customerPartnerNumber: true
        }
      });

      loggerService.info('Exact search by customer partner numbers completed', {
        query: params.customerPartnerNumbers,
        resultsCount: results.length
      });

      return results;
    } catch (error) {
      loggerService.error('Failed to search by exact customer partner numbers', {
        error,
        params
      });
      throw error;
    }
  }

  /**
   * Fetch company mappings by store name and SKU IDs
   */
  async findCompanyMappingsBySkuIds(params: {
    storeName: string;
    skuIds: string[];
  }): Promise<Array<{
    skuId: string;
    companyId: string;
    customerPartnerNumber: string;
  }>> {
    try {
      const results = await prisma.storeCompanyMapping.findMany({
        where: {
          storeName: params.storeName,
          skuId: {
            in: params.skuIds
          }
        },
        select: {
          skuId: true,
          companyId: true,
          customerPartnerNumber: true
        }
      });

      // Transform the results to remove the GID prefix from companyId
      return results.map(item => ({
        ...item,
        companyId: item.companyId.split('/').pop() || item.companyId
      }));
    } catch (error) {
      loggerService.error('Failed to fetch company mappings by SKU IDs', {
        error,
        storeName: params.storeName,
        skuIds: params.skuIds
      });
      throw error;
    }
  }
}

export const storeCompanyMappingRepository = new StoreCompanyMappingRepository();
