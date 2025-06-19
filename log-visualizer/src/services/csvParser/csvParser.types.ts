// Core domain types
export interface SignalEvent {
  timestamp: number; // Unix timestamp in milliseconds
  signalName: string; // e.g., "CLK", "DATA", "RESET"
  value: string; // e.g., "0", "1", "x", "z", "data_value"
}

// CSV Parser configuration
export interface CsvParserConfig {
  timestampColumn: string; // Default: "timestamp"
  signalColumn: string; // Default: "signal_name"
  valueColumn: string; // Default: "value"
  timestampFormat: 'unix' | 'iso8601' | 'custom';
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Error types for CSV parsing
export enum ErrorType {
  CSV_PARSE_ERROR = 'CSV_PARSE_ERROR',
  INVALID_TIMESTAMP = 'INVALID_TIMESTAMP',
  WAVEDROM_GENERATION_ERROR = 'WAVEDROM_GENERATION_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
}

// CSV Parser Service interface
export interface ICsvParserService {
  parseFile(file: File, config?: CsvParserConfig): Promise<SignalEvent[]>;
  validateFormat(headers: string[]): ValidationResult;
}

// Default configuration
export const DEFAULT_CSV_CONFIG: CsvParserConfig = {
  timestampColumn: 'timestamp',
  signalColumn: 'signal_name',
  valueColumn: 'value',
  timestampFormat: 'unix',
};
