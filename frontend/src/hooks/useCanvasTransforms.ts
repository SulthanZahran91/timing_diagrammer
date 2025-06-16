import { useMemo } from 'react';
import { CanvasTransforms, TimeRange, ViewportDimensions } from '../types/canvas';

interface UseCanvasTransformsProps {
  timeRange: TimeRange;
  signalCount: number;
  viewportDimensions: ViewportDimensions;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const useCanvasTransforms = ({
  timeRange,
  signalCount,
  viewportDimensions,
  padding,
}: UseCanvasTransformsProps): CanvasTransforms => {
  return useMemo(() => {
    // Calculate available drawing area
    const drawingWidth = viewportDimensions.width - padding.left - padding.right;
    const drawingHeight = viewportDimensions.height - padding.top - padding.bottom;
    
    // Time range for X-axis calculations
    const timeSpan = timeRange.end - timeRange.start;
    
    // Signal spacing for Y-axis calculations
    const signalHeight = signalCount > 0 ? drawingHeight / signalCount : 0;
    
    const transforms: CanvasTransforms = {
      // Convert time to X pixel coordinate
      timeToPixels: (time: number): number => {
        if (timeSpan === 0) return padding.left;
        const normalizedTime = (time - timeRange.start) / timeSpan;
        return padding.left + normalizedTime * drawingWidth;
      },

      // Convert X pixel coordinate to time
      pixelsToTime: (pixels: number): number => {
        const normalizedX = (pixels - padding.left) / drawingWidth;
        return timeRange.start + normalizedX * timeSpan;
      },

      // Convert signal index to Y pixel coordinate
      signalToY: (signalIndex: number): number => {
        return padding.top + signalIndex * signalHeight + signalHeight / 2;
      },

      // Convert Y pixel coordinate to signal index
      pixelsToSignal: (pixels: number): number => {
        const adjustedY = pixels - padding.top;
        return Math.floor(adjustedY / signalHeight);
      },
    };

    return transforms;
  }, [timeRange, signalCount, viewportDimensions, padding]);
};

// Utility function to get mouse coordinates relative to SVG element
export const getRelativeMouseCoordinates = (
  event: React.MouseEvent<SVGElement>
): { x: number; y: number } => {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}; 