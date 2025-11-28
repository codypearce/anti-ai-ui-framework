import React, { useState, useEffect, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props for the GlitchText component
 */
export interface GlitchTextProps {
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
   * Custom render function for the text
   */
  children?: (currentText: string) => React.ReactNode;

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Additional inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * HTML tag to use for the text element
   * @default 'span'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
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
 * Creates dynamic text that cycles through stylistic variations.
 *
 * This component displays text that randomly cycles through different variations
 * including leet speak, zalgo text, Unicode variations, and case changes.
 * The dynamic encoding provides visual interest while maintaining readability
 * for human users.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <GlitchText text="Company Name" />
 *
 * // Custom variations
 * <GlitchText
 *   text="Codinhood"
 *   variations={[
 *     'Codinhood',
 *     'C0d1nh00d',
 *     'ℂ𝕠𝕕𝕚𝕟𝕙𝕠𝕠𝕕',
 *     'CODINHOOD',
 *   ]}
 *   changeInterval={1000}
 * />
 *
 * // As header with custom render
 * <GlitchText text="Welcome" as="h1">
 *   {(currentText) => (
 *     <div>
 *       <span style={{ fontSize: '2rem' }}>{currentText}</span>
 *       <small>Changing text...</small>
 *     </div>
 *   )}
 * </GlitchText>
 * ```
 */
export function GlitchText({
  text = 'Text',
  variations,
  changeInterval = 800,
  children,
  className,
  style,
  as: Component = 'span',
}: GlitchTextProps) {
  const logger = useMemo(() => componentLoggers.glitchText, []);

  const textVariations = useMemo(
    () => variations || generateDefaultVariations(text),
    [variations, text]
  );
  const [currentText, setCurrentText] = useState(textVariations[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * textVariations.length);
      const newText = textVariations[randomIndex];
      logger.debug('Switching to text variation:', newText);
      setCurrentText(newText);
    }, changeInterval);

    return () => clearInterval(interval);
  }, [textVariations, changeInterval, logger]);

  if (children) {
    return <>{children(currentText)}</>;
  }

  return React.createElement(
    Component,
    { className, style },
    currentText
  );
}
