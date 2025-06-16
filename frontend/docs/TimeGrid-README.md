# Time Grid Rendering System

## Overview

The Time Grid Rendering System provides a dynamic, professional-looking grid overlay for timing diagrams. It automatically calculates optimal tick spacing based on zoom levels and displays time labels with configurable units.

## Features

### Core Functionality
- **Dynamic Tick Calculation**: Automatically determines optimal spacing between grid lines
- **Visual Hierarchy**: Displays major ticks (thick lines) and minor ticks (thin lines)
- **Time Labels**: Shows time values with configurable units (ns, μs, cycles)
- **Adaptive Density**: Prevents visual clutter by adjusting tick density based on zoom

### Performance Optimizations
- **Memoized Calculations**: Expensive grid calculations are cached
- **Viewport Culling**: Only renders ticks within the visible area
- **React.memo**: Prevents unnecessary re-renders
- **Debounced Updates**: Optimizes performance during continuous zoom/pan

### Accessibility
- **ARIA Labels**: Proper accessibility support for screen readers
- **High Contrast Support**: Adapts to user's contrast preferences
- **Reduced Motion**: Respects user's motion preferences

## Usage

### Basic Usage

```tsx
import { TimeGrid } from '@/components';

<TimeGrid
  width={800}
  height={400}
  timeUnit="ns"
  startTime={0}
  endTime={1000}
  canvasTransforms={transforms}
/>
```

### Integration with TimingCanvas

```tsx
import { TimingCanvasWithGrid } from '@/components';

<TimingCanvasWithGrid
  width={800}
  height={400}
  timeRange={{ start: 0, end: 1000 }}
  signalCount={4}
  timeUnit="ns"
/>
```

## API Reference

### TimeGrid Component

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `width` | `number` | Canvas width in pixels |
| `height` | `number` | Canvas height in pixels |
| `timeUnit` | `'ns' \| 'μs' \| 'cycles'` | Time unit for labels |
| `startTime` | `number` | Visible time range start |
| `endTime` | `number` | Visible time range end |
| `canvasTransforms` | `CanvasTransforms` | Coordinate transformation functions |

### Utility Functions

#### `calculateOptimalTickInterval(timeSpan, availableWidth, minPixelSpacing?, maxPixelSpacing?)`

Calculates the best tick interval for the given parameters.

**Parameters:**
- `timeSpan`: Total time span visible
- `availableWidth`: Available pixel width
- `minPixelSpacing`: Minimum pixels between ticks (default: 20)
- `maxPixelSpacing`: Maximum pixels between ticks (default: 200)

#### `formatTimeValue(time, timeUnit, precision?)`

Formats time values for display with appropriate precision.

**Parameters:**
- `time`: Time value to format
- `timeUnit`: Unit type for suffix
- `precision`: Decimal places (default: 2)

#### `generateGridConfig(startTime, endTime, canvasTransforms, timeUnit, availableWidth)`

Generates complete grid configuration with major and minor ticks.

## Mathematical Algorithm

The tick calculation follows these principles:

1. **Human-Friendly Intervals**: Uses [1, 2, 5] × 10^n pattern
2. **Optimal Density**: Maintains 20-200 pixel spacing between ticks
3. **Hierarchical Structure**: Major ticks every 5 minor ticks
4. **Precision Handling**: Avoids floating-point precision issues

### Tick Calculation Process

```
1. Calculate rough interval: timeSpan / maxPossibleTicks
2. Find magnitude: 10^floor(log10(roughInterval))
3. Test base intervals [1, 2, 5] × magnitude
4. Select interval with best pixel spacing
5. Generate major ticks (5× minor interval)
6. Position labels to prevent overlap
```

## Styling

The component uses CSS modules for styling with these key classes:

- `.timeGrid`: Main container
- `.majorTick`: Major grid lines (1.5px, #333)
- `.minorTick`: Minor grid lines (0.5px, #ccc)
- `.timeLabel`: Time labels (12px, system font)
- `.baseline`: Bottom reference line

### Responsive Design

- Mobile: Smaller font sizes (10px)
- High Contrast: Enhanced line visibility
- Print: Optimized colors for printing

## Performance Considerations

### Optimization Strategies

1. **Viewport Culling**: Only render visible ticks
2. **Memoization**: Cache expensive calculations
3. **Efficient Keys**: Use stable React keys for SVG elements
4. **Vector Effects**: Use `non-scaling-stroke` for consistent line widths

### Memory Management

- Grid configurations are recalculated only when dependencies change
- Old tick arrays are garbage collected automatically
- SVG elements are reused when possible

## Integration Points

### Canvas Coordinate System

The TimeGrid integrates seamlessly with the existing canvas coordinate system:

```tsx
const transforms = useCanvasTransforms({
  timeRange,
  signalCount,
  viewportDimensions: { width, height },
  padding: { top: 40, right: 40, bottom: 60, left: 120 }
});
```

### State Management

No internal state management is required - the grid is purely reactive to props:

```tsx
// Grid updates automatically when any of these change
const gridConfig = useMemo(() => {
  return generateGridConfig(startTime, endTime, canvasTransforms, timeUnit, width);
}, [startTime, endTime, canvasTransforms, timeUnit, width]);
```

## Future Enhancements

### Planned Features

1. **Zoom-dependent label density**: Fewer labels at high zoom levels
2. **Custom tick intervals**: User-defined spacing
3. **Multi-scale grids**: Different scales for different zoom levels
4. **Theme support**: Dark/light mode styling
5. **Animation support**: Smooth transitions during zoom

### Extension Points

The system is designed for extensibility:

- Custom formatters for time values
- Alternative tick calculation algorithms
- Custom visual styles
- Additional time units

## Troubleshooting

### Common Issues

**Grid lines not visible**
- Check if timeRange is valid (end > start)
- Verify canvasTransforms are properly initialized
- Ensure width/height are positive numbers

**Labels overlapping**
- Increase minimum label spacing in `visibleLabels` calculation
- Reduce precision in `formatTimeValue`
- Consider responsive font sizes

**Performance issues**
- Enable React DevTools to check for unnecessary re-renders
- Verify memoization dependencies are stable
- Consider debouncing continuous updates

### Debug Mode

Development builds include debug information:

```tsx
{process.env.NODE_ENV === 'development' && (
  <g>
    <text>Debug: {tickCount} ticks, {interval}ns interval</text>
  </g>
)}
``` 