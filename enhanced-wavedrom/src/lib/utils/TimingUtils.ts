import type { TimeUnit, FrequencyUnit } from '../types';

/**
 * Timing utility functions for Enhanced WaveDrom
 */
export class TimingUtils {
  // Time unit multipliers relative to seconds
  private static readonly TIME_UNITS: Record<TimeUnit, number> = {
    ps: 1e-12,
    ns: 1e-9,
    μs: 1e-6,
    ms: 1e-3,
    s: 1
  };

  // Frequency unit multipliers relative to Hz
  private static readonly FREQUENCY_UNITS: Record<FrequencyUnit, number> = {
    Hz: 1,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12
  };

  /**
   * Format time value with appropriate unit
   */
  static formatTime(timeInSeconds: number, precision = 3): { value: number; unit: TimeUnit; formatted: string } {
    const absTime = Math.abs(timeInSeconds);
    
    let selectedUnit: TimeUnit = 's';
    
    if (absTime < this.TIME_UNITS.ms) {
      if (absTime < this.TIME_UNITS.ns) {
        selectedUnit = 'ps';
      } else if (absTime < this.TIME_UNITS.μs) {
        selectedUnit = 'ns';
      } else {
        selectedUnit = 'μs';
      }
    } else if (absTime < this.TIME_UNITS.s) {
      selectedUnit = 'ms';
    }

    const value = timeInSeconds / this.TIME_UNITS[selectedUnit];
    const formatted = `${value.toFixed(precision)} ${selectedUnit}`;
    
    return { value, unit: selectedUnit, formatted };
  }

  /**
   * Format frequency value with appropriate unit
   */
  static formatFrequency(frequencyInHz: number, precision = 3): { value: number; unit: FrequencyUnit; formatted: string } {
    const absFreq = Math.abs(frequencyInHz);
    
    let selectedUnit: FrequencyUnit = 'Hz';
    
    if (absFreq >= this.FREQUENCY_UNITS.THz) {
      selectedUnit = 'THz';
    } else if (absFreq >= this.FREQUENCY_UNITS.GHz) {
      selectedUnit = 'GHz';
    } else if (absFreq >= this.FREQUENCY_UNITS.MHz) {
      selectedUnit = 'MHz';
    } else if (absFreq >= this.FREQUENCY_UNITS.kHz) {
      selectedUnit = 'kHz';
    }

    const value = frequencyInHz / this.FREQUENCY_UNITS[selectedUnit];
    const formatted = `${value.toFixed(precision)} ${selectedUnit}`;
    
    return { value, unit: selectedUnit, formatted };
  }

  /**
   * Convert pixels to time units (requires timing diagram scale)
   */
  static pixelsToTime(pixels: number, pixelsPerUnit: number, timeUnit: TimeUnit = 'ns'): number {
    const units = pixels / pixelsPerUnit;
    return units * this.TIME_UNITS[timeUnit];
  }

  /**
   * Convert time units to pixels (requires timing diagram scale)
   */
  static timeToPixels(timeInSeconds: number, pixelsPerUnit: number, timeUnit: TimeUnit = 'ns'): number {
    const units = timeInSeconds / this.TIME_UNITS[timeUnit];
    return units * pixelsPerUnit;
  }

  /**
   * Calculate frequency from time period
   */
  static calculateFrequency(periodInSeconds: number): number {
    if (periodInSeconds <= 0) return 0;
    return 1 / periodInSeconds;
  }
} 