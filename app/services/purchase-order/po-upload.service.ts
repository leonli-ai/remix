import { loggerService } from '~/lib/logger';
import { googleStorageService } from '~/lib/google/storage/storage.service';
import { PoFileUploadError } from '~/lib/errors/po-file-upload-errors';
import type { PoFileUploadRequest, PoFileUploadResponse, AllowedFileTypesEnum } from '~/types/purchase-order/file-upload.schema';
import { poFileRepository } from '~/repositories/po-automation/po-file.repository';
import type { Prisma } from '@prisma/client';
import { pdfParser } from '~/lib/pdf/pdf-parser';

// Constants
const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PDF_PAGES: 5,
  VALID_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp'] as const,
  BASE_PATH: 'po-automation'
} as const;

type FileStatus = 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';

interface FileRecord {
  id: number;
  fileUrl: string;
  status: FileStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  metadata: Prisma.JsonValue;
}

/**
 * Service for handling PO automation file uploads
 */
class PoFileUploadService {
  private readonly CLASS_NAME = 'PoFileUploadService';
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.PO_AUTOMATION_BUCKET_NAME_DEV || '';
    if (!this.bucketName) {
      throw new Error('PO_AUTOMATION_BUCKET_NAME_DEV environment variable is not set');
    }
  }

  /**
   * Upload a file for PO automation
   * @param params - File upload request parameters
   * @returns File upload response
   */
  public async uploadFile(params: PoFileUploadRequest): Promise<PoFileUploadResponse> {
    const METHOD = 'uploadFile';
    try {
      this.logUploadStart(METHOD, params);

      // 1. Validate file
      this.validateFile(params.file);
      
      // 2. Prepare file for upload
      const { fileName, buffer } = await this.prepareFileForUpload(params);

      // 3. Validate PDF if applicable
      const pdfInfo = await this.validatePdfIfApplicable(params.file, buffer);

      // 4. Upload to storage
      const fileUrl = await this.uploadToStorage(fileName, buffer, params);

      // 5. Save to database
      const fileRecord = await this.saveToDatabase(params, fileUrl, pdfInfo);
      
      this.logUploadSuccess(METHOD, params, fileName, fileUrl, fileRecord, pdfInfo);
      
      return this.createSuccessResponse(params, fileRecord);

    } catch (error) {
      this.logUploadError(METHOD, error, params);
      
      if (error instanceof PoFileUploadError) {
        throw error;
      }
      
      throw PoFileUploadError.uploadFailed(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: File): void {
    if (!FILE_CONSTANTS.VALID_FILE_TYPES.includes(file.type as any)) {
      throw PoFileUploadError.invalidFileType(file.type);
    }

    if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
      throw PoFileUploadError.fileTooLarge(file.size);
    }
  }

  /**
   * Validate PDF file if applicable
   */
  private async validatePdfIfApplicable(file: File, buffer: Buffer) {
    if (file.type !== 'application/pdf') return null;

    const pdfInfo = await pdfParser.getPdfInfo(buffer);
    if (pdfInfo.pageCount > FILE_CONSTANTS.MAX_PDF_PAGES) {
      throw new Error(`PDF has ${pdfInfo.pageCount} pages, exceeding the maximum limit of ${FILE_CONSTANTS.MAX_PDF_PAGES} pages`);
    }
    return pdfInfo;
  }

  /**
   * Prepare file data for upload
   */
  private async prepareFileForUpload(params: PoFileUploadRequest): Promise<{ fileName: string; buffer: Buffer }> {
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(params.file.name);
    const fileName = `${FILE_CONSTANTS.BASE_PATH}/${params.storeName}/${timestamp}-${sanitizedFileName}`;
    
    const arrayBuffer = await params.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return { fileName, buffer };
  }

  /**
   * Sanitize file name to ensure URL safety
   */
  private sanitizeFileName(originalFileName: string): string {
    const baseName = originalFileName.replace(/^.*[\\\/]/, '');
    const extension = baseName.split('.').pop() || '';
    
    const sanitized = baseName
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(new RegExp(`\\.${extension}$`), '');
    
    return `${sanitized}.${extension.toLowerCase()}`;
  }

  /**
   * Upload file to storage service
   */
  private async uploadToStorage(
    fileName: string,
    buffer: Buffer,
    params: PoFileUploadRequest
  ): Promise<string> {
    return googleStorageService.uploadFile(
      this.bucketName,
      fileName,
      buffer,
      params.file.type,
      {
        storeName: params.storeName,
        originalName: params.file.name,
        uploadedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Save file information to database
   */
  private async saveToDatabase(
    params: PoFileUploadRequest,
    fileUrl: string,
    pdfInfo: any | null
  ): Promise<FileRecord> {
    const timestamp = new Date().toISOString();
    
    const record = await poFileRepository.create({
      storeName: params.storeName,
      fileName: params.file.name,
      fileUrl,
      fileType: params.file.type,
      fileSize: params.file.size,
      createdBy: params.customerId || 'system',
      companyId: params.companyId || '',
      companyLocationId: params.companyLocationId || '',
      status: 'QUEUED',
      metadata: {
        originalName: params.file.name,
        uploadedAt: timestamp,
        pdfInfo
      }
    });

    return {
      id: record.id,
      fileUrl: record.fileUrl,
      status: record.status as FileStatus,
      metadata: record.metadata
    };
  }

  /**
   * Create success response
   */
  private createSuccessResponse(
    params: PoFileUploadRequest,
    fileRecord: FileRecord
  ): PoFileUploadResponse {
    return {
      success: fileRecord.status !== 'FAILED',
      message: fileRecord.status === 'FAILED' 
        ? fileRecord.errorMessage || 'File upload failed'
        : 'File uploaded successfully',
      fileUrl: fileRecord.fileUrl,
      fileName: params.file.name,
      fileType: params.file.type as AllowedFileTypesEnum,
      fileSize: params.file.size,
      fileId: fileRecord.id,
      uploadedAt: new Date().toISOString(),
      status: fileRecord.status as FileStatus,
      errorCode: fileRecord.errorCode || undefined,
      errorMessage: fileRecord.errorMessage || undefined,
      metadata: fileRecord.metadata as Record<string, unknown>
    };
  }

  // Logging methods
  private logUploadStart(METHOD: string, params: PoFileUploadRequest): void {
    loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting file upload`, {
      storeName: params.storeName,
      fileName: params.file.name,
      fileType: params.file.type,
      fileSize: params.file.size
    });
  }

  private logUploadSuccess(
    METHOD: string,
    params: PoFileUploadRequest,
    fileName: string,
    fileUrl: string,
    fileRecord: FileRecord,
    pdfInfo: any | null
  ): void {
    loggerService.info(`${this.CLASS_NAME}.${METHOD}: File uploaded`, {
      storeName: params.storeName,
      fileName,
      fileUrl,
      fileId: fileRecord.id,
      pdfPageCount: pdfInfo?.pageCount
    });
  }

  private logUploadError(METHOD: string, error: unknown, params: PoFileUploadRequest): void {
    loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to upload file`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Unknown error',
      params: {
        storeName: params.storeName,
        fileName: params.file.name,
        fileType: params.file.type,
        fileSize: params.file.size
      }
    });
  }
}

export const poFileUploadService = new PoFileUploadService(); 