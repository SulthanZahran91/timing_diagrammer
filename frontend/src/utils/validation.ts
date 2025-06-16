/**
 * Validation functions and type guards for timing diagram data structures.
 * These functions ensure data integrity and provide runtime type checking.
 */

import { 
  Signal, 
  SignalType, 
  SignalValue, 
  TimingPoint, 
  BusSignal, 
  ClockSignal 
} from '../types/signal';
import { 
  TimeUnit, 
  TimeScale 
} from '../types/timing';
import { TimingDiagram } from '../types/diagram';

/**
 * Validation result interface.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
}

/**
 * Creates a successful validation result.
 */
export function createValidResult(): ValidationResult {
  return { isValid: true, errors: [], warnings: [] };
}

/**
 * Creates a failed validation result with errors.
 */
export function createInvalidResult(errors: string[], warnings: string[] = []): ValidationResult {
  return { isValid: false, errors, warnings };
}

/**
 * Type guard to check if a value is a valid SignalValue.
 */
export function isSignalValue(value: unknown): value is SignalValue {
  if (typeof value !== 'string') return false;
  const validValues = ['HIGH', 'LOW', 'HIGH_Z', 'UNKNOWN', 'RISING', 'FALLING'];
  return validValues.includes(value) || /^[0-9A-Fa-f]+$/.test(value);
}

/**
 * Type guard to check if a value is a valid SignalType.
 */
export function isSignalType(value: unknown): value is SignalType {
  return Object.values(SignalType).includes(value as SignalType);
}

/**
 * Type guard to check if a value is a valid TimeUnit.
 */
export function isTimeUnit(value: unknown): value is TimeUnit {
  return Object.values(TimeUnit).includes(value as TimeUnit);
}

/**
 * Validates a timing point.
 */
export function validateTimingPoint(point: unknown): ValidationResult {
  const result = createValidResult();
  
  if (!point || typeof point !== 'object') {
    return createInvalidResult(['Timing point must be an object']);
  }
  
  const tp = point as Partial<TimingPoint>;
  
  // Validate time
  if (typeof tp.time !== 'number') {
    result.errors.push('Timing point time must be a number');
  } else if (tp.time < 0) {
    result.errors.push('Timing point time must be non-negative');
  } else if (!isFinite(tp.time)) {
    result.errors.push('Timing point time must be finite');
  }
  
  // Validate value
  if (!isSignalValue(tp.value)) {
    result.errors.push('Timing point value must be a valid SignalValue');
  }
  
  // Validate optional metadata
  if (tp.metadata !== undefined) {
    if (typeof tp.metadata !== 'object') {
      result.errors.push('Timing point metadata must be an object');
    } else {
      const meta = tp.metadata;
      if (meta.comment !== undefined && typeof meta.comment !== 'string') {
        result.errors.push('Timing point comment must be a string');
      }
      if (meta.tags !== undefined && (!Array.isArray(meta.tags) || !meta.tags.every(tag => typeof tag === 'string'))) {
        result.errors.push('Timing point tags must be an array of strings');
      }
    }
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors, result.warnings) : result;
}

/**
 * Validates that timing points are in chronological order.
 */
export function validateTimingPointsOrder(points: TimingPoint[]): ValidationResult {
  const result = createValidResult();
  
  for (let i = 1; i < points.length; i++) {
    if (points[i].time < points[i - 1].time) {
      result.errors.push(`Timing points must be in chronological order: point at index ${i} (time: ${points[i].time}) is before point at index ${i - 1} (time: ${points[i - 1].time})`);
    } else if (points[i].time === points[i - 1].time) {
      result.warnings.push(`Duplicate timing points at time ${points[i].time} (indices ${i - 1} and ${i})`);
    }
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors, result.warnings) : result;
}

/**
 * Validates a signal.
 */
