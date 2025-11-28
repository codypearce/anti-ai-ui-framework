import React, { useEffect, useState, useMemo, useRef } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props for the RandomFakeErrors component
 */
export interface RandomFakeErrorsProps {
  /**
   * Array of fake error messages to display
   * @default ['Error: Username is too enthusiastic', 'Error: Email lacks passion', ...]
   */
  errors?: string[];

  /**
   * Interval in milliseconds between error appearances
   * @default 5000
   */
  errorInterval?: number;

  /**
   * Duration in milliseconds that each error is displayed
   * @default 3000
   */
  errorDuration?: number;

  /**
   * Custom className for the error message
   */
  className?: string;

  /**
   * Custom styles for the error message
   */
  style?: React.CSSProperties;

  /**
   * Content to render when there's an error
   * Receives the current error message
   */
  children?: (error: string | null) => React.ReactNode;
}

const DEFAULT_ERRORS = [
  'Error: Username is too enthusiastic',
  'Error: Email lacks passion',
  'Error: Password is too obvious',
  'Error: Phone number seems suspicious',
  'Error: First name sounds fake',
  'Error: You seem like a robot',
  'Error: Try again on a Tuesday',
  'Error: This field must contain exactly 7 vowels',
];

/**
 * RandomFakeErrors - Displays dynamic validation messages at random intervals
 *
 * This component shows dynamic validation messages that appear and disappear
 * at configurable intervals. These messages help ensure users are actively
 * engaged with the form and paying attention to feedback.
 *
 * The component is fully composable - you can provide custom messages
 * and custom rendering via children.
 *
 * @example
 * ```tsx
 * <RandomFakeErrors
 *   errors={['Error: Please verify your input', 'Error: Attention required']}
 *   errorInterval={5000}
 *   errorDuration={3000}
 * >
 *   {(error) => error ? (
 *     <div className="error-message">{error}</div>
 *   ) : (
 *     <div className="hint">Wait for errors...</div>
 *   )}
 * </RandomFakeErrors>
 * ```
 */
export function RandomFakeErrors({
  errors = DEFAULT_ERRORS,
  errorInterval = 5000,
  errorDuration = 3000,
  className,
  style,
  children,
}: RandomFakeErrorsProps) {
  const logger = useMemo(() => componentLoggers.randomFakeErrors, []);

  const [currentError, setCurrentError] = useState<string | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const randomError = errors[Math.floor(Math.random() * errors.length)];
      logger.debug('Showing fake error:', randomError);
      setCurrentError(randomError);

      // Clear any existing hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => {
        setCurrentError(null);
      }, errorDuration);
    }, errorInterval);

    return () => {
      clearInterval(timer);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [errors, errorInterval, errorDuration, logger]);

  // If children render prop provided, use it
  if (children) {
    return <>{children(currentError)}</>;
  }

  // Default rendering
  return currentError ? (
    <div
      className={className}
      style={{
        color: '#ff4757',
        fontSize: '0.875rem',
        marginTop: '0.5rem',
        padding: '8px 12px',
        background: '#ffebee',
        border: '1px solid #ffcdd2',
        borderRadius: '4px',
        ...style,
      }}
    >
      {currentError}
    </div>
  ) : null;
}
