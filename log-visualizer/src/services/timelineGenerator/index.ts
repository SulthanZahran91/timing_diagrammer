// Timeline Generator Service - Main exports
export {
  default as TimelineGeneratorService,
  timelineGeneratorService,
} from './timelineGenerator';
export type {
  SignalTimeline,
  TimelineGenerationConfig,
  TimelineValidationResult,
  TimelineStats,
  ITimelineGeneratorService,
} from './timelineGenerator.types';
export { DEFAULT_TIMELINE_CONFIG } from './timelineGenerator.types';
