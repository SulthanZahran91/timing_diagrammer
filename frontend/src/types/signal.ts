/**
 * Core signal interfaces and types for digital timing diagrams.
 * These types define the fundamental data structures for representing
 * digital signals and their timing information.
 */

/**
 * Enum defining the different types of digital signals in timing diagrams.
 */
export enum SignalType {
  /** Periodic signals with regular transitions (e.g., system clock, clock domains) */
  CLOCK = 'CLOCK',
  /** Information-carrying signals (e.g., data lines, address buses) */
  DATA = 'DATA',
  /** Enable, select, and control signals (e.g., chip select, enable signals) */
  CONTROL = 'CONTROL',
  /** Multi-bit data buses represented as grouped signals */
  BUS = 'BUS',
  /** Power and ground signals */
  POWER = 'POWER'
}

/**
 * Union type representing all possible digital signal values.
 */
export type SignalValue = 
  | 'HIGH'    // Logic high (1)
  | 'LOW'     // Logic low (0)
  | 'HIGH_Z'  // High impedance (tri-state)
  | 'UNKNOWN' // Unknown or undefined state
  | 'RISING'  // Rising edge transition
  | 'FALLING' // Falling edge transition
  | string;   // For bus values (hex, binary, decimal representations)

/**
 * Represents a single timing point where a signal changes state.
 */
export interface TimingPoint {
  /** Time value in nanoseconds (must be positive) */
  time: number;
  /** The signal value at this timing point */
  value: SignalValue;
  /** Optional metadata for annotations, comments, or analysis data */
  metadata?: {
    /** Human-readable comment or annotation */
    comment?: string;
    /** Tags for categorization or filtering */
    tags?: string[];
    /** Analysis-specific data (setup/hold violations, etc.) */
    analysisData?: Record<string, unknown>;
  };
}

/**
 * Visual styling properties for signal rendering.
 */
export interface SignalStyle {
  /** Primary color for the signal line (CSS color value) */
  color: string;
  /** Line thickness in pixels */
  thickness?: number;
  /** Line style pattern */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Background color for highlighting */
  backgroundColor?: string;
  /** Whether the signal should be highlighted */
  highlighted?: boolean;
}

/**
 * Core interface representing a digital signal in a timing diagram.
 */
export interface Signal {
  /** Unique identifier for the signal (must be unique within a diagram) */
  id: string;
  /** Human-readable name displayed in the diagram */
  name: string;
  /** Classification of the signal type */
  type: SignalType;
  /** Array of timing transitions in chronological order */
  transitions: TimingPoint[];
  /** Visual properties for rendering */
  style: SignalStyle;
  /** Optional metadata for analysis and organization */
  metadata?: {
    /** Description or documentation for the signal */
    description?: string;
    /** Clock domain this signal belongs to */
    clockDomain?: string;
    /** Physical pin or net name in hardware */
    physicalName?: string;
    /** Whether this signal is currently visible in the diagram */
    visible?: boolean;
    /** Z-index for layer ordering */
    zIndex?: number;
    /** Group ID for signal grouping/hierarchy */
    groupId?: string;
    /** Custom properties for extensibility */
    customProperties?: Record<string, unknown>;
  };
}

/**
 * Configuration for bus signals that represent multiple bits.
 */
export interface BusSignal extends Signal {
  type: SignalType.BUS;
  /** Number of bits in the bus */
  width: number;
  /** Display format for bus values */
  displayFormat: 'hex' | 'binary' | 'decimal' | 'ascii';
  /** Individual bit signals if expanded view is needed */
  bitSignals?: Signal[];
}

/**
 * Configuration for clock signals with periodic properties.
 */
export interface ClockSignal extends Signal {
  type: SignalType.CLOCK;
  /** Clock frequency in Hz */
  frequency?: number;
  /** Clock period in nanoseconds */
  period?: number;
  /** Duty cycle as percentage (0-100) */
  dutyCycle?: number;
  /** Phase offset in nanoseconds */
  phaseOffset?: number;
} 