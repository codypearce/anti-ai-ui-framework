import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props passed to the renderChar function
 */
export interface RenderCharProps {
  /** The character to render */
  char: string;
  /** Original index in the source text */
  originalIndex: number;
  /** Current position index */
  currentIndex: number;
  /** Vertical offset in pixels */
  offsetY: number;
  /** Default styles for the character */
  style: React.CSSProperties;
}

/**
 * Props for the GlitchText component
 */
export interface GlitchTextProps {
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
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Additional inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Inline styles for each character span
   */
  charStyle?: React.CSSProperties;

  /**
   * Custom render function for each character
   */
  renderChar?: (props: RenderCharProps) => React.ReactNode;
}

interface CharState {
  char: string;
  originalIndex: number;
  offsetY: number;
}

/**
 * Creates text with characters that constantly shuffle positions.
 *
 * Humans can still read word shapes, but OCR gets scrambled output
 * on every frame. Characters swap positions rapidly with optional
 * vertical jitter for additional visual disruption.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <GlitchText text="Welcome" />
 *
 * // Custom settings
 * <GlitchText
 *   text="Hello World"
 *   shuffleInterval={100}
 *   shuffleChance={0.5}
 *   jitterY={10}
 * />
 *
 * // With custom styling
 * <GlitchText
 *   text="Styled"
 *   style={{ fontSize: '3rem', color: 'white' }}
 *   charStyle={{ textShadow: '0 0 10px blue' }}
 * />
 * ```
 */
export function GlitchText({
  text = 'Text',
  shuffleInterval = 120,
  shuffleChance = 0.4,
  jitterY = 8,
  preferAdjacent = true,
  className,
  style,
  charStyle,
  renderChar,
}: GlitchTextProps) {
  const logger = useMemo(() => componentLoggers.glitchText, []);

  const [chars, setChars] = useState<CharState[]>(() =>
    text.split('').map((char, i) => ({
      char,
      originalIndex: i,
      offsetY: 0,
    }))
  );

  const animationRef = useRef<number | null>(null);
  const lastShuffleRef = useRef<number>(0);

  const shufflePositions = useCallback(() => {
    setChars((prevChars) => {
      const newChars = [...prevChars];
      const numSwaps = Math.floor(Math.random() * 3) + 1;

      for (let s = 0; s < numSwaps; s++) {
        if (Math.random() > shuffleChance) continue;

        const i = Math.floor(Math.random() * newChars.length);
        let j = Math.floor(Math.random() * newChars.length);

        // Prefer adjacent swaps for readability
        if (preferAdjacent && Math.random() < 0.7) {
          j = Math.min(newChars.length - 1, Math.max(0, i + (Math.random() < 0.5 ? -1 : 1)));
        }

        if (i !== j) {
          [newChars[i], newChars[j]] = [newChars[j], newChars[i]];
          logger.debug('Swapped characters:', i, j);
        }
      }

      // Add vertical jitter
      return newChars.map((c) => ({
        ...c,
        offsetY: (Math.random() - 0.5) * jitterY,
      }));
    });
  }, [shuffleChance, preferAdjacent, jitterY, logger]);

  useEffect(() => {
    // Reset chars when text changes
    setChars(
      text.split('').map((char, i) => ({
        char,
        originalIndex: i,
        offsetY: 0,
      }))
    );
  }, [text]);

  useEffect(() => {
    const animate = () => {
      const now = performance.now();

      if (now - lastShuffleRef.current > shuffleInterval) {
        shufflePositions();
        lastShuffleRef.current = now;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shuffleInterval, shufflePositions]);

  const defaultCharStyle: React.CSSProperties = {
    display: 'inline-block',
    willChange: 'transform',
    transition: 'transform 0.15s ease-out',
    ...charStyle,
  };

  const defaultRenderChar = ({ char, style: charStyles }: RenderCharProps) => (
    <span style={charStyles}>{char}</span>
  );

  const charRenderer = renderChar ?? defaultRenderChar;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        userSelect: 'none',
        ...style,
      }}
    >
      {chars.map((c, idx) => (
        <React.Fragment key={`${c.originalIndex}-${idx}`}>
          {charRenderer({
            char: c.char,
            originalIndex: c.originalIndex,
            currentIndex: idx,
            offsetY: c.offsetY,
            style: {
              ...defaultCharStyle,
              transform: `translateY(${c.offsetY}px)`,
            },
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
