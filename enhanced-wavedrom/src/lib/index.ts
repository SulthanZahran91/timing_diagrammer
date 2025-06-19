// Main export
export { EnhancedWaveDrom } from './EnhancedWaveDrom';

// Type exports
export type {
  WaveJSON,
  EnhancedOptions,
  MeasurementData,
  CursorPosition,
  InteractionMode,
  EventType,
  EventData,
  ViewBox,
  TimeUnit,
  FrequencyUnit,
  TimingConstraints,
  ToolbarConfig,
  ToolbarTool,
  MeasurementDisplayConfig,
  ExportConfig,
  Plugin,
  EnhancedWaveDromInstance,
  BrowserCapabilities,
  PerformanceMetrics
} from './types';

// Utility exports
export { TimingUtils } from './utils/TimingUtils';
export { SVGUtils } from './utils/SVGUtils';
export { EventManager } from './utils/EventManager';

// Error export
export { EnhancedWaveDromError } from './types';

// Component exports for advanced usage
export { MeasurementCursor } from './interactive/MeasurementCursor';
export { ZoomPanController } from './interactive/ZoomPanController';
export { InteractiveLayer } from './interactive/InteractiveLayer'; 