import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { csvParserService, CsvParserService } from './csvParser';
import {
  CsvParserConfig,
  ErrorType,
  DEFAULT_CSV_CONFIG,
  SignalEvent,
} from './csvParser.types';

// Mock PapaParse using Bun's mocking
const mockPapaParse = mock(() => {});

mock.module('papaparse', () => ({
  default: {
    parse: mockPapaParse,
  },
}));

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(() => {
    service = new CsvParserService();
    mockPapaParse.mockClear();
  });

  describe('validateFormat', () => {
    it('should validate correct headers', () => {
      const headers = ['timestamp', 'signal_name', 'value'];
      const result = service.validateFormat(headers);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required columns', () => {
      const headers = ['timestamp', 'signal_name']; // missing 'value'
      const result = service.validateFormat(headers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required column: value');
    });

    it('should detect duplicate headers', () => {
      const headers = ['timestamp', 'signal_name', 'value', 'timestamp'];
      const result = service.validateFormat(headers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate columns found: timestamp');
    });

    it('should warn about extra columns', () => {
      const headers = ['timestamp', 'signal_name', 'value', 'extra_column'];
      const result = service.validateFormat(headers);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Extra columns will be ignored: extra_column'
      );
    });

    it('should handle case-insensitive column matching', () => {
      const headers = ['TIMESTAMP', 'Signal_Name', 'VALUE'];
      const result = service.validateFormat(headers);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('parseFile', () => {
    const createMockFile = (name: string, size: number = 1000): File => {
      const blob = new Blob(['mock content'], { type: 'text/csv' });
      Object.defineProperty(blob, 'name', { value: name });
      Object.defineProperty(blob, 'size', { value: size });
      return blob as File;
    };

    it('should reject files that are too large', async () => {
      const largeFile = createMockFile('large.csv', 60 * 1024 * 1024); // 60MB

      await expect(service.parseFile(largeFile)).rejects.toMatchObject({
        type: ErrorType.FILE_TOO_LARGE,
        message: expect.stringContaining('exceeds maximum allowed size'),
      });
    });

    it('should reject non-CSV files', async () => {
      const txtFile = createMockFile('data.txt');

      await expect(service.parseFile(txtFile)).rejects.toMatchObject({
        type: ErrorType.UNSUPPORTED_FORMAT,
        message: 'Only CSV files are supported',
      });
    });

    it('should successfully parse valid CSV file', async () => {
      const csvFile = createMockFile('data.csv');
      const mockData = [
        { timestamp: '1000', signal_name: 'CLK', value: '0' },
        { timestamp: '1010', signal_name: 'CLK', value: '1' },
        { timestamp: '1015', signal_name: 'DATA', value: '0xFF' },
      ];

      mockPapaParse.mockImplementation((file: any, options?: any) => {
        setTimeout(() => {
          if (options?.complete) {
            options.complete({
              data: mockData,
              errors: [],
              meta: { fields: ['timestamp', 'signal_name', 'value'] },
            });
          }
        }, 0);
        return {} as any;
      });

      const result = await service.parseFile(csvFile);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        timestamp: 1000000, // Should be converted to milliseconds
        signalName: 'CLK',
        value: '0',
      });
    });

    it('should handle Papa Parse errors', async () => {
      const csvFile = createMockFile('data.csv');

      mockPapaParse.mockImplementation((file: any, options?: any) => {
        setTimeout(() => {
          if (options?.error) {
            options.error({ message: 'Parse error' });
          }
        }, 0);
        return {} as any;
      });

      await expect(service.parseFile(csvFile)).rejects.toMatchObject({
        type: ErrorType.CSV_PARSE_ERROR,
        message: expect.stringContaining('Failed to parse CSV'),
      });
    });

    it('should handle empty CSV files', async () => {
      const csvFile = createMockFile('empty.csv');

      mockPapaParse.mockImplementation((file: any, options?: any) => {
        setTimeout(() => {
          if (options?.complete) {
            options.complete({
              data: [],
              errors: [],
              meta: { fields: [] },
            });
          }
        }, 0);
        return {} as any;
      });

      await expect(service.parseFile(csvFile)).rejects.toMatchObject({
        type: ErrorType.CSV_PARSE_ERROR,
        message: 'CSV file is empty or contains no valid data',
      });
    });

    it('should handle invalid timestamps', async () => {
      const csvFile = createMockFile('data.csv');
      const mockData = [
        { timestamp: 'invalid', signal_name: 'CLK', value: '0' },
      ];

      mockPapaParse.mockImplementation((file: any, options?: any) => {
        setTimeout(() => {
          if (options?.complete) {
            options.complete({
              data: mockData,
              errors: [],
              meta: { fields: ['timestamp', 'signal_name', 'value'] },
            });
          }
        }, 0);
        return {} as any;
      });

      await expect(service.parseFile(csvFile)).rejects.toMatchObject({
        type: ErrorType.CSV_PARSE_ERROR,
        message: expect.stringContaining('Too many parsing errors'),
      });
    });

    it('should handle ISO8601 timestamps', async () => {
      const csvFile = createMockFile('data.csv');
      const mockData = [
        {
          timestamp: '2023-01-01T00:00:01.000Z',
          signal_name: 'CLK',
          value: '0',
        },
      ];
      const config: CsvParserConfig = {
        ...DEFAULT_CSV_CONFIG,
        timestampFormat: 'iso8601',
      };

      mockPapaParse.mockImplementation((file: any, options?: any) => {
        setTimeout(() => {
          if (options?.complete) {
            options.complete({
              data: mockData,
              errors: [],
              meta: { fields: ['timestamp', 'signal_name', 'value'] },
            });
          }
        }, 0);
        return {} as any;
      });

      const result = await service.parseFile(csvFile, config);

      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBe(
        new Date('2023-01-01T00:00:01.000Z').getTime()
      );
    });

    it('should skip rows with missing data', async () => {
      const csvFile = createMockFile('data.csv');
      const mockData = [
        { timestamp: '1000', signal_name: 'CLK', value: '0' },
        { timestamp: '', signal_name: 'CLK', value: '1' }, // Missing timestamp
        { timestamp: '1020', signal_name: '', value: '0' }, // Missing signal name
        { timestamp: '1030', signal_name: 'DATA', value: '0xFF' },
      ];

      mockPapaParse.mockImplementation((file: any, options?: any) => {
        setTimeout(() => {
          if (options?.complete) {
            options.complete({
              data: mockData,
              errors: [],
              meta: { fields: ['timestamp', 'signal_name', 'value'] },
            });
          }
        }, 0);
        return {} as any;
      });

      const result = await service.parseFile(csvFile);

      expect(result).toHaveLength(2); // Only valid rows
    });

    it('should sort events by timestamp', async () => {
      const csvFile = createMockFile('data.csv');
      const mockData = [
        { timestamp: '1020', signal_name: 'CLK', value: '0' },
        { timestamp: '1000', signal_name: 'CLK', value: '1' },
        { timestamp: '1010', signal_name: 'DATA', value: '0xFF' },
      ];

      mockPapaParse.mockImplementation((file: any, options?: any) => {
        setTimeout(() => {
          if (options?.complete) {
            options.complete({
              data: mockData,
              errors: [],
              meta: { fields: ['timestamp', 'signal_name', 'value'] },
            });
          }
        }, 0);
        return {} as any;
      });

      const result = await service.parseFile(csvFile);

      expect(result).toHaveLength(3);
      expect(result[0].timestamp).toBe(1000000);
      expect(result[1].timestamp).toBe(1010000);
      expect(result[2].timestamp).toBe(1020000);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(csvParserService).toBeTruthy();
      expect(typeof csvParserService.parseFile).toBe('function');
      expect(typeof csvParserService.validateFormat).toBe('function');
    });
  });
});
