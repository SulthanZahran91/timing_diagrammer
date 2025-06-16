/**
 * Main index file for timing diagram types.
 * Exports all interfaces and types for convenient importing.
 */

// Core signal types
export type {
  Signal,
  SignalStyle,
  BusSignal,
  ClockSignal,
  TimingPoint
} from './signal';

export {
  SignalType,
  type SignalValue
} from './signal';

// Timing-related types
export type {
  TimeScale,
  TimeInterval,
  TimingCursor,
  TimingMeasurement,
  TimingConstraint,
  TimingAnalysisResult,
  ClockDomain,
  TimeAnnotation
} from './timing';

export {
  TimeUnit
} from './timing';

// Diagram container types
export type {
  TimingDiagram,
  DiagramMetadata,
  DiagramVersion,
  DiagramViewport,
  ExportConfiguration,
  SignalGroup,
  DiagramSummary,
  DiagramTemplate,
  DiagramDiff
} from './diagram';

// Validation types
export type {
  ValidationResult
} from '../utils/validation';

// Canvas types (existing)
export type {
  TimeRange,
  LogicalCoordinates,
  ScreenCoordinates,
  ViewportDimensions,
  CanvasTransforms,
  TimingCanvasProps,
  CanvasState,
  MouseEventHandler,
  TimeGridProps,
  GridTick,
  GridConfig
} from './canvas';

export {
  type TimeUnit as CanvasTimeUnit
} from './canvas'; 