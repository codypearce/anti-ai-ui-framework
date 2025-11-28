import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFormChaos } from '../src/vanilla/formChaos';

describe('createFormChaos (vanilla)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('Basic Functionality', () => {
    it('creates form in container', () => {
      createFormChaos({ container });
      expect(container.querySelector('input')).not.toBeNull();
      expect(container.querySelector('button')).not.toBeNull();
    });

    it('returns cleanup function', () => {
      const cleanup = createFormChaos({ container });
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('creates default form content', () => {
      createFormChaos({ container });
      expect(container.querySelector('label')?.textContent).toBe('Message');
      expect(container.querySelector('input[type="text"]')).not.toBeNull();
      expect(container.querySelector('button')?.textContent).toBe('Submit');
    });
  });

  describe('Transform Updates', () => {
    it('updates transform at specified interval', async () => {
      createFormChaos({ container, changeInterval: 500 });

      const wrapper = container.firstChild as HTMLElement;
      const formElement = wrapper.firstChild as HTMLElement;

      // Advance past the interval to ensure it fires
      await vi.advanceTimersByTimeAsync(600);
      const transform = formElement.style.transform;

      expect(transform).toContain('rotate');
      expect(transform).toContain('scale');
    });

    it('applies rotation within configured range', async () => {
      createFormChaos({ container, changeInterval: 100, minRotation: -10, maxRotation: 10 });

      await vi.advanceTimersByTimeAsync(100);

      const formElement = container.querySelector('div > div') as HTMLElement;
      const transform = formElement.style.transform;
      const rotationMatch = transform.match(/rotate\(([-\d.]+)deg\)/);

      if (rotationMatch) {
        const rotation = parseFloat(rotationMatch[1]);
        expect(rotation).toBeGreaterThanOrEqual(-10);
        expect(rotation).toBeLessThanOrEqual(10);
      }
    });

    it('applies scale within configured range', async () => {
      createFormChaos({ container, changeInterval: 100, minScale: 0.8, maxScale: 1.2 });

      await vi.advanceTimersByTimeAsync(100);

      const formElement = container.querySelector('div > div') as HTMLElement;
      const transform = formElement.style.transform;
      const scaleMatch = transform.match(/scale\(([\d.]+)\)/);

      if (scaleMatch) {
        const scale = parseFloat(scaleMatch[1]);
        expect(scale).toBeGreaterThanOrEqual(0.8);
        expect(scale).toBeLessThanOrEqual(1.2);
      }
    });
  });

  describe('Custom Rendering', () => {
    it('uses createFormContent when provided', () => {
      const createFormContent = vi.fn(() => {
        const div = document.createElement('div');
        div.setAttribute('data-custom', 'true');
        div.textContent = 'Custom Form';
        return div;
      });

      createFormChaos({ container, createFormContent });

      expect(createFormContent).toHaveBeenCalled();
      expect(container.querySelector('[data-custom="true"]')).not.toBeNull();
    });

    it('passes rotation and scale to createFormContent on updates', async () => {
      const receivedValues: { rotation: number; scale: number }[] = [];

      const createFormContent = (rotation: number, scale: number) => {
        receivedValues.push({ rotation, scale });
        const div = document.createElement('div');
        return div;
      };

      createFormChaos({
        container,
        createFormContent,
        changeInterval: 100,
        minRotation: 5,
        maxRotation: 10,
        minScale: 1.1,
        maxScale: 1.2,
      });

      await vi.advanceTimersByTimeAsync(100);

      // Should have been called at least twice (initial + after interval)
      expect(receivedValues.length).toBeGreaterThanOrEqual(2);

      // Check the last call has values in range
      const last = receivedValues[receivedValues.length - 1];
      expect(last.rotation).toBeGreaterThanOrEqual(5);
      expect(last.rotation).toBeLessThanOrEqual(10);
      expect(last.scale).toBeGreaterThanOrEqual(1.1);
      expect(last.scale).toBeLessThanOrEqual(1.2);
    });
  });

  describe('Cleanup', () => {
    it('removes form element on cleanup', () => {
      const cleanup = createFormChaos({ container });

      expect(container.children.length).toBeGreaterThan(0);

      cleanup();

      expect(container.children.length).toBe(0);
    });

    it('clears interval on cleanup', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const cleanup = createFormChaos({ container, changeInterval: 1000 });

      cleanup();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
