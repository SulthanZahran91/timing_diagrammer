'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimingCanvasProps, LogicalCoordinates, CanvasState } from '../types/canvas';
import { useCanvasTransforms, getRelativeMouseCoordinates } from '../hooks/useCanvasTransforms';
import styles from './TimingCanvas.module.css';

const DEFAULT_PADDING = {
  top: 40,
  right: 40,
  bottom: 60,
  left: 120,
};

export const TimingCanvas: React.FC<TimingCanvasProps> = ({
  width = 800,
  height = 600,
  timeRange,
  signalCount,
  onMouseMove,
  onMouseClick,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas state management
  const [canvasState, setCanvasState] = useState<CanvasState>({
    viewportDimensions: { width, height },
    timeRange,
    signalCount,
    padding: DEFAULT_PADDING,
  });

  // Get coordinate transformation functions
  const transforms = useCanvasTransforms(canvasState);

  // Handle window resize for responsive design
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCanvasState(prev => ({
        ...prev,
        viewportDimensions: {
          width: rect.width,
          height: rect.height,
        },
      }));
    }
  }, []);

  // Set up resize observer for responsive behavior
  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Update canvas state when props change
  useEffect(() => {
    setCanvasState(prev => ({
      ...prev,
      timeRange,
      signalCount,
      viewportDimensions: { width, height },
    }));
  }, [timeRange, signalCount, width, height]);

  // Mouse event handlers
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      if (!onMouseMove) return;

      const { x, y } = getRelativeMouseCoordinates(event);
      const logicalCoords: LogicalCoordinates = {
        time: transforms.pixelsToTime(x),
        signal: transforms.pixelsToSignal(y),
      };

      onMouseMove(event, logicalCoords);
    },
    [onMouseMove, transforms]
  );

  const handleMouseClick = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      if (!onMouseClick) return;

      const { x, y } = getRelativeMouseCoordinates(event);
      const logicalCoords: LogicalCoordinates = {
        time: transforms.pixelsToTime(x),
        signal: transforms.pixelsToSignal(y),
      };

      onMouseClick(event, logicalCoords);
    },
    [onMouseClick, transforms]
  );

  // Prevent context menu on right click
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const containerClasses = `${styles.canvasContainer} ${className || ''}`.trim();

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={{ width, height }}
    >
      <svg
        className={styles.canvas}
        width={canvasState.viewportDimensions.width}
        height={canvasState.viewportDimensions.height}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        onContextMenu={handleContextMenu}
        role="img"
        aria-label="Timing diagram canvas"
      >
        {/* Background rectangle for better event handling */}
        <rect
          x={0}
          y={0}
          width={canvasState.viewportDimensions.width}
          height={canvasState.viewportDimensions.height}
          fill="transparent"
          pointerEvents="all"
        />
        
        {/* Render children components (future signals, grid, etc.) */}
        {children}
        
        {/* Debug information (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <g>
            <text
              x={10}
              y={20}
              fontSize="12"
              fill="#666"
              fontFamily="monospace"
            >
              Time: {timeRange.start.toFixed(2)}ns - {timeRange.end.toFixed(2)}ns
            </text>
            <text
              x={10}
              y={35}
              fontSize="12"
              fill="#666"
              fontFamily="monospace"
            >
              Signals: {signalCount}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// Export transforms hook for use by child components
export { useCanvasTransforms } from '../hooks/useCanvasTransforms';
export type { TimingCanvasProps, LogicalCoordinates } from '../types/canvas'; 