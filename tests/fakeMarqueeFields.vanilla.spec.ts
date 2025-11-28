import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFakeMarqueeFields } from '../src/vanilla/fakeMarqueeFields';

describe('createFakeMarqueeFields (vanilla)', () => {
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
    it('creates fake marquee fields in container', () => {
      createFakeMarqueeFields({ container });
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('returns cleanup function', () => {
      const cleanup = createFakeMarqueeFields({ container });
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('sets container styles', () => {
      createFakeMarqueeFields({ container });
      expect(container.style.position).toBe('relative');
      expect(container.style.overflow).toBe('hidden');
    });

    it('adds animation keyframes to document', () => {
      createFakeMarqueeFields({ container });
      const styleElement = document.querySelector('style[id*="fake-marquee-style"]');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.textContent).toContain('@keyframes scrollAcross');
    });
  });

  describe('Field Spawning', () => {
    it('spawns fields at specified interval', async () => {
      createFakeMarqueeFields({ container, spawnInterval: 2000 });

      const initialCount = container.querySelectorAll('input').length;
      expect(initialCount).toBe(1);

      await vi.advanceTimersByTimeAsync(2000);
      expect(container.querySelectorAll('input').length).toBe(2);

      await vi.advanceTimersByTimeAsync(2000);
      expect(container.querySelectorAll('input').length).toBe(3);
    });

    it('removes fields after scroll duration', async () => {
      createFakeMarqueeFields({
        container,
        spawnInterval: 10000,
        scrollDuration: 1000,
      });

      expect(container.querySelectorAll('input').length).toBe(1);

      await vi.advanceTimersByTimeAsync(1100);
      expect(container.querySelectorAll('input').length).toBe(0);
    });
  });

  describe('Custom Fields', () => {
    it('uses custom fields when provided', () => {
      const customFields = [
        { label: 'API Key', placeholder: 'sk-...' },
        { label: 'Secret Token', placeholder: 'Enter token' },
      ];

      createFakeMarqueeFields({ container, fields: customFields });

      const labels = container.querySelectorAll('label');
      const labelTexts = Array.from(labels).map((l) => l.textContent);
      expect(labelTexts.some((t) => t === 'API Key' || t === 'Secret Token')).toBe(true);
    });
  });

  describe('Custom Rendering', () => {
    it('uses createFieldContent when provided', () => {
      const customFields = [{ label: 'Test', placeholder: 'test' }];
      const createFieldContent = vi.fn((field) => {
        const div = document.createElement('div');
        div.setAttribute('data-custom', 'true');
        div.textContent = field.label;
        return div;
      });

      createFakeMarqueeFields({ container, fields: customFields, createFieldContent });

      expect(createFieldContent).toHaveBeenCalled();
      const customField = container.querySelector('[data-custom="true"]');
      expect(customField).not.toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('removes all active fields on cleanup', async () => {
      const cleanup = createFakeMarqueeFields({ container, spawnInterval: 500 });

      await vi.advanceTimersByTimeAsync(1500);
      expect(container.querySelectorAll('input').length).toBeGreaterThan(0);

      cleanup();
      expect(container.children.length).toBe(0);
    });

    it('clears spawn interval on cleanup', async () => {
      const cleanup = createFakeMarqueeFields({ container, spawnInterval: 1000 });

      cleanup();

      await vi.advanceTimersByTimeAsync(3000);
      expect(container.children.length).toBe(0);
    });

    it('removes style element on cleanup', () => {
      const cleanup = createFakeMarqueeFields({ container });

      const stylesBefore = document.querySelectorAll('style[id*="fake-marquee-style"]').length;
      expect(stylesBefore).toBeGreaterThan(0);

      cleanup();

      const stylesAfter = document.querySelectorAll('style[id*="fake-marquee-style"]').length;
      expect(stylesAfter).toBeLessThan(stylesBefore);
    });
  });
});
