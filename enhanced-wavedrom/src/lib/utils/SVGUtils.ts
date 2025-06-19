import type { Coordinates, TransformMatrix } from '../types';

/**
 * SVG utility functions for Enhanced WaveDrom
 */
export class SVGUtils {
  /**
   * Convert screen coordinates to SVG coordinates
   */
  static screenToSVGCoords(
    svg: SVGSVGElement,
    screenX: number,
    screenY: number
  ): Coordinates {
    const point = svg.createSVGPoint();
    point.x = screenX;
    point.y = screenY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) {
      return { x: screenX, y: screenY };
    }
    
    const svgPoint = point.matrixTransform(ctm.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  }

  /**
   * Convert SVG coordinates to screen coordinates
   */
  static svgToScreenCoords(
    svg: SVGSVGElement,
    svgX: number,
    svgY: number
  ): Coordinates {
    const point = svg.createSVGPoint();
    point.x = svgX;
    point.y = svgY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) {
      return { x: svgX, y: svgY };
    }
    
    const screenPoint = point.matrixTransform(ctm);
    return { x: screenPoint.x, y: screenPoint.y };
  }

  /**
   * Create an SVG element with attributes
   */
  static createElement<K extends keyof SVGElementTagNameMap>(
    tagName: K,
    attributes: Record<string, string | number> = {},
    namespace = 'http://www.w3.org/2000/svg'
  ): SVGElementTagNameMap[K] {
    const element = document.createElementNS(namespace, tagName) as SVGElementTagNameMap[K];
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    
    return element;
  }

  /**
   * Add a CSS class to an SVG element
   */
  static addClassName(element: SVGElement, className: string): void {
    const currentClass = element.getAttribute('class') || '';
    const classes = currentClass.split(' ').filter(c => c.trim());
    
    if (!classes.includes(className)) {
      classes.push(className);
      element.setAttribute('class', classes.join(' '));
    }
  }

  /**
   * Remove a CSS class from an SVG element
   */
  static removeClassName(element: SVGElement, className: string): void {
    const currentClass = element.getAttribute('class') || '';
    const classes = currentClass.split(' ').filter(c => c.trim() && c !== className);
    element.setAttribute('class', classes.join(' '));
  }

  /**
   * Check if an SVG element has a specific CSS class
   */
  static hasClassName(element: SVGElement, className: string): boolean {
    const currentClass = element.getAttribute('class') || '';
    return currentClass.split(' ').includes(className);
  }

  /**
   * Get the bounding box of an SVG element
   */
  static getBBox(element: SVGGraphicsElement): DOMRect {
    try {
      return element.getBBox();
    } catch {
      // Fallback for elements not in DOM
      return new DOMRect(0, 0, 0, 0);
    }
  }

  /**
   * Get the transformation matrix of an SVG element
   */
  static getTransformMatrix(element: SVGGraphicsElement): TransformMatrix {
    const transform = element.transform.baseVal.consolidate();
    if (!transform) {
      return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    }
    
    const matrix = transform.matrix;
    return {
      a: matrix.a,
      b: matrix.b,
      c: matrix.c,
      d: matrix.d,
      e: matrix.e,
      f: matrix.f
    };
  }

  /**
   * Set the transformation matrix of an SVG element
   */
  static setTransformMatrix(
    element: SVGGraphicsElement,
    matrix: TransformMatrix
  ): void {
    const svg = element.ownerSVGElement;
    if (!svg) return;
    
    const transform = svg.createSVGTransform();
    const svgMatrix = svg.createSVGMatrix();
    
    svgMatrix.a = matrix.a;
    svgMatrix.b = matrix.b;
    svgMatrix.c = matrix.c;
    svgMatrix.d = matrix.d;
    svgMatrix.e = matrix.e;
    svgMatrix.f = matrix.f;
    
    transform.setMatrix(svgMatrix);
    element.transform.baseVal.initialize(transform);
  }

  /**
   * Find elements at a specific point in SVG coordinates
   */
  static elementsFromPoint(
    svg: SVGSVGElement,
    x: number,
    y: number
  ): Element[] {
    const screenCoords = this.svgToScreenCoords(svg, x, y);
    return document.elementsFromPoint(screenCoords.x, screenCoords.y);
  }

  /**
   * Calculate the distance between two points
   */
  static distance(p1: Coordinates, p2: Coordinates): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Animate an SVG attribute
   */
  static animateAttribute(
    element: SVGElement,
    attribute: string,
    from: string | number,
    to: string | number,
    duration: number,
    easing: (t: number) => number = (t) => t
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const fromValue = typeof from === 'string' ? parseFloat(from) || 0 : from;
      const toValue = typeof to === 'string' ? parseFloat(to) || 0 : to;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        const currentValue = this.lerp(fromValue, toValue, easedProgress);
        element.setAttribute(attribute, String(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  /**
   * Parse viewBox string into object
   */
  static parseViewBox(viewBox: string): { x: number; y: number; width: number; height: number } {
    const values = viewBox.split(/\s+/).map(Number);
    return {
      x: values[0] || 0,
      y: values[1] || 0,
      width: values[2] || 0,
      height: values[3] || 0
    };
  }

  /**
   * Format viewBox object into string
   */
  static formatViewBox(box: { x: number; y: number; width: number; height: number }): string {
    return `${box.x} ${box.y} ${box.width} ${box.height}`;
  }
} 