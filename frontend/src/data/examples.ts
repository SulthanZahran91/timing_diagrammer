/**
 * Example data for testing and demonstrating timing diagram functionality.
 * These examples provide realistic digital circuit timing scenarios.
 */

import { 
  Signal, 
  SignalType, 
  BusSignal, 
  ClockSignal 
} from '../types/signal';
import { 
  TimeUnit, 
  TimeScale, 
  TimingCursor, 
  TimingMeasurement, 
  ClockDomain 
} from '../types/timing';
import { 
  TimingDiagram, 
  DiagramMetadata, 
  DiagramViewport, 
  SignalGroup,
  DiagramTemplate 
} from '../types/diagram';

/**
 * Default time scale configuration for nanosecond timing.
 */
export const defaultTimeScale: TimeScale = {
  unit: TimeUnit.NANOSECOND,
  scaleFactor: 1,
  resolution: 0.1,
  displayFormat: {
    decimalPlaces: 1,
    showUnit: true
  }
};

/**
 * Example system clock signal running at 100MHz.
 */
export const exampleClockSignal: ClockSignal = {
  id: 'sys_clk',
  name: 'System Clock',
  type: SignalType.CLOCK,
  frequency: 100_000_000, // 100 MHz
  period: 10, // 10 ns period
  dutyCycle: 50,
  phaseOffset: 0,
  transitions: [
    { time: 0, value: 'LOW' },
    { time: 5, value: 'HIGH' },
    { time: 10, value: 'LOW' },
    { time: 15, value: 'HIGH' },
    { time: 20, value: 'LOW' },
    { time: 25, value: 'HIGH' },
    { time: 30, value: 'LOW' },
    { time: 35, value: 'HIGH' },
    { time: 40, value: 'LOW' },
    { time: 45, value: 'HIGH' },
    { time: 50, value: 'LOW' }
  ],
  style: {
    color: '#FF6B6B',
    thickness: 2,
    style: 'solid'
  },
  metadata: {
    description: 'Main system clock running at 100MHz',
    clockDomain: 'sys_domain',
    visible: true,
    zIndex: 10
  }
};

/**
 * Example chip select control signal.
 */
export const exampleChipSelectSignal: Signal = {
  id: 'cs_n',
  name: 'Chip Select (CS#)',
  type: SignalType.CONTROL,
  transitions: [
    { time: 0, value: 'HIGH' },
    { time: 8, value: 'LOW', metadata: { comment: 'SPI transaction start' } },
    { time: 42, value: 'HIGH', metadata: { comment: 'SPI transaction end' } },
    { time: 50, value: 'LOW' }
  ],
  style: {
    color: '#4ECDC4',
    thickness: 1.5,
    style: 'solid'
  },
  metadata: {
    description: 'SPI chip select signal (active low)',
    physicalName: 'CS_N',
    visible: true,
    zIndex: 5
  }
};

/**
 * Example data signal with various states.
 */
export const exampleDataSignal: Signal = {
  id: 'data_out',
  name: 'Data Output',
  type: SignalType.DATA,
  transitions: [
    { time: 0, value: 'HIGH_Z' },
    { time: 12, value: 'HIGH' },
    { time: 15, value: 'LOW' },
    { time: 18, value: 'HIGH' },
    { time: 22, value: 'LOW' },
    { time: 25, value: 'HIGH' },
    { time: 28, value: 'LOW' },
    { time: 32, value: 'HIGH' },
    { time: 35, value: 'LOW' },
    { time: 38, value: 'HIGH_Z' }
  ],
  style: {
    color: '#45B7D1',
    thickness: 1.5,
    style: 'solid'
  },
  metadata: {
    description: 'Serial data output line',
    visible: true,
    zIndex: 5
  }
};

/**
 * Example 8-bit bus signal with hex values.
 */
export const exampleBusSignal: BusSignal = {
  id: 'addr_bus',
  name: 'Address Bus [7:0]',
  type: SignalType.BUS,
  width: 8,
  displayFormat: 'hex',
  transitions: [
    { time: 0, value: 'XX', metadata: { comment: 'Bus idle' } },
    { time: 10, value: 'A0' },
    { time: 20, value: 'A1' },
    { time: 30, value: 'FF' },
    { time: 40, value: 'XX' }
  ],
  style: {
    color: '#96CEB4',
    thickness: 2,
    style: 'solid'
  },
  metadata: {
    description: '8-bit address bus for memory interface',
    visible: true,
    zIndex: 5
  }
};

/**
 * Example power signal.
 */