export function validateSignal(signal: unknown): ValidationResult {
  const result = createValidResult();
  
  if (!signal || typeof signal !== 'object') {
    return createInvalidResult(['Signal must be an object']);
  }
  
  const sig = signal as Partial<Signal>;
  
  // Validate required fields
  if (!sig.id || typeof sig.id !== 'string' || sig.id.trim() === '') {
    result.errors.push('Signal must have a non-empty string id');
  }
  
  if (!sig.name || typeof sig.name !== 'string' || sig.name.trim() === '') {
    result.errors.push('Signal must have a non-empty string name');
  }
  
  if (!isSignalType(sig.type)) {
    result.errors.push('Signal must have a valid SignalType');
  }
  
  if (!Array.isArray(sig.transitions)) {
    result.errors.push('Signal transitions must be an array');
  } else {
    // Validate each timing point
    sig.transitions.forEach((point, index) => {
      const pointResult = validateTimingPoint(point);
      if (!pointResult.isValid) {
        result.errors.push(...pointResult.errors.map(err => `Transition ${index}: ${err}`));
        result.warnings.push(...pointResult.warnings.map(warn => `Transition ${index}: ${warn}`));
      }
    });
    
    // Validate chronological order
    const orderResult = validateTimingPointsOrder(sig.transitions as TimingPoint[]);
    if (!orderResult.isValid) {
      result.errors.push(...orderResult.errors);
      result.warnings.push(...orderResult.warnings);
    }
  }
  
  // Validate style
  if (!sig.style || typeof sig.style !== 'object') {
    result.errors.push('Signal must have a style object');
  } else {
    if (!sig.style.color || typeof sig.style.color !== 'string') {
      result.errors.push('Signal style must have a color string');
    }
    if (sig.style.thickness !== undefined && (typeof sig.style.thickness !== 'number' || sig.style.thickness <= 0)) {
      result.errors.push('Signal style thickness must be a positive number');
    }
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors, result.warnings) : result;
}

/**
 * Validates a bus signal.
 */
export function validateBusSignal(signal: unknown): ValidationResult {
  const result = validateSignal(signal);
  
  if (!result.isValid) return result;
  
  const bus = signal as Partial<BusSignal>;
  
  if (bus.type !== SignalType.BUS) {
    result.errors.push('Bus signal must have type BUS');
  }
  
  if (typeof bus.width !== 'number' || bus.width <= 0 || !Number.isInteger(bus.width)) {
    result.errors.push('Bus signal width must be a positive integer');
  }
  
  const validFormats = ['hex', 'binary', 'decimal', 'ascii'];
  if (!validFormats.includes(bus.displayFormat as string)) {
    result.errors.push('Bus signal displayFormat must be one of: hex, binary, decimal, ascii');
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors, result.warnings) : result;
}

/**
 * Validates a clock signal.
 */
export function validateClockSignal(signal: unknown): ValidationResult {
  const result = validateSignal(signal);
  
  if (!result.isValid) return result;
  
  const clock = signal as Partial<ClockSignal>;
  
  if (clock.type !== SignalType.CLOCK) {
    result.errors.push('Clock signal must have type CLOCK');
  }
  
  if (clock.frequency !== undefined && (typeof clock.frequency !== 'number' || clock.frequency <= 0)) {
    result.errors.push('Clock signal frequency must be a positive number');
  }
  
  if (clock.period !== undefined && (typeof clock.period !== 'number' || clock.period <= 0)) {
    result.errors.push('Clock signal period must be a positive number');
  }
  
  if (clock.dutyCycle !== undefined && (typeof clock.dutyCycle !== 'number' || clock.dutyCycle < 0 || clock.dutyCycle > 100)) {
    result.errors.push('Clock signal dutyCycle must be a number between 0 and 100');
  }
  
  if (clock.phaseOffset !== undefined && (typeof clock.phaseOffset !== 'number' || !isFinite(clock.phaseOffset))) {
    result.errors.push('Clock signal phaseOffset must be a finite number');
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors, result.warnings) : result;
}

/**
 * Validates a time scale configuration.
 */
