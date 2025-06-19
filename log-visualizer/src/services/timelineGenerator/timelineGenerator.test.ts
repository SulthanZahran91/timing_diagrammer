import TimelineGeneratorService, {
  timelineGeneratorService,
} from './timelineGenerator';
import {
  SignalTimeline,
  TimelineGenerationConfig,
  TimelineValidationResult,
  TimelineStats,
  DEFAULT_TIMELINE_CONFIG,
} from './timelineGenerator.types';
import { SignalEvent, ErrorType } from '../csvParser/csvParser.types';

describe('TimelineGeneratorService', () => {
  let service: TimelineGeneratorService;

  beforeEach(() => {
    service = new TimelineGeneratorService();
  });

  describe('generateTimelines', () => {
    it('should group events by signal name and create timelines', async () => {
      const events: SignalEvent[] = [
        { timestamp: 1000, signalName: 'CLK', value: '0' },
        { timestamp: 1010, signalName: 'CLK', value: '1' },
        { timestamp: 1005, signalName: 'DATA', value: '0xFF' },
        { timestamp: 1015, signalName: 'DATA', value: '0x00' },
        { timestamp: 1020, signalName: 'CLK', value: '0' },
      ];

      const timelines = await service.generateTimelines(events);

      expect(timelines).toHaveLength(2);

      const clkTimeline = timelines.find(t => t.signalName === 'CLK');
      const dataTimeline = timelines.find(t => t.signalName === 'DATA');

      expect(clkTimeline).toBeDefined();
      expect(clkTimeline!.events).toHaveLength(3);
      expect(clkTimeline!.events[0]).toEqual({ timestamp: 1000, value: '0' });
      expect(clkTimeline!.events[1]).toEqual({ timestamp: 1010, value: '1' });
      expect(clkTimeline!.events[2]).toEqual({ timestamp: 1020, value: '0' });

      expect(dataTimeline).toBeDefined();
      expect(dataTimeline!.events).toHaveLength(2);
      expect(dataTimeline!.events[0]).toEqual({
        timestamp: 1005,
        value: '0xFF',
      });
      expect(dataTimeline!.events[1]).toEqual({
        timestamp: 1015,
        value: '0x00',
      });
    });

    it('should sort events by timestamp when sortEvents is true', async () => {
      const events: SignalEvent[] = [
        { timestamp: 1020, signalName: 'CLK', value: '0' },
        { timestamp: 1000, signalName: 'CLK', value: '1' },
        { timestamp: 1010, signalName: 'CLK', value: '0' },
      ];

      const config: TimelineGenerationConfig = {
        ...DEFAULT_TIMELINE_CONFIG,
        sortEvents: true,
      };

      const timelines = await service.generateTimelines(events, config);
      const clkTimeline = timelines[0];

      expect(clkTimeline.events[0].timestamp).toBe(1000);
      expect(clkTimeline.events[1].timestamp).toBe(1010);
      expect(clkTimeline.events[2].timestamp).toBe(1020);
    });

    it('should handle duplicate timestamps based on merge strategy', async () => {
      const events: SignalEvent[] = [
        { timestamp: 1000, signalName: 'CLK', value: '0' },
        { timestamp: 1000, signalName: 'CLK', value: '1' },
        { timestamp: 1010, signalName: 'CLK', value: '0' },
      ];

      // Test 'last' strategy (default)
      const timelinesLast = await service.generateTimelines(events, {
        ...DEFAULT_TIMELINE_CONFIG,
        mergeStrategy: 'last',
      });
      expect(timelinesLast[0].events).toHaveLength(2);
      expect(timelinesLast[0].events[0].value).toBe('1'); // Last value for timestamp 1000

      // Test 'first' strategy
      const timelinesFirst = await service.generateTimelines(events, {
        ...DEFAULT_TIMELINE_CONFIG,
        mergeStrategy: 'first',
      });
      expect(timelinesFirst[0].events[0].value).toBe('0'); // First value for timestamp 1000

      // Test 'error' strategy
      await expect(
        service.generateTimelines(events, {
          ...DEFAULT_TIMELINE_CONFIG,
          mergeStrategy: 'error',
        })
      ).rejects.toThrow('Duplicate timestamp 1000 found');
    });

    it('should throw error for empty events array', async () => {
      await expect(service.generateTimelines([])).rejects.toMatchObject({
        type: ErrorType.CSV_PARSE_ERROR,
        message: 'No signal events provided for timeline generation',
      });
    });

    it('should throw error for invalid events', async () => {
      await expect(
        service.generateTimelines(null as any)
      ).rejects.toMatchObject({
        type: ErrorType.CSV_PARSE_ERROR,
      });
    });

    it('should validate timelines when validateOrder is true', async () => {
      const events: SignalEvent[] = [
        { timestamp: 1010, signalName: 'CLK', value: '0' },
        { timestamp: 1000, signalName: 'CLK', value: '1' }, // Out of order
      ];

      await expect(
        service.generateTimelines(events, {
          ...DEFAULT_TIMELINE_CONFIG,
          sortEvents: false, // Don't sort to test validation
          validateOrder: true,
        })
      ).rejects.toMatchObject({
        type: ErrorType.CSV_PARSE_ERROR,
        message: expect.stringContaining('Timeline validation failed'),
      });
    });
  });

  describe('validateTimelines', () => {
    it('should return valid result for properly ordered timelines', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: 'CLK',
          events: [
            { timestamp: 1000, value: '0' },
            { timestamp: 1010, value: '1' },
            { timestamp: 1020, value: '0' },
          ],
        },
      ];

      const result = service.validateTimelines(timelines);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.outOfOrderEvents).toBeUndefined();
    });

    it('should detect out-of-order events', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: 'CLK',
          events: [
            { timestamp: 1000, value: '0' },
            { timestamp: 1020, value: '1' },
            { timestamp: 1010, value: '0' }, // Out of order
          ],
        },
      ];

      const result = service.validateTimelines(timelines);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('out-of-order event');
      expect(result.outOfOrderEvents).toHaveLength(1);
      expect(result.outOfOrderEvents![0]).toMatchObject({
        signalName: 'CLK',
        eventIndex: 2,
        timestamp: 1010,
        previousTimestamp: 1020,
      });
    });

    it('should detect duplicate timestamps and provide warnings', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: 'CLK',
          events: [
            { timestamp: 1000, value: '0' },
            { timestamp: 1000, value: '1' }, // Duplicate timestamp
          ],
        },
      ];

      const result = service.validateTimelines(timelines);

      expect(result.isValid).toBe(true); // Duplicates are warnings, not errors
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('duplicate timestamp');
      expect(result.duplicateEvents).toHaveLength(1);
      expect(result.duplicateEvents![0]).toMatchObject({
        signalName: 'CLK',
        timestamp: 1000,
        values: ['0', '1'],
      });
    });

    it('should detect empty signal names', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: '',
          events: [{ timestamp: 1000, value: '0' }],
        },
      ];

      const result = service.validateTimelines(timelines);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Signal timeline has empty or invalid signal name'
      );
    });

    it('should warn about empty event arrays', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: 'CLK',
          events: [],
        },
      ];

      const result = service.validateTimelines(timelines);

      expect(result.isValid).toBe(true); // Empty events are warnings
      expect(result.warnings).toContain("Signal 'CLK' has no events");
    });
  });

  describe('getTimelineStats', () => {
    it('should calculate correct statistics for multiple timelines', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: 'CLK',
          events: [
            { timestamp: 1000, value: '0' },
            { timestamp: 1010, value: '1' },
            { timestamp: 1020, value: '0' },
          ],
        },
        {
          signalName: 'DATA',
          events: [
            { timestamp: 1005, value: '0xFF' },
            { timestamp: 1015, value: '0x00' },
          ],
        },
      ];

      const stats = service.getTimelineStats(timelines);

      expect(stats.totalSignals).toBe(2);
      expect(stats.totalEvents).toBe(5);
      expect(stats.timeRange.startTime).toBe(1000);
      expect(stats.timeRange.endTime).toBe(1020);

      expect(stats.signalStats).toHaveLength(2);

      const clkStats = stats.signalStats.find(s => s.signalName === 'CLK');
      expect(clkStats).toBeDefined();
      expect(clkStats!.eventCount).toBe(3);
      expect(clkStats!.uniqueValues).toEqual(['0', '1']);
      expect(clkStats!.timeRange.startTime).toBe(1000);
      expect(clkStats!.timeRange.endTime).toBe(1020);

      const dataStats = stats.signalStats.find(s => s.signalName === 'DATA');
      expect(dataStats).toBeDefined();
      expect(dataStats!.eventCount).toBe(2);
      expect(dataStats!.uniqueValues).toEqual(['0xFF', '0x00']);
      expect(dataStats!.timeRange.startTime).toBe(1005);
      expect(dataStats!.timeRange.endTime).toBe(1015);
    });

    it('should handle empty timelines array', () => {
      const stats = service.getTimelineStats([]);

      expect(stats.totalSignals).toBe(0);
      expect(stats.totalEvents).toBe(0);
      expect(stats.timeRange.startTime).toBe(0);
      expect(stats.timeRange.endTime).toBe(0);
      expect(stats.signalStats).toHaveLength(0);
    });

    it('should handle timelines with no events', () => {
      const timelines: SignalTimeline[] = [{ signalName: 'CLK', events: [] }];

      const stats = service.getTimelineStats(timelines);

      expect(stats.totalSignals).toBe(1);
      expect(stats.totalEvents).toBe(0);
      expect(stats.signalStats[0].eventCount).toBe(0);
      expect(stats.signalStats[0].uniqueValues).toEqual([]);
    });
  });

  describe('mergeTimelines', () => {
    it('should merge timelines with same signal names', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: 'CLK',
          events: [{ timestamp: 1000, value: '0' }],
        },
        {
          signalName: 'CLK',
          events: [{ timestamp: 1010, value: '1' }],
        },
        {
          signalName: 'DATA',
          events: [{ timestamp: 1005, value: '0xFF' }],
        },
      ];

      const merged = service.mergeTimelines(timelines);

      expect(merged).toHaveLength(2);

      const clkTimeline = merged.find(t => t.signalName === 'CLK');
      expect(clkTimeline!.events).toHaveLength(2);
      expect(clkTimeline!.events[0]).toEqual({ timestamp: 1000, value: '0' });
      expect(clkTimeline!.events[1]).toEqual({ timestamp: 1010, value: '1' });

      const dataTimeline = merged.find(t => t.signalName === 'DATA');
      expect(dataTimeline!.events).toHaveLength(1);
    });

    it('should sort events after merging', () => {
      const timelines: SignalTimeline[] = [
        {
          signalName: 'CLK',
          events: [{ timestamp: 1010, value: '1' }],
        },
        {
          signalName: 'CLK',
          events: [{ timestamp: 1000, value: '0' }],
        },
      ];

      const merged = service.mergeTimelines(timelines);
      const clkTimeline = merged[0];

      expect(clkTimeline.events[0].timestamp).toBe(1000);
      expect(clkTimeline.events[1].timestamp).toBe(1010);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(timelineGeneratorService).toBeInstanceOf(TimelineGeneratorService);
      expect(timelineGeneratorService).toBe(timelineGeneratorService); // Same reference
    });
  });

  describe('edge cases', () => {
    it('should handle signals with special characters in names', async () => {
      const events: SignalEvent[] = [
        { timestamp: 1000, signalName: 'CLK_1/2', value: '0' },
        { timestamp: 1010, signalName: 'DATA[7:0]', value: '0xFF' },
        { timestamp: 1020, signalName: 'RESET#', value: '1' },
      ];

      const timelines = await service.generateTimelines(events);

      expect(timelines).toHaveLength(3);
      expect(timelines.map(t => t.signalName)).toEqual([
        'CLK_1/2',
        'DATA[7:0]',
        'RESET#',
      ]);
    });

    it('should handle very large timestamps', async () => {
      const events: SignalEvent[] = [
        {
          timestamp: Number.MAX_SAFE_INTEGER - 1,
          signalName: 'CLK',
          value: '0',
        },
        { timestamp: Number.MAX_SAFE_INTEGER, signalName: 'CLK', value: '1' },
      ];

      const timelines = await service.generateTimelines(events);
      expect(timelines[0].events).toHaveLength(2);
    });

    it('should handle negative timestamps', async () => {
      const events: SignalEvent[] = [
        { timestamp: -1000, signalName: 'CLK', value: '0' },
        { timestamp: 0, signalName: 'CLK', value: '1' },
        { timestamp: 1000, signalName: 'CLK', value: '0' },
      ];

      const timelines = await service.generateTimelines(events);
      const stats = service.getTimelineStats(timelines);

      expect(stats.timeRange.startTime).toBe(-1000);
      expect(stats.timeRange.endTime).toBe(1000);
    });

    it('should handle allowDuplicates configuration', async () => {
      const events: SignalEvent[] = [
        { timestamp: 1000, signalName: 'CLK', value: '0' },
        { timestamp: 1000, signalName: 'CLK', value: '1' },
      ];

      const config: TimelineGenerationConfig = {
        ...DEFAULT_TIMELINE_CONFIG,
        allowDuplicates: true,
      };

      const timelines = await service.generateTimelines(events, config);
      expect(timelines[0].events).toHaveLength(2); // Both events should be preserved
    });
  });
});
