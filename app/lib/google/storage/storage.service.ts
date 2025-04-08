import { Storage } from '@google-cloud/storage';
import { loggerService } from '~/lib/logger';
import { PoFileUploadError } from '~/lib/errors/po-file-upload-errors';

/**
 * Service for interacting with Google Cloud Storage
 */
class GoogleStorageService {
  private readonly CLASS_NAME = 'GoogleStorageService';
  private readonly storage: Storage;
  
  constructor() {
    this.storage = new Storage();
  }

  /**
   * Upload a file to Google Cloud Storage
   * @param bucketName - Name of the bucket to upload to
   * @param filePath - Path where the file will be stored in the bucket
   * @param fileContent - Content of the file to upload
   * @param contentType - MIME type of the file
   * @param metadata - Additional metadata for the file
   * @returns Public URL of the uploaded file
   */
  public async uploadFile(
    bucketName: string,
    filePath: string,
    fileContent: Buffer,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<string> {
    const METHOD = 'uploadFile';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Starting file upload`, {
        bucketName,
        filePath,
        contentType,
        metadata
      });

      // Get the bucket
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(filePath);
      
      // Upload the file
      await file.save(fileContent, {
        contentType,
        metadata
      });
      
      // Make the file publicly accessible
      await file.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: File uploaded successfully`, {
        bucketName,
        filePath,
        publicUrl
      });
      
      return publicUrl;
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to upload file`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        bucketName,
        filePath
      });
      
      throw PoFileUploadError.uploadFailed(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param bucketName - Name of the bucket containing the file
   * @param filePath - Path of the file to delete
   */
  public async deleteFile(bucketName: string, filePath: string): Promise<void> {
    const METHOD = 'deleteFile';
    try {
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: Deleting file`, {
        bucketName,
        filePath
      });

      // Get the bucket and file
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(filePath);
      
      // Delete the file
      await file.delete();
      
      loggerService.info(`${this.CLASS_NAME}.${METHOD}: File deleted successfully`, {
        bucketName,
        filePath
      });
    } catch (error) {
      loggerService.error(`${this.CLASS_NAME}.${METHOD}: Failed to delete file`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : 'Unknown error',
        bucketName,
        filePath
      });
      
      throw error;
    }
  }
}

export const googleStorageService = new GoogleStorageService(); 