export function validateTimeScale(timeScale: unknown): ValidationResult {
  const result = createValidResult();
  
  if (!timeScale || typeof timeScale !== 'object') {
    return createInvalidResult(['TimeScale must be an object']);
  }
  
  const ts = timeScale as Partial<TimeScale>;
  
  if (!isTimeUnit(ts.unit)) {
    result.errors.push('TimeScale must have a valid TimeUnit');
  }
  
  if (typeof ts.scaleFactor !== 'number' || ts.scaleFactor <= 0) {
    result.errors.push('TimeScale scaleFactor must be a positive number');
  }
  
  if (typeof ts.resolution !== 'number' || ts.resolution <= 0) {
    result.errors.push('TimeScale resolution must be a positive number');
  }
  
  if (ts.referenceClockFrequency !== undefined && (typeof ts.referenceClockFrequency !== 'number' || ts.referenceClockFrequency <= 0)) {
    result.errors.push('TimeScale referenceClockFrequency must be a positive number');
  }
  
  if (!ts.displayFormat || typeof ts.displayFormat !== 'object') {
    result.errors.push('TimeScale must have a displayFormat object');
  } else {
    const df = ts.displayFormat;
    if (typeof df.decimalPlaces !== 'number' || df.decimalPlaces < 0 || !Number.isInteger(df.decimalPlaces)) {
      result.errors.push('TimeScale displayFormat decimalPlaces must be a non-negative integer');
    }
    if (typeof df.showUnit !== 'boolean') {
      result.errors.push('TimeScale displayFormat showUnit must be a boolean');
    }
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors, result.warnings) : result;
}

/**
 * Validates unique IDs within an array of objects with id property.
 */
export function validateUniqueIds<T extends { id: string }>(items: T[], itemType: string): ValidationResult {
  const result = createValidResult();
  const ids = new Set<string>();
  const duplicates = new Set<string>();
  
  items.forEach((item) => {
    if (ids.has(item.id)) {
      duplicates.add(item.id);
    } else {
      ids.add(item.id);
    }
  });
  
  if (duplicates.size > 0) {
    result.errors.push(`Duplicate ${itemType} IDs found: ${Array.from(duplicates).join(', ')}`);
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors) : result;
}

/**
 * Validates a complete timing diagram.
 */
export function validateTimingDiagram(diagram: unknown): ValidationResult {
  const result = createValidResult();
  
  if (!diagram || typeof diagram !== 'object') {
    return createInvalidResult(['TimingDiagram must be an object']);
  }
  
  const diag = diagram as Partial<TimingDiagram>;
  
  // Validate required fields
  if (!diag.id || typeof diag.id !== 'string' || diag.id.trim() === '') {
    result.errors.push('TimingDiagram must have a non-empty string id');
  }
  
  // Validate signals
  if (!Array.isArray(diag.signals)) {
    result.errors.push('TimingDiagram signals must be an array');
  } else {
    // Validate each signal
    diag.signals.forEach((signal, index) => {
      const signalResult = validateSignal(signal);
      if (!signalResult.isValid) {
        result.errors.push(...signalResult.errors.map(err => `Signal ${index}: ${err}`));
        result.warnings.push(...signalResult.warnings.map(warn => `Signal ${index}: ${warn}`));
      }
    });
    
    // Validate unique signal IDs
    const idResult = validateUniqueIds(diag.signals as Signal[], 'signal');
    if (!idResult.isValid) {
      result.errors.push(...idResult.errors);
    }
  }
  
  // Validate viewport if present
  if (diag.viewport) {
    if (typeof diag.viewport !== 'object') {
      result.errors.push('TimingDiagram viewport must be an object');
    } else {
      const viewport = diag.viewport;
      if (viewport.timeRange) {
        if (typeof viewport.timeRange.start !== 'number' || typeof viewport.timeRange.end !== 'number') {
          result.errors.push('Viewport timeRange start and end must be numbers');
        } else if (viewport.timeRange.start >= viewport.timeRange.end) {
          result.errors.push('Viewport timeRange start must be less than end');
        }
      }
    }
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors, result.warnings) : result;
}

/**
 * Validates that a time value is within reasonable bounds.
 */
export function validateTimeRange(time: number, minTime = 0, maxTime = Number.MAX_SAFE_INTEGER): ValidationResult {
  const result = createValidResult();
  
  if (!isFinite(time)) {
    result.errors.push('Time must be a finite number');
  } else if (time < minTime) {
    result.errors.push(`Time ${time} is below minimum allowed value ${minTime}`);
  } else if (time > maxTime) {
    result.errors.push(`Time ${time} is above maximum allowed value ${maxTime}`);
  }
  
  return result.errors.length > 0 ? createInvalidResult(result.errors) : result;
} 