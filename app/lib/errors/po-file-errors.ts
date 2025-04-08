/**
 * Custom error class for PO file related errors
 */
export class PoFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PoFileError';
  }

  /**
   * Create an error for when a PO file is not found
   */
  static notFound(id: number): PoFileError {
    return new PoFileError(`PO file with ID ${id} not found`);
  }

  /**
   * Create an error for when a file type is invalid
   */
  static invalidFileType(type: string): PoFileError {
    return new PoFileError(`Invalid file type: ${type}`);
  }

  /**
   * Create an error for when a file is too large
   */
  static fileTooLarge(size: number): PoFileError {
    return new PoFileError(`File size ${size} bytes exceeds maximum allowed size`);
  }

  /**
   * Create an error for when file upload fails
   */
  static uploadFailed(error: Error): PoFileError {
    return new PoFileError(`Failed to upload file: ${error.message}`);
  }
} 