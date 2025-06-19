import { SignalEvent, ValidationResult } from '../csvParser/csvParser.types';
import {
  TimeRange,
  ConversionConfig,
  DEFAULT_CONVERSION_CONFIG,
  SlotEvent,
  SlotMap,
  ConflictData,
  WaveDromConversionResult,
  WaveDromDiagram,
  WaveDromSignal,
  IWaveDromConverterService,
} from './waveDromConverter.types';

export class WaveDromConverterService implements IWaveDromConverterService {
  convertToWaveDrom(
    events: SignalEvent[],
    timeRange: TimeRange,
    config: ConversionConfig = DEFAULT_CONVERSION_CONFIG
  ): WaveDromConversionResult {
    const validationResult = this.validateInput(events, timeRange);
    if (!validationResult.isValid) {
      return {
        diagram: { signal: [] },
        conflictData: {},
        stats: {
          totalSlots: 0,
          signalsProcessed: 0,
          conflictsDetected: 0,
          timeRange,
          resolution: config.resolution,
        },
        validationResult,
      };
    }

    // Group events by signal name
    const signalGroups = this.groupEventsBySignal(events);

    // Calculate total slots based on time range and resolution
    const totalSlots = Math.ceil(
      (timeRange.endTime - timeRange.startTime) / config.resolution
    );

    const signals: WaveDromSignal[] = [];
    const conflictData: ConflictData = {};
    let totalConflicts = 0;

    // Process each signal
    for (const [signalName, signalEvents] of Object.entries(signalGroups)) {
      const result = this.processSignal(
        signalName,
        signalEvents,
        timeRange,
        config,
        totalSlots
      );
      signals.push(result.signal);

      if (result.conflicts && Object.keys(result.conflicts).length > 0) {
        conflictData[signalName] = result.conflicts;
        totalConflicts += Object.keys(result.conflicts).length;
      }
    }

    const diagram: WaveDromDiagram = {
      signal: signals,
      config: {
        hscale: 1,
      },
    };

    return {
      diagram,
      conflictData,
      stats: {
        totalSlots,
        signalsProcessed: signals.length,
        conflictsDetected: totalConflicts,
        timeRange,
        resolution: config.resolution,
      },
      validationResult,
    };
  }

  private validateInput(
    events: SignalEvent[],
    timeRange: TimeRange
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!events || events.length === 0) {
      errors.push('No events provided');
    }

    if (timeRange.startTime >= timeRange.endTime) {
      errors.push('Invalid time range: start time must be before end time');
    }

    if (timeRange.endTime - timeRange.startTime <= 0) {
      errors.push('Time range must be positive');
    }

    // Check if events fall within time range
    const eventsInRange = events.filter(
      e =>
        e.timestamp >= timeRange.startTime && e.timestamp <= timeRange.endTime
    );

