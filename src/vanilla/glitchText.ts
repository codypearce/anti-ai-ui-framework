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
   * Base text to apply glitch variations to
   * @default 'Text'
   */
  text?: string;

  /**
   * Array of text variations to cycle through
   * If not provided, default variations will be generated from the base text
   */
  variations?: string[];

  /**
   * Interval in milliseconds between text changes
   * @default 800
   */
  changeInterval?: number;

  /**
   * HTML tag to use for the text element
   * @default 'span'
   */
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

  /**
   * Custom function to create text element
   */
  createTextElement?: (currentText: string) => HTMLElement;
}

/**
 * Generates default text variations from base text
 */
function generateDefaultVariations(text: string): string[] {
  return [
    text, // Original
    text.replace(/[aeiou]/gi, (m) => Math.random() > 0.5 ? m.toUpperCase() : m), // Random vowel case
    text.split('').map(c => c + '\u0336').join(''), // Strikethrough combining character
    text.toUpperCase(), // All caps
    text.toLowerCase(), // All lowercase
    text.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join(''), // Alternating case
  ];
}

/**
 * Creates text that cycles through variations with vanilla JavaScript.
 *
 * This function displays text that randomly cycles through different variations
 * including leet speak, zalgo text, Unicode variations, and case changes.
 * AI text recognition expects consistent strings and struggles with constantly
 * changing text encodings.
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
 *   text: 'Codinhood',
 *   variations: [
 *     'Codinhood',
 *     'C0d1nh00d',
 *     'ℂ𝕠𝕕𝕚𝕟𝕙𝕠𝕠𝕕',
 *     'CODINHOOD',
 *   ],
 *   changeInterval: 1000,
 *   tag: 'h1',
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
    variations,
    changeInterval = 800,
    tag = 'span',
    createTextElement,
  } = options;

  const textVariations = variations || generateDefaultVariations(text);

  // Create text element
  let textElement: HTMLElement;

  if (createTextElement) {
    textElement = createTextElement(textVariations[0]);
  } else {
    textElement = document.createElement(tag);
    textElement.textContent = textVariations[0];
  }

  container.appendChild(textElement);

  // Update text function
  const updateText = () => {
    const randomIndex = Math.floor(Math.random() * textVariations.length);
    const newText = textVariations[randomIndex];
    logger.debug('Switching to text variation:', newText);

    if (createTextElement) {
      const newElement = createTextElement(newText);
      textElement.replaceWith(newElement);
      textElement = newElement;
    } else {
      textElement.textContent = newText;
    }
  };

  // Start interval
  const interval = setInterval(updateText, changeInterval);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    textElement.remove();
  };
}
