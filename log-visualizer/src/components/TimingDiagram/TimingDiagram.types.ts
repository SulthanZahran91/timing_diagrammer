// TimingDiagram component types based on tech spec domain definitions

export interface WaveDromSignal {
  name: string;
  wave: string; // e.g., "01.x.z"
  data?: string[]; // Data values for '=' symbols
  period?: number;
  phase?: number;
}

export interface WaveDromDiagram {
  signal: WaveDromSignal[];
  config?: {
    hscale?: number;
    skin?: string;
  };
  head?: {
    text: string;
  };
}

export interface TimingDiagramProps {
  diagram: WaveDromDiagram;
  width?: number;
  height?: number;
  className?: string;
  onError?: (error: Error) => void;
}

export interface TimingDiagramRef {
  getDiagramElement: () => SVGElement | null;
  exportAsSvg: () => string | null;
}
