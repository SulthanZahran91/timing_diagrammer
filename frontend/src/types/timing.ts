/**
 * Timing-related types and interfaces for digital timing diagrams.
 * These types handle time scales, measurements, and timing constraints.
 */

/**
 * Time unit enumeration for different scales of timing diagrams.
 */
export enum TimeUnit {
  /** Nanoseconds - default unit for internal calculations */
  NANOSECOND = 'ns',
  /** Microseconds - common for slower digital systems */
  MICROSECOND = 'μs',
  /** Milliseconds - for very slow systems */
  MILLISECOND = 'ms',
  /** Clock cycles - relative to a reference clock */
  CYCLES = 'cycles',
  /** Picoseconds - for high-speed systems */
  PICOSECOND = 'ps'
}

/**
 * Time scale configuration for display and user interaction.
 */
export interface TimeScale {
  /** Primary unit for display */
  unit: TimeUnit;
  /** Scale factor for converting to/from nanoseconds */
  scaleFactor: number;
  /** Minimum time resolution for this scale */
  resolution: number;
  /** Reference clock frequency for cycle-based timing (Hz) */
  referenceClockFrequency?: number;
  /** Display format configuration */
  displayFormat: {
    /** Number of decimal places to show */
    decimalPlaces: number;
    /** Whether to show unit suffix */
    showUnit: boolean;
    /** Custom format string (e.g., "0.000 ns") */
    customFormat?: string;
  };
}

/**
 * Represents a time range or interval.
 */
export interface TimeInterval {
  /** Start time in nanoseconds */
  startTime: number;
  /** End time in nanoseconds */
  endTime: number;
  /** Duration in nanoseconds (derived) */
  readonly duration: number;
  /** Optional label for the interval */
  label?: string;
  /** Color for visual representation */
  color?: string;
}

/**
 * Cursor configuration for timing measurements.
 */
export interface TimingCursor {
  /** Unique identifier for the cursor */
  id: string;
  /** Position in nanoseconds */
  position: number;
  /** Cursor label */
  label: string;
  /** Visual properties */
  style: {
    color: string;
    lineStyle: 'solid' | 'dashed' | 'dotted';
    thickness: number;
  };
  /** Whether the cursor is currently visible */
  visible: boolean;
  /** Whether the cursor can be moved by user interaction */
  moveable: boolean;
}

/**
 * Timing measurement between two cursors or timing points.
 */
export interface TimingMeasurement {
  /** Unique identifier for the measurement */
  id: string;
  /** Start time or cursor reference */
  startReference: number | string; // number for time, string for cursor ID
  /** End time or cursor reference */
  endReference: number | string;
  /** Calculated duration in nanoseconds */
  readonly duration: number;
  /** Measurement type for categorization */
  type: 'setup' | 'hold' | 'pulse_width' | 'period' | 'delay' | 'custom';
  /** Display label */
  label: string;
  /** Associated signal IDs */
  signalIds: string[];
  /** Visual properties */
  style: {
    color: string;
    showValue: boolean;
    position: 'above' | 'below' | 'inline';
  };
  /** Optional constraints for validation */
  constraints?: {
    /** Minimum allowed duration */
    minDuration?: number;
    /** Maximum allowed duration */
    maxDuration?: number;
    /** Target or ideal duration */
    targetDuration?: number;
    /** Tolerance for warnings */
    tolerance?: number;
  };
}

/**
 * Timing constraint definition for analysis.
 */
export interface TimingConstraint {
  /** Unique identifier */
  id: string;
  /** Constraint name */
  name: string;
  /** Type of timing constraint */
  type: 'setup' | 'hold' | 'clock_to_q' | 'propagation' | 'recovery' | 'removal';
  /** Source signal ID */
  sourceSignalId: string;
  /** Destination signal ID */
  destinationSignalId: string;
  /** Clock signal ID (if applicable) */
  clockSignalId?: string;
  /** Required timing value in nanoseconds */
  requiredValue: number;
  /** Tolerance for warnings */
  tolerance: number;
  /** Whether this constraint is currently active */
  enabled: boolean;
  /** Priority level for constraint checking */
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Timing analysis result for a specific constraint.
 */
export interface TimingAnalysisResult {
  /** Reference to the constraint */
  constraintId: string;
  /** Whether the constraint is met */
  passed: boolean;
  /** Actual measured value */
  actualValue: number;
  /** Required value */
  requiredValue: number;
  /** Margin (positive = slack, negative = violation) */
  margin: number;
  /** Severity of violation if any */
  severity?: 'critical' | 'warning' | 'info';
  /** Location of the analysis in the timing diagram */
  location: {
    time: number;
    signalIds: string[];
  };
  /** Human-readable message */
  message: string;
}

/**
 * Clock domain definition for multi-clock systems.
 */
export interface ClockDomain {
  /** Unique identifier */
  id: string;
  /** Domain name */
  name: string;
  /** Primary clock signal ID */
  clockSignalId: string;
  /** Clock frequency in Hz */
  frequency: number;
  /** Phase relationship to other domains */
  phaseOffset: number;
  /** Whether this domain is currently active */
  active: boolean;
  /** Associated signal IDs */
  signalIds: string[];
  /** Background color for visual grouping */
  backgroundColor?: string;
}

/**
 * Time annotation for marking specific points or intervals.
 */
export interface TimeAnnotation {
  /** Unique identifier */
  id: string;
  /** Annotation text */
  text: string;
  /** Position in time (nanoseconds) */
  time: number;
  /** Optional end time for interval annotations */
  endTime?: number;
  /** Associated signal ID (if specific to a signal) */
  signalId?: string;
  /** Visual properties */
  style: {
    color: string;
    backgroundColor?: string;
    fontSize: number;
    position: 'above' | 'below' | 'inline';
  };
  /** Whether the annotation is currently visible */
  visible: boolean;
  /** Annotation category for filtering */
  category?: string;
} 