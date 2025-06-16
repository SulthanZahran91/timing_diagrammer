/**
 * Signal processing utilities for timing diagram rendering.
 * Contains path generation, optimization, and coordinate calculation functions.
 */

import { SignalType, SignalValue, TimingPoint } from '../types/signal';

/**
 * Interface for clock marker coordinates.
 */
export interface ClockMarker {
  points: string;
  time: number;
}

/**
 * Interface for bus label positioning.
 */
export interface BusLabel {
  x: number;
  y: number;
  text: string;
  time: number;
}

/**
 * Interface for high-impedance pattern lines.
 */
export interface HighZPattern {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Return type for signal path generation.
 */
export interface SignalPaths {
  mainPath: string;
  clockMarkers: ClockMarker[];
  busLabels: BusLabel[];
  highZPatterns?: HighZPattern[];
}

/**
 * Parameters for signal path generation.
 */
export interface SignalPathParams {
  transitions: TimingPoint[];
  signalType: SignalType;
  timeScale: number;
  yPosition: number;
  signalHeight: number;
  viewportStartTime: number;
  viewportEndTime: number;
}

/**
 * Convert time to X-coordinate based on viewport and scale.
 */
export function timeToX(time: number, timeScale: number, viewportStartTime: number): number {
  return (time - viewportStartTime) * timeScale;
}

/**
 * Convert signal value to Y-coordinate.
 */
export function valueToY(value: SignalValue, baseY: number, signalHeight: number): number {
  switch (value) {
    case 'HIGH':
    case 'RISING':
      return baseY;
    case 'LOW':
    case 'FALLING':
      return baseY + signalHeight * 0.6;
    case 'HIGH_Z':
    case 'UNKNOWN':
      return baseY + signalHeight * 0.3;
    default:
      // For bus values (strings), position in middle
      return baseY + signalHeight * 0.3;
  }
}

/**
 * Check if a transition should be rendered based on time visibility and minimum pixel width.
 */
export function shouldRenderTransition(
  transition: TimingPoint,
  nextTransition: TimingPoint | undefined,
  timeScale: number,
  minPixelWidth: number = 2
): boolean {
  if (!nextTransition) return true;
  
  const duration = nextTransition.time - transition.time;
  const pixelWidth = duration * timeScale;
  
  return pixelWidth >= minPixelWidth;
}

/**
 * Generate clock edge markers for clock signals.
 */
function generateClockMarkers(
  transitions: TimingPoint[],
  timeScale: number,
  yPosition: number,
  signalHeight: number,
  viewportStartTime: number
): ClockMarker[] {
  const markers: ClockMarker[] = [];
  const markerSize = 4;

  transitions.forEach((transition, index) => {
    const nextTransition = transitions[index + 1];
    
    // Only create markers for rising edges
    if (transition.value === 'LOW' && nextTransition?.value === 'HIGH') {
      const x = timeToX(nextTransition.time, timeScale, viewportStartTime);
      const y = valueToY('LOW', yPosition, signalHeight);
      const topY = valueToY('HIGH', yPosition, signalHeight);
      
      // Create triangular marker pointing up for rising edge
      const points = `${x},${y} ${x + markerSize},${y - markerSize/2} ${x},${topY}`;
      
      markers.push({
        points,
        time: nextTransition.time
      });
    }
  });

  return markers;
}

/**
 * Generate bus value labels for bus signals.
 */
function generateBusLabels(
  transitions: TimingPoint[],
  timeScale: number,
  yPosition: number,
  signalHeight: number,
  viewportStartTime: number
): BusLabel[] {
  const labels: BusLabel[] = [];

  transitions.forEach((transition, index) => {
    const nextTransition = transitions[index + 1];
    
    // Skip HIGH_Z and UNKNOWN states
    if (transition.value === 'HIGH_Z' || transition.value === 'UNKNOWN' || transition.value === 'XX') {
      return;
    }

    // Calculate label position at the center of the state duration
    const startTime = transition.time;
    const endTime = nextTransition ? nextTransition.time : viewportStartTime + 100; // Default fallback
    const labelTime = startTime + (endTime - startTime) / 2;
    
    const x = timeToX(labelTime, timeScale, viewportStartTime);
    const y = valueToY(transition.value, yPosition, signalHeight);
    
    labels.push({
      x,
      y,
      text: String(transition.value),
      time: labelTime
    });
  });

  return labels;
}

/**
 * Generate high-impedance pattern lines.
 */
function generateHighZPatterns(
  transitions: TimingPoint[],
  timeScale: number,
  yPosition: number,
  signalHeight: number,
  viewportStartTime: number
): HighZPattern[] {
  const patterns: HighZPattern[] = [];
  const patternSpacing = 10; // Pixels between diagonal lines

  transitions.forEach((transition, index) => {
    const nextTransition = transitions[index + 1];
    
    if (transition.value === 'HIGH_Z' || transition.value === 'UNKNOWN') {
      const startX = timeToX(transition.time, timeScale, viewportStartTime);
      const endX = nextTransition ? 
        timeToX(nextTransition.time, timeScale, viewportStartTime) : 
        startX + 50;
      
      const topY = valueToY('HIGH', yPosition, signalHeight);
      const bottomY = valueToY('LOW', yPosition, signalHeight);
      
      // Create diagonal pattern lines
      for (let x = startX; x < endX; x += patternSpacing) {
        patterns.push({
          x1: x,
          y1: topY,
          x2: Math.min(x + patternSpacing/2, endX),
          y2: bottomY
        });
      }
    }
  });

  return patterns;
}

/**
 * Main function to generate all signal paths and markers.
 */
export function generateSignalPath(params: SignalPathParams): SignalPaths {
  const {
    transitions,
    signalType,
    timeScale,
    yPosition,
    signalHeight,
    viewportStartTime,
    viewportEndTime
  } = params;

  if (transitions.length === 0) {
    return { mainPath: '', clockMarkers: [], busLabels: [] };
  }

  const pathCommands: string[] = [];
  let clockMarkers: ClockMarker[] = [];
  let busLabels: BusLabel[] = [];
  let highZPatterns: HighZPattern[] = [];

  // Handle special signal types
  if (signalType === SignalType.CLOCK) {
    clockMarkers = generateClockMarkers(transitions, timeScale, yPosition, signalHeight, viewportStartTime);
  }
  
  if (signalType === SignalType.BUS) {
    busLabels = generateBusLabels(transitions, timeScale, yPosition, signalHeight, viewportStartTime);
  }

  // Generate high-Z patterns for any signal type
  highZPatterns = generateHighZPatterns(transitions, timeScale, yPosition, signalHeight, viewportStartTime);

  // Start path from the first transition or viewport start
  const startTime = Math.max(transitions[0].time, viewportStartTime);
  const startX = timeToX(startTime, timeScale, viewportStartTime);
  const startY = valueToY(transitions[0].value, yPosition, signalHeight);
  
  pathCommands.push(`M ${startX} ${startY}`);

  // Generate path commands for each transition
  for (let i = 0; i < transitions.length; i++) {
    const transition = transitions[i];
    const nextTransition = transitions[i + 1];
    
    const currentX = timeToX(transition.time, timeScale, viewportStartTime);
    const currentY = valueToY(transition.value, yPosition, signalHeight);
    
    if (nextTransition) {
      const nextX = timeToX(nextTransition.time, timeScale, viewportStartTime);
      const nextY = valueToY(nextTransition.value, yPosition, signalHeight);
      
      // Check if transition is visible
      if (shouldRenderTransition(transition, nextTransition, timeScale)) {
        // Draw horizontal line to transition point
        pathCommands.push(`L ${nextX} ${currentY}`);
        // Draw vertical transition
        pathCommands.push(`L ${nextX} ${nextY}`);
      } else {
        // For very short pulses, draw a thin vertical line
        pathCommands.push(`L ${currentX} ${currentY}`);
        pathCommands.push(`M ${currentX} ${yPosition}`);
        pathCommands.push(`L ${currentX} ${yPosition + signalHeight * 0.6}`);
        pathCommands.push(`M ${nextX} ${nextY}`);
      }
    } else {
      // Extend to viewport end for the last transition
      const endX = timeToX(viewportEndTime, timeScale, viewportStartTime);
      pathCommands.push(`L ${endX} ${currentY}`);
    }
  }

  return {
    mainPath: pathCommands.join(' '),
    clockMarkers,
    busLabels,
    highZPatterns: highZPatterns.length > 0 ? highZPatterns : undefined
  };
}

/**
 * Optimize signal path by removing redundant points and simplifying curves.
 */
export function optimizeSignalPath(pathData: string, tolerance: number = 1.0): string {
  // Simple optimization: remove very close points
  // This is a basic implementation - could be enhanced with more sophisticated algorithms
  const commands = pathData.split(/([ML])/);
  const optimized: string[] = [];
  let lastX = 0;
  let lastY = 0;

  for (let i = 0; i < commands.length; i += 2) {
    const command = commands[i];
    const coords = commands[i + 1]?.trim().split(' ').map(Number);
    
    if (coords && coords.length >= 2) {
      const [x, y] = coords;
      const distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
      
      if (distance > tolerance || command === 'M') {
        optimized.push(command + ' ' + coords.join(' '));
        lastX = x;
        lastY = y;
      }
    }
  }

  return optimized.join(' ');
} 