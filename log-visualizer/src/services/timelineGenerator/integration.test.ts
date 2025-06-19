/**
 * Integration test demonstrating CSV Parser -> Timeline Generator workflow
 * This test shows how PBI-004 integrates with existing CSV parsing functionality
 */

import { timelineGeneratorService } from './timelineGenerator';
import { SignalEvent } from '../csvParser/csvParser.types';

describe('Timeline Generator Integration', () => {
  it('should process CSV parser output and create organized timelines', async () => {
    // Simulate output from CSV parser (PBI-002)
    const csvParserOutput: SignalEvent[] = [
      { timestamp: 1000, signalName: 'CLK', value: '0' },
      { timestamp: 1005, signalName: 'DATA[7:0]', value: '0xFF' },
      { timestamp: 1010, signalName: 'CLK', value: '1' },
      { timestamp: 1015, signalName: 'RESET#', value: '0' },
      { timestamp: 1020, signalName: 'CLK', value: '0' },
      { timestamp: 1025, signalName: 'DATA[7:0]', value: '0x00' },
      { timestamp: 1030, signalName: 'CLK', value: '1' },
      { timestamp: 1035, signalName: 'RESET#', value: '1' },
      { timestamp: 1040, signalName: 'CLK', value: '0' },
    ];

    // Generate timelines using PBI-004 implementation
    const timelines =
      await timelineGeneratorService.generateTimelines(csvParserOutput);

    // Verify results meet acceptance criteria
    expect(timelines).toHaveLength(3); // CLK, DATA[7:0], RESET#

    // Verify signals are correctly grouped
    const signalNames = timelines.map(t => t.signalName).sort();
    expect(signalNames).toEqual(['CLK', 'DATA[7:0]', 'RESET#']);

    // Verify chronological order is maintained
    for (const timeline of timelines) {
      for (let i = 1; i < timeline.events.length; i++) {
        expect(timeline.events[i].timestamp).toBeGreaterThanOrEqual(
          timeline.events[i - 1].timestamp
        );
      }
    }

    // Verify CLK timeline has expected events
    const clkTimeline = timelines.find(t => t.signalName === 'CLK')!;
    expect(clkTimeline.events).toEqual([
      { timestamp: 1000, value: '0' },
      { timestamp: 1010, value: '1' },
      { timestamp: 1020, value: '0' },
      { timestamp: 1030, value: '1' },
      { timestamp: 1040, value: '0' },
    ]);

    // Verify DATA timeline has expected events
    const dataTimeline = timelines.find(t => t.signalName === 'DATA[7:0]')!;
    expect(dataTimeline.events).toEqual([
      { timestamp: 1005, value: '0xFF' },
      { timestamp: 1025, value: '0x00' },
    ]);

    // Verify RESET timeline has expected events
    const resetTimeline = timelines.find(t => t.signalName === 'RESET#')!;
    expect(resetTimeline.events).toEqual([
      { timestamp: 1015, value: '0' },
      { timestamp: 1035, value: '1' },
    ]);
  });

  it('should detect data inconsistencies in CSV output', async () => {
    // Simulate CSV parser output with data issues
    const problematicData: SignalEvent[] = [
      { timestamp: 1000, signalName: 'CLK', value: '0' },
      { timestamp: 1020, signalName: 'CLK', value: '1' }, // Out of order with next
      { timestamp: 1010, signalName: 'CLK', value: '0' }, // This should be detected
      { timestamp: 1005, signalName: 'DATA', value: '0xFF' },
      { timestamp: 1005, signalName: 'DATA', value: '0x00' }, // Duplicate timestamp
    ];

    // This should throw due to duplicate timestamp error
    await expect(
      timelineGeneratorService.generateTimelines(problematicData, {
        sortEvents: false, // Don't auto-fix to test validation
        allowDuplicates: false,
        mergeStrategy: 'error',
        validateOrder: true,
      })
    ).rejects.toThrow('Duplicate timestamp 1005 found');

    // But with auto-correction enabled, it should work
    const correctedTimelines = await timelineGeneratorService.generateTimelines(
      problematicData,
      {
        sortEvents: true, // Auto-sort to fix order
        allowDuplicates: false,
        mergeStrategy: 'last', // Use last value for duplicates
        validateOrder: true,
      }
    );

    expect(correctedTimelines).toHaveLength(2);

    // Verify CLK events are now in correct order
    const clkTimeline = correctedTimelines.find(t => t.signalName === 'CLK')!;
    expect(clkTimeline.events[0].timestamp).toBe(1000);
    expect(clkTimeline.events[1].timestamp).toBe(1010);
    expect(clkTimeline.events[2].timestamp).toBe(1020);

    // Verify DATA duplicate was resolved
    const dataTimeline = correctedTimelines.find(t => t.signalName === 'DATA')!;
    expect(dataTimeline.events).toHaveLength(1);
    expect(dataTimeline.events[0].value).toBe('0x00'); // 'last' strategy
  });

  it('should provide statistics for analysis and UI display', async () => {
    const events: SignalEvent[] = [
      { timestamp: 1000, signalName: 'CLK', value: '0' },
      { timestamp: 1010, signalName: 'CLK', value: '1' },
      { timestamp: 1020, signalName: 'CLK', value: '0' },
      { timestamp: 1005, signalName: 'DATA', value: '0xFF' },
      { timestamp: 1015, signalName: 'DATA', value: '0x00' },
      { timestamp: 1025, signalName: 'DATA', value: '0x55' },
    ];

    const timelines = await timelineGeneratorService.generateTimelines(events);
    const stats = timelineGeneratorService.getTimelineStats(timelines);

    // Verify overall statistics
    expect(stats.totalSignals).toBe(2);
    expect(stats.totalEvents).toBe(6);
    expect(stats.timeRange.startTime).toBe(1000);
    expect(stats.timeRange.endTime).toBe(1025);

    // Verify per-signal statistics
    const clkStats = stats.signalStats.find(s => s.signalName === 'CLK')!;
    expect(clkStats.eventCount).toBe(3);
    expect(clkStats.uniqueValues).toEqual(['0', '1']);
    expect(clkStats.timeRange.startTime).toBe(1000);
    expect(clkStats.timeRange.endTime).toBe(1020);

    const dataStats = stats.signalStats.find(s => s.signalName === 'DATA')!;
    expect(dataStats.eventCount).toBe(3);
    expect(dataStats.uniqueValues).toEqual(['0xFF', '0x00', '0x55']);
    expect(dataStats.timeRange.startTime).toBe(1005);
    expect(dataStats.timeRange.endTime).toBe(1025);
  });

  it('should handle edge cases from real-world CSV data', async () => {
    // Test with realistic signal names and values
    const realWorldData: SignalEvent[] = [
      { timestamp: 0, signalName: 'system_clock', value: '0' },
      { timestamp: 5000000, signalName: 'system_clock', value: '1' }, // 5ns
      { timestamp: 10000000, signalName: 'system_clock', value: '0' }, // 10ns
      {
        timestamp: 2000000,
        signalName: 'cpu_data_bus[31:0]',
        value: '0x12345678',
      },
      {
        timestamp: 8000000,
        signalName: 'cpu_data_bus[31:0]',
        value: '0xDEADBEEF',
      },
      { timestamp: 1000000, signalName: 'interrupt_req_n', value: 'Z' }, // High impedance
      { timestamp: 12000000, signalName: 'interrupt_req_n', value: '0' },
      { timestamp: 15000000, signalName: 'interrupt_req_n', value: 'Z' },
    ];

    const timelines =
      await timelineGeneratorService.generateTimelines(realWorldData);

    expect(timelines).toHaveLength(3);

    // Verify all signal types are handled
    const signalNames = timelines.map(t => t.signalName).sort();
    expect(signalNames).toEqual([
      'cpu_data_bus[31:0]',
      'interrupt_req_n',
      'system_clock',
    ]);

    // Verify high-impedance values are preserved
    const interruptTimeline = timelines.find(
      t => t.signalName === 'interrupt_req_n'
    )!;
    expect(interruptTimeline.events[0].value).toBe('Z');
    expect(interruptTimeline.events[2].value).toBe('Z');

    // Verify hex data values are preserved
    const dataTimeline = timelines.find(
      t => t.signalName === 'cpu_data_bus[31:0]'
    )!;
    expect(dataTimeline.events[0].value).toBe('0x12345678');
    expect(dataTimeline.events[1].value).toBe('0xDEADBEEF');
  });
});
