import { SVGUtils } from '../utils/SVGUtils';
import type { ViewBox } from '../types';

export class ZoomPanController {
  private svg: SVGSVGElement;
  private currentViewBox: ViewBox;
  private originalViewBox: ViewBox;
  private isPanning = false;
  private lastPanPoint = { x: 0, y: 0 };
  private zoomLimits = { min: 0.1, max: 10 };
  private onViewBoxChange?: (viewBox: ViewBox, zoomLevel: number) => void;

  constructor(
    svg: SVGSVGElement,
    options: {
      zoomLimits?: { min: number; max: number };
      onViewBoxChange?: (viewBox: ViewBox, zoomLevel: number) => void;
    } = {}
  ) {
    this.svg = svg;
    this.zoomLimits = options.zoomLimits || this.zoomLimits;
    this.onViewBoxChange = options.onViewBoxChange;

    const viewBoxAttr = svg.getAttribute('viewBox');
    if (viewBoxAttr) {
      this.originalViewBox = SVGUtils.parseViewBox(viewBoxAttr);
    } else {
      const rect = svg.getBoundingClientRect();
      this.originalViewBox = { x: 0, y: 0, width: rect.width, height: rect.height };
    }

    this.currentViewBox = { ...this.originalViewBox };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.svg.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const svgCenter = SVGUtils.screenToSVGCoords(this.svg, event.clientX, event.clientY);
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomAroundPoint(zoomFactor, svgCenter.x, svgCenter.y);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.isPanning = true;
      this.lastPanPoint = { x: event.clientX, y: event.clientY };
      this.svg.style.cursor = 'grabbing';
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    const deltaX = event.clientX - this.lastPanPoint.x;
    const deltaY = event.clientY - this.lastPanPoint.y;
    this.pan(deltaX, deltaY);
    this.lastPanPoint = { x: event.clientX, y: event.clientY };
  }

  private handleMouseUp(): void {
    this.isPanning = false;
    this.svg.style.cursor = '';
  }

  zoomAroundPoint(factor: number, centerX: number, centerY: number): void {
    const newWidth = this.currentViewBox.width * factor;
    const newHeight = this.currentViewBox.height * factor;

    const currentZoom = this.originalViewBox.width / this.currentViewBox.width;
    const newZoom = currentZoom * (1 / factor);

    if (newZoom < this.zoomLimits.min || newZoom > this.zoomLimits.max) return;

    const deltaWidth = newWidth - this.currentViewBox.width;
    const deltaHeight = newHeight - this.currentViewBox.height;

    const newX = this.currentViewBox.x - (deltaWidth * (centerX - this.currentViewBox.x)) / this.currentViewBox.width;
    const newY = this.currentViewBox.y - (deltaHeight * (centerY - this.currentViewBox.y)) / this.currentViewBox.height;

    this.setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  }

  pan(deltaX: number, deltaY: number): void {
    const scale = this.currentViewBox.width / this.svg.clientWidth;
    const svgDeltaX = -deltaX * scale;
    const svgDeltaY = -deltaY * scale;

    this.setViewBox({
      x: this.currentViewBox.x + svgDeltaX,
      y: this.currentViewBox.y + svgDeltaY,
      width: this.currentViewBox.width,
      height: this.currentViewBox.height
    });
  }

  private setViewBox(viewBox: ViewBox): void {
    this.currentViewBox = { ...viewBox };
    this.svg.setAttribute('viewBox', SVGUtils.formatViewBox(viewBox));

    if (this.onViewBoxChange) {
      const zoomLevel = this.originalViewBox.width / viewBox.width;
      this.onViewBoxChange(viewBox, zoomLevel);
    }
  }

  getZoomLevel(): number {
    return this.originalViewBox.width / this.currentViewBox.width;
  }

  getViewBox(): ViewBox {
    return { ...this.currentViewBox };
  }

  setPanEnabled(_enabled: boolean): void {
    // Pan is controlled by mode, this is a placeholder
  }

  setZoomEnabled(_enabled: boolean): void {
    // Zoom is controlled by mode, this is a placeholder
  }

  fitToView(): void {
    this.setViewBox({ ...this.originalViewBox });
  }

  destroy(): void {
    this.svg.removeEventListener('wheel', this.handleWheel.bind(this));
    this.svg.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.svg.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.svg.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }
} 