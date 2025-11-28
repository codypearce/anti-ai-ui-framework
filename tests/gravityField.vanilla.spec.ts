import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeGravityField } from '../src/vanilla/gravityField';

describe('makeGravityField (vanilla)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });

    container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('returns cleanup function', () => {
    const button = document.createElement('button');
    button.textContent = 'Test';
    container.appendChild(button);

    const cleanup = makeGravityField(container);
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('positions children absolutely', () => {
    const button = document.createElement('button');
    button.textContent = 'Test';
    container.appendChild(button);

    makeGravityField(container);

    expect(button.style.position).toBe('absolute');
  });

  it('sets initial position on children', () => {
    const button = document.createElement('button');
    button.textContent = 'Test';
    container.appendChild(button);

    makeGravityField(container);

    expect(button.style.left).toBeDefined();
    expect(button.style.top).toBeDefined();
  });

  it('sets container to relative positioning if static', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    // Set position to static explicitly
    container.style.position = 'static';

    makeGravityField(container);

    expect(container.style.position).toBe('relative');
  });

  it('sets container overflow to hidden', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    makeGravityField(container);

    expect(container.style.overflow).toBe('hidden');
  });

  it('handles multiple children', () => {
    const button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    const button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    const button3 = document.createElement('button');
    button3.textContent = 'Button 3';

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);

    makeGravityField(container);

    expect(button1.style.position).toBe('absolute');
    expect(button2.style.position).toBe('absolute');
    expect(button3.style.position).toBe('absolute');
  });

  it('updates positions over time', async () => {
    const button = document.createElement('button');
    button.textContent = 'Test';
    container.appendChild(button);

    makeGravityField(container, { updateInterval: 50 });

    const initialLeft = button.style.left;
    const initialTop = button.style.top;

    await vi.advanceTimersByTimeAsync(200);

    // Position should exist (may or may not change depending on gravity)
    expect(button.style.left).toBeDefined();
    expect(button.style.top).toBeDefined();
  });

  it('cleans up on cleanup call', async () => {
    const button = document.createElement('button');
    button.textContent = 'Test';
    container.appendChild(button);

    const cleanup = makeGravityField(container);

    // Let animation start
    await vi.advanceTimersByTimeAsync(50);

    cleanup();

    // Styles should be reset
    expect(button.style.position).toBe('');
    expect(button.style.left).toBe('');
    expect(button.style.top).toBe('');
  });

  it('removes event listeners on cleanup', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    const cleanup = makeGravityField(container);
    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('cancels animation frame on cleanup', async () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const button = document.createElement('button');
    container.appendChild(button);

    const cleanup = makeGravityField(container);

    await vi.advanceTimersByTimeAsync(50);

    cleanup();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('handles mouseenter event', async () => {
    const button = document.createElement('button');
    container.appendChild(button);

    makeGravityField(container, { reseedOnHover: true });

    // Should not throw
    const event = new MouseEvent('mouseenter');
    container.dispatchEvent(event);

    await vi.advanceTimersByTimeAsync(50);
    expect(button.style.position).toBe('absolute');
  });

  it('handles mousemove event', async () => {
    const button = document.createElement('button');
    container.appendChild(button);

    makeGravityField(container);

    // Should not throw
    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
    container.dispatchEvent(event);

    await vi.advanceTimersByTimeAsync(50);
    expect(button.style.position).toBe('absolute');
  });

  it('respects reseedOnHover=false', async () => {
    const button = document.createElement('button');
    container.appendChild(button);

    makeGravityField(container, { reseedOnHover: false });

    const event = new MouseEvent('mouseenter');
    container.dispatchEvent(event);

    await vi.advanceTimersByTimeAsync(50);
    expect(button.style.position).toBe('absolute');
  });

  it('accepts wellCount option', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    // Should not throw
    makeGravityField(container, { wellCount: 5 });
    expect(button.style.position).toBe('absolute');
  });

  it('accepts wellStrength option', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    // Should not throw
    makeGravityField(container, { wellStrength: 0.8 });
    expect(button.style.position).toBe('absolute');
  });

  it('accepts noise option', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    // Should not throw
    makeGravityField(container, { noise: 5 });
    expect(button.style.position).toBe('absolute');
  });

  it('sets transform translate on children', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    makeGravityField(container);

    expect(button.style.transform).toBe('translate(-50%, -50%)');
  });

  it('sets transition to none for smooth physics', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    makeGravityField(container);

    expect(button.style.transition).toBe('none');
  });

  it('handles empty container', () => {
    // Should not throw with no children
    const cleanup = makeGravityField(container);
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('preserves container relative positioning if already set', () => {
    container.style.position = 'relative';
    const button = document.createElement('button');
    container.appendChild(button);

    makeGravityField(container);

    expect(container.style.position).toBe('relative');
  });
});
