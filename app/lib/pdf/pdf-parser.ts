import { loggerService } from '~/lib/logger';
import { fromBuffer } from 'pdf2pic';
import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

interface PdfPicOptions {
  density: number;
  format: string;
  width: number;
  height: number;
  preserveAspectRatio?: boolean;
  quality?: number;
  saveFilename?: string;
  savePath?: string;
}

interface PdfInfo {
  pageCount: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface BufferResponse {
  buffer: Buffer;
  text: string;
  page: number;
  name: string;
  size: string;
  filesize: string;
  file: string;
  path?: string;
  density?: number;
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}

/**
 * PDF parser utility class
 * Provides wrapper for pdf2pic with TypeScript support
 */
export class PdfParser {
  private readonly CLASS_NAME = 'PdfParser';
  private readonly DEFAULT_IMAGE_OPTIONS: PdfPicOptions = {
    density: 300,
    format: 'png',
    width: 2480,
    height: 3508,
    preserveAspectRatio: true,
    quality: 100
  };

  /**
   * Get PDF information including page count
   * @param buffer - PDF buffer
   * @returns PDF information
   */
  public async getPdfInfo(buffer: Buffer): Promise<PdfInfo> {
    const METHOD = 'getPdfInfo';
    try {
      // Load PDF document from buffer
      const pdfDoc = await PDFDocument.load(buffer);
      // Get page count
      const pageCount = pdfDoc.getPageCount();
      // Get dimensions from first page
      const firstPage = pdfDoc.getPage(0);
      const { width, height } = firstPage.getSize();

      return {
        pageCount,
        dimensions: {
          width,
          height
        }
      };
    } catch (error) {
      this.logError(METHOD, 'Failed to get PDF info', error);
      // Return default values if failed
      return {
        pageCount: 1,
        dimensions: {
          width: this.DEFAULT_IMAGE_OPTIONS.width,
          height: this.DEFAULT_IMAGE_OPTIONS.height
        }
      };
    }
  }

  /**
   * Convert PDF buffer to images
   * @param buffer - PDF file buffer
   * @param options - Conversion options
   * @returns Array of image buffers and PDF info
   */
  public async convert(
    buffer: Buffer,
    options: Partial<PdfPicOptions> = {}
  ): Promise<{ images: Buffer[]; info: PdfInfo }> {
    const METHOD = 'convert';
    let tempDir: string | undefined;
    
    try {
      this.logInfo(METHOD, 'Starting PDF conversion', { bufferLength: buffer.length, options });

      tempDir = await this.createTempDirectory();
      const pdfInfo = await this.getPdfInfo(buffer);
      const convertOptions = this.getConvertOptions(tempDir, options);
      
      this.logInfo(METHOD, 'Converting with options', { pdfInfo, convertOptions });

      const convert = fromBuffer(buffer, convertOptions);
      const results = await this.performBulkConversion(convert, METHOD);
      const imageBuffers = this.processConversionResults(results, METHOD);

      if (imageBuffers.length === 0) {
        throw new Error('Failed to convert PDF: No valid images generated');
      }

      this.logInfo(METHOD, 'Conversion completed', {
        totalPages: pdfInfo.pageCount,
        successfulConversions: imageBuffers.length,
        imageBufferSizes: imageBuffers.map(buf => buf.length)
      });

      return { images: imageBuffers, info: pdfInfo };
    } catch (error) {
      this.logError(METHOD, 'Failed to convert PDF', error);
      throw error;
    } finally {
      await this.cleanupTempDirectory(tempDir, METHOD);
    }
  }

  private async createTempDirectory(): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp', `pdf-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  private getConvertOptions(tempDir: string, options: Partial<PdfPicOptions>): PdfPicOptions {
    return {
      ...this.DEFAULT_IMAGE_OPTIONS,
      ...options,
      saveFilename: 'page',
      savePath: tempDir
    };
  }

  private async performBulkConversion(convert: any, method: string): Promise<BufferResponse[]> {
    try {
      const results = await convert.bulk(-1, { responseType: "buffer" });
      this.logInfo(method, 'Bulk conversion completed', {
        resultsCount: results.length,
        hasResults: results.some(r => r && r.buffer)
      });
      return results;
    } catch (error) {
      this.logError(method, 'Bulk conversion failed', error);
      throw error;
    }
  }

  private processConversionResults(results: BufferResponse[], method: string): Buffer[] {
    return results
      .filter((result): result is BufferResponse => {
        if (!result || !result.buffer) {
          this.logWarn(method, 'Page conversion result invalid', {
            hasResult: !!result,
            hasBuffer: result?.buffer !== undefined
          });
          return false;
        }
        return true;
      })
      .map(result => result.buffer)
      .filter((buffer): buffer is Buffer => buffer !== null);
  }

  private async cleanupTempDirectory(tempDir: string | undefined, method: string): Promise<void> {
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        this.logWarn(method, 'Failed to clean up temp directory', { error, tempDir });
      }
    }
  }

  private logInfo(method: string, message: string, data?: Record<string, any>): void {
    loggerService.info(`${this.CLASS_NAME}.${method}: ${message}`, data);
  }

  private logError(method: string, message: string, error: unknown): void {
    loggerService.error(`${this.CLASS_NAME}.${method}: ${message}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  private logWarn(method: string, message: string, data?: Record<string, any>): void {
    loggerService.warn(`${this.CLASS_NAME}.${method}: ${message}`, data);
  }
}

export const pdfParser = new PdfParser(); 