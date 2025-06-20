import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';
import { TimingDiagram } from '../TimingDiagram';
import { TimeRangeSelector } from '../TimeRangeSelector/TimeRangeSelector';
import { ZoomControls } from '../ZoomControls/ZoomControls';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setViewportTimeRange, zoomViewport } from '../../store/slices/viewConfigSlice';
import { WaveDromConverterService } from '../../services/waveDromConverter/waveDromConverter';
import { DEFAULT_CONVERSION_CONFIG } from '../../services/waveDromConverter/waveDromConverter.types';
import { WaveDromDiagram } from '../TimingDiagram/TimingDiagram.types';

interface TimingDiagramWithNavigationProps {
  className?: string;
  diagramWidth?: number;
  diagramHeight?: number;
}

const converter = new WaveDromConverterService();

export const TimingDiagramWithNavigation: React.FC<TimingDiagramWithNavigationProps> = ({
  className,
  diagramWidth = 1100,
  diagramHeight = 400,
}) => {
  const dispatch = useAppDispatch();
  const { events, timeRange } = useAppSelector(state => state.signalData);
  const { viewportTimeRange } = useAppSelector(state => state.viewConfig);
  
  const [diagram, setDiagram] = useState<WaveDromDiagram | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, time: 0 });
  const conversionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastViewportRef = useRef<any>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentMountedRef = useRef(false);

  // Track component mounting to prevent initial wheel events
  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  // Convert to WaveDrom with proper debouncing
  useEffect(() => {
    if (!events.length || !viewportTimeRange) return;

    // Clear any pending conversion
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }

    // Check if viewport actually changed to avoid unnecessary conversions
    const viewportChanged = !lastViewportRef.current || 
      lastViewportRef.current.startTime !== viewportTimeRange.startTime ||
      lastViewportRef.current.endTime !== viewportTimeRange.endTime;

    if (!viewportChanged) return;

    // If interacting, delay the conversion
    const delay = isInteracting ? 300 : 0;

    conversionTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Converting to WaveDrom (debounced)');
      
      try {
        const result = converter.convertToWaveDrom(
          events,
          viewportTimeRange,
          DEFAULT_CONVERSION_CONFIG
        );
        
        console.log('✅ WaveDrom conversion successful:', result.diagram.signal?.length, 'signals');
        setDiagram(result.diagram);
        lastViewportRef.current = { ...viewportTimeRange };
      } catch (error) {
        console.error('❌ Error converting to WaveDrom:', error);
        setDiagram(null);
      }
    }, delay);

    return () => {
      if (conversionTimeoutRef.current) {
        clearTimeout(conversionTimeoutRef.current);
      }
    };
  }, [events, viewportTimeRange, isInteracting]);

  const getTimeFromPosition = useCallback((x: number): number => {
    if (!diagramRef.current || !viewportTimeRange) return 0;
    const rect = diagramRef.current.getBoundingClientRect();
    const ratio = x / rect.width;
    return viewportTimeRange.startTime + ratio * (viewportTimeRange.endTime - viewportTimeRange.startTime);
  }, [viewportTimeRange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!viewportTimeRange) return;
    
    console.log('🖱️ Mouse down - starting pan');
    setIsPanning(true);
    setIsInteracting(true);
    
    const rect = diagramRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      setPanStart({ x, time: getTimeFromPosition(x) });
    }
  }, [viewportTimeRange, getTimeFromPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning || !viewportTimeRange || !diagramRef.current) return;

    // Use requestAnimationFrame for smooth dragging
    requestAnimationFrame(() => {
      const rect = diagramRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const currentTime = getTimeFromPosition(x);
      const deltaTime = panStart.time - currentTime;
      
      const duration = viewportTimeRange.endTime - viewportTimeRange.startTime;
      const newStart = viewportTimeRange.startTime + deltaTime;
      const newEnd = newStart + duration;

      dispatch(setViewportTimeRange({
        startTime: newStart,
        endTime: newEnd,
      }));
    });
  }, [isPanning, viewportTimeRange, panStart, getTimeFromPosition, dispatch]);

  const handleMouseUp = useCallback(() => {
    console.log('🖱️ Mouse up - ending pan');
    setIsPanning(false);
    // End interaction after a delay to allow for final conversion
    setTimeout(() => setIsInteracting(false), 100);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    console.log('🎯 Wheel event detected:', {
      deltaY: e.deltaY,
      isInteracting,
      hasViewport: !!viewportTimeRange,
      hasRef: !!diagramRef.current,
      componentMounted: componentMountedRef.current
    });

    // Multiple layers of protection
    if (!viewportTimeRange || !diagramRef.current || isInteracting) {
      console.log('🚫 Wheel event blocked - conditions not met');
      return;
    }

    // Don't process wheel events too quickly
    if (wheelTimeoutRef.current) {
      console.log('🚫 Wheel event blocked - too frequent');
      return;
    }

    // Block wheel events for a short period
    wheelTimeoutRef.current = setTimeout(() => {
      wheelTimeoutRef.current = null;
    }, 100);
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('✅ Processing wheel event');
    
    // Temporarily mark as interacting to prevent multiple wheel events
    setIsInteracting(true);
    
    const rect = diagramRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const centerTime = getTimeFromPosition(x);
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    
    console.log('🔍 Dispatching zoom:', { factor: zoomFactor, centerTime });
    
    dispatch(zoomViewport({ 
      factor: zoomFactor,
      centerTime: centerTime 
    }));
    
    // End interaction after zoom with a short delay
    setTimeout(() => setIsInteracting(false), 150);
  }, [viewportTimeRange, getTimeFromPosition, dispatch, isInteracting]);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  if (!viewportTimeRange) {
    return null;
  }

  return (
    <Box className={className}>
      {/* Zoom Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ZoomControls />
      </Box>

      {/* Main Timing Diagram */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          ref={diagramRef}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          sx={{
            cursor: isPanning ? 'grabbing' : 'grab',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          {diagram ? (
            <TimingDiagram
              diagram={diagram}
              width={diagramWidth}
              height={diagramHeight}
            />
          ) : (
            <div>Loading diagram...</div>
          )}
        </Box>
      </Paper>

      {/* Timeline Minimap */}
      <TimeRangeSelector />
    </Box>
  );
};

export default TimingDiagramWithNavigation; 