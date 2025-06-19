import {
  ITimelineGeneratorService,
  SignalTimeline,
  TimelineGenerationConfig,
  TimelineValidationResult,
  TimelineStats,
  DEFAULT_TIMELINE_CONFIG,
} from './timelineGenerator.types';
import { SignalEvent, ErrorType, AppError } from '../csvParser/csvParser.types';

class TimelineGeneratorService implements ITimelineGeneratorService {
  /**
   * Generate signal timelines from array of signal events
   * Groups events by signal name and handles sorting/validation
   */
  async generateTimelines(
    events: SignalEvent[],
    config: TimelineGenerationConfig = DEFAULT_TIMELINE_CONFIG
  ): Promise<SignalTimeline[]> {
    if (!events || events.length === 0) {
      throw this.createError(
        ErrorType.CSV_PARSE_ERROR,
        'No signal events provided for timeline generation',
        { eventsCount: events?.length || 0 }
      );
    }

    // Group events by signal name
    const signalGroups = this.groupEventsBySignal(events);

    // Process each signal group
    const timelines: SignalTimeline[] = [];

    for (const [signalName, signalEvents] of signalGroups.entries()) {
      try {
        const timeline = await this.createSignalTimeline(
          signalName,
          signalEvents,
          config
        );
        timelines.push(timeline);
      } catch (error) {
        throw this.createError(
          ErrorType.CSV_PARSE_ERROR,
          `Failed to create timeline for signal '${signalName}': ${error instanceof Error ? error.message : 'Unknown error'}`,
          { signalName, error }
        );
      }
    }

    // Validate the generated timelines if requested
    if (config.validateOrder) {
      const validation = this.validateTimelines(timelines);
      if (!validation.isValid) {
        throw this.createError(
          ErrorType.CSV_PARSE_ERROR,
          `Timeline validation failed: ${validation.errors.join(', ')}`,
          validation
        );
      }
    }

    return timelines;
  }

  /**
   * Validate signal timelines for chronological order and data consistency
   */
  validateTimelines(timelines: SignalTimeline[]): TimelineValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const duplicateEvents: TimelineValidationResult['duplicateEvents'] = [];
    const outOfOrderEvents: TimelineValidationResult['outOfOrderEvents'] = [];

