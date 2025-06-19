import Papa from 'papaparse';
import {
  ICsvParserService,
  SignalEvent,
  CsvParserConfig,
  ValidationResult,
  ErrorType,
  AppError,
  DEFAULT_CSV_CONFIG,
} from './csvParser.types';

// Maximum file size: 50MB (as per tech spec)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

class CsvParserService implements ICsvParserService {
  /**
   * Parse a CSV file and convert it to SignalEvent array
   */
  async parseFile(
    file: File,
    config: CsvParserConfig = DEFAULT_CSV_CONFIG
  ): Promise<SignalEvent[]> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw this.createError(
        ErrorType.FILE_TOO_LARGE,
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 50MB`,
        { fileSize: file.size, maxSize: MAX_FILE_SIZE },
        false
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw this.createError(
        ErrorType.UNSUPPORTED_FORMAT,
        'Only CSV files are supported',
        { fileName: file.name },
        true
      );
    }

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        transform: (value: string) => value.trim(),
        complete: results => {
          try {
            const signalEvents = this.processParseResults(results, config);
            resolve(signalEvents);
          } catch (error) {
            reject(error);
          }
        },
        error: error => {
          reject(
            this.createError(
              ErrorType.CSV_PARSE_ERROR,
              `Failed to parse CSV: ${error.message}`,
              error,
              true
            )
          );
        },
      });
    });
  }

  /**
   * Validate CSV format by checking headers
   */
  validateFormat(headers: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required columns
    const requiredColumns = [
      DEFAULT_CSV_CONFIG.timestampColumn,
      DEFAULT_CSV_CONFIG.signalColumn,
      DEFAULT_CSV_CONFIG.valueColumn,
    ];

    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

    for (const required of requiredColumns) {
      if (!normalizedHeaders.includes(required.toLowerCase())) {
        errors.push(`Missing required column: ${required}`);
      }
    }

    // Check for duplicate headers
    const duplicates = headers.filter(
      (header, index) => headers.indexOf(header) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate columns found: ${duplicates.join(', ')}`);
    }

    // Warnings for extra columns
    const extraColumns = headers.filter(
      header => !requiredColumns.includes(header.toLowerCase())
    );
    if (extraColumns.length > 0) {
      warnings.push(
        `Extra columns will be ignored: ${extraColumns.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Process Papa Parse results and convert to SignalEvent array
   */
  private processParseResults(
    results: Papa.ParseResult<any>,
    config: CsvParserConfig
  ): SignalEvent[] {
    if (results.errors.length > 0) {
      throw this.createError(
        ErrorType.CSV_PARSE_ERROR,
        `CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`,
        results.errors,
        true
      );
    }

    if (!results.data || results.data.length === 0) {
      throw this.createError(
        ErrorType.CSV_PARSE_ERROR,
        'CSV file is empty or contains no valid data',
        { data: results.data },
        true
      );
    }

    // Validate headers
    const headers = Object.keys(results.data[0] || {});
    const validation = this.validateFormat(headers);

    if (!validation.isValid) {
      throw this.createError(
        ErrorType.CSV_PARSE_ERROR,
        `Invalid CSV format: ${validation.errors.join(', ')}`,
        validation,
        true
      );
    }

    const signalEvents: SignalEvent[] = [];
    const parseErrors: string[] = [];

    results.data.forEach((row: any, index: number) => {
      try {
        const signalEvent = this.convertRowToSignalEvent(
          row,
          config,
          index + 1
        );
        if (signalEvent) {
          signalEvents.push(signalEvent);
        }
      } catch (error) {
        parseErrors.push(
          `Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    // If we have too many parse errors, fail completely
    if (parseErrors.length > 0) {
      const errorRate = parseErrors.length / results.data.length;
      if (errorRate > 0.1) {
        // More than 10% errors
        throw this.createError(
          ErrorType.CSV_PARSE_ERROR,
          `Too many parsing errors (${parseErrors.length}/${results.data.length} rows failed)`,
          { errors: parseErrors.slice(0, 10) }, // Show first 10 errors
          true
        );
      }
    }

    if (signalEvents.length === 0) {
      throw this.createError(
        ErrorType.CSV_PARSE_ERROR,
        'No valid signal events found in CSV file',
        { parseErrors },
        true
      );
    }

    // Sort events by timestamp
    signalEvents.sort((a, b) => a.timestamp - b.timestamp);

    return signalEvents;
  }

  /**
   * Convert a CSV row to a SignalEvent
   */
  private convertRowToSignalEvent(
    row: any,
    config: CsvParserConfig,
    rowNumber: number
  ): SignalEvent | null {
    const timestampStr = row[config.timestampColumn];
    const signalName = row[config.signalColumn];
    const value = row[config.valueColumn];

    // Skip rows with missing required data
    if (!timestampStr || !signalName || value === undefined || value === null) {
      return null;
    }

    // Parse timestamp based on format
    let timestamp: number;

    try {
      switch (config.timestampFormat) {
        case 'unix':
          timestamp = parseFloat(timestampStr);
          if (isNaN(timestamp)) {
            throw new Error(`Invalid unix timestamp: ${timestampStr}`);
          }
          // Convert to milliseconds if timestamp is in seconds
          if (timestamp < 1e12) {
            timestamp = timestamp * 1000;
          }
          break;

        case 'iso8601':
          timestamp = new Date(timestampStr).getTime();
          if (isNaN(timestamp)) {
            throw new Error(`Invalid ISO8601 timestamp: ${timestampStr}`);
          }
          break;

        case 'custom':
          // For now, treat custom as unix timestamp
          // Could be extended to support custom parsing logic
          timestamp = parseFloat(timestampStr);
          if (isNaN(timestamp)) {
            throw new Error(`Invalid custom timestamp: ${timestampStr}`);
          }
          break;

        default:
          throw new Error(
            `Unsupported timestamp format: ${config.timestampFormat}`
          );
      }
    } catch (error) {
      throw this.createError(
        ErrorType.INVALID_TIMESTAMP,
        `Row ${rowNumber}: ${error instanceof Error ? error.message : 'Invalid timestamp'}`,
        { row, timestampStr },
        true
      );
    }

    return {
      timestamp,
      signalName: signalName.toString().trim(),
      value: value.toString().trim(),
    };
  }

  /**
   * Create a standardized error object
   */
  private createError(
    type: ErrorType,
    message: string,
    details?: any,
    recoverable: boolean = false
  ): AppError {
    return {
      type,
      message,
      details,
      recoverable,
    };
  }
}

// Export singleton instance
export const csvParserService = new CsvParserService();
export { CsvParserService };
