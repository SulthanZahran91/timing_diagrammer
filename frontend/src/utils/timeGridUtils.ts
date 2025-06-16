import { GridTick, GridConfig, TimeUnit, CanvasTransforms } from '../types/canvas';

// Human-friendly intervals following the pattern [1, 2, 5] * 10^n
const BASE_INTERVALS = [1, 2, 5];

/**
 * Calculate the optimal tick interval based on available pixels and zoom level
 */
export function calculateOptimalTickInterval(
  timeSpan: number,
  availableWidth: number,
  minPixelSpacing = 20,
  maxPixelSpacing = 200
): number {
  if (timeSpan <= 0 || availableWidth <= 0) return 1;

  // Calculate how many ticks would fit with minimum spacing
  const maxTicks = Math.floor(availableWidth / minPixelSpacing);
  const minTicks = Math.floor(availableWidth / maxPixelSpacing);

  // Start with a rough interval
  const roughInterval = timeSpan / maxTicks;

  // Find the magnitude (power of 10)
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));

  // Find the best base interval
  let bestInterval = magnitude;
  let bestError = Infinity;

  for (const base of BASE_INTERVALS) {
    const testInterval = base * magnitude;
    const tickCount = Math.floor(timeSpan / testInterval);
    
    // Check if this interval gives us a reasonable number of ticks
    if (tickCount >= minTicks && tickCount <= maxTicks) {
      const pixelSpacing = availableWidth / tickCount;
      const error = Math.abs(pixelSpacing - (minPixelSpacing + maxPixelSpacing) / 2);
      
      if (error < bestError) {
        bestError = error;
        bestInterval = testInterval;
      }
    }
  }

  return bestInterval;
}

/**
 * Format time value for display based on the time unit and precision needed
 */
export function formatTimeValue(time: number, timeUnit: TimeUnit, precision = 2): string {
  // Handle zero specially
  if (time === 0) return '0';

  const unitSuffixes = {
    'ns': 'ns',
    'μs': 'μs', 
    'cycles': 'cyc'
  };

  // For very small numbers, use scientific notation
  if (Math.abs(time) < 0.001) {
    return `${time.toExponential(1)}${unitSuffixes[timeUnit]}`;
  }

  // For normal numbers, use fixed precision
  let formattedValue = time.toFixed(precision);
  
  // Remove trailing zeros and decimal point if not needed
  formattedValue = formattedValue.replace(/\.?0+$/, '');
  
  return `${formattedValue}${unitSuffixes[timeUnit]}`;
}

/**
 * Generate grid configuration with major and minor ticks
 */
export function generateGridConfig(
  startTime: number,
  endTime: number,
  canvasTransforms: CanvasTransforms,
  timeUnit: TimeUnit,
  availableWidth: number
): GridConfig {
  const timeSpan = endTime - startTime;
  
  // Calculate optimal minor tick interval
  const minorTickInterval = calculateOptimalTickInterval(timeSpan, availableWidth);
  
  // Major ticks every 5 minor ticks (or adjust based on density)
  const majorTickInterval = minorTickInterval * 5;

  // Generate minor ticks
  const minorTicks: GridTick[] = [];
  const startTick = Math.ceil(startTime / minorTickInterval) * minorTickInterval;
  
  for (let time = startTick; time <= endTime; time += minorTickInterval) {
    const position = canvasTransforms.timeToPixels(time);
    // Only add ticks that are within the visible area
    if (position >= 0 && position <= availableWidth) {
      minorTicks.push({
        position,
        time,
        isMajor: false
      });
    }
  }

  // Generate major ticks
  const majorTicks: GridTick[] = [];
  const startMajorTick = Math.ceil(startTime / majorTickInterval) * majorTickInterval;
  
  for (let time = startMajorTick; time <= endTime; time += majorTickInterval) {
    const position = canvasTransforms.timeToPixels(time);
    // Only add ticks that are within the visible area
    if (position >= 0 && position <= availableWidth) {
      majorTicks.push({
        position,
        time,
        isMajor: true,
        label: formatTimeValue(time, timeUnit)
      });
    }
  }

  return {
    majorTickInterval,
    minorTickInterval,
    majorTicks,
    minorTicks
  };
}

/**
 * Debounce function for performance optimization during continuous zoom/pan
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 