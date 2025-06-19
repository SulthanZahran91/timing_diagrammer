import { describe, it, expect } from 'bun:test';
import { render } from '@testing-library/react';
import Home from '../page';

describe('Home Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it('contains expected content', () => {
    const { container } = render(<Home />);
    // This is a basic test - adjust based on actual content
    expect(container.firstChild).toBeTruthy();
  });
});
