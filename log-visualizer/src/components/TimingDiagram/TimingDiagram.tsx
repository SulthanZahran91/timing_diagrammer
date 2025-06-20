import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useMemo,
} from 'react';
import { Box, Alert } from '@mui/material';
import { TimingDiagramProps, TimingDiagramRef } from './TimingDiagram.types';

// Declare WaveDrom on the window object for global access
declare global {
  interface Window {
    WaveDrom: {
      ProcessAll: () => void;
    };
  }
}

export const TimingDiagram = forwardRef<TimingDiagramRef, TimingDiagramProps>(
  ({ diagram, width = 800, height = 400, className, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const lastDiagramRef = useRef<string>('');
    const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoize diagram serialization to avoid unnecessary re-renders
    const diagramKey = useMemo(() => {
      return JSON.stringify(diagram);
    }, [diagram]);

    useImperativeHandle(ref, () => ({
      getDiagramElement: () =>
        containerRef.current?.querySelector('svg') ?? null,
      exportAsSvg: () => {
        const svgElement = containerRef.current?.querySelector('svg');
        return svgElement
          ? new XMLSerializer().serializeToString(svgElement)
          : null;
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container || !diagram) {
        return;
      }

      if (!diagram.signal || diagram.signal.length === 0) {
        setError('No signals to display');
        return;
      }

      if (
        typeof window.WaveDrom === 'undefined' ||
        typeof window.WaveDrom.ProcessAll !== 'function'
      ) {
        setError(
          'WaveDrom library not found or ProcessAll function is missing. It might be blocked or failed to load.'
        );
        return;
      }

      // Skip rendering if diagram hasn't actually changed
      if (diagramKey === lastDiagramRef.current) {
        console.log('📊 Skipping TimingDiagram render - diagram unchanged');
        return;
      }

      // Clear any pending render
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }

      let isCancelled = false;
      setIsRendering(true);

      const renderDiagram = async () => {
        try {
          if (isCancelled || !container) {
            return;
          }

          console.log('🎨 Rendering TimingDiagram with', diagram.signal?.length, 'signals');

          // Clear container content safely by setting innerHTML
          container.innerHTML = '';
          setError(null);

          const script = document.createElement('script');
          script.type = 'WaveDrom';
          script.innerHTML = diagramKey;
          container.appendChild(script);

          // Use requestAnimationFrame for better performance
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              if (isCancelled) {
                resolve();
                return;
              }

              try {
                window.WaveDrom.ProcessAll();
                resolve();
              } catch (processError) {
                console.error('WaveDrom ProcessAll error:', processError);
                resolve();
              }
            });
          });

          // Check for SVG with a reasonable timeout
          renderTimeoutRef.current = setTimeout(() => {
            if (isCancelled) return;
            
            const svgElement = container.querySelector('svg');
            if (svgElement) {
              svgElement.setAttribute('width', width.toString());
              svgElement.setAttribute('height', height.toString());
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
              
              console.log('✅ TimingDiagram rendered successfully');
              lastDiagramRef.current = diagramKey;
            } else {
              setError(
                'WaveDrom processed, but no SVG was found. Check the diagram data for errors.'
              );
              console.error('❌ No SVG found after WaveDrom processing');
            }
            setIsRendering(false);
          }, 100); // Increased timeout for more reliable rendering
          
        } catch (err) {
          if (isCancelled) {
            return;
          }
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Failed to render timing diagram';
          setError(errorMessage);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
          console.error('Timing diagram rendering error:', err);
          setIsRendering(false);
        }
      };

      // Use a small delay to batch rapid changes
      renderTimeoutRef.current = setTimeout(() => {
        renderDiagram();
      }, 10);

      return () => {
        isCancelled = true;
        setIsRendering(false);
        if (renderTimeoutRef.current) {
          clearTimeout(renderTimeoutRef.current);
        }
      };
    }, [diagramKey, width, height, onError]);

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    return (
      <Box
        ref={containerRef}
        className={className}
        sx={{
          overflow: 'auto',
          minHeight: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isRendering ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
        }}
        data-testid="timing-diagram-container"
      >
        {isRendering && (
          <Box sx={{ position: 'absolute', color: 'text.secondary' }}>
            Rendering diagram...
          </Box>
        )}
      </Box>
    );
  }
);

TimingDiagram.displayName = 'TimingDiagram';

export default TimingDiagram;
