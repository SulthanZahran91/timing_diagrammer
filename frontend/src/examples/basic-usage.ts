/**
 * Basic usage examples demonstrating how to use the timing diagram data structures.
 * This file serves as documentation and testing for the type definitions.
 */

import {
  Signal,
  SignalType,
  SignalValue,
  TimingPoint,
  ClockSignal,
  BusSignal,
  TimingDiagram,
  TimeUnit,
  TimeScale
} from '../types';

import { 
  validateSignal, 
  validateTimingDiagram,
  ValidationResult 
} from '../utils/validation';

/**
 * Example: Creating a simple clock signal
 */
export function createSimpleClockSignal(): ClockSignal {
  const signal: ClockSignal = {
    id: 'clk_example',
    name: 'Example Clock',
    type: SignalType.CLOCK,
    frequency: 50_000_000, // 50 MHz
    period: 20, // 20 ns
    dutyCycle: 50,
    phaseOffset: 0,
    transitions: [
      { time: 0, value: 'LOW' },
      { time: 10, value: 'HIGH' },
      { time: 20, value: 'LOW' },
      { time: 30, value: 'HIGH' },
      { time: 40, value: 'LOW' }
    ],
    style: {
      color: '#FF0000',
      thickness: 2,
      style: 'solid'
    },
    metadata: {
      description: 'Example 50MHz system clock',
      visible: true
    }
  };

  return signal;
}

/**
 * Example: Creating a data signal with various states
 */
export function createDataSignal(): Signal {
  const transitions: TimingPoint[] = [
    { time: 0, value: 'HIGH_Z' },
    { time: 5, value: 'LOW' },
    { time: 15, value: 'HIGH' },
    { time: 25, value: 'UNKNOWN' },
    { time: 35, value: 'HIGH_Z' }
  ];

  const signal: Signal = {
    id: 'data_example',
    name: 'Data Line',
    type: SignalType.DATA,
    transitions,
    style: {
      color: '#0000FF'
    }
  };

  return signal;
}

/**
 * Example: Creating a bus signal
 */
export function createBusSignal(): BusSignal {
  const busSignal: BusSignal = {
    id: 'bus_example',
    name: 'Address Bus',
    type: SignalType.BUS,
    width: 16,
    displayFormat: 'hex',
    transitions: [
      { time: 0, value: 'XXXX', metadata: { comment: 'High impedance' } },
      { time: 10, value: '1000' },
      { time: 20, value: '1004' },
      { time: 30, value: '1008' },
      { time: 40, value: 'XXXX' }
    ],
    style: {
      color: '#00FF00',
      thickness: 2
    }
  };

  return busSignal;
}

/**
 * Example: Creating a complete timing diagram
 */
export function createExampleDiagram(): TimingDiagram {
  const timeScale: TimeScale = {
    unit: TimeUnit.NANOSECOND,
    scaleFactor: 1,
    resolution: 1,
    displayFormat: {
      decimalPlaces: 0,
      showUnit: true
    }
  };

  const diagram: TimingDiagram = {
    id: 'example_diagram',
    metadata: {
      title: 'Basic Example',
      description: 'Simple timing diagram example',
      createdAt: new Date(),
      modifiedAt: new Date(),
      version: { major: 1, minor: 0, patch: 0 }
    },
    signals: [
      createSimpleClockSignal(),
      createDataSignal(),
      createBusSignal()
    ],
    signalGroups: [
      {
        id: 'main_group',
        name: 'Main Signals',
        childGroupIds: [],
        signalIds: ['clk_example', 'data_example', 'bus_example'],
        expanded: true,
        style: { color: '#333333' }
      }
    ],
    clockDomains: [
      {
        id: 'main_domain',
        name: 'Main Clock Domain',
        clockSignalId: 'clk_example',
        frequency: 50_000_000,
        phaseOffset: 0,
        active: true,
        signalIds: ['clk_example', 'data_example', 'bus_example']
      }
    ],
    cursors: [],
    measurements: [],
    constraints: [],
    analysisResults: [],
    annotations: [],
    viewport: {
      timeRange: { start: 0, end: 50 },
      signalRange: { start: 0, end: 3 },
      zoomLevel: 1.0,
      timeScale,
      showGrid: true,
      showSignalNames: true,
      showMeasurements: false,
      backgroundColor: '#FFFFFF',
      gridColor: '#EEEEEE'
    },
    settings: {
      defaultSignalColors: {
        [SignalType.CLOCK]: '#FF0000',
        [SignalType.DATA]: '#0000FF',
        [SignalType.CONTROL]: '#00FF00',
        [SignalType.BUS]: '#FF00FF',
        [SignalType.POWER]: '#FFFF00'
      },
      defaultTimeScale: timeScale,
      autoSave: false,
      undoHistoryLimit: 20,
      snapToGrid: false,
      gridResolution: 1
    }
  };

  return diagram;
}

/**
 * Example: Validating signals and diagrams
 */
export function validateExampleData(): ValidationResult {
  const diagram = createExampleDiagram();
  
  // Validate the entire diagram
  const diagramResult = validateTimingDiagram(diagram);
  
  if (!diagramResult.isValid) {
    console.error('Diagram validation failed:', diagramResult.errors);
    return diagramResult;
  }

  // Validate individual signals
  for (const signal of diagram.signals) {
    const signalResult = validateSignal(signal);
    if (!signalResult.isValid) {
      console.error(`Signal ${signal.id} validation failed:`, signalResult.errors);
      return signalResult;
    }
  }

  console.log('All validation checks passed!');
  return { isValid: true, errors: [], warnings: [] };
}

/**
 * Example: Working with signal values
 */
export function demonstrateSignalValues(): void {
  const values: SignalValue[] = [
    'HIGH',
    'LOW',
    'HIGH_Z',
    'UNKNOWN',
    'RISING',
    'FALLING',
    'FF', // Hex value for bus
    '10101010' // Binary value for bus
  ];

  console.log('Valid signal values:', values);
}

/**
 * Example: Time conversion utilities
 */
export function demonstrateTimeConversion(): void {
  const timeInNanoseconds = 1000; // 1 microsecond
  const timeInMicroseconds = timeInNanoseconds / 1000;
  const timeInMilliseconds = timeInNanoseconds / 1_000_000;

  console.log({
    nanoseconds: timeInNanoseconds,
    microseconds: timeInMicroseconds,
    milliseconds: timeInMilliseconds
  });
}

/**
 * Export usage example for demonstration
 */
export const usageExample = {
  createClock: createSimpleClockSignal,
  createData: createDataSignal,
  createBus: createBusSignal,
  createDiagram: createExampleDiagram,
  validate: validateExampleData,
  signalValues: demonstrateSignalValues,
  timeConversion: demonstrateTimeConversion
}; 