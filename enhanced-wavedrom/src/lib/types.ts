/**
 * WaveDrom JSON format interface
 */
export interface WaveJSON {
  signal: Array<{
    name: string;
    wave: string;
    data?: string[];
    node?: string;
    phase?: number;
    period?: number;
  }>;
  edge?: string[];
  head?: { 
    text?: string; 
    tick?: number; 
    tock?: number; 
    every?: number; 
  };
  foot?: { 
    text?: string; 
    tick?: number; 
    tock?: number; 
    every?: number; 
  };
  config?: { 
    hscale?: number; 
    skin?: string; 
    marks?: boolean; 
  };
}

/**
 * Enhanced WaveDrom configuration options
 */
export interface EnhancedOptions {
  interactive?: boolean;
  analysis?: boolean;
  cursors?: boolean;
  zoom?: boolean;
  pan?: boolean;
  constraints?: TimingConstraints;
  maxCursors?: number;
  snapToEdge?: boolean;
  cursorColors?: string[];
  animationDuration?: number;
  zoomLimits?: { min: number; max: number };
}

/**
 * Timing constraints for analysis
 */
export interface TimingConstraints {
  minPulseWidth?: number;
  setupTime?: number;
  holdTime?: number;
  clockFrequency?: number;
  tolerance?: number;
}

/**
 * Measurement data between cursors
 */
export interface MeasurementData {
  timeDifference: number;
  frequency?: number;
  cursorA: number;
  cursorB: number;
  unit: TimeUnit;
  formattedTime: string;
  formattedFrequency?: string;
}

/**
 * Individual cursor position data
 */
export interface CursorPosition {
  id: string;
  x: number;
  time: number;
  snappedToEdge: boolean;
  color: string;
  visible: boolean;
}

/**
 * Interaction modes for the enhanced interface
 */
export type InteractionMode = 'cursor' | 'measure' | 'zoom' | 'pan';

/**
 * Time units for formatting
 */
export type TimeUnit = 'ps' | 'ns' | 'μs' | 'ms' | 's';

/**
 * Frequency units for formatting
 */
export type FrequencyUnit = 'Hz' | 'kHz' | 'MHz' | 'GHz' | 'THz';

/**
 * Event types emitted by Enhanced WaveDrom
 */
export type EventType = 
  | 'cursor-added'
  | 'cursor-moved'
  | 'cursor-removed'
  | 'measurement-changed'
  | 'zoom-changed'
  | 'pan-changed'
  | 'mode-changed'
  | 'svg-updated';

/**
 * Event data payloads
 */
export interface EventData {
  'cursor-added': { cursor: CursorPosition };
  'cursor-moved': { cursor: CursorPosition; oldPosition: { x: number; time: number } };
  'cursor-removed': { cursorId: string };
  'measurement-changed': MeasurementData | null;
  'zoom-changed': { factor: number; level: number; centerX: number; centerY: number };
  'pan-changed': { deltaX: number; deltaY: number; newViewBox: ViewBox };
  'mode-changed': { oldMode: InteractionMode; newMode: InteractionMode };
  'svg-updated': { svg: SVGElement };
}

/**
 * SVG ViewBox parameters
 */
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Coordinate transformation data
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * SVG transformation matrix
 */
export interface TransformMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  property: string;
  from: string | number;
  to: string | number;
}

/**
 * Snap target for cursor positioning
 */
export interface SnapTarget {
  x: number;
  time: number;
  element: SVGElement;
  type: 'edge' | 'transition' | 'marker';
}

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  tools: ToolbarTool[];
  compact: boolean;
}

/**
 * Individual toolbar tool
 */
export interface ToolbarTool {
  id: string;
  icon: string;
  label: string;
  mode?: InteractionMode;
  action?: () => void;
  active?: boolean;
  disabled?: boolean;
}

/**
 * Measurement display configuration
 */
export interface MeasurementDisplayConfig {
  position: 'floating' | 'fixed';
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  precision: number;
  units: {
    time: TimeUnit;
    frequency: FrequencyUnit;
  };
}

/**
 * Export configuration for saving diagrams
 */
export interface ExportConfig {
  format: 'svg' | 'png' | 'pdf' | 'json';
  includeCursors: boolean;
  includeToolbar: boolean;
  quality?: number;
  scale?: number;
}

/**
 * Plugin interface for extensibility
 */
export interface Plugin {
  name: string;
  version: string;
  install: (instance: EnhancedWaveDromInstance) => void;
  uninstall?: (instance: EnhancedWaveDromInstance) => void;
}

/**
 * Enhanced WaveDrom instance type for plugins
 */
export interface EnhancedWaveDromInstance {
  addCursor: (x: number) => void;
  removeCursor: (index: number) => void;
  zoom: (factor: number, centerX?: number, centerY?: number) => void;
  pan: (deltaX: number, deltaY: number) => void;
  setMode: (mode: InteractionMode) => void;
  getMeasurements: () => MeasurementData | null;
  on: <T extends EventType>(event: T, callback: (data: EventData[T]) => void) => void;
  off: <T extends EventType>(event: T, callback: (data: EventData[T]) => void) => void;
}

/**
 * Error types for Enhanced WaveDrom
 */
export class EnhancedWaveDromError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EnhancedWaveDromError';
  }
}

/**
 * Browser capability detection
 */
export interface BrowserCapabilities {
  svg: boolean;
  animation: boolean;
  pointer: boolean;
  touch: boolean;
  wheel: boolean;
}

/**
 * Performance metrics tracking
 */
export interface PerformanceMetrics {
  renderTime: number;
  interactionLatency: number;
  memoryUsage: number;
  frameRate: number;
} 