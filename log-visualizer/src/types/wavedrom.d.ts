// Type declarations for wavedrom module

declare module 'wavedrom' {
  export interface WaveDromConfig {
    hscale?: number;
    skin?: string;
  }

  export interface WaveDromSignal {
    name: string;
    wave: string;
    data?: string[];
    period?: number;
    phase?: number;
  }

  export interface WaveDromDiagram {
    signal: WaveDromSignal[];
    config?: WaveDromConfig;
    head?: {
      text: string;
    };
  }

  export function renderWaveForm(
    index: number,
    source: WaveDromDiagram,
    target: HTMLElement
  ): SVGElement;

  export function processAll(): void;
}
