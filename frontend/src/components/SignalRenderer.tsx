'use client';

import React, { useMemo } from 'react';
import { Signal, SignalType, SignalValue } from '../types/signal';

// Constants for signal rendering
const SIGNAL_HEIGHT = 40;

export interface SignalRendererProps {
  /** The signal to render */
  signal: Signal;
  /** Time scale factor (pixels per nanosecond) */
  timeScale: number;
  /** Y position for the signal baseline */
  yPosition: number;
  /** Start time of the visible viewport */
  viewportStartTime: number;
  /** End time of the visible viewport */
  viewportEndTime: number;
  /** Optional color override */
  colorOverride?: string;
  /** Whether to show signal as highlighted */
  highlighted?: boolean;
}

/**
 * Convert time to X-coordinate based on viewport and scale.
 */
function timeToX(time: number, timeScale: number, viewportStartTime: number): number {
  return (time - viewportStartTime) * timeScale;
}

/**
 * Convert signal value to Y-coordinate.
 */
function valueToY(value: SignalValue, baseY: number, signalHeight: number): number {
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
 * Core signal rendering component that transforms timing data into SVG paths.
 * Handles different signal types with appropriate visual styling and optimizations.
 */
export const SignalRenderer: React.FC<SignalRendererProps> = ({
  signal,
  timeScale,
  yPosition,
  viewportStartTime,
  viewportEndTime,
  colorOverride,
  highlighted = false,
}) => {
  // Memoized signal path calculation for performance
  const signalPath = useMemo(() => {
    // Filter transitions to only those visible in viewport
    const visibleTransitions = signal.transitions.filter((transition, index) => {
      const nextTransition = signal.transitions[index + 1];
      const transitionEnd = nextTransition ? nextTransition.time : viewportEndTime;
      
      return transition.time <= viewportEndTime && transitionEnd >= viewportStartTime;
    });

    if (visibleTransitions.length === 0) {
      return '';
    }

    const pathCommands: string[] = [];

    // Start path from the first transition or viewport start
    const startTime = Math.max(visibleTransitions[0].time, viewportStartTime);
    const startX = timeToX(startTime, timeScale, viewportStartTime);
    const startY = valueToY(visibleTransitions[0].value, yPosition, SIGNAL_HEIGHT);
    
    pathCommands.push(`M ${startX} ${startY}`);

    // Generate path commands for each transition
    for (let i = 0; i < visibleTransitions.length; i++) {
      const transition = visibleTransitions[i];
      const nextTransition = visibleTransitions[i + 1];
      
      const currentY = valueToY(transition.value, yPosition, SIGNAL_HEIGHT);
      
      if (nextTransition) {
        const nextX = timeToX(nextTransition.time, timeScale, viewportStartTime);
        const nextY = valueToY(nextTransition.value, yPosition, SIGNAL_HEIGHT);
        
        // Draw horizontal line to transition point
        pathCommands.push(`L ${nextX} ${currentY}`);
        // Draw vertical transition
        pathCommands.push(`L ${nextX} ${nextY}`);
      } else {
        // Extend to viewport end for the last transition
        const endX = timeToX(viewportEndTime, timeScale, viewportStartTime);
        pathCommands.push(`L ${endX} ${currentY}`);
      }
    }

    return pathCommands.join(' ');
  }, [signal.transitions, timeScale, yPosition, viewportStartTime, viewportEndTime]);

  // Determine signal color with precedence: override > signal.style.color > type default
  const signalColor = useMemo(() => {
    if (colorOverride) return colorOverride;
    if (signal.style.color) return signal.style.color;
    
    // Default colors by signal type
    switch (signal.type) {
      case SignalType.CLOCK:
        return '#FF6B6B';
      case SignalType.DATA:
        return '#45B7D1';
      case SignalType.CONTROL:
        return '#4ECDC4';
      case SignalType.BUS:
        return '#96CEB4';
      case SignalType.POWER:
        return '#F38BA8';
      default:
        return '#2563eb';
    }
  }, [colorOverride, signal.style.color, signal.type]);

  // Calculate line thickness
  const lineThickness = signal.style.thickness || 
    (signal.type === SignalType.POWER ? 3 : 
     signal.type === SignalType.CLOCK ? 2 : 1.5);

  // Apply highlighting effect
  const finalColor = highlighted ? adjustColorBrightness(signalColor, 30) : signalColor;
  const strokeOpacity = highlighted ? 1 : 0.9;

  return (
    <g 
      className="signal-renderer"
      data-signal-id={signal.id}
      data-signal-type={signal.type}
    >
      {/* Main signal path */}
      <path
        d={signalPath}
        stroke={finalColor}
        strokeWidth={lineThickness}
        strokeOpacity={strokeOpacity}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: signal.style.style === 'dashed' ? '5,5' : 
                          signal.style.style === 'dotted' ? '2,2' : 'none'
        }}
      />

      {/* Clock edge markers for clock signals */}
      {signal.type === SignalType.CLOCK && signal.transitions.map((transition, index) => {
        const nextTransition = signal.transitions[index + 1];
        
        // Only create markers for rising edges
        if (transition.value === 'LOW' && nextTransition?.value === 'HIGH') {
          const x = timeToX(nextTransition.time, timeScale, viewportStartTime);
          const y = valueToY('LOW', yPosition, SIGNAL_HEIGHT);
          const topY = valueToY('HIGH', yPosition, SIGNAL_HEIGHT);
          const markerSize = 4;
          
          // Create triangular marker pointing up for rising edge
          const points = `${x},${y} ${x + markerSize},${y - markerSize/2} ${x},${topY}`;
          
          return (
            <polygon
              key={`clock-marker-${index}`}
              points={points}
              fill={finalColor}
              opacity={strokeOpacity}
            />
          );
        }
        return null;
      })}

      {/* Bus value labels for bus signals */}
      {signal.type === SignalType.BUS && signal.transitions.map((transition, index) => {
        const nextTransition = signal.transitions[index + 1];
        
        // Skip HIGH_Z and UNKNOWN states
        if (transition.value === 'HIGH_Z' || transition.value === 'UNKNOWN' || transition.value === 'XX') {
          return null;
        }

        // Calculate label position at the center of the state duration
        const startTime = transition.time;
        const endTime = nextTransition ? nextTransition.time : viewportStartTime + 100;
        const labelTime = startTime + (endTime - startTime) / 2;
        
        const x = timeToX(labelTime, timeScale, viewportStartTime);
        const y = valueToY(transition.value, yPosition, SIGNAL_HEIGHT);
        
        // Calculate text width to size background properly
        const textContent = String(transition.value);
        const textWidth = textContent.length * 7 + 8; // Approximate character width
        
        return (
          <g key={`bus-label-${index}`}>
            {/* Background rectangle for readability */}
            <rect
              x={x - textWidth/2}
              y={y - 8}
              width={textWidth}
              height={16}
              fill="white"
              stroke={finalColor}
              strokeWidth={0.5}
              opacity={0.95}
              rx={3}
            />
            {/* Label text */}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontFamily="monospace"
              fill={finalColor}
              fontWeight="600"
            >
              {textContent}
            </text>
          </g>
        );
      })}

      {/* Debug information removed to prevent text clutter */}
    </g>
  );
};

/**
 * Utility function to adjust color brightness for highlighting.
 */
function adjustColorBrightness(color: string, percent: number): string {
  // Simple color brightness adjustment
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const newR = Math.min(255, Math.max(0, r + percent));
    const newG = Math.min(255, Math.max(0, g + percent));
    const newB = Math.min(255, Math.max(0, b + percent));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  return color; // Return original if not a hex color
}

export default SignalRenderer; 