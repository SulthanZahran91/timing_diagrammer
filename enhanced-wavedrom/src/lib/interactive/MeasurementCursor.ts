import { SVGUtils } from '../utils/SVGUtils';
import { TimingUtils } from '../utils/TimingUtils';
import type { CursorPosition } from '../types';

/**
 * Draggable measurement cursor for timing diagrams
 */
export class MeasurementCursor {
  private svg: SVGSVGElement;
  private cursorGroup: SVGGElement;
  private cursorLine!: SVGLineElement;
  private cursorHandle!: SVGCircleElement;
  private cursorLabel!: SVGTextElement;
  private isDragging = false;
  private dragOffset = 0;
  private position: CursorPosition;
  private snapThreshold = 5; // pixels
  private onPositionChange?: (cursor: CursorPosition, oldPosition: { x: number; time: number }) => void;

  constructor(
    svg: SVGSVGElement,
    initialPosition: CursorPosition,
    onPositionChange?: (cursor: CursorPosition, oldPosition: { x: number; time: number }) => void
  ) {
    this.svg = svg;
    this.position = { ...initialPosition };
    this.onPositionChange = onPositionChange;
    
    this.cursorGroup = this.createCursorElements();
    this.setupEventListeners();
    this.updatePosition();
  }

  /**
   * Create SVG elements for the cursor
   */
  private createCursorElements(): SVGGElement {
    const group = SVGUtils.createElement('g', {
      class: 'enhanced-wavedrom-cursor',
      'data-cursor-id': this.position.id
    });

    // Vertical line
    this.cursorLine = SVGUtils.createElement('line', {
      class: 'cursor-line',
      x1: this.position.x,
      y1: 0,
      x2: this.position.x,
      y2: '100%',
      stroke: this.position.color,
      'stroke-width': 2,
      'stroke-dasharray': '4,2',
      'pointer-events': 'none'
    });

    // Draggable handle
    this.cursorHandle = SVGUtils.createElement('circle', {
      class: 'cursor-handle',
      cx: this.position.x,
      cy: 20,
      r: 6,
      fill: this.position.color,
      stroke: '#fff',
      'stroke-width': 2,
      cursor: 'ew-resize',
      'pointer-events': 'all'
    });

    // Label
    this.cursorLabel = SVGUtils.createElement('text', {
      class: 'cursor-label',
      x: this.position.x,
      y: 15,
      'text-anchor': 'middle',
      fill: this.position.color,
      'font-size': '12',
      'font-family': 'monospace',
      'pointer-events': 'none'
    });

    group.appendChild(this.cursorLine);
    group.appendChild(this.cursorHandle);
    group.appendChild(this.cursorLabel);

    return group;
  }

  /**
   * Setup mouse event listeners for dragging
   */
  private setupEventListeners(): void {
    this.cursorHandle.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Touch events for mobile support
    this.cursorHandle.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.startDrag(event.clientX);
  }

  /**
   * Handle touch start event
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      this.startDrag(event.touches[0].clientX);
    }
  }

  /**
   * Start dragging operation
   */
  private startDrag(clientX: number): void {
    this.isDragging = true;
    const svgCoords = SVGUtils.screenToSVGCoords(this.svg, clientX, 0);
    this.dragOffset = svgCoords.x - this.position.x;
    
    SVGUtils.addClassName(this.cursorGroup, 'dragging');
    document.body.style.cursor = 'ew-resize';
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    this.updateDrag(event.clientX);
  }

  /**
   * Handle touch move event
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length !== 1) return;
    event.preventDefault();
    this.updateDrag(event.touches[0].clientX);
  }

  /**
   * Update cursor position during drag
   */
  private updateDrag(clientX: number): void {
    const svgCoords = SVGUtils.screenToSVGCoords(this.svg, clientX, 0);
    const newX = svgCoords.x - this.dragOffset;
    
    const oldPosition = { x: this.position.x, time: this.position.time };
    
    // Find snap targets
    const snapTarget = this.findSnapTarget(newX);
    if (snapTarget) {
      this.setPosition(snapTarget.x, snapTarget.time, true);
    } else {
      // Convert x position to time (simplified calculation)
      const time = this.xToTime(newX);
      this.setPosition(newX, time, false);
    }

    // Notify position change
    if (this.onPositionChange) {
      this.onPositionChange(this.position, oldPosition);
    }
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(): void {
    this.endDrag();
  }

  /**
   * Handle touch end event
   */
  private handleTouchEnd(): void {
    this.endDrag();
  }

  /**
   * End dragging operation
   */
  private endDrag(): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    SVGUtils.removeClassName(this.cursorGroup, 'dragging');
    document.body.style.cursor = '';
  }

