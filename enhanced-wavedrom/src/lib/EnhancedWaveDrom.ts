import { EventManager } from './utils/EventManager';
import { InteractiveLayer } from './interactive/InteractiveLayer';
import type { 
  WaveJSON, 
  EnhancedOptions, 
  InteractionMode, 
  MeasurementData, 
  EventType, 
  EventData 
} from './types';

export class EnhancedWaveDrom {
  private container: HTMLElement;
  private waveJson: WaveJSON;
  private options: EnhancedOptions;
  private eventManager: EventManager;
  private interactiveLayer?: InteractiveLayer;
  private svg?: SVGSVGElement;

  constructor(
    container: HTMLElement,
    waveJson: WaveJSON,
    options: EnhancedOptions = {}
  ) {
    this.container = container;
    this.waveJson = waveJson;
    this.options = {
      interactive: true,
      cursors: true,
      zoom: true,
      pan: true,
      ...options
    };

    this.eventManager = new EventManager();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.renderWaveDrom();
      if (this.options.interactive) {
        this.setupInteractiveFeatures();
      }
      this.eventManager.emit('svg-updated', { svg: this.svg! });
    } catch (error) {
      console.error('Failed to initialize Enhanced WaveDrom:', error);
    }
  }

  private async renderWaveDrom(): Promise<void> {
    // Clear container
    this.container.innerHTML = '';

    // Create a simple placeholder SVG for now
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '400');
    svg.setAttribute('viewBox', '0 0 800 400');
    svg.style.border = '1px solid #ccc';

    // Add some sample content
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '10');
    rect.setAttribute('y', '10');
    rect.setAttribute('width', '780');
    rect.setAttribute('height', '380');
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', '#333');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '400');
    text.setAttribute('y', '200');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#666');
    text.textContent = 'WaveDrom Diagram Placeholder';

    svg.appendChild(rect);
    svg.appendChild(text);
    this.container.appendChild(svg);
    this.svg = svg;
  }

  private setupInteractiveFeatures(): void {
    if (!this.svg) return;

    this.svg.classList.add('enhanced-wavedrom');
    this.interactiveLayer = new InteractiveLayer(
      this.svg,
      this.eventManager
    );
  }

  addCursor(x: number): void {
    this.interactiveLayer?.addCursorAt(x);
  }

  removeCursor(index: number): void {
    if (!this.interactiveLayer) return;
    const cursors = this.interactiveLayer.getCursors();
    if (index >= 0 && index < cursors.length) {
      this.interactiveLayer.removeCursor(cursors[index].id);
    }
  }

  zoom(factor: number, centerX?: number, centerY?: number): void {
    this.interactiveLayer?.zoom(factor, centerX, centerY);
  }

  pan(deltaX: number, deltaY: number): void {
    this.interactiveLayer?.pan(deltaX, deltaY);
  }

  setMode(mode: InteractionMode): void {
    this.interactiveLayer?.setMode(mode);
  }

  getMeasurements(): MeasurementData | null {
    return this.interactiveLayer?.getMeasurements() || null;
  }

  fitToView(): void {
    this.interactiveLayer?.fitToView();
  }

  clearCursors(): void {
    this.interactiveLayer?.clearCursors();
  }

  on<T extends EventType>(event: T, callback: (data: EventData[T]) => void): void {
    this.eventManager.on(event, callback);
  }

  off<T extends EventType>(event: T, callback: (data: EventData[T]) => void): void {
    this.eventManager.off(event, callback);
  }

  destroy(): void {
    this.interactiveLayer?.destroy();
    this.eventManager.destroy();
    this.container.innerHTML = '';
  }
} 