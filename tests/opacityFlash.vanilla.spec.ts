import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createOpacityFlash } from '../src/vanilla/opacityFlash';

describe('createOpacityFlash (vanilla)', () => {
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

  it('returns cleanup function', () => {
    const cleanup = createOpacityFlash({ container });
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('creates label and input', () => {
    createOpacityFlash({ container });
    expect(container.querySelector('label')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('uses custom label and placeholder', () => {
    createOpacityFlash({
      container,
      label: 'Email',
      placeholder: 'Enter email...',
    });

    expect(container.querySelector('label')).toHaveTextContent('Email');
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Enter email...');
  });

  it('changes opacity at intervals', async () => {
    const onOpacityChange = vi.fn();
    createOpacityFlash({
      container,
      changeInterval: 1000,
      onOpacityChange,
    });

    await vi.advanceTimersByTimeAsync(1000);

    expect(onOpacityChange).toHaveBeenCalled();
    const opacity = onOpacityChange.mock.calls[0][0];
    expect(opacity).toBeGreaterThanOrEqual(0.2);
    expect(opacity).toBeLessThanOrEqual(1.0);
  });

  it('calls onOpacityChange callback', async () => {
    const onOpacityChange = vi.fn();
    createOpacityFlash({
      container,
      changeInterval: 1000,
      onOpacityChange,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(onOpacityChange).toHaveBeenCalled();
  });

  it('uses custom opacity range', async () => {
    const onOpacityChange = vi.fn();
    createOpacityFlash({
      container,
      minOpacity: 0.5,
      maxOpacity: 0.8,
      changeInterval: 1000,
      onOpacityChange,
    });

    await vi.advanceTimersByTimeAsync(1000);
    const opacity = onOpacityChange.mock.calls[0][0];
    expect(opacity).toBeGreaterThanOrEqual(0.5);
    expect(opacity).toBeLessThanOrEqual(0.8);
  });

  it('uses custom createFieldElement function', async () => {
    const createFieldElement = vi.fn((opacity, label, placeholder) => {
      const el = document.createElement('div');
      el.className = 'custom-field';
      el.style.opacity = String(opacity);
      el.textContent = `${label} - ${placeholder}`;
      return el;
    });

    createOpacityFlash({
      container,
      changeInterval: 1000,
      createFieldElement,
    });

    expect(createFieldElement).toHaveBeenCalledWith(1, 'Username', 'Can you even see this?');
    expect(container.querySelector('.custom-field')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1000);
    expect(createFieldElement).toHaveBeenCalledTimes(2);
  });

  it('shows opacity indicator by default', () => {
    createOpacityFlash({ container });
    expect(container.textContent).toContain('current:');
  });

  it('hides opacity indicator when showOpacityIndicator is false', () => {
    createOpacityFlash({ container, showOpacityIndicator: false });
    expect(container.textContent).not.toContain('current:');
  });

  it('applies opacity to flash container', async () => {
    createOpacityFlash({
      container,
      changeInterval: 1000,
    });

    const wrapper = container.firstElementChild as HTMLElement;
    const flashContainer = wrapper.firstElementChild as HTMLElement;

    expect(flashContainer.style.opacity).toBe('1');

    await vi.advanceTimersByTimeAsync(1000);
    const newOpacity = parseFloat(flashContainer.style.opacity);
    expect(newOpacity).toBeGreaterThanOrEqual(0.2);
    expect(newOpacity).toBeLessThanOrEqual(1.0);
  });

  it('cycles through multiple opacity values', async () => {
    const opacities: number[] = [];
    createOpacityFlash({
      container,
      changeInterval: 500,
      onOpacityChange: (opacity) => opacities.push(opacity),
    });

    await vi.advanceTimersByTimeAsync(2000);
    expect(opacities.length).toBeGreaterThanOrEqual(3);
  });

  it('cleans up on cleanup', () => {
    const cleanup = createOpacityFlash({ container });

    expect(container.children.length).toBeGreaterThan(0);
    cleanup();
    expect(container.children.length).toBe(0);
  });

  it('stops changing opacity after cleanup', async () => {
    const onOpacityChange = vi.fn();
    const cleanup = createOpacityFlash({
      container,
      changeInterval: 1000,
      onOpacityChange,
    });

    cleanup();
    await vi.advanceTimersByTimeAsync(1000);
    expect(onOpacityChange).not.toHaveBeenCalled();
  });

  it('applies default styles to label', () => {
    createOpacityFlash({ container });
    const label = container.querySelector('label') as HTMLElement;

    expect(label.style.fontWeight).toBe('500');
    expect(label.style.fontSize).toBe('14px');
  });

  it('applies default styles to input', () => {
    createOpacityFlash({ container });
    const input = container.querySelector('input') as HTMLElement;

    expect(input.style.padding).toBe('8px 12px');
    expect(input.style.border).toContain('1px');
  });

  it('uses custom transition', () => {
    createOpacityFlash({ container, transition: '1s linear' });

    const wrapper = container.firstElementChild as HTMLElement;
    const flashContainer = wrapper.firstElementChild as HTMLElement;

    expect(flashContainer.style.transition).toContain('1s linear');
  });

  it('updates indicator text on opacity change', async () => {
    createOpacityFlash({ container, changeInterval: 1000 });

    await vi.advanceTimersByTimeAsync(1000);
    const indicatorText = container.textContent || '';
    expect(indicatorText).toMatch(/current: \d\.\d\d/);
  });

  it('handles rapid opacity changes', async () => {
    createOpacityFlash({
      container,
      changeInterval: 100,
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(container.querySelector('label')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeInTheDocument();
  });
});
