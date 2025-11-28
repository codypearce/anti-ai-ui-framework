import React, { useEffect, useState, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props for the ThreeFormCarousel component
 */
export interface ThreeFormCarouselProps {
  /**
   * Number of forms to display and shuffle
   * @default 3
   */
  formCount?: number;

  /**
   * Interval in milliseconds between shuffles
   * @default 2000
   */
  shuffleInterval?: number;

  /**
   * Width of each form in pixels
   * @default 220
   */
  formWidth?: number;

  /**
   * Gap between forms in pixels
   * @default 16
   */
  gap?: number;

  /**
   * Content to render inside each form
   * Receives the form index as parameter
   */
  children?: (formIndex: number) => React.ReactNode;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Custom styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Custom styles for individual forms
   */
  formStyle?: React.CSSProperties;

  /**
   * Custom className for individual forms
   */
  formClassName?: string;
}

/**
 * ThreeFormCarousel - Multiple identical forms that shuffle positions
 *
 * This component creates a carousel of visually identical forms that randomly
 * shuffle their positions at regular intervals. This ensures users visually
 * identify the correct form rather than relying on positional memory.
 *
 * The component is fully composable - you provide the form content via children,
 * and it handles the position management.
 *
 * @example
 * ```tsx
 * <ThreeFormCarousel formCount={3} shuffleInterval={2000}>
 *   {(formIndex) => (
 *     <>
 *       <h3>Application Form {formIndex + 1}</h3>
 *       <input type="text" placeholder="Name" />
 *       <input type="email" placeholder="Email" />
 *       <button>Submit</button>
 *     </>
 *   )}
 * </ThreeFormCarousel>
 * ```
 */
export function ThreeFormCarousel({
  formCount = 3,
  shuffleInterval = 2000,
  formWidth = 220,
  gap = 16,
  children,
  className,
  style,
  formStyle,
  formClassName,
}: ThreeFormCarouselProps) {
  const logger = useMemo(() => componentLoggers.threeFormCarousel, []);

  // Initialize positions array [0, 1, 2, ...formCount-1]
  const [positions, setPositions] = useState<number[]>(() =>
    Array.from({ length: formCount }, (_, i) => i)
  );

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setPositions((prev) => {
        const shuffled = shuffleArray(prev);
        logger.debug('Forms shuffled:', shuffled);
        return shuffled;
      });
    }, shuffleInterval);

    return () => clearInterval(timer);
  }, [shuffleInterval, logger]);

  const containerWidth = formCount * formWidth + (formCount - 1) * gap;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: `${gap}px`,
        width: `${containerWidth}px`,
        height: 'auto',
        overflow: 'visible',
        ...style,
        margin: '0 auto',
      }}
    >
      {Array.from({ length: formCount }, (_, formIndex) => {
        const position = positions.indexOf(formIndex);
        const offset = position * (formWidth + gap) - formIndex * (formWidth + gap);

        return (
          <div
            key={formIndex}
            className={formClassName}
            style={{
              width: `${formWidth}px`,
              flexShrink: 0,
              transform: `translateX(${offset}px)`,
              transition: 'transform 0.5s ease',
              ...formStyle,
            }}
          >
            {children?.(formIndex)}
          </div>
        );
      })}
    </div>
  );
}
