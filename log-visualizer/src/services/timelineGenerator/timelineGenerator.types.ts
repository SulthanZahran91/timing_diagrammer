import {
  SignalEvent,
  ValidationResult,
  ErrorType,
} from '../csvParser/csvParser.types';

// Timeline-specific types
export interface SignalTimeline {
  signalName: string;
  events: Array<{
    timestamp: number;
    value: string;
  }>;
}

export interface TimelineValidationResult extends ValidationResult {
  duplicateEvents?: Array<{
    signalName: string;
    timestamp: number;
    values: string[];
  }>;
  outOfOrderEvents?: Array<{
    signalName: string;
    eventIndex: number;
    timestamp: number;
    previousTimestamp: number;
  }>;
}

export interface TimelineGenerationConfig {
  sortEvents: boolean; // Whether to sort events by timestamp (default: true)
  allowDuplicates: boolean; // Whether to allow multiple events at same timestamp (default: false)
  mergeStrategy: 'first' | 'last' | 'error'; // How to handle duplicates
  validateOrder: boolean; // Whether to validate chronological order (default: true)
}

export interface TimelineStats {
  totalSignals: number;
  totalEvents: number;
  timeRange: {
    startTime: number;
    endTime: number;
  };
  signalStats: Array<{
    signalName: string;
    eventCount: number;
    uniqueValues: string[];
    timeRange: {
      startTime: number;
      endTime: number;
    };
  }>;
}

// Timeline Generator Service interface
export interface ITimelineGeneratorService {
  generateTimelines(
    events: SignalEvent[],
    config?: TimelineGenerationConfig
  ): Promise<SignalTimeline[]>;

  validateTimelines(timelines: SignalTimeline[]): TimelineValidationResult;

  getTimelineStats(timelines: SignalTimeline[]): TimelineStats;

  mergeTimelines(timelines: SignalTimeline[]): SignalTimeline[];
}

// Default configuration
export const DEFAULT_TIMELINE_CONFIG: TimelineGenerationConfig = {
  sortEvents: true,
  allowDuplicates: false,
  mergeStrategy: 'last',
  validateOrder: true,
};