export const examplePowerSignal: Signal = {
  id: 'vdd',
  name: 'VDD (3.3V)',
  type: SignalType.POWER,
  transitions: [
    { time: 0, value: 'LOW' },
    { time: 2, value: 'HIGH', metadata: { comment: 'Power-on' } }
  ],
  style: {
    color: '#F38BA8',
    thickness: 3,
    style: 'solid'
  },
  metadata: {
    description: '3.3V power supply',
    visible: true,
    zIndex: 15
  }
};

/**
 * Example clock domain for system signals.
 */
export const exampleClockDomain: ClockDomain = {
  id: 'sys_domain',
  name: 'System Domain',
  clockSignalId: 'sys_clk',
  frequency: 100_000_000,
  phaseOffset: 0,
  active: true,
  signalIds: ['sys_clk', 'cs_n', 'data_out', 'addr_bus'],
  backgroundColor: '#f0f0f0'
};

/**
 * Example timing cursors for measurements.
 */
export const exampleCursors: TimingCursor[] = [
  {
    id: 'cursor_1',
    position: 8,
    label: 'Setup Time',
    style: {
      color: '#FF6B6B',
      lineStyle: 'dashed',
      thickness: 1
    },
    visible: true,
    moveable: true
  },
  {
    id: 'cursor_2',
    position: 15,
    label: 'Clock Edge',
    style: {
      color: '#4ECDC4',
      lineStyle: 'solid',
      thickness: 2
    },
    visible: true,
    moveable: true
  }
];

/**
 * Example timing measurement.
 */
export const exampleMeasurement: TimingMeasurement = {
  id: 'setup_measurement',
  startReference: 'cursor_1',
  endReference: 'cursor_2',
  duration: 7, // calculated from cursor positions
  type: 'setup',
  label: 'CS Setup Time',
  signalIds: ['cs_n', 'sys_clk'],
  style: {
    color: '#FF6B6B',
    showValue: true,
    position: 'above'
  },
  constraints: {
    minDuration: 5,
    targetDuration: 7,
    tolerance: 1
  }
};

/**
 * Example signal groups for hierarchical organization.
 */
export const exampleSignalGroups: SignalGroup[] = [
  {
    id: 'spi_group',
    name: 'SPI Interface',
    childGroupIds: [],
    signalIds: ['cs_n', 'data_out'],
    expanded: true,
    style: {
      color: '#4ECDC4',
      backgroundColor: '#E8F9F6'
    },
    description: 'SPI communication signals'
  },
  {
    id: 'system_group',
    name: 'System Signals',
    childGroupIds: [],
    signalIds: ['sys_clk', 'vdd'],
    expanded: true,
    style: {
      color: '#FF6B6B',
      backgroundColor: '#FFF2F2'
    },
    description: 'Core system signals'
  },
  {
    id: 'memory_group',
    name: 'Memory Interface',
    childGroupIds: [],
    signalIds: ['addr_bus'],
    expanded: true,
    style: {
      color: '#96CEB4',
      backgroundColor: '#F0F9F4'
    },
    description: 'Memory addressing signals'
  }
];

/**
 * Example diagram metadata.
 */
export const exampleMetadata: DiagramMetadata = {
  title: 'SPI Communication Example',
  description: 'Demonstrates SPI protocol timing with setup and hold requirements',
  author: 'Timing Diagrammer',
  organization: 'Digital Design Team',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  modifiedAt: new Date('2024-01-15T14:30:00Z'),
  version: {
    major: 1,
    minor: 0,
    patch: 0
  },
  tags: ['SPI', 'serial-communication', 'timing-analysis'],
  customFields: {
    'project': 'MCU Interface',
    'revision': 'Rev A'
  }
};

/**
 * Example viewport configuration.
 */
export const exampleViewport: DiagramViewport = {
  timeRange: {
    start: 0,
    end: 50
  },
  signalRange: {
    start: 0,
    end: 5
  },
  zoomLevel: 1.0,
  timeScale: defaultTimeScale,
  showGrid: true,
  showSignalNames: true,
  showMeasurements: true,
  backgroundColor: '#FFFFFF',
  gridColor: '#E0E0E0'
};

/**
 * Complete example timing diagram.
 */
