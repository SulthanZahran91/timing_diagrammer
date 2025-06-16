# Timing Diagram TypeScript Data Structures

## Overview

This document describes the comprehensive TypeScript interfaces and types created for the timing diagram application. These data structures provide the foundation for modeling digital signals, timing information, and complete timing diagrams.

## File Structure

```
src/
├── types/
│   ├── signal.ts      # Core signal interfaces and enums
│   ├── timing.ts      # Timing-related types and measurements
│   ├── diagram.ts     # Container types for complete diagrams
│   ├── canvas.ts      # Existing canvas types (preserved)
│   └── index.ts       # Main export file for all types
├── utils/
│   └── validation.ts  # Validation functions and type guards
├── data/
│   └── examples.ts    # Sample data and templates
└── examples/
    └── basic-usage.ts # Usage examples and documentation
```

## Core Types

### Signal Types

#### `SignalType` Enum
```typescript
enum SignalType {
  CLOCK = 'CLOCK',     // Periodic signals with regular transitions
  DATA = 'DATA',       // Information-carrying signals
  CONTROL = 'CONTROL', // Enable/select/control signals
  BUS = 'BUS',         // Multi-bit data buses
  POWER = 'POWER'      // Power and ground signals
}
```

#### `SignalValue` Union Type
Represents all possible digital signal states:
- `'HIGH'` - Logic high (1)
- `'LOW'` - Logic low (0)
- `'HIGH_Z'` - High impedance (tri-state)
- `'UNKNOWN'` - Unknown or undefined state
- `'RISING'` - Rising edge transition
- `'FALLING'` - Falling edge transition
- `string` - For bus values (hex, binary, decimal)

#### `Signal` Interface
Core interface for digital signals with:
- Unique identifier and human-readable name
- Signal type classification
- Array of timing transitions
- Visual styling properties
- Optional metadata for analysis

#### Specialized Signal Types
- `BusSignal` - Extends Signal for multi-bit buses
- `ClockSignal` - Extends Signal with clock-specific properties (frequency, period, duty cycle)

### Timing Types

#### `TimeUnit` Enum
```typescript
enum TimeUnit {
  NANOSECOND = 'ns',
  MICROSECOND = 'μs',
  MILLISECOND = 'ms',
  CYCLES = 'cycles',
  PICOSECOND = 'ps'
}
```

#### Key Timing Interfaces
- `TimingPoint` - Represents state changes with time and value
- `TimeScale` - Configuration for time units and display
- `TimingCursor` - Cursors for measurements and navigation
- `TimingMeasurement` - Measurements between timing points
- `TimingConstraint` - Timing requirements for analysis
- `ClockDomain` - Clock domain definitions for multi-clock systems

### Diagram Container Types

#### `TimingDiagram` Interface
Complete data structure containing:
- Metadata (title, author, version, tags)
- Signal collection with grouping
- Clock domains and timing cursors
- Measurements and analysis results
- Viewport and display settings
- User preferences

#### Supporting Interfaces
- `DiagramMetadata` - Creation info and documentation
- `DiagramViewport` - Display configuration
- `SignalGroup` - Hierarchical signal organization
- `DiagramTemplate` - Predefined diagram structures

## Validation System

### Type Guards
Runtime type checking functions:
- `isSignalValue(value)` - Validates signal values
- `isSignalType(value)` - Validates signal types
- `isTimeUnit(value)` - Validates time units

### Validation Functions
Comprehensive validation for:
- Individual timing points and signals
- Signal chronological ordering
- Complete timing diagrams
- Time range validation
- Unique ID validation

### ValidationResult Interface
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

## Example Data

### Sample Signals
The `examples.ts` file provides realistic examples:
- **System Clock** - 100MHz clock with proper timing
- **SPI Interface** - Chip select, data, and clock signals
- **Bus Signals** - 8-bit address bus with hex values
- **Power Signals** - VDD power rail

### Protocol Templates
Pre-built templates for common protocols:
- **SPI Protocol** - 4-signal SPI interface
- **I2C Protocol** - 2-signal I2C interface

### Complete Example Diagram
A full SPI communication example demonstrating:
- Multiple signal types
- Proper timing relationships
- Signal grouping and organization
- Timing measurements and cursors

## Usage Patterns

### Creating a Simple Signal
```typescript
const signal: Signal = {
  id: 'clk_1',
  name: 'System Clock',
  type: SignalType.CLOCK,
  transitions: [
    { time: 0, value: 'LOW' },
    { time: 5, value: 'HIGH' },
    { time: 10, value: 'LOW' }
  ],
  style: { color: '#ff6b6b' }
};
```

### Validation
```typescript
import { validateSignal } from '../utils/validation';

const result = validateSignal(signal);
if (!result.isValid) {
  console.error('Validation failed:', result.errors);
}
```

### Importing Types
```typescript
import {
  Signal,
  SignalType,
  TimingDiagram,
  ValidationResult
} from '../types';
```

## Design Principles

### Type Safety
- Strict TypeScript compliance
- Runtime validation functions
- Type guards for safe casting

### Extensibility
- Optional metadata fields
- Custom properties support
- Flexible display formats

### JSON Serialization
- All types are JSON-serializable
- Compatible with save/load operations
- Version information for migration

### Performance
- Efficient data structures
- Minimal memory overhead
- Fast validation functions

### Integration
- Compatible with canvas rendering
- Supports analysis features
- Ready for future enhancements

## Validation Requirements

All data structures include validation for:
- ✅ Timing points in chronological order
- ✅ Valid signal values for each signal type
- ✅ No duplicate transition times
- ✅ Positive time values
- ✅ Unique IDs within collections
- ✅ Required field validation
- ✅ Type safety with runtime checks

## Future Compatibility

The type system is designed to support upcoming features:
- Analog signal support (Sprint 6)
- Real-time collaboration (Sprint 8)
- Advanced analysis overlays (Sprint 4)
- Format conversion (Sprint 5)
- Mobile touch interaction (Sprint 7)

## Code Quality Standards

- All interfaces exported for external use
- Comprehensive JSDoc documentation
- Type guards for runtime safety
- Example data for testing
- Backward compatibility considerations

This type system provides a solid foundation for the timing diagram application, supporting both current Sprint 1 requirements and future development phases. 