  /**
   * Find nearby snap targets (signal edges, transitions)
   */
  private findSnapTarget(x: number): { x: number; time: number } | null {
    // Find elements near the cursor position
    const elements = SVGUtils.elementsFromPoint(this.svg, x, 50);
    
    for (const element of elements) {
      if (element instanceof SVGPathElement || element instanceof SVGLineElement) {
                 // Check if this is a signal path
         if (element.classList.contains('signal-path') || element.getAttribute('class')?.includes('signal')) {
           // Find the nearest edge or transition
           const snapX = this.findNearestEdge(element as SVGGraphicsElement, x);
          
          if (snapX !== null && Math.abs(snapX - x) <= this.snapThreshold) {
            return {
              x: snapX,
              time: this.xToTime(snapX)
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Find the nearest edge in a signal path
   */
  private findNearestEdge(element: SVGGraphicsElement, targetX: number): number | null {
    // This is a simplified implementation
    // In a real implementation, you would parse the path data to find actual edges
    const bbox = SVGUtils.getBBox(element);
    const elementX = bbox.x + bbox.width / 2;
    
    if (Math.abs(elementX - targetX) <= this.snapThreshold) {
      return elementX;
    }
    
    return null;
  }

  /**
   * Convert x coordinate to time value
   */
  private xToTime(x: number): number {
    // This is a simplified conversion
    // In a real implementation, you would use the actual timing scale from WaveDrom
    const pixelsPerNanosecond = 20; // Example scale
    return x / pixelsPerNanosecond * 1e-9; // Convert to seconds
  }

  /**
   * Convert time value to x coordinate
   */
  private timeToX(time: number): number {
    // This is a simplified conversion
    const pixelsPerNanosecond = 20; // Example scale
    return (time * 1e9) * pixelsPerNanosecond;
  }

  /**
   * Set cursor position
   */
  setPosition(x: number, time: number, snapped = false): void {
    this.position.x = x;
    this.position.time = time;
    this.position.snappedToEdge = snapped;
    this.updatePosition();
  }

  /**
   * Update visual position of cursor elements
   */
  private updatePosition(): void {
    // Update line position
    this.cursorLine.setAttribute('x1', String(this.position.x));
    this.cursorLine.setAttribute('x2', String(this.position.x));

    // Update handle position
    this.cursorHandle.setAttribute('cx', String(this.position.x));

    // Update label position and text
    this.cursorLabel.setAttribute('x', String(this.position.x));
    const timeFormatted = TimingUtils.formatTime(this.position.time);
    this.cursorLabel.textContent = timeFormatted.formatted;

    // Add visual feedback for snapped cursors
    if (this.position.snappedToEdge) {
      SVGUtils.addClassName(this.cursorGroup, 'snapped');
    } else {
      SVGUtils.removeClassName(this.cursorGroup, 'snapped');
    }
  }

  /**
   * Get current cursor position
   */
  getPosition(): CursorPosition {
    return { ...this.position };
  }

  /**
   * Set cursor visibility
   */
  setVisible(visible: boolean): void {
    this.position.visible = visible;
    this.cursorGroup.style.display = visible ? '' : 'none';
  }

  /**
   * Get the cursor's SVG group element
   */
  getElement(): SVGGElement {
    return this.cursorGroup;
  }

  /**
   * Destroy the cursor and clean up event listeners
   */
  destroy(): void {
    this.cursorHandle.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.cursorHandle.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    
    if (this.cursorGroup.parentNode) {
      this.cursorGroup.parentNode.removeChild(this.cursorGroup);
    }
  }
} 