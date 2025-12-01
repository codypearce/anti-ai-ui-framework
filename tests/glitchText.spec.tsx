import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { GlitchText } from '../src/components/GlitchText';

describe('GlitchText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders with default text', () => {
    const { container } = render(<GlitchText />);
    // The text is split into individual span elements
    expect(container.textContent).toBe('Text');
  });

  it('renders with custom text', () => {
    const { container } = render(<GlitchText text="Hello" />);
    expect(container.textContent).toBe('Hello');
  });

  it('shuffles character positions over time', async () => {
    const { container } = render(<GlitchText text="ABCD" shuffleInterval={100} shuffleChance={1} />);

    // Get initial character order
    const getCharacters = () => {
      const spans = container.querySelectorAll('span');
      return Array.from(spans).map((s) => s.textContent).join('');
    };

    const initial = getCharacters();
    expect(initial).toBe('ABCD');

    // Advance time to trigger shuffles
    await vi.advanceTimersByTimeAsync(200);

    // Characters should still be there (just possibly reordered)
    const shuffled = getCharacters();
    expect(shuffled.split('').sort().join('')).toBe('ABCD');
  });

  it('applies custom className', () => {
    const { container } = render(<GlitchText className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(<GlitchText style={{ fontSize: '24px' }} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.fontSize).toBe('24px');
  });
});
