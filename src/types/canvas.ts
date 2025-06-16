export interface TimeRange {
  start: number;
  end: number;
}

export interface LogicalCoordinates {
  time: number;
  signal: number;
}

export interface ScreenCoordinates {
  x: number;
  y: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface CanvasTransforms {
  timeToPixels: (time: number) => number;
  pixelsToTime: (pixels: number) => number;
  signalToY: (signalIndex: number) => number;
  pixelsToSignal: (pixels: number) => number;
}

export interface TimingCanvasProps {
  width?: number;
  height?: number;
  timeRange: TimeRange;
  signalCount: number;
  onMouseMove?: (event: React.MouseEvent, logicalCoords: LogicalCoordinates) => void;
  onMouseClick?: (event: React.MouseEvent, logicalCoords: LogicalCoordinates) => void;
  children?: React.ReactNode;
  className?: string;
}

export interface CanvasState {
  viewportDimensions: ViewportDimensions;
  timeRange: TimeRange;
  signalCount: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export type MouseEventHandler = (event: React.MouseEvent, logicalCoords: LogicalCoordinates) => void; 