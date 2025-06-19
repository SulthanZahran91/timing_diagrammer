import { SVGUtils } from '../utils/SVGUtils';
import { TimingUtils } from '../utils/TimingUtils';
import { MeasurementCursor } from './MeasurementCursor';
import { ZoomPanController } from './ZoomPanController';
import { EventManager } from '../utils/EventManager';
import type { 
  InteractionMode, 
  CursorPosition, 
  MeasurementData, 
  ViewBox 
} from '../types';

export class InteractiveLayer {
  private svg: SVGSVGElement;
  private overlayGroup: SVGGElement;
  private cursors: Map<string, MeasurementCursor> = new Map();
  private zoomPanController: ZoomPanController;
  private eventManager: EventManager;
  private mode: InteractionMode = 'cursor';
  private cursorColors = ['#ff0000', '#0066cc', '#00cc66', '#ffcc00'];
  private maxCursors = 4;

  constructor(
    svg: SVGSVGElement,
    eventManager: EventManager,
    options: {
      maxCursors?: number;
      cursorColors?: string[];
    } = {}
  ) {
    this.svg = svg;
    this.eventManager = eventManager;
    this.maxCursors = options.maxCursors || this.maxCursors;
    this.cursorColors = options.cursorColors || this.cursorColors;

    this.overlayGroup = this.createOverlay();
    this.zoomPanController = new ZoomPanController(svg, {
      onViewBoxChange: this.handleViewBoxChange.bind(this)
    });

    this.setupEventListeners();
  }

  private createOverlay(): SVGGElement {
    const overlay = SVGUtils.createElement('g', {
      class: 'enhanced-wavedrom-overlay',
      'pointer-events': 'all'
    });

    // Create invisible rect for capturing mouse events
    const captureRect = SVGUtils.createElement('rect', {
      class: 'interaction-capture',
      x: '0',
      y: '0',
      width: '100%',
      height: '100%',
      fill: 'transparent',
      'pointer-events': 'all'
    });

    overlay.appendChild(captureRect);
    this.svg.appendChild(overlay);

    return overlay;
  }

