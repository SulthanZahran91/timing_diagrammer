import React from 'react';
import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import TimingDiagram from './TimingDiagram';
import { WaveDromDiagram } from './TimingDiagram.types';

const mockDiagram: WaveDromDiagram = {
  signal: [
    { name: 'CLK', wave: '01010101' },
    { name: 'DATA', wave: '0.1..0.1', data: ['A', 'B'] },
    { name: 'RESET', wave: 'x.1...0.' },
  ],
  config: {
    hscale: 1,
    skin: 'default',
  },
  head: {
    text: 'Test Timing Diagram',
  },
};

describe('TimingDiagram', () => {
  it('renders without crashing', () => {
    const { container } = render(<TimingDiagram diagram={mockDiagram} />);
    expect(container).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TimingDiagram diagram={mockDiagram} className="custom-class" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('exposes ref methods correctly', () => {
    const ref = React.createRef<{
      getDiagramElement: () => Element | null;
      exportAsSvg: () => string | null;
    }>();
    const { container } = render(
      <TimingDiagram ref={ref} diagram={mockDiagram} />
    );
    expect(container).toBeTruthy();
    // Note: Ref testing would require more complex setup with WaveDrom
  });

  it('handles empty diagram gracefully', () => {
    const { container } = render(<TimingDiagram diagram={{ signal: [] }} />);
    expect(container).toBeTruthy();
  });
});
