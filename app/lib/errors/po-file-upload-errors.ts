import { BaseError, HttpStatusCode } from './base-error';

/**
 * Error codes for PO file upload operations
 */
export enum PoFileUploadErrorCodes {
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND'
}

/**
 * Error class for PO file upload operations
 */
export class PoFileUploadError extends BaseError {
  constructor(message: string, errorCode: PoFileUploadErrorCodes, statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR) {
    super(message, statusCode, errorCode);
    this.name = 'PoFileUploadError';
  }

  /**
   * Create an error for invalid file type
   */
  static invalidFileType(fileType: string): PoFileUploadError {
    return new PoFileUploadError(
      `Invalid file type: ${fileType}. Only PDF, JPEG, PNG, GIF, and BMP files are allowed.`,
      PoFileUploadErrorCodes.INVALID_FILE_TYPE,
      HttpStatusCode.BAD_REQUEST
    );
  }

  /**
   * Create an error for file size exceeding the limit
   */
  static fileTooLarge(fileSize: number): PoFileUploadError {
    return new PoFileUploadError(
      `File size (${fileSize} bytes) exceeds the maximum allowed size of 10MB.`,
      PoFileUploadErrorCodes.FILE_TOO_LARGE,
      HttpStatusCode.BAD_REQUEST
    );
  }

  /**
   * Create an error for upload failure
   */
  static uploadFailed(error: Error): PoFileUploadError {
    return new PoFileUploadError(
      `File upload failed: ${error.message}`,
      PoFileUploadErrorCodes.UPLOAD_FAILED,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  /**
   * Create an error for file not found
   */
  static fileNotFound(): PoFileUploadError {
    return new PoFileUploadError(
      'File not found in the request',
      PoFileUploadErrorCodes.FILE_NOT_FOUND,
      HttpStatusCode.BAD_REQUEST
    );
  }
} 