import { componentLoggers } from '../utils/logger';

/**
 * Options for creating random fake errors
 */
export interface RandomFakeErrorsOptions {
  /**
   * Container element to append errors to
   */
  container: HTMLElement;

  /**
   * Array of fake error messages
   * @default ['Error: Username is too enthusiastic', ...]
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
 * Creates random fake errors with vanilla JavaScript.
 *
 * This function displays absurd error messages at random intervals,
 * confusing AI automation by making it think there are validation errors.
 *
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('form-container');
 *
 * const cleanup = createRandomFakeErrors({
 *   container,
 *   errorInterval: 5000,
 *   errorDuration: 3000,
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createRandomFakeErrors(
  options: RandomFakeErrorsOptions
): () => void {
  const logger = componentLoggers.randomFakeErrors;

  const {
    container,
    errors = DEFAULT_ERRORS,
    errorInterval = 5000,
    errorDuration = 3000,
  } = options;

  // Create error element
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    color: #ff4757;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    padding: 8px 12px;
    background: #ffebee;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    display: none;
  `;

  container.appendChild(errorDiv);

  let errorTimeout: ReturnType<typeof setTimeout> | null = null;

  // Start error interval
  const timer = setInterval(() => {
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    logger.debug('Showing fake error:', randomError);

    errorDiv.textContent = randomError;
    errorDiv.style.display = 'block';

    // Clear previous timeout if exists
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }

    // Hide after duration
    errorTimeout = setTimeout(() => {
      errorDiv.style.display = 'none';
    }, errorDuration);
  }, errorInterval);

  // Return cleanup function
  return () => {
    clearInterval(timer);
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    errorDiv.remove();
  };
}
