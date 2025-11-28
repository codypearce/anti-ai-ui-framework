import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlitchText } from '../src/components/GlitchText';

describe('GlitchText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders with default text', () => {
    render(<GlitchText />);
    expect(screen.getByText(/Text/i)).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<GlitchText text="Hello" />);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
  });

  it('cycles through variations', async () => {
    const { container } = render(
      <GlitchText text="Test" variations={['Test', 'T3st', 'TEST']} changeInterval={500} />
    );

    const initialText = container.textContent;
    await vi.advanceTimersByTimeAsync(500);
    const newText = container.textContent;

    expect(['Test', 'T3st', 'TEST']).toContain(initialText);
    expect(['Test', 'T3st', 'TEST']).toContain(newText);
  });

  it('renders as different HTML tags', () => {
    const { container } = render(<GlitchText text="Title" as="h1" />);
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('uses children render prop', () => {
    render(
      <GlitchText text="Custom">
        {(text) => <div data-testid="custom">{text}</div>}
      </GlitchText>
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });
});
