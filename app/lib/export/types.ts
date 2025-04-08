export type ExportFormat = 'csv' | 'xlsx';

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportSheet {
  name: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
}

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  sheets?: ExportSheet[];  // For XLSX multi-sheet export
  columns?: ExportColumn[];  // For single sheet/CSV export
  data?: Record<string, any>[];  // For single sheet/CSV export
}

export interface ExportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
} 