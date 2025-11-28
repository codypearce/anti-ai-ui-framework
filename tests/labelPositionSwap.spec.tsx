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

  it('renders with default label and input', () => {
    const { container } = render(<LabelPositionSwap />);
    expect(container.querySelector('label')).toHaveTextContent('Email');
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('renders with custom label and placeholder', () => {
    const { container } = render(
      <LabelPositionSwap label="Username" placeholder="Enter username..." />
    );
    expect(container.querySelector('label')).toHaveTextContent('Username');
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Enter username...');
  });

  it('changes position at intervals', async () => {
    const onPositionChange = vi.fn();
    render(
      <LabelPositionSwap changeInterval={1000} onPositionChange={onPositionChange} />
    );

    await vi.advanceTimersByTimeAsync(1000);

    // Position should have changed
    expect(onPositionChange).toHaveBeenCalled();
  });

  it('calls onPositionChange callback', async () => {
    const onPositionChange = vi.fn();
    render(
      <LabelPositionSwap changeInterval={1000} onPositionChange={onPositionChange} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    expect(onPositionChange).toHaveBeenCalled();
    expect(['top', 'bottom', 'left', 'right']).toContain(onPositionChange.mock.calls[0][0]);
  });

  it('uses custom positions array', async () => {
    const onPositionChange = vi.fn();
    render(
      <LabelPositionSwap
        positions={['top', 'bottom']}
        changeInterval={1000}
        onPositionChange={onPositionChange}
      />
    );

    await vi.advanceTimersByTimeAsync(1000);
    expect(['top', 'bottom']).toContain(onPositionChange.mock.calls[0][0]);
  });

  it('uses children render prop', async () => {
    const { getByTestId } = render(
      <LabelPositionSwap changeInterval={1000}>
        {(position, label, placeholder) => (
          <div data-testid="custom" data-position={position}>
            <label>{label}</label>
            <input placeholder={placeholder} />
          </div>
        )}
      </LabelPositionSwap>
    );

    const custom = getByTestId('custom');
    expect(custom).toBeInTheDocument();
    expect(custom.getAttribute('data-position')).toBe('top');

    await vi.advanceTimersByTimeAsync(1000);
    expect(['top', 'bottom', 'left', 'right']).toContain(
      custom.getAttribute('data-position')
    );
  });

  it('applies custom className', () => {
    const { container } = render(<LabelPositionSwap className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(
      <LabelPositionSwap style={{ backgroundColor: 'red' }} />
    );
    // Style is applied to container's nested div
    expect(container.innerHTML).toContain('background-color: red');
  });

  it('applies custom labelClassName', () => {
    const { container } = render(<LabelPositionSwap labelClassName="custom-label" />);
    expect(container.querySelector('.custom-label')).toBeInTheDocument();
  });

  it('applies custom labelStyle', () => {
    const { container } = render(
      <LabelPositionSwap labelStyle={{ color: 'blue' }} />
    );
    const label = container.querySelector('label') as HTMLElement;
    expect(label.style.color).toBe('blue');
  });

  it('applies custom inputClassName', () => {
    const { container } = render(<LabelPositionSwap inputClassName="custom-input" />);
    expect(container.querySelector('.custom-input')).toBeInTheDocument();
  });

  it('applies custom inputStyle', () => {
    const { container } = render(
      <LabelPositionSwap inputStyle={{ fontSize: '20px' }} />
    );
    const input = container.querySelector('input') as HTMLElement;
    expect(input.style.fontSize).toBe('20px');
  });

  it('hides position indicator when showPositionIndicator is false', () => {
    const { container } = render(<LabelPositionSwap showPositionIndicator={false} />);
    expect(container.textContent).not.toContain('current:');
  });

  it('shows position indicator by default', () => {
    const { container } = render(<LabelPositionSwap />);
    expect(container.textContent).toContain('current:');
  });

  it('updates flex direction for top/bottom positions', async () => {
    const { container } = render(
      <LabelPositionSwap positions={['top', 'bottom']} changeInterval={1000} />
    );

    // Should have flex display
    await vi.advanceTimersByTimeAsync(1000);
    expect(container.innerHTML).toContain('display');
  });

  it('cycles through multiple positions', async () => {
    const positions: string[] = [];
    render(
      <LabelPositionSwap
        changeInterval={500}
        onPositionChange={(pos) => positions.push(pos)}
      />
    );

    await vi.advanceTimersByTimeAsync(2000);
    expect(positions.length).toBeGreaterThanOrEqual(3);
  });

  it('cleans up interval on unmount', async () => {
    const onPositionChange = vi.fn();
    const { unmount } = render(
      <LabelPositionSwap changeInterval={1000} onPositionChange={onPositionChange} />
    );

    unmount();
    await vi.advanceTimersByTimeAsync(1000);
    expect(onPositionChange).not.toHaveBeenCalled();
  });
});
