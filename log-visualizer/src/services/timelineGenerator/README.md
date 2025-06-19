# Timeline Generator Service - PBI-004 Implementation

## Overview

This service implements **PBI-004: Signal Timeline Generation** from the project specification. It takes an array of `SignalEvent` objects (typically from the CSV parser) and groups them by signal name into organized timelines.

## Features Implemented

### Core Functionality ✅

- **Group CSV events by signal**: Events are automatically grouped by `signalName`
- **Create timeline data structure**: Converts grouped events into `SignalTimeline` objects
- **Handle time sorting and validation**: Automatically sorts events chronologically and validates order
- **Detect data inconsistencies**: Identifies out-of-order events and duplicate timestamps

### Acceptance Criteria Met ✅

- ✅ **Correctly groups signals**: Events with the same signal name are grouped together
- ✅ **Maintains chronological order**: Events within each signal timeline are sorted by timestamp
- ✅ **Detects data inconsistencies**: Validation identifies timing issues and provides detailed error reporting

## API Usage

### Basic Usage

```typescript
import { timelineGeneratorService } from './services/timelineGenerator';

const signalEvents: SignalEvent[] = [
  { timestamp: 1000, signalName: 'CLK', value: '0' },
  { timestamp: 1010, signalName: 'CLK', value: '1' },
  { timestamp: 1005, signalName: 'DATA', value: '0xFF' },
];

const timelines =
  await timelineGeneratorService.generateTimelines(signalEvents);
console.log(timelines);
// [
//   { signalName: 'CLK', events: [{ timestamp: 1000, value: '0' }, { timestamp: 1010, value: '1' }] },
//   { signalName: 'DATA', events: [{ timestamp: 1005, value: '0xFF' }] }
// ]
```

### Advanced Configuration

```typescript
const config: TimelineGenerationConfig = {
  sortEvents: true, // Auto-sort events by timestamp
  allowDuplicates: false, // Handle duplicate timestamps
  mergeStrategy: 'last', // Use 'first', 'last', or 'error' for duplicates
  validateOrder: true, // Validate chronological order
};

const timelines = await timelineGeneratorService.generateTimelines(
  events,
  config
);
```

### Validation and Statistics

```typescript
// Validate timeline data integrity
const validation = timelineGeneratorService.validateTimelines(timelines);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}

// Get statistics for UI display
const stats = timelineGeneratorService.getTimelineStats(timelines);
console.log(`Total signals: ${stats.totalSignals}`);
console.log(
  `Time range: ${stats.timeRange.startTime} - ${stats.timeRange.endTime}`
);
```

## Files Structure

```
src/services/timelineGenerator/
├── index.ts                      # Main exports
├── timelineGenerator.ts          # Core service implementation
├── timelineGenerator.types.ts    # Type definitions
├── timelineGenerator.test.ts     # Unit tests (21 tests)
├── integration.test.ts           # Integration tests (4 tests)
└── README.md                     # This documentation
```

## Integration with Other PBIs

### CSV Parser Integration (PBI-002)

The timeline generator seamlessly processes output from the CSV parser:

```typescript
// CSV Parser output -> Timeline Generator input
const csvEvents = await csvParserService.parseFile(file);
const timelines = await timelineGeneratorService.generateTimelines(csvEvents);
```

### Future WaveDrom Integration (PBI-005)

The `SignalTimeline` structure is designed to be easily converted to WaveDrom format:

```typescript
// Timeline Generator output -> WaveDrom Converter input
const timelines = await timelineGeneratorService.generateTimelines(events);
const waveDromJson = waveDromConverter.convertToWaveDrom(
  timelines,
  timeRange,
  config
);
```

## Error Handling

The service provides comprehensive error handling:

- **Empty input validation**: Throws error for null/empty events
- **Duplicate timestamp handling**: Configurable strategies (first/last/error)
- **Chronological validation**: Detects and reports out-of-order events
- **Signal name validation**: Ensures valid signal names
- **Data inconsistency detection**: Provides detailed error reporting

## Testing

- **21 unit tests**: Cover all core functionality and edge cases
- **4 integration tests**: Demonstrate real-world usage scenarios
- **100% test coverage**: All methods and error paths tested
- **Edge case handling**: Negative timestamps, special characters, large datasets

## Performance Considerations

- **Efficient grouping**: Uses Map for O(1) signal lookup
- **Memory optimization**: Minimal object creation and copying
- **Scalable validation**: Handles large datasets efficiently
- **Configurable sorting**: Can skip sorting for pre-sorted data

## Next Steps

This implementation is ready for integration with:

1. **PBI-005**: WaveDrom JSON Generator (next sprint)
2. **Redux State Management**: For storing timeline data
3. **UI Components**: For displaying signal statistics and validation results

The service provides a solid foundation for the timing diagram conversion pipeline.
