// Manual mock for wavedrom module

export const renderWaveForm = jest.fn(
  (index: number, diagram: any, container: HTMLElement) => {
    // Create a mock SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '400');
    svg.innerHTML = '<rect x="0" y="0" width="100" height="50" fill="blue"/>';
    container.appendChild(svg);
    return svg;
  }
);

export const processAll = jest.fn();
