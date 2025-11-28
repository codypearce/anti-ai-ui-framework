import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGlitchText } from '../src/vanilla/glitchText';

describe('createGlitchText (vanilla)', () => {
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

  it('creates text element', () => {
    createGlitchText({ container, text: 'Hello' });
    expect(container.textContent).toContain('Hello');
  });

  it('returns cleanup function', () => {
    const cleanup = createGlitchText({ container });
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('cycles through variations', async () => {
    createGlitchText({
      container,
      variations: ['A', 'B', 'C'],
      changeInterval: 500,
    });

    const initialText = container.textContent;
    await vi.advanceTimersByTimeAsync(500);
    const newText = container.textContent;

    expect(['A', 'B', 'C']).toContain(initialText);
    expect(['A', 'B', 'C']).toContain(newText);
  });

  it('uses custom tag', () => {
    createGlitchText({ container, text: 'Title', tag: 'h1' });
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('cleans up on destroy', () => {
    const cleanup = createGlitchText({ container });
    expect(container.children.length).toBeGreaterThan(0);
    cleanup();
    expect(container.children.length).toBe(0);
  });
});
