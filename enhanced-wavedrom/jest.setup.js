import '@testing-library/jest-dom'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }]);
  }
  unobserve() {}
  disconnect() {}
};

// Mock SVG elements
Object.defineProperty(window, 'SVGElement', {
  writable: true,
  value: class MockSVGElement {
    getBBox() {
      return { x: 0, y: 0, width: 100, height: 100 };
    }
    getScreenCTM() {
      return {
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
        inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
      };
    }
    createSVGPoint() {
      return { x: 0, y: 0, matrixTransform: (matrix) => ({ x: 0, y: 0 }) };
    }
  }
});

// Mock WaveDrom
jest.mock('wavedrom', () => ({
  default: {
    renderWaveForm: jest.fn(() => document.createElement('div')),
    WaveDrom: {
      renderWaveForm: jest.fn(() => document.createElement('div'))
    }
  }
})); 