  private setupEventListeners(): void {
    this.overlayGroup.addEventListener('click', this.handleClick.bind(this));
    this.overlayGroup.addEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    event.preventDefault();

    if (this.mode === 'cursor' || this.mode === 'measure') {
      const svgCoords = SVGUtils.screenToSVGCoords(this.svg, event.clientX, event.clientY);
      this.addCursorAt(svgCoords.x);
    }
  }

  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    // Remove cursor near click position
    const svgCoords = SVGUtils.screenToSVGCoords(this.svg, event.clientX, event.clientY);
    this.removeCursorNear(svgCoords.x);
  }

  private handleViewBoxChange(viewBox: ViewBox, zoomLevel: number): void {
    this.eventManager.emit('zoom-changed', {
      factor: zoomLevel,
      level: zoomLevel,
      centerX: viewBox.x + viewBox.width / 2,
      centerY: viewBox.y + viewBox.height / 2
    });
  }

  addCursorAt(x: number): string | null {
    if (this.cursors.size >= this.maxCursors) {
      return null;
    }

    const cursorId = `cursor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const colorIndex = this.cursors.size % this.cursorColors.length;
    const color = this.cursorColors[colorIndex];

    const position: CursorPosition = {
      id: cursorId,
      x,
      time: this.xToTime(x),
      snappedToEdge: false,
      color,
      visible: true
    };

    const cursor = new MeasurementCursor(
      this.svg,
      position,
      this.handleCursorPositionChange.bind(this)
    );

    this.overlayGroup.appendChild(cursor.getElement());
    this.cursors.set(cursorId, cursor);

    this.eventManager.emit('cursor-added', { cursor: position });
    this.updateMeasurements();

    return cursorId;
  }

  private handleCursorPositionChange(
    cursor: CursorPosition, 
    oldPosition: { x: number; time: number }
  ): void {
    this.eventManager.emit('cursor-moved', { cursor, oldPosition });
    this.updateMeasurements();
  }

  removeCursor(cursorId: string): boolean {
    const cursor = this.cursors.get(cursorId);
    if (!cursor) return false;

    cursor.destroy();
    this.cursors.delete(cursorId);

    this.eventManager.emit('cursor-removed', { cursorId });
    this.updateMeasurements();

    return true;
  }

  private removeCursorNear(x: number, threshold = 10): boolean {
    let nearestCursor: { id: string; distance: number } | null = null;

         Array.from(this.cursors.entries()).forEach(([id, cursor]) => {
       const distance = Math.abs(cursor.getPosition().x - x);
       if (distance <= threshold) {
         if (!nearestCursor || distance < nearestCursor.distance) {
           nearestCursor = { id, distance };
         }
       }
     });

    if (nearestCursor) {
      return this.removeCursor(nearestCursor.id);
    }

    return false;
  }

  private updateMeasurements(): void {
    const cursorPositions = Array.from(this.cursors.values())
      .map(cursor => cursor.getPosition())
      .sort((a, b) => a.x - b.x);

    if (cursorPositions.length >= 2) {
      const cursorA = cursorPositions[0];
      const cursorB = cursorPositions[1];
      const timeDifference = Math.abs(cursorB.time - cursorA.time);
      const frequency = TimingUtils.calculateFrequency(timeDifference);

      const timeFormatted = TimingUtils.formatTime(timeDifference);
      const frequencyFormatted = TimingUtils.formatFrequency(frequency);

      const measurementData: MeasurementData = {
        timeDifference,
        frequency,
        cursorA: cursorA.x,
        cursorB: cursorB.x,
        unit: timeFormatted.unit,
        formattedTime: timeFormatted.formatted,
        formattedFrequency: frequencyFormatted.formatted
      };

      this.eventManager.emit('measurement-changed', measurementData);
    } else {
      this.eventManager.emit('measurement-changed', null);
    }
  }

  private xToTime(x: number): number {
    // Simplified conversion - in real implementation, use WaveDrom's scale
    const pixelsPerNanosecond = 20;
    return x / pixelsPerNanosecond * 1e-9;
  }

  setMode(mode: InteractionMode): void {
    const oldMode = this.mode;
    this.mode = mode;

    // Configure zoom/pan based on mode
    this.zoomPanController.setPanEnabled(mode === 'pan');
    this.zoomPanController.setZoomEnabled(mode === 'zoom' || mode === 'pan');

    // Update cursor style
    const captureRect = this.overlayGroup.querySelector('.interaction-capture');
    if (captureRect) {
      switch (mode) {
        case 'cursor':
        case 'measure':
          captureRect.setAttribute('cursor', 'crosshair');
          break;
        case 'zoom':
          captureRect.setAttribute('cursor', 'zoom-in');
          break;
        case 'pan':
          captureRect.setAttribute('cursor', 'grab');
          break;
      }
    }

    this.eventManager.emit('mode-changed', { oldMode, newMode: mode });
  }

  getMode(): InteractionMode {
    return this.mode;
  }

  zoom(factor: number, centerX?: number, centerY?: number): void {
    if (centerX !== undefined && centerY !== undefined) {
      this.zoomPanController.zoomAroundPoint(factor, centerX, centerY);
    } else {
      // Zoom around center
      const viewBox = this.zoomPanController.getViewBox();
      const centerXCalc = viewBox.x + viewBox.width / 2;
      const centerYCalc = viewBox.y + viewBox.height / 2;
      this.zoomPanController.zoomAroundPoint(factor, centerXCalc, centerYCalc);
    }
  }

  pan(deltaX: number, deltaY: number): void {
    this.zoomPanController.pan(deltaX, deltaY);
  }

  fitToView(): void {
    this.zoomPanController.fitToView();
  }

  getCursors(): CursorPosition[] {
    return Array.from(this.cursors.values()).map(cursor => cursor.getPosition());
  }

  getMeasurements(): MeasurementData | null {
    const positions = this.getCursors().sort((a, b) => a.x - b.x);
    
    if (positions.length >= 2) {
      const cursorA = positions[0];
      const cursorB = positions[1];
      const timeDifference = Math.abs(cursorB.time - cursorA.time);
      const frequency = TimingUtils.calculateFrequency(timeDifference);
      
      const timeFormatted = TimingUtils.formatTime(timeDifference);
      const frequencyFormatted = TimingUtils.formatFrequency(frequency);

      return {
        timeDifference,
        frequency,
        cursorA: cursorA.x,
        cursorB: cursorB.x,
        unit: timeFormatted.unit,
        formattedTime: timeFormatted.formatted,
        formattedFrequency: frequencyFormatted.formatted
      };
    }

    return null;
  }

  clearCursors(): void {
    for (const cursor of this.cursors.values()) {
      cursor.destroy();
    }
    this.cursors.clear();
    this.eventManager.emit('measurement-changed', null);
  }

  destroy(): void {
    this.clearCursors();
    this.zoomPanController.destroy();
    
    if (this.overlayGroup.parentNode) {
      this.overlayGroup.parentNode.removeChild(this.overlayGroup);
    }
  }
} 