import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { OpacityFlash } from '../src/components/OpacityFlash';

describe('OpacityFlash', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default label and input', () => {
    const { container } = render(<OpacityFlash />);
    expect(container.querySelector('label')).toHaveTextContent('Username');
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('renders with custom label and placeholder', () => {
    const { container } = render(
      <OpacityFlash label="Email" placeholder="Enter email..." />
    );
    expect(container.querySelector('label')).toHaveTextContent('Email');
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Enter email...');
  });

  it('changes opacity at intervals', async () => {
    const onOpacityChange = vi.fn();
    render(
      <OpacityFlash changeInterval={1000} onOpacityChange={onOpacityChange} />
    );

    await vi.advanceTimersByTimeAsync(1000);

    expect(onOpacityChange).toHaveBeenCalled();
    const opacity = onOpacityChange.mock.calls[0][0];
    expect(opacity).toBeGreaterThanOrEqual(0.2);
    expect(opacity).toBeLessThanOrEqual(1.0);
  });

  it('calls onOpacityChange callback', async () => {
    const onOpacityChange = vi.fn();
    render(
      <OpacityFlash changeInterval={1000} onOpacityChange={onOpacityChange} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    expect(onOpacityChange).toHaveBeenCalled();
  });

  it('uses custom opacity range', async () => {
    const onOpacityChange = vi.fn();
    render(
      <OpacityFlash
        minOpacity={0.5}
        maxOpacity={0.8}
        changeInterval={1000}
        onOpacityChange={onOpacityChange}
      />
    );

    await vi.advanceTimersByTimeAsync(1000);
    const opacity = onOpacityChange.mock.calls[0][0];
    expect(opacity).toBeGreaterThanOrEqual(0.5);
    expect(opacity).toBeLessThanOrEqual(0.8);
  });

  it('uses children render prop', async () => {
    const { getByTestId } = render(
      <OpacityFlash changeInterval={1000}>
        {(opacity, label, placeholder) => (
          <div data-testid="custom" style={{ opacity }}>
            <label>{label}</label>
            <input placeholder={placeholder} />
          </div>
        )}
      </OpacityFlash>
    );

    const custom = getByTestId('custom');
    expect(custom).toBeInTheDocument();
    expect(custom.style.opacity).toBe('1');

    await vi.advanceTimersByTimeAsync(1000);
    const newOpacity = parseFloat(custom.style.opacity);
    expect(newOpacity).toBeGreaterThanOrEqual(0.2);
    expect(newOpacity).toBeLessThanOrEqual(1.0);
  });

  it('applies custom className', () => {
    const { container } = render(<OpacityFlash className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(
      <OpacityFlash style={{ padding: '20px' }} />
    );
    expect(container.innerHTML).toContain('padding');
  });

  it('applies custom flashClassName', () => {
    const { container } = render(<OpacityFlash flashClassName="custom-flash" />);
    expect(container.querySelector('.custom-flash')).toBeInTheDocument();
  });

  it('applies custom flashStyle', () => {
    const { container } = render(
      <OpacityFlash flashStyle={{ border: '1px solid red' }} />
    );
    expect(container.innerHTML).toContain('border');
  });

  it('hides opacity indicator when showOpacityIndicator is false', () => {
    const { container } = render(<OpacityFlash showOpacityIndicator={false} />);
    expect(container.textContent).not.toContain('current:');
  });

  it('shows opacity indicator by default', () => {
    const { container } = render(<OpacityFlash />);
    expect(container.textContent).toContain('current:');
  });

  it('uses custom transition', () => {
    const { container } = render(<OpacityFlash transition="1s linear" />);
    expect(container.innerHTML).toContain('1s linear');
  });

  it('cycles through multiple opacity values', async () => {
    const opacities: number[] = [];
    render(
      <OpacityFlash
        changeInterval={500}
        onOpacityChange={(opacity) => opacities.push(opacity)}
      />
    );

    await vi.advanceTimersByTimeAsync(2000);
    expect(opacities.length).toBeGreaterThanOrEqual(3);
  });

  it('cleans up interval on unmount', async () => {
    const onOpacityChange = vi.fn();
    const { unmount } = render(
      <OpacityFlash changeInterval={1000} onOpacityChange={onOpacityChange} />
    );

    unmount();
    await vi.advanceTimersByTimeAsync(1000);
    expect(onOpacityChange).not.toHaveBeenCalled();
  });

  it('updates opacity display in indicator', async () => {
    const { container } = render(<OpacityFlash changeInterval={1000} />);

    await vi.advanceTimersByTimeAsync(1000);
    const indicatorText = container.textContent || '';
    expect(indicatorText).toMatch(/current: \d\.\d\d/);
  });
});
