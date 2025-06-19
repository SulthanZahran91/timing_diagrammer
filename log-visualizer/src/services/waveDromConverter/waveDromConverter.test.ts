import { describe, it, expect, beforeEach } from 'bun:test';
import { WaveDromConverterService } from './waveDromConverter';
import { SignalEvent } from '../csvParser/csvParser.types';
import { TimeRange, ConversionConfig } from './waveDromConverter.types';

describe('WaveDromConverterService', () => {
  let service: WaveDromConverterService;

  beforeEach(() => {
    service = new WaveDromConverterService();
  });

  describe('convertToWaveDrom', () => {
    it('should convert basic digital signals correctly', () => {
      const events: SignalEvent[] = [
        { timestamp: 0, signalName: 'CLK', value: '0' },
        { timestamp: 10, signalName: 'CLK', value: '1' },
        { timestamp: 20, signalName: 'CLK', value: '0' },
        { timestamp: 30, signalName: 'CLK', value: '1' },
      ];

      const timeRange: TimeRange = { startTime: 0, endTime: 40 };
      const config: ConversionConfig = {
        resolution: 10,
        defaultValue: '.',
        dataThreshold: 8,
      };

      const result = service.convertToWaveDrom(events, timeRange, config);

      expect(result.validationResult.isValid).toBe(true);
      expect(result.diagram.signal).toHaveLength(1);

      const clkSignal = result.diagram.signal.find(s => s.name === 'CLK');
      expect(clkSignal).toBeDefined();
      expect(clkSignal!.wave).toBe('0101');
    });

    it('should handle data values when threshold is exceeded', () => {
      const events: SignalEvent[] = [
        { timestamp: 0, signalName: 'ADDR', value: '0x1000' },
        { timestamp: 10, signalName: 'ADDR', value: '0x1004' },
        { timestamp: 20, signalName: 'ADDR', value: '0x1008' },
        { timestamp: 30, signalName: 'ADDR', value: '0x100C' },
        { timestamp: 40, signalName: 'ADDR', value: '0x1010' },
        { timestamp: 50, signalName: 'ADDR', value: '0x1014' },
        { timestamp: 60, signalName: 'ADDR', value: '0x1018' },
        { timestamp: 70, signalName: 'ADDR', value: '0x101C' },
        { timestamp: 80, signalName: 'ADDR', value: '0x1020' },
      ];

      const timeRange: TimeRange = { startTime: 0, endTime: 90 };
      const config: ConversionConfig = {
        resolution: 10,
        defaultValue: '.',
        dataThreshold: 8,
      };

      const result = service.convertToWaveDrom(events, timeRange, config);

      const addrSignal = result.diagram.signal.find(s => s.name === 'ADDR');
      expect(addrSignal).toBeDefined();
      expect(addrSignal!.wave).toBe('=========');
      expect(addrSignal!.data).toEqual([
        '0x1000',
        '0x1004',
        '0x1008',
        '0x100C',
        '0x1010',
        '0x1014',
        '0x1018',
        '0x101C',
        '0x1020',
      ]);
    });

    it('should detect conflicts when multiple events occur in same time slot', () => {
      const events: SignalEvent[] = [
        { timestamp: 5, signalName: 'BUS', value: '0' },
        { timestamp: 8, signalName: 'BUS', value: '1' }, // Conflict in slot 0
        { timestamp: 25, signalName: 'BUS', value: 'z' }, // Event in slot 2
      ];

      const timeRange: TimeRange = { startTime: 0, endTime: 30 };
      const config: ConversionConfig = {
        resolution: 10,
        defaultValue: '.',
        dataThreshold: 8,
      };

      const result = service.convertToWaveDrom(events, timeRange, config);

      const busSignal = result.diagram.signal.find(s => s.name === 'BUS');
      expect(busSignal!.wave).toBe('x.z');
      expect(result.conflictData.BUS).toBeDefined();
      expect(result.conflictData.BUS[0]).toHaveLength(2);
      expect(result.stats.conflictsDetected).toBe(1);
    });

    it('should handle empty events gracefully', () => {
      const events: SignalEvent[] = [];
      const timeRange: TimeRange = { startTime: 0, endTime: 100 };

      const result = service.convertToWaveDrom(events, timeRange);

      expect(result.validationResult.isValid).toBe(false);
      expect(result.validationResult.errors).toContain('No events provided');
      expect(result.diagram.signal).toHaveLength(0);
    });

    it('should validate invalid time ranges', () => {
      const events: SignalEvent[] = [
        { timestamp: 50, signalName: 'CLK', value: '0' },
      ];
      const timeRange: TimeRange = { startTime: 100, endTime: 50 }; // Invalid range

      const result = service.convertToWaveDrom(events, timeRange);

      expect(result.validationResult.isValid).toBe(false);
      expect(result.validationResult.errors).toContain(
        'Invalid time range: start time must be before end time'
      );
    });

    it('should filter events outside time range', () => {
      const events: SignalEvent[] = [
        { timestamp: 5, signalName: 'CLK', value: '0' }, // Outside range
        { timestamp: 15, signalName: 'CLK', value: '1' }, // In range
        { timestamp: 25, signalName: 'CLK', value: '0' }, // In range
        { timestamp: 35, signalName: 'CLK', value: '1' }, // Outside range
      ];

      const timeRange: TimeRange = { startTime: 10, endTime: 30 };
      const config: ConversionConfig = {
        resolution: 10,
        defaultValue: '.',
        dataThreshold: 8,
      };

      const result = service.convertToWaveDrom(events, timeRange);

      const clkSignal = result.diagram.signal.find(s => s.name === 'CLK');
      expect(clkSignal!.wave).toBe('10');
      expect(result.validationResult.warnings).toContain(
        '2 events fall outside the time range'
      );
    });
  });

  describe('optimizeWaveString', () => {
    it('should collapse consecutive identical characters', () => {
      expect(service.optimizeWaveString('1111')).toBe('1...');
      expect(service.optimizeWaveString('0000')).toBe('0...');
      expect(service.optimizeWaveString('1010')).toBe('1010');
    });

    it('should not optimize continuation characters', () => {
      expect(service.optimizeWaveString('1..')).toBe('1..');
      expect(service.optimizeWaveString('...')).toBe('...');
    });

    it('should handle mixed patterns correctly', () => {
      expect(service.optimizeWaveString('111000111')).toBe('1..0..1..');
      expect(service.optimizeWaveString('1x1x1')).toBe('1x1x1');
    });

    it('should handle single character strings', () => {
      expect(service.optimizeWaveString('1')).toBe('1');
      expect(service.optimizeWaveString('')).toBe('');
    });
  });

  describe('generateWaveCharacter', () => {
    it('should map digital values correctly', () => {
      expect(service.generateWaveCharacter('0', false, false)).toBe('0');
      expect(service.generateWaveCharacter('1', false, false)).toBe('1');
      expect(service.generateWaveCharacter('x', false, false)).toBe('x');
      expect(service.generateWaveCharacter('z', false, false)).toBe('z');
    });

    it('should map alternative digital value formats', () => {
      expect(service.generateWaveCharacter('low', false, false)).toBe('0');
      expect(service.generateWaveCharacter('high', false, false)).toBe('1');
      expect(service.generateWaveCharacter('false', false, false)).toBe('0');
      expect(service.generateWaveCharacter('true', false, false)).toBe('1');
      expect(service.generateWaveCharacter('unknown', false, false)).toBe('x');
      expect(service.generateWaveCharacter('hi-z', false, false)).toBe('z');
    });

    it('should handle conflicts', () => {
      expect(service.generateWaveCharacter('any', true, false)).toBe('x');
    });

    it('should handle data notation', () => {
      expect(service.generateWaveCharacter('0xFF', false, true)).toBe('=');
      expect(service.generateWaveCharacter('data', false, true)).toBe('=');
    });

    it('should be case insensitive', () => {
      expect(service.generateWaveCharacter('X', false, false)).toBe('x');
      expect(service.generateWaveCharacter('Z', false, false)).toBe('z');
      expect(service.generateWaveCharacter('HIGH', false, false)).toBe('1');
      expect(service.generateWaveCharacter('LOW', false, false)).toBe('0');
    });
  });

  describe('detectDataValues', () => {
    it('should not use data notation for basic digital values', () => {
      const digitalValues = ['0', '1', 'x', 'z'];
      expect(service.detectDataValues(digitalValues, 4)).toBe(false);
    });

    it('should use data notation when threshold exceeded', () => {
      const manyValues = [
        'val1',
        'val2',
        'val3',
        'val4',
        'val5',
        'val6',
        'val7',
        'val8',
        'val9',
      ];
      expect(service.detectDataValues(manyValues, 8)).toBe(true);
    });

    it('should not use data notation when threshold not exceeded', () => {
      const fewValues = ['val1', 'val2', 'val3'];
      expect(service.detectDataValues(fewValues, 8)).toBe(false);
    });

    it('should handle mixed digital and data values', () => {
      const mixedValues = [
        '0',
        '1',
        'data1',
        'data2',
        'data3',
        'data4',
        'data5',
        'data6',
        'data7',
      ];
      expect(service.detectDataValues(mixedValues, 8)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle zero-duration time range', () => {
      const events: SignalEvent[] = [
        { timestamp: 10, signalName: 'CLK', value: '1' },
      ];
      const timeRange: TimeRange = { startTime: 10, endTime: 10 };

      const result = service.convertToWaveDrom(events, timeRange);
      expect(result.validationResult.isValid).toBe(false);
    });

    it('should handle very fine resolution', () => {
      const events: SignalEvent[] = [
        { timestamp: 0, signalName: 'CLK', value: '0' },
        { timestamp: 1, signalName: 'CLK', value: '1' },
      ];
      const timeRange: TimeRange = { startTime: 0, endTime: 10 };
      const config: ConversionConfig = {
        resolution: 1,
        defaultValue: '.',
        dataThreshold: 8,
      };

      const result = service.convertToWaveDrom(events, timeRange, config);
      expect(result.stats.totalSlots).toBe(10);
    });

    it('should handle signals with no events in time range', () => {
      const events: SignalEvent[] = [
        { timestamp: 100, signalName: 'CLK', value: '0' }, // Outside range
      ];
      const timeRange: TimeRange = { startTime: 0, endTime: 50 };

      const result = service.convertToWaveDrom(events, timeRange);
      expect(result.validationResult.warnings).toContain(
        'No events fall within the specified time range'
      );
    });

    it('should handle duplicate events with same value in same slot', () => {
      const events: SignalEvent[] = [
        { timestamp: 5, signalName: 'DATA', value: '1' },
        { timestamp: 8, signalName: 'DATA', value: '1' }, // Same value, same slot
      ];
      const timeRange: TimeRange = { startTime: 0, endTime: 20 };
      const config: ConversionConfig = {
        resolution: 10,
        defaultValue: '.',
        dataThreshold: 8,
      };

      const result = service.convertToWaveDrom(events, timeRange);
      const dataSignal = result.diagram.signal.find(s => s.name === 'DATA');
      expect(dataSignal!.wave).toBe('1.');
      expect(result.stats.conflictsDetected).toBe(0);
    });
  });
});
