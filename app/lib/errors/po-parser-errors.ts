export class PoParserError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PoParserError';
  }

  static invalidRequest(message: string): PoParserError {
    return new PoParserError(message, 'INVALID_REQUEST');
  }

  static unsupportedFileType(fileType: string): PoParserError {
    return new PoParserError(
      `Unsupported file type: ${fileType}`,
      'UNSUPPORTED_FILE_TYPE'
    );
  }

  static fileDownloadFailed(message: string): PoParserError {
    return new PoParserError(
      `Failed to download file: ${message}`,
      'FILE_DOWNLOAD_FAILED'
    );
  }

  static parseFailed(error: Error): PoParserError {
    return new PoParserError(
      `Failed to parse purchase order: ${error.message}`,
      'PARSE_FAILED'
    );
  }

  static invalidData(message: string): PoParserError {
    return new PoParserError(message, 'INVALID_DATA');
  }
} 