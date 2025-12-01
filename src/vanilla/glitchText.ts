import { componentLoggers } from '../utils/logger';

/**
 * Options for creating glitch text
 */
export interface GlitchTextOptions {
  /**
   * Container element to append the text to
   */
  container: HTMLElement;

  /**
   * Text to display with shuffling characters
   * @default 'Text'
   */
  text?: string;

  /**
   * Milliseconds between character shuffles
   * @default 120
   */
  shuffleInterval?: number;

  /**
   * Probability (0-1) of swapping characters on each interval
   * @default 0.4
   */
  shuffleChance?: number;

  /**
   * Max vertical offset in pixels for each character
   * @default 8
   */
  jitterY?: number;

  /**
   * Prefer swapping adjacent characters for better readability
   * @default true
   */
  preferAdjacent?: boolean;

  /**
   * CSS styles to apply to the wrapper element
   */
  wrapperStyle?: string;

  /**
   * CSS styles to apply to each character span
   */
  charStyle?: string;
}

interface CharState {
  char: string;
  el: HTMLSpanElement;
  originalIndex: number;
  currentIndex: number;
  offsetY: number;
}

/**
 * Creates text with characters that constantly shuffle positions.
 *
 * Humans can still read word shapes, but OCR gets scrambled output
 * on every frame. Characters swap positions rapidly with optional
 * vertical jitter for additional visual disruption.
 *
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('header');
 *
 * const cleanup = createGlitchText({
 *   container,
 *   text: 'Welcome',
 *   shuffleInterval: 120,
 *   shuffleChance: 0.4,
 *   jitterY: 8
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createGlitchText(options: GlitchTextOptions): () => void {
  const logger = componentLoggers.glitchText;

  const {
    container,
    text = 'Text',
    shuffleInterval = 120,
    shuffleChance = 0.4,
    jitterY = 8,
    preferAdjacent = true,
    wrapperStyle = 'display: flex; font-size: 2rem; font-weight: 800; user-select: none;',
    charStyle = 'display: inline-block; will-change: transform; transition: transform 0.15s ease-out;',
  } = options;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = wrapperStyle;
  container.appendChild(wrapper);

  const chars: CharState[] = [];

  // Create character elements
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text[i];
    span.style.cssText = charStyle;
    wrapper.appendChild(span);

    chars.push({
      char: text[i],
      el: span,
      originalIndex: i,
      currentIndex: i,
      offsetY: 0
    });
  }

  let animationId: number | null = null;
  let lastShuffle = 0;

  function shufflePositions() {
    const numSwaps = Math.floor(Math.random() * 3) + 1;

    for (let s = 0; s < numSwaps; s++) {
      if (Math.random() > shuffleChance) continue;

      const i = Math.floor(Math.random() * chars.length);
      let j = Math.floor(Math.random() * chars.length);

      // Prefer adjacent swaps for readability
      if (preferAdjacent && Math.random() < 0.7) {
        j = Math.min(chars.length - 1, Math.max(0, i + (Math.random() < 0.5 ? -1 : 1)));
      }

      if (i !== j) {
        // Swap in array
        [chars[i], chars[j]] = [chars[j], chars[i]];
        chars[i].currentIndex = i;
        chars[j].currentIndex = j;

        logger.debug('Swapped characters:', i, j);
      }
    }

    // Reorder DOM and add vertical jitter
    chars.forEach((c) => {
      wrapper.appendChild(c.el);
      c.offsetY = (Math.random() - 0.5) * jitterY;
      c.el.style.transform = `translateY(${c.offsetY}px)`;
    });
  }

  function animate() {
    const now = performance.now();

    if (now - lastShuffle > shuffleInterval) {
      shufflePositions();
      lastShuffle = now;
    }

    animationId = requestAnimationFrame(animate);
  }

  // Start animation
  animationId = requestAnimationFrame(animate);

  // Return cleanup function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    wrapper.remove();
  };
}
