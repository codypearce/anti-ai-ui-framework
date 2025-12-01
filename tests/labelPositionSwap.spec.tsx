import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { LabelPositionSwap } from '../src/components/LabelPositionSwap';

describe('LabelPositionSwap', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default fields (3 fields)', () => {
    const { container } = render(<LabelPositionSwap />);
    const labels = container.querySelectorAll('label');
    const inputs = container.querySelectorAll('input');

    expect(labels.length).toBe(3);
    expect(inputs.length).toBe(3);
  });

  it('renders with custom fields', () => {
    const { container } = render(
      <LabelPositionSwap
        fields={[
          { label: 'Username', placeholder: 'Enter username' },
          { label: 'Email', placeholder: 'Enter email', type: 'email' },
        ]}
      />
    );

    const labels = container.querySelectorAll('label');
    const inputs = container.querySelectorAll('input');

    expect(labels.length).toBe(2);
    expect(inputs.length).toBe(2);
    // Initial labels before shuffle
    expect(labels[0]).toHaveTextContent('Username');
    expect(inputs[0]).toHaveAttribute('placeholder', 'Enter username');
  });

  it('shuffles labels at intervals', async () => {
    const onShuffle = vi.fn();
    render(
      <LabelPositionSwap shuffleInterval={1000} onShuffle={onShuffle} />
    );

    // Initial shuffle happens at 500ms
    await vi.advanceTimersByTimeAsync(500);
    // Then wait for the 150ms fade animation
    await vi.advanceTimersByTimeAsync(150);

    expect(onShuffle).toHaveBeenCalled();
  });

  it('calls onShuffle with label order array', async () => {
    const onShuffle = vi.fn();
    render(
      <LabelPositionSwap
        fields={[
          { label: 'A', placeholder: 'a' },
          { label: 'B', placeholder: 'b' },
          { label: 'C', placeholder: 'c' },
        ]}
        shuffleInterval={1000}
        onShuffle={onShuffle}
      />
    );

    await vi.advanceTimersByTimeAsync(500);
    await vi.advanceTimersByTimeAsync(150);

    expect(onShuffle).toHaveBeenCalled();
    const order = onShuffle.mock.calls[0][0];
    expect(Array.isArray(order)).toBe(true);
    expect(order.length).toBe(3);
    expect([...order].sort()).toEqual([0, 1, 2]);
  });

  it('uses renderField prop for custom rendering', async () => {
    const { getByTestId } = render(
      <LabelPositionSwap
        fields={[{ label: 'Test', placeholder: 'test' }]}
        renderField={({ label, placeholder, index }) => (
          <div key={index} data-testid="custom-field">
            <span>{label}</span>
            <input placeholder={placeholder} />
          </div>
        )}
      />
    );

    const custom = getByTestId('custom-field');
    expect(custom).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LabelPositionSwap className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(
      <LabelPositionSwap style={{ backgroundColor: 'red' }} />
    );
    expect(container.innerHTML).toContain('background-color: red');
  });

  it('shuffles multiple times', async () => {
    const onShuffle = vi.fn();
    render(
      <LabelPositionSwap shuffleInterval={1000} onShuffle={onShuffle} />
    );

    // Initial shuffle at 500ms + 150ms fade
    await vi.advanceTimersByTimeAsync(650);
    expect(onShuffle).toHaveBeenCalledTimes(1);

    // Next shuffle at 1000ms + 150ms fade from initial
    await vi.advanceTimersByTimeAsync(1000);
    expect(onShuffle).toHaveBeenCalledTimes(2);
  });

  it('cleans up interval on unmount', async () => {
    const onShuffle = vi.fn();
    const { unmount } = render(
      <LabelPositionSwap shuffleInterval={1000} onShuffle={onShuffle} />
    );

    unmount();
    onShuffle.mockClear();

    await vi.advanceTimersByTimeAsync(2000);
    expect(onShuffle).not.toHaveBeenCalled();
  });

  it('passes isFading to renderField during shuffle animation', async () => {
    const renderField = vi.fn(({ label }) => <div>{label}</div>);

    render(
      <LabelPositionSwap
        fields={[{ label: 'Test', placeholder: 'test' }]}
        shuffleInterval={1000}
        renderField={renderField}
      />
    );

    // Check initial render
    expect(renderField).toHaveBeenCalledWith(
      expect.objectContaining({ isFading: false })
    );

    // Trigger shuffle start (at 500ms, fading becomes true)
    await vi.advanceTimersByTimeAsync(500);

    // The render should have been called with isFading: true at some point
    // (during the fade animation)
    const calls = renderField.mock.calls;
    const fadingCall = calls.find(call => call[0].isFading === true);
    expect(fadingCall).toBeDefined();
  });
});
