import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setViewportTimeRange } from '../../store/slices/viewConfigSlice';

interface TimeRangeSelectorProps {
  className?: string;
  height?: number;
}

// Throttle utility for performance
const useThrottle = (callback: Function, delay: number) => {
  const lastExecuted = useRef<number>(0);
  
  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastExecuted.current >= delay) {
      lastExecuted.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  className,
  height = 60,
}) => {
  const dispatch = useAppDispatch();
  const { timeRange } = useAppSelector(state => state.signalData);
  const { viewportTimeRange } = useAppSelector(state => state.viewConfig);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });

  // Initialize viewport range when data is loaded
  useEffect(() => {
    if (timeRange && !viewportTimeRange) {
      console.log('✅ TimeRangeSelector: Setting initial viewport time range');
      dispatch(setViewportTimeRange(timeRange));
    }
  }, [timeRange, viewportTimeRange, dispatch]);

  const getTimeFromPosition = useCallback((x: number): number => {
    if (!containerRef.current || !timeRange) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = x / rect.width;
    return timeRange.startTime + ratio * (timeRange.endTime - timeRange.startTime);
  }, [timeRange]);

  const getPositionFromTime = useCallback((time: number): number => {
    if (!containerRef.current || !timeRange) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = (time - timeRange.startTime) / (timeRange.endTime - timeRange.startTime);
    return ratio * rect.width;
  }, [timeRange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !timeRange || !viewportTimeRange) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const viewportStart = getPositionFromTime(viewportTimeRange.startTime);
    const viewportEnd = getPositionFromTime(viewportTimeRange.endTime);

    const RESIZE_HANDLE_WIDTH = 8;

    if (Math.abs(x - viewportStart) <= RESIZE_HANDLE_WIDTH) {
      setIsResizing('left');
    } else if (Math.abs(x - viewportEnd) <= RESIZE_HANDLE_WIDTH) {
      setIsResizing('right');
    } else if (x >= viewportStart && x <= viewportEnd) {
      setIsDragging(true);
      setDragStart({ x, time: getTimeFromPosition(x) });
    } else {
      // Click outside viewport - center viewport on click position
      const clickTime = getTimeFromPosition(x);
      const duration = viewportTimeRange.endTime - viewportTimeRange.startTime;
      dispatch(setViewportTimeRange({
        startTime: clickTime - duration / 2,
        endTime: clickTime + duration / 2,
      }));
    }
  }, [timeRange, viewportTimeRange, getTimeFromPosition, getPositionFromTime, dispatch]);

  // Throttle mouse move to improve performance during dragging
  const throttledDispatch = useThrottle((newRange: any) => {
    dispatch(setViewportTimeRange(newRange));
  }, 16); // ~60fps

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !timeRange || !viewportTimeRange) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const currentTime = getTimeFromPosition(x);

    if (isDragging) {
      const deltaTime = currentTime - dragStart.time;
      const newStart = viewportTimeRange.startTime + deltaTime;
      const newEnd = viewportTimeRange.endTime + deltaTime;
      
      // Constrain to bounds
      if (newStart >= timeRange.startTime && newEnd <= timeRange.endTime) {
        throttledDispatch({
          startTime: newStart,
          endTime: newEnd,
        });
      }
    } else if (isResizing) {
      if (isResizing === 'left') {
        const newStart = Math.max(timeRange.startTime, Math.min(currentTime, viewportTimeRange.endTime - 1000));
        throttledDispatch({
          startTime: newStart,
          endTime: viewportTimeRange.endTime,
        });
      } else if (isResizing === 'right') {
        const newEnd = Math.min(timeRange.endTime, Math.max(currentTime, viewportTimeRange.startTime + 1000));
        throttledDispatch({
          startTime: viewportTimeRange.startTime,
          endTime: newEnd,
        });
      }
    }
  }, [isDragging, isResizing, timeRange, viewportTimeRange, dragStart, getTimeFromPosition, throttledDispatch]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (!timeRange) {
    return null;
  }

  const viewportStart = viewportTimeRange ? getPositionFromTime(viewportTimeRange.startTime) : 0;
  const viewportWidth = viewportTimeRange ? 
    getPositionFromTime(viewportTimeRange.endTime) - viewportStart : 0;

  return (
    <Box className={className} sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Timeline Overview
      </Typography>
      <Box
        ref={containerRef}
        onMouseDown={handleMouseDown}
        sx={{
          position: 'relative',
          height: height,
          backgroundColor: 'grey.100',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Background timeline */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
          }}
        />
        
        {/* Viewport window */}
        {viewportTimeRange && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: `${viewportStart}px`,
              width: `${viewportWidth}px`,
              height: '100%',
              backgroundColor: 'primary.main',
              opacity: 0.3,
              border: 2,
              borderColor: 'primary.main',
              cursor: isDragging ? 'grabbing' : 'grab',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -4,
                top: 0,
                width: 8,
                height: '100%',
                cursor: 'ew-resize',
                backgroundColor: 'primary.main',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                right: -4,
                top: 0,
                width: 8,
                height: '100%',
                cursor: 'ew-resize',
                backgroundColor: 'primary.main',
              },
            }}
          />
        )}
        
        {/* Time labels */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 8,
            fontSize: '10px',
            color: 'text.secondary',
          }}
        >
          {timeRange.startTime}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 8,
            fontSize: '10px',
            color: 'text.secondary',
          }}
        >
          {timeRange.endTime}
        </Box>
      </Box>
    </Box>
  );
};

export default TimeRangeSelector; 