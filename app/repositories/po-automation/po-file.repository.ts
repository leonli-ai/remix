import prisma from '../../db.server';
import { loggerService } from '~/lib/logger';
import { PoFileError } from '~/lib/errors/po-file-errors';
import type { PoFileStatus, Prisma } from '@prisma/client';

/**
 * Repository class for managing PO files
 * Handles database operations for PO files including creation, updates, and queries
 */
export class PoFileRepository {
  private readonly CLASS_NAME = 'PoFileRepository';

  /**
   * Find PO file by ID
   * @param id - The ID of the PO file
   * @returns The PO file record or null if not found
   */
  public async findById(id: number) {
    const METHOD = 'findById';
    try {
      const poFile = await prisma.poFile.findFirst({
        where: { id },
        include: {
          histories: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!poFile) {
        throw PoFileError.notFound(id);
      }

      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Found PO file`, { id });
      return poFile;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to find PO file`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        id
      });
      if (error instanceof PoFileError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Create a new PO file record
   * @param data - The PO file data
   * @returns The created PO file record
   */
  public async create(data: {
    storeName: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    status: PoFileStatus;
    metadata: Prisma.InputJsonValue;
    createdBy: string;
    companyId: string;
    companyLocationId: string;
  }) {
    const METHOD = 'create';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Creating PO file record`, { data });

      return await prisma.$transaction(async (tx) => {
        // Create PO file record
        const poFile = await tx.poFile.create({
          data: {
            storeName: data.storeName,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            fileSize: data.fileSize,
            status: data.status,
            metadata: data.metadata,
            createdBy: data.createdBy,
            companyId: data.companyId,
            companyLocationId: data.companyLocationId,
            histories: {
              create: {
                operationType: 'UPLOAD',
                status: 'UPLOADED',
                message: 'File uploaded successfully',
                metadata: data.metadata,
                createdBy: data.createdBy
              }
            }
          },
          include: {
            histories: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        });

        loggerService.info(`${this.CLASS_NAME}.${METHOD}: Created PO file record`, {
          fileId: poFile.id,
          storeName: data.storeName,
          fileName: data.fileName
        });

        return poFile;
      });
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to create PO file record`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
      throw error;
    }
  }

  /**
   * Update PO file by file URL
   * @param fileUrl - The URL of the file to update
   * @param data - The data to update
   * @returns The updated PO file record
   */
  public async updateByFileUrl(
    fileUrl: string,
    data: { status: PoFileStatus; metadata: Prisma.InputJsonValue }
  ) {
    const METHOD = 'updateByFileUrl';
    try {
      // First find the record by fileUrl
      const record = await prisma.poFile.findFirst({
        where: { fileUrl },
        select: { id: true }
      });

      if (!record) {
        const error = new Error(`File not found with URL: ${fileUrl}`);
        error.name = 'PoFileError';
        throw error;
      }

      // Then update by id
      return await prisma.poFile.update({
        where: { id: record.id },
        data: {
          status: data.status,
          metadata: data.metadata as Prisma.InputJsonValue
        }
      });
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to update PO file`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        fileUrl
      });
      throw error;
    }
  }
}

export const poFileRepository = new PoFileRepository(); 