    for (const timeline of timelines) {
      // Check chronological order
      let previousTimestamp = -Infinity;

      for (let i = 0; i < timeline.events.length; i++) {
        const event = timeline.events[i];

        if (event.timestamp < previousTimestamp) {
          outOfOrderEvents?.push({
            signalName: timeline.signalName,
            eventIndex: i,
            timestamp: event.timestamp,
            previousTimestamp,
          });
          errors.push(
            `Signal '${timeline.signalName}' has out-of-order event at index ${i}: ` +
              `timestamp ${event.timestamp} < previous ${previousTimestamp}`
          );
        }

        // Check for duplicate timestamps
        if (event.timestamp === previousTimestamp) {
          const duplicateIndex = duplicateEvents?.findIndex(
            d =>
              d.signalName === timeline.signalName &&
              d.timestamp === event.timestamp
          );

          if (
            duplicateIndex !== undefined &&
            duplicateIndex >= 0 &&
            duplicateEvents
          ) {
            duplicateEvents[duplicateIndex].values.push(event.value);
          } else {
            duplicateEvents?.push({
              signalName: timeline.signalName,
              timestamp: event.timestamp,
              values: [timeline.events[i - 1]?.value || '', event.value],
            });
          }

          warnings.push(
            `Signal '${timeline.signalName}' has duplicate timestamp ${event.timestamp} ` +
              `with values: ${timeline.events[i - 1]?.value} -> ${event.value}`
          );
        }

        previousTimestamp = event.timestamp;
      }

      // Validate signal name
      if (!timeline.signalName || timeline.signalName.trim().length === 0) {
        errors.push('Signal timeline has empty or invalid signal name');
      }

      // Validate events array
      if (!timeline.events || timeline.events.length === 0) {
        warnings.push(`Signal '${timeline.signalName}' has no events`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      duplicateEvents: duplicateEvents.length > 0 ? duplicateEvents : undefined,
      outOfOrderEvents:
        outOfOrderEvents.length > 0 ? outOfOrderEvents : undefined,
    };
  }

  /**
   * Get statistics about the timelines
   */
  getTimelineStats(timelines: SignalTimeline[]): TimelineStats {
    if (!timelines || timelines.length === 0) {
      return {
        totalSignals: 0,
        totalEvents: 0,
        timeRange: { startTime: 0, endTime: 0 },
        signalStats: [],
      };
    }

    let globalStartTime = Infinity;
    let globalEndTime = -Infinity;
    let totalEvents = 0;

    const signalStats = timelines.map(timeline => {
      const events = timeline.events;
      const eventCount = events.length;
      totalEvents += eventCount;

      const signalStartTime = eventCount > 0 ? events[0].timestamp : 0;
      const signalEndTime =
        eventCount > 0 ? events[eventCount - 1].timestamp : 0;

      if (signalStartTime < globalStartTime) globalStartTime = signalStartTime;
      if (signalEndTime > globalEndTime) globalEndTime = signalEndTime;

      const uniqueValues = [...new Set(events.map(e => e.value))];

      return {
        signalName: timeline.signalName,
        eventCount,
        uniqueValues,
        timeRange: {
          startTime: signalStartTime,
          endTime: signalEndTime,
        },
      };
    });

    return {
      totalSignals: timelines.length,
      totalEvents,
      timeRange: {
        startTime: globalStartTime === Infinity ? 0 : globalStartTime,
        endTime: globalEndTime === -Infinity ? 0 : globalEndTime,
      },
      signalStats,
    };
  }

  /**
   * Merge multiple timeline arrays (utility method)
   */
  mergeTimelines(timelines: SignalTimeline[]): SignalTimeline[] {
    const merged = new Map<string, SignalTimeline>();

    for (const timeline of timelines) {
      const existing = merged.get(timeline.signalName);
      if (existing) {
        // Merge events and sort by timestamp
        const combinedEvents = [...existing.events, ...timeline.events];
        combinedEvents.sort((a, b) => a.timestamp - b.timestamp);

        merged.set(timeline.signalName, {
          signalName: timeline.signalName,
          events: combinedEvents,
        });
      } else {
        merged.set(timeline.signalName, { ...timeline });
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Group signal events by signal name
   */
  private groupEventsBySignal(
    events: SignalEvent[]
  ): Map<string, SignalEvent[]> {
    const groups = new Map<string, SignalEvent[]>();

    for (const event of events) {
      const signalName = event.signalName;
      if (!groups.has(signalName)) {
        groups.set(signalName, []);
      }
      groups.get(signalName)!.push(event);
    }

    return groups;
  }

  /**
   * Create a timeline for a single signal
   */
  private async createSignalTimeline(
    signalName: string,
    events: SignalEvent[],
    config: TimelineGenerationConfig
  ): Promise<SignalTimeline> {
    // Sort events by timestamp if requested
    if (config.sortEvents) {
      events.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Handle duplicate timestamps based on merge strategy
    const processedEvents = this.handleDuplicateTimestamps(events, config);

    return {
      signalName,
      events: processedEvents.map(event => ({
        timestamp: event.timestamp,
        value: event.value,
      })),
    };
  }

  /**
   * Handle duplicate timestamps based on merge strategy
   */
  private handleDuplicateTimestamps(
    events: SignalEvent[],
    config: TimelineGenerationConfig
  ): SignalEvent[] {
    if (config.allowDuplicates) {
      return events;
    }

    const processed: SignalEvent[] = [];
    const timestampGroups = new Map<number, SignalEvent[]>();

    // Group events by timestamp
    for (const event of events) {
      if (!timestampGroups.has(event.timestamp)) {
        timestampGroups.set(event.timestamp, []);
      }
      timestampGroups.get(event.timestamp)!.push(event);
    }

    // Process each timestamp group
    for (const [timestamp, timestampEvents] of timestampGroups) {
      if (timestampEvents.length === 1) {
        processed.push(timestampEvents[0]);
      } else {
        // Handle duplicates based on strategy
        switch (config.mergeStrategy) {
          case 'first':
            processed.push(timestampEvents[0]);
            break;
          case 'last':
            processed.push(timestampEvents[timestampEvents.length - 1]);
            break;
          case 'error':
            throw new Error(
              `Duplicate timestamp ${timestamp} found with values: ${timestampEvents.map(e => e.value).join(', ')}`
            );
          default:
            processed.push(timestampEvents[timestampEvents.length - 1]);
        }
      }
    }

    return processed;
  }

  /**
   * Create an AppError
   */
  private createError(
    type: ErrorType,
    message: string,
    details?: any
  ): AppError {
    return {
      type,
      message,
      details,
      recoverable: false,
    };
  }
}

// Export singleton instance
export const timelineGeneratorService = new TimelineGeneratorService();
export default TimelineGeneratorService;
