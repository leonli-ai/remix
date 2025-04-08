import * as XLSX from 'xlsx';
import { stringify } from 'csv-stringify/sync';
import { loggerService } from '../logger';
import type { ExportOptions, ExportResult, ExportSheet } from './types';
import { parse } from 'csv-parse/sync';

export class ExportService {
  private static readonly CONTENT_TYPES = {
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };

  /**
   * Generate export file based on options
   */
  public static async generateExport(options: ExportOptions): Promise<ExportResult> {
    try {
      loggerService.info('Starting export generation', { 
        format: options.format,
        filename: options.filename
      });

      let buffer: Buffer;
      const contentType = this.CONTENT_TYPES[options.format];

      if (options.format === 'csv') {
        buffer = await this.generateCSV(options);
      } else {
        buffer = await this.generateXLSX(options);
      }

      const filename = this.generateFilename(options);

      loggerService.info('Export generated successfully', {
        format: options.format,
        filename,
        sizeKB: Math.round(buffer.length / 1024)
      });

      return {
        buffer,
        filename,
        contentType
      };
    } catch (error) {
      loggerService.error('Failed to generate export', {
        error,
        format: options.format,
        filename: options.filename
      });
      throw error;
    }
  }

  /**
   * Generate CSV file
   */
  private static async generateCSV(options: ExportOptions): Promise<Buffer> {
    if (!options.columns || !options.data) {
      throw new Error('Columns and data are required for CSV export');
    }

    const headers = options.columns.map(col => col.header);
    const keys = options.columns.map(col => col.key);

    const rows = options.data.map(item => 
      keys.map(key => item[key] ?? '')
    );

    const csvData = stringify([headers, ...rows], {
      delimiter: ',',
      quoted: true
    });

    return Buffer.from(csvData);
  }

  /**
   * Generate XLSX file
   */
  private static async generateXLSX(options: ExportOptions): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    if (options.sheets) {
      // Multi-sheet export
      options.sheets.forEach(sheet => {
        const wsData = this.prepareSheetData(sheet);
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
      });
    } else if (options.columns && options.data) {
      // Single sheet export
      const sheet: ExportSheet = {
        name: 'Sheet1',
        columns: options.columns,
        data: options.data
      };
      const wsData = this.prepareSheetData(sheet);
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
    } else {
      throw new Error('Either sheets or columns/data must be provided for XLSX export');
    }

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Prepare sheet data for XLSX
   */
  private static prepareSheetData(sheet: ExportSheet): any[][] {
    const headers = sheet.columns.map(col => col.header);
    const keys = sheet.columns.map(col => col.key);

    const rows = sheet.data.map(item =>
      keys.map(key => item[key] ?? '')
    );

    return [headers, ...rows];
  }

  /**
   * Generate filename with date and time
   */
  private static generateFilename(options: ExportOptions): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Format time as HH-mm-ss
    const time = now.toTimeString()
      .split(' ')[0]  // Get HH:mm:ss part
      .replace(/:/g, '-');  // Replace : with -
    
    const baseFilename = options.filename.replace(/\.[^/.]+$/, '');
    return `${baseFilename}_${date}_${time}.${options.format}`;
  }

  public static async parseFile<T extends Record<string, unknown>>(file: File, format: 'xlsx' | 'csv'): Promise<Array<T & { rowNumber: number }>> {
    const buffer = await file.arrayBuffer();
    
    if (format === 'csv') {
      const content = Buffer.from(buffer);
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true
      }) as T[];
      return records.map((record: T, index: number) => ({ ...record, rowNumber: index + 2 })); // Add 2 because of header row
    } else {
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json(worksheet) as T[];
      return records.map((record: T, index: number) => ({ ...record, rowNumber: index + 2 })); // Add 2 because of header row
    }
  }
} 