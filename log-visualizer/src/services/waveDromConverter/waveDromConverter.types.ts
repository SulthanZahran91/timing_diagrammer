import { SignalEvent, ValidationResult } from '../csvParser/csvParser.types';

// WaveDrom types (inline since wavedrom.d.ts is a type declaration)
export interface WaveDromConfig {
  hscale?: number;
  skin?: string;
}

export interface WaveDromSignal {
  name: string;
  wave: string;
  data?: string[];
  period?: number;
  phase?: number;
}

export interface WaveDromDiagram {
  signal: WaveDromSignal[];
  config?: WaveDromConfig;
  head?: {
    text: string;
  };
}

// Time range interface
export interface TimeRange {
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
}

// Conversion configuration
export interface ConversionConfig {
  resolution: number; // Time units per wave character
  defaultValue: string; // Value for gaps (default: '.')
  dataThreshold: number; // Max unique values before using '=' notation
}

// Default configuration
export const DEFAULT_CONVERSION_CONFIG: ConversionConfig = {
  resolution: 10, // 10ms per character by default
  defaultValue: '.',
  dataThreshold: 8, // More than 8 unique values triggers data notation
};

// Intermediate data structures for conversion process
export interface SlotEvent {
  timestamp: number;
  value: string;
}

export interface SlotMap {
  [slotIndex: number]: SlotEvent[];
}

export interface ConflictData {
  [signalName: string]: {
    [slotIndex: number]: SlotEvent[];
  };
}

// Conversion result with additional metadata
export interface WaveDromConversionResult {
  diagram: WaveDromDiagram;
  conflictData: ConflictData;
  stats: {
    totalSlots: number;
    signalsProcessed: number;
    conflictsDetected: number;
    timeRange: TimeRange;
    resolution: number;
  };
  validationResult: ValidationResult;
}

// WaveDrom Converter Service interface
export interface IWaveDromConverterService {
  convertToWaveDrom(
    events: SignalEvent[],
    timeRange: TimeRange,
    config?: ConversionConfig
  ): WaveDromConversionResult;

  optimizeWaveString(wave: string): string;

  generateWaveCharacter(
    value: string,
    isConflict: boolean,
    isData: boolean
  ): string;

  detectDataValues(uniqueValues: string[], threshold: number): boolean;
}
