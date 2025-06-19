import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
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
    const [error, setError] = React.useState<string | null>(null);

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

      let isCancelled = false;

      const renderDiagram = () => {
        try {
          if (isCancelled || !container) {
            return;
          }

          container.innerHTML = '';
          setError(null);

          const script = document.createElement('script');
          script.type = 'WaveDrom';
          script.innerHTML = JSON.stringify(diagram, null, 2);
          container.appendChild(script);

          window.WaveDrom.ProcessAll();

          // The rendering is asynchronous, so we need to check for the SVG after a delay
          setTimeout(() => {
            if (isCancelled) return;
            const svgElement = container.querySelector('svg');
            if (svgElement) {
              svgElement.setAttribute('width', width.toString());
              svgElement.setAttribute('height', height.toString());
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
            } else {
              setError(
                'WaveDrom processed, but no SVG was found. Check the diagram data for errors.'
              );
            }
          }, 100);
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
        }
      };

      Promise.resolve().then(renderDiagram);

      return () => {
        isCancelled = true;
      };
    }, [diagram, width, height, onError]);

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
        }}
        data-testid="timing-diagram-container"
      />
    );
  }
);

TimingDiagram.displayName = 'TimingDiagram';

export default TimingDiagram;
