import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLabelPositionSwap } from '../src/vanilla/labelPositionSwap';

describe('createLabelPositionSwap (vanilla)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('returns object with destroy method', () => {
    const result = createLabelPositionSwap({ container });
    expect(result).toHaveProperty('destroy');
    expect(typeof result.destroy).toBe('function');
    result.destroy();
  });

  it('creates labels and inputs for default fields', () => {
    const result = createLabelPositionSwap({ container });
    const labels = container.querySelectorAll('label');
    const inputs = container.querySelectorAll('input');

    // Default has 3 fields: Full Name, Email, Password
    expect(labels.length).toBe(3);
    expect(inputs.length).toBe(3);

    result.destroy();
  });

  it('uses custom fields', () => {
    const result = createLabelPositionSwap({
      container,
      fields: [
        { label: 'Username', placeholder: 'Enter username' },
        { label: 'Email', placeholder: 'Enter email', type: 'email' },
      ],
    });

    const labels = container.querySelectorAll('label');
    const inputs = container.querySelectorAll('input');

    expect(labels.length).toBe(2);
    expect(inputs.length).toBe(2);
    expect(labels[0].textContent).toBe('Username');
    expect(inputs[0].getAttribute('placeholder')).toBe('Enter username');

    result.destroy();
  });

  it('calls onShuffle after interval', async () => {
    const onShuffle = vi.fn();
    const result = createLabelPositionSwap({
      container,
      shuffleInterval: 1000,
      onShuffle,
    });

    // Initial shuffle happens at 500ms
    await vi.advanceTimersByTimeAsync(500);
    expect(onShuffle).toHaveBeenCalled();

    result.destroy();
  });

  it('shuffles labels at specified interval', async () => {
    const onShuffle = vi.fn();
    const result = createLabelPositionSwap({
      container,
      shuffleInterval: 1000,
      onShuffle,
    });

    // Initial shuffle at 500ms
    await vi.advanceTimersByTimeAsync(500);
    expect(onShuffle).toHaveBeenCalledTimes(1);

    // Next shuffle at 1500ms (500 + 1000)
    await vi.advanceTimersByTimeAsync(1000);
    expect(onShuffle).toHaveBeenCalledTimes(2);

    result.destroy();
  });

  it('returns label order in onShuffle callback', async () => {
    const onShuffle = vi.fn();
    const result = createLabelPositionSwap({
      container,
      fields: [
        { label: 'A', placeholder: 'a' },
        { label: 'B', placeholder: 'b' },
        { label: 'C', placeholder: 'c' },
      ],
      shuffleInterval: 1000,
      onShuffle,
    });

    await vi.advanceTimersByTimeAsync(500);

    // Should be called with an array of indices
    expect(onShuffle).toHaveBeenCalled();
    const order = onShuffle.mock.calls[0][0];
    expect(Array.isArray(order)).toBe(true);
    expect(order.length).toBe(3);
    expect(order.sort()).toEqual([0, 1, 2]);

    result.destroy();
  });

  it('cleans up on destroy', () => {
    const result = createLabelPositionSwap({ container });

    expect(container.children.length).toBeGreaterThan(0);
    result.destroy();
    expect(container.children.length).toBe(0);
  });

  it('stops shuffling after destroy', async () => {
    const onShuffle = vi.fn();
    const result = createLabelPositionSwap({
      container,
      shuffleInterval: 1000,
      onShuffle,
    });

    result.destroy();
    onShuffle.mockClear();

    await vi.advanceTimersByTimeAsync(2000);
    expect(onShuffle).not.toHaveBeenCalled();
  });

  it('applies default styles to label', () => {
    createLabelPositionSwap({ container });
    const label = container.querySelector('label') as HTMLElement;

    expect(label.style.fontWeight).toBe('500');
    expect(label.style.fontSize).toBe('14px');
  });

  it('applies default styles to input', () => {
    createLabelPositionSwap({ container });
    const input = container.querySelector('input') as HTMLElement;

    expect(input.style.padding).toBe('10px 12px');
    expect(input.style.border).toContain('1px');
  });

  it('getValues returns input values', () => {
    const result = createLabelPositionSwap({
      container,
      fields: [
        { label: 'A', placeholder: 'a' },
        { label: 'B', placeholder: 'b' },
      ],
    });

    const inputs = container.querySelectorAll('input');
    (inputs[0] as HTMLInputElement).value = 'first';
    (inputs[1] as HTMLInputElement).value = 'second';

    const values = result.getValues();
    expect(values).toEqual(['first', 'second']);

    result.destroy();
  });

  it('getLabelOrder returns current label order', async () => {
    const result = createLabelPositionSwap({
      container,
      fields: [
        { label: 'A', placeholder: 'a' },
        { label: 'B', placeholder: 'b' },
      ],
    });

    const order = result.getLabelOrder();
    expect(Array.isArray(order)).toBe(true);
    expect(order.length).toBe(2);

    result.destroy();
  });

  it('shuffleNow triggers immediate shuffle', () => {
    const onShuffle = vi.fn();
    const result = createLabelPositionSwap({
      container,
      onShuffle,
    });

    onShuffle.mockClear();
    result.shuffleNow();
    expect(onShuffle).toHaveBeenCalled();

    result.destroy();
  });

  it('handles rapid shuffles', async () => {
    const result = createLabelPositionSwap({
      container,
      shuffleInterval: 100,
    });

    await vi.advanceTimersByTimeAsync(500);
    // Should still have valid structure
    expect(container.querySelector('label')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeInTheDocument();

    result.destroy();
  });
});
