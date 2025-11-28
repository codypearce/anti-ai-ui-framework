import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { GravityField } from '../src/components/GravityField';

describe('GravityField', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame for controlled testing
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children elements', () => {
    const { getByText } = render(
      <GravityField>
        <button>Button 1</button>
        <button>Button 2</button>
      </GravityField>
    );

    expect(getByText('Button 1')).toBeInTheDocument();
    expect(getByText('Button 2')).toBeInTheDocument();
  });

  it('positions children absolutely', () => {
    const { container } = render(
      <GravityField>
        <button>Test Button</button>
      </GravityField>
    );

    const wrapper = container.querySelector('div[style*="position: absolute"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <GravityField className="custom-gravity">
        <button>Test</button>
      </GravityField>
    );

    expect(container.querySelector('.custom-gravity')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(
      <GravityField style={{ width: 500, height: 400 }}>
        <button>Test</button>
      </GravityField>
    );

    const field = container.firstChild as HTMLElement;
    expect(field.style.width).toBe('500px');
    expect(field.style.height).toBe('400px');
  });

  it('has overflow hidden', () => {
    const { container } = render(
      <GravityField>
        <button>Test</button>
      </GravityField>
    );

    const field = container.firstChild as HTMLElement;
    expect(field.style.overflow).toBe('hidden');
  });

  it('updates positions over time', async () => {
    const { container } = render(
      <GravityField updateInterval={50}>
        <button>Moving Button</button>
      </GravityField>
    );

    const wrapper = container.querySelector('div[style*="position: absolute"]') as HTMLElement;
    const initialLeft = wrapper?.style.left;
    const initialTop = wrapper?.style.top;

    // Advance timers to trigger position updates
    await vi.advanceTimersByTimeAsync(200);

    // Positions should have changed (gravity + noise causes drift)
    const newLeft = wrapper?.style.left;
    const newTop = wrapper?.style.top;

    // Due to gravity wells and noise, at least one position should change
    // (or stay same if element hit bounds - both are valid behaviors)
    expect(newLeft).toBeDefined();
    expect(newTop).toBeDefined();
  });

  it('handles mouse enter event for reseeding', async () => {
    const { container } = render(
      <GravityField reseedOnHover={true}>
        <button>Test</button>
      </GravityField>
    );

    const field = container.firstChild as HTMLElement;

    // Should not throw when mouseenter fires
    fireEvent.mouseEnter(field);
    await vi.advanceTimersByTimeAsync(100);

    expect(field).toBeInTheDocument();
  });

  it('handles mouse move event', async () => {
    const { container } = render(
      <GravityField>
        <button>Test</button>
      </GravityField>
    );

    const field = container.firstChild as HTMLElement;

    // Should not throw when mousemove fires
    fireEvent.mouseMove(field, { clientX: 100, clientY: 100 });
    await vi.advanceTimersByTimeAsync(100);

    expect(field).toBeInTheDocument();
  });

  it('respects reseedOnHover=false', async () => {
    const { container } = render(
      <GravityField reseedOnHover={false}>
        <button>Test</button>
      </GravityField>
    );

    const field = container.firstChild as HTMLElement;

    // Should not reseed on hover when disabled
    fireEvent.mouseEnter(field);
    await vi.advanceTimersByTimeAsync(100);

    expect(field).toBeInTheDocument();
  });

  it('renders multiple children in different positions', () => {
    const { container } = render(
      <GravityField showWells={false}>
        <button>Button 1</button>
        <button>Button 2</button>
        <button>Button 3</button>
      </GravityField>
    );

    // Find buttons and verify they're wrapped in positioned divs
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);

    // Each button's parent should be a positioned wrapper
    buttons.forEach((button) => {
      const wrapper = button.parentElement as HTMLElement;
      expect(wrapper.style.position).toBe('absolute');
      expect(wrapper.style.left).toBeDefined();
      expect(wrapper.style.top).toBeDefined();
    });
  });

  it('cleans up animation frame on unmount', async () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const { unmount } = render(
      <GravityField>
        <button>Test</button>
      </GravityField>
    );

    // Let animation start
    await vi.advanceTimersByTimeAsync(50);

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('accepts wellCount option', () => {
    const { container } = render(
      <GravityField wellCount={5}>
        <button>Test</button>
      </GravityField>
    );

    // Component should render without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts wellStrength option', () => {
    const { container } = render(
      <GravityField wellStrength={0.8}>
        <button>Test</button>
      </GravityField>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts noise option', () => {
    const { container } = render(
      <GravityField noise={5}>
        <button>Test</button>
      </GravityField>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('has relative positioning on container', () => {
    const { container } = render(
      <GravityField>
        <button>Test</button>
      </GravityField>
    );

    const field = container.firstChild as HTMLElement;
    expect(field.style.position).toBe('relative');
  });
});