export const exampleTimingDiagram: TimingDiagram = {
  id: 'spi_example',
  metadata: exampleMetadata,
  signals: [
    examplePowerSignal,
    exampleClockSignal,
    exampleChipSelectSignal,
    exampleDataSignal,
    exampleBusSignal
  ],
  signalGroups: exampleSignalGroups,
  clockDomains: [exampleClockDomain],
  cursors: exampleCursors,
  measurements: [exampleMeasurement],
  constraints: [],
  analysisResults: [],
  annotations: [],
  viewport: exampleViewport,
  settings: {
    defaultSignalColors: {
      [SignalType.CLOCK]: '#FF6B6B',
      [SignalType.DATA]: '#45B7D1',
      [SignalType.CONTROL]: '#4ECDC4',
      [SignalType.BUS]: '#96CEB4',
      [SignalType.POWER]: '#F38BA8'
    },
    defaultTimeScale: defaultTimeScale,
    autoSave: true,
    undoHistoryLimit: 50,
    snapToGrid: true,
    gridResolution: 1.0
  }
};

/**
 * Example SPI communication protocol template.
 */
export const spiProtocolTemplate: DiagramTemplate = {
  id: 'spi_template',
  name: 'SPI Protocol',
  description: 'Template for SPI serial communication timing diagrams',
  category: 'Serial Protocols',
  signals: [
    {
      name: 'SCLK',
      type: SignalType.CLOCK,
      transitions: [],
      style: { color: '#FF6B6B' }
    },
    {
      name: 'CS#',
      type: SignalType.CONTROL,
      transitions: [],
      style: { color: '#4ECDC4' }
    },
    {
      name: 'MOSI',
      type: SignalType.DATA,
      transitions: [],
      style: { color: '#45B7D1' }
    },
    {
      name: 'MISO',
      type: SignalType.DATA,
      transitions: [],
      style: { color: '#96CEB4' }
    }
  ],
  signalGroups: [
    {
      name: 'SPI Interface',
      childGroupIds: [],
      expanded: true,
      style: { color: '#4ECDC4' }
    }
  ],
  clockDomains: [
    {
      name: 'SPI Clock Domain',
      clockSignalId: 'sclk',
      frequency: 1_000_000, // 1 MHz default
      phaseOffset: 0,
      active: true
    }
  ],
  defaultViewport: {
    timeRange: { start: 0, end: 100 },
    timeScale: defaultTimeScale,
    showGrid: true,
    showSignalNames: true,
    showMeasurements: false
  },
  tags: ['SPI', 'serial', 'protocol'],
  builtIn: true
};

/**
 * Example I2C communication protocol template.
 */
export const i2cProtocolTemplate: DiagramTemplate = {
  id: 'i2c_template',
  name: 'I2C Protocol',
  description: 'Template for I2C serial communication timing diagrams',
  category: 'Serial Protocols',
  signals: [
    {
      name: 'SCL',
      type: SignalType.CLOCK,
      transitions: [],
      style: { color: '#FF6B6B' }
    },
    {
      name: 'SDA',
      type: SignalType.DATA,
      transitions: [],
      style: { color: '#45B7D1' }
    }
  ],
  signalGroups: [
    {
      name: 'I2C Interface',
      childGroupIds: [],
      expanded: true,
      style: { color: '#45B7D1' }
    }
  ],
  clockDomains: [
    {
      name: 'I2C Clock Domain',
      clockSignalId: 'scl',
      frequency: 100_000, // 100 kHz default
      phaseOffset: 0,
      active: true
    }
  ],
  defaultViewport: {
    timeRange: { start: 0, end: 200 },
    timeScale: {
      unit: TimeUnit.MICROSECOND,
      scaleFactor: 1000,
      resolution: 0.1,
      displayFormat: {
        decimalPlaces: 1,
        showUnit: true
      }
    },
    showGrid: true,
    showSignalNames: true,
    showMeasurements: false
  },
  tags: ['I2C', 'serial', 'protocol'],
  builtIn: true
};

/**
 * Array of all example templates.
 */
export const exampleTemplates: DiagramTemplate[] = [
  spiProtocolTemplate,
  i2cProtocolTemplate
];

/**
 * Test data with various edge cases for validation testing.
 */
export const testSignals: Signal[] = [
  // Signal with no transitions
  {
    id: 'empty_signal',
    name: 'Empty Signal',
    type: SignalType.DATA,
    transitions: [],
    style: { color: '#808080' }
  },
  // Signal with single transition
  {
    id: 'single_transition',
    name: 'Single Transition',
    type: SignalType.CONTROL,
    transitions: [{ time: 10, value: 'HIGH' }],
    style: { color: '#FF0000' }
  },
  // Signal with very fast transitions
  {
    id: 'fast_signal',
    name: 'Fast Signal',
    type: SignalType.DATA,
    transitions: [
      { time: 0, value: 'LOW' },
      { time: 0.1, value: 'HIGH' },
      { time: 0.2, value: 'LOW' },
      { time: 0.3, value: 'HIGH' }
    ],
    style: { color: '#00FF00' }
  }
]; 