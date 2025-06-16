'use client';

import React from 'react';
import { TimingCanvas } from './TimingCanvas';
import { TimeGrid } from './TimeGrid';
import { useCanvasTransforms } from '../hooks/useCanvasTransforms';
import { TimeUnit, TimeRange } from '../types/canvas';

interface TimingCanvasWithGridProps {
  width?: number;
  height?: number;
  timeRange: TimeRange;
  signalCount: number;
  timeUnit?: TimeUnit;
  className?: string;
}

/**
 * Example component demonstrating TimeGrid integration with TimingCanvas
 * This shows how to create a timing diagram with a time grid overlay
 */
export const TimingCanvasWithGrid: React.FC<TimingCanvasWithGridProps> = ({
  width = 800,
  height = 600,
  timeRange,
  signalCount,
  timeUnit = 'ns',
  className,
}) => {
  return (
    <TimingCanvas
      width={width}
      height={height}
      timeRange={timeRange}
      signalCount={signalCount}
      className={className}
    >
      {/* TimeGrid component automatically calculates and renders the grid */}
      <TimeGrid
        width={width}
        height={height}
        timeUnit={timeUnit}
        startTime={timeRange.start}
        endTime={timeRange.end}
        canvasTransforms={
          useCanvasTransforms({
            timeRange,
            signalCount,
            viewportDimensions: { width, height },
            padding: { top: 40, right: 40, bottom: 60, left: 120 }
          })
        }
      />
      
      {/* Future signal components would go here */}
      {/* <DigitalSignal ... /> */}
      {/* <ClockSignal ... /> */}
    </TimingCanvas>
  );
};

/**
 * Example usage:
 * 
 * ```tsx
 * <TimingCanvasWithGrid
 *   width={1000}
 *   height={400}
 *   timeRange={{ start: 0, end: 100 }}
 *   signalCount={4}
 *   timeUnit="ns"
 * />
 * ```
 */ 