    if (eventsInRange.length === 0 && events.length > 0) {
      warnings.push('No events fall within the specified time range');
    } else if (eventsInRange.length < events.length) {
      warnings.push(
        `${events.length - eventsInRange.length} events fall outside the time range`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private groupEventsBySignal(
    events: SignalEvent[]
  ): Record<string, SignalEvent[]> {
    return events.reduce(
      (groups, event) => {
        if (!groups[event.signalName]) {
          groups[event.signalName] = [];
        }
        groups[event.signalName].push(event);
        return groups;
      },
      {} as Record<string, SignalEvent[]>
    );
  }

  private processSignal(
    signalName: string,
    events: SignalEvent[],
    timeRange: TimeRange,
    config: ConversionConfig,
    totalSlots: number
  ): { signal: WaveDromSignal; conflicts?: Record<number, SlotEvent[]> } {
    // Step 1: Build intermediate slot map
    const slotMap = this.buildSlotMap(events, timeRange, config.resolution);

    // Step 2: Collect unique values to determine if we should use data notation
    const uniqueValues = this.getUniqueValues(events);
    const useDataNotation = this.detectDataValues(
      uniqueValues,
      config.dataThreshold
    );

    // Step 3: Generate wave string and handle conflicts
    const { wave, data, conflicts } = this.generateWaveString(
      slotMap,
      totalSlots,
      config.defaultValue,
      useDataNotation,
      uniqueValues
    );

    // Step 4: Optimize wave string
    const optimizedWave = this.optimizeWaveString(wave);

    const signal: WaveDromSignal = {
      name: signalName,
      wave: optimizedWave,
    };

    if (useDataNotation && data.length > 0) {
      signal.data = data;
    }

    return { signal, conflicts };
  }

  private buildSlotMap(
    events: SignalEvent[],
    timeRange: TimeRange,
    resolution: number
  ): SlotMap {
    const slotMap: SlotMap = {};

    for (const event of events) {
      // Only process events within time range
      if (
        event.timestamp >= timeRange.startTime &&
        event.timestamp <= timeRange.endTime
      ) {
        const slotIndex = Math.floor(
          (event.timestamp - timeRange.startTime) / resolution
        );

        if (!slotMap[slotIndex]) {
          slotMap[slotIndex] = [];
        }

        slotMap[slotIndex].push({
          timestamp: event.timestamp,
          value: event.value,
        });
      }
    }

    return slotMap;
  }

  private getUniqueValues(events: SignalEvent[]): string[] {
    const uniqueSet = new Set<string>();
    events.forEach(event => uniqueSet.add(event.value));
    return Array.from(uniqueSet);
  }

  detectDataValues(uniqueValues: string[], threshold: number): boolean {
    // Don't use data notation for basic digital signals
    const digitalValues = new Set(['0', '1', 'x', 'z', 'X', 'Z']);
    const hasOnlyDigitalValues = uniqueValues.every(val =>
      digitalValues.has(val)
    );

    if (hasOnlyDigitalValues) {
      return false;
    }

    return uniqueValues.length > threshold;
  }

  private generateWaveString(
    slotMap: SlotMap,
    totalSlots: number,
    defaultValue: string,
    useDataNotation: boolean,
    uniqueValues: string[]
  ): { wave: string; data: string[]; conflicts?: Record<number, SlotEvent[]> } {
    let wave = '';
    const data: string[] = [];
    const conflicts: Record<number, SlotEvent[]> = {};

    for (let slot = 0; slot < totalSlots; slot++) {
      const slotEvents = slotMap[slot] || [];

      if (slotEvents.length === 0) {
        // No events in this slot - continue previous state
        wave += defaultValue;
      } else if (slotEvents.length === 1) {
        // Single event in slot
        const event = slotEvents[0];
        const waveChar = this.generateWaveCharacter(
          event.value,
          false,
          useDataNotation
        );
        wave += waveChar;

        if (useDataNotation && waveChar === '=') {
          data.push(event.value);
        }
      } else {
        // Multiple events in slot - check for conflicts
        const uniqueSlotValues = [...new Set(slotEvents.map(e => e.value))];

        if (uniqueSlotValues.length === 1) {
          // All events have same value - treat as single event
          const waveChar = this.generateWaveCharacter(
            uniqueSlotValues[0],
            false,
            useDataNotation
          );
          wave += waveChar;

          if (useDataNotation && waveChar === '=') {
            data.push(uniqueSlotValues[0]);
          }
        } else {
          // True conflict - different values in same slot
          wave += 'x';
          conflicts[slot] = slotEvents;
        }
      }
    }

    return {
      wave,
      data,
      conflicts: Object.keys(conflicts).length > 0 ? conflicts : undefined,
    };
  }

  generateWaveCharacter(
    value: string,
    isConflict: boolean,
    isData: boolean
  ): string {
    if (isConflict) {
      return 'x';
    }

    if (isData) {
      return '=';
    }

    // Map common digital values
    switch (value.toLowerCase()) {
      case '0':
      case 'low':
      case 'false':
        return '0';
      case '1':
      case 'high':
      case 'true':
        return '1';
      case 'x':
      case 'unknown':
      case 'undefined':
        return 'x';
      case 'z':
      case 'hi-z':
      case 'highz':
      case 'high-impedance':
        return 'z';
      default:
        // For non-standard values, use data notation if enabled
        return isData ? '=' : 'x';
    }
  }

  optimizeWaveString(wave: string): string {
    if (wave.length <= 1) {
      return wave;
    }

    let optimized = '';
    let i = 0;

    while (i < wave.length) {
      const currentChar = wave[i];
      optimized += currentChar;

      // Skip consecutive identical characters for basic digital values only
      // Don't optimize '=' (data), 'x' (conflict), or '.' (continuation)
      if (currentChar !== '.' && currentChar !== '=' && currentChar !== 'x') {
        let j = i + 1;
        while (j < wave.length && wave[j] === currentChar) {
          j++;
        }

        // Add continuation characters for the skipped identical characters
        const skipCount = j - i - 1;
        if (skipCount > 0) {
          optimized += '.'.repeat(skipCount);
        }

        i = j;
      } else {
        i++;
      }
    }

    return optimized;
  }
}

// Export a singleton instance
export const waveDromConverter = new WaveDromConverterService();
