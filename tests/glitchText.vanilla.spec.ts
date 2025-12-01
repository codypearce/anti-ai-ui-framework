import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGlitchText } from '../src/vanilla/glitchText';

describe('createGlitchText (vanilla)', () => {
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
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('creates text element', () => {
    createGlitchText({ container, text: 'Hello' });
    expect(container.textContent).toContain('Hello');
  });

  it('returns cleanup function', () => {
    const cleanup = createGlitchText({ container });
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('shuffles character positions over time', async () => {
    createGlitchText({
      container,
      text: 'ABCD',
      shuffleInterval: 100,
      shuffleChance: 1,
    });

    const getCharacters = () => {
      const spans = container.querySelectorAll('span');
      return Array.from(spans).map((s) => s.textContent).join('');
    };

    const initial = getCharacters();
    expect(initial).toBe('ABCD');

    // Advance time to trigger shuffles
    await vi.advanceTimersByTimeAsync(200);

    // Characters should still be there (just possibly reordered)
    const shuffled = getCharacters();
    expect(shuffled.split('').sort().join('')).toBe('ABCD');
  });

  it('applies custom wrapper styles', () => {
    createGlitchText({
      container,
      text: 'Title',
      wrapperStyle: 'color: red;',
    });
    const wrapper = container.querySelector('div') as HTMLElement;
    expect(wrapper.style.color).toBe('red');
  });

  it('cleans up on destroy', () => {
    const cleanup = createGlitchText({ container });
    expect(container.children.length).toBeGreaterThan(0);
    cleanup();
    expect(container.children.length).toBe(0);
  });
});
