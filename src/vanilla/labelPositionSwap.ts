import { componentLoggers } from '../utils/logger';

/**
 * Label position options
 */
export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Options for creating label position swap
 */
export interface LabelPositionSwapOptions {
  /**
   * Container element to append the field to
   */
  container: HTMLElement;

  /**
   * Label text
   * @default 'Email'
   */
  label?: string;

  /**
   * Input placeholder
   * @default 'Enter text...'
   */
  placeholder?: string;

  /**
   * Interval in milliseconds between position changes
   * @default 2200
   */
  changeInterval?: number;

  /**
   * Available positions to cycle through
   * @default ['top', 'bottom', 'left', 'right']
   */
  positions?: LabelPosition[];

  /**
   * Callback when position changes
   */
  onPositionChange?: (position: LabelPosition) => void;

  /**
   * Custom function to create field element
   */
  createFieldElement?: (position: LabelPosition, label: string, placeholder: string) => HTMLElement;

  /**
   * Show current position indicator
   * @default true
   */
  showPositionIndicator?: boolean;
}

const DEFAULT_POSITIONS: LabelPosition[] = ['top', 'bottom', 'left', 'right'];

/**
 * Creates a label and input field where the label moves between different positions with vanilla JavaScript.
 *
 * This function creates confusion by moving the label to different positions
 * (top, bottom, left, right) relative to the input field. AI systems expect
 * labels in consistent locations and use label proximity to identify fields.
 * Constantly changing positions breaks field identification.
 *
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('app');
 *
 * const cleanup = createLabelPositionSwap({
 *   container,
 *   label: 'Username',
 *   placeholder: 'Enter username...',
 *   changeInterval: 1500,
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createLabelPositionSwap(
  options: LabelPositionSwapOptions
): () => void {
  const logger = componentLoggers.labelPositionSwap;

  const {
    container,
    label = 'Email',
    placeholder = 'Enter text...',
    changeInterval = 2200,
    positions = DEFAULT_POSITIONS,
    onPositionChange,
    createFieldElement,
    showPositionIndicator = true,
  } = options;

  let currentPosition: LabelPosition = positions[0];

  // Create wrapper
  const wrapper = document.createElement('div');

  // Create field container
  const fieldContainer = document.createElement('div');
  fieldContainer.style.display = 'flex';
  fieldContainer.style.gap = '8px';

  // Create label
  const labelElement = document.createElement('label');
  labelElement.textContent = label;
  Object.assign(labelElement.style, {
    fontWeight: '500',
    fontSize: '14px',
    color: '#374151',
  });

  // Create input
  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.placeholder = placeholder;
  Object.assign(inputElement.style, {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  // Create indicator
  let indicatorElement: HTMLElement | null = null;
  if (showPositionIndicator) {
    indicatorElement = document.createElement('p');
    Object.assign(indicatorElement.style, {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '8px',
    });
  }

  const updatePosition = (position: LabelPosition) => {
    if (createFieldElement) {
      // Custom rendering
      fieldContainer.innerHTML = '';
      const customElement = createFieldElement(position, label, placeholder);
      fieldContainer.appendChild(customElement);
    } else {
      // Default rendering
      fieldContainer.innerHTML = '';

      // Update layout based on position
      if (position === 'top' || position === 'bottom') {
        fieldContainer.style.flexDirection = 'column';
        fieldContainer.style.alignItems = 'stretch';

        if (position === 'top') {
          fieldContainer.appendChild(labelElement);
          fieldContainer.appendChild(inputElement);
        } else {
          fieldContainer.appendChild(inputElement);
          fieldContainer.appendChild(labelElement);
        }
      } else {
        fieldContainer.style.flexDirection = 'row';
        fieldContainer.style.alignItems = 'center';

        if (position === 'left') {
          fieldContainer.appendChild(labelElement);
          fieldContainer.appendChild(inputElement);
        } else {
          fieldContainer.appendChild(inputElement);
          fieldContainer.appendChild(labelElement);
        }
      }
    }

    // Update indicator
    if (indicatorElement) {
      indicatorElement.textContent = `Label position changes every ${changeInterval}ms (current: ${position})`;
    }
  };

  // Initial render
  wrapper.appendChild(fieldContainer);
  if (indicatorElement) {
    wrapper.appendChild(indicatorElement);
  }
  container.appendChild(wrapper);
  updatePosition(currentPosition);

  // Start position changing
  const interval = setInterval(() => {
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    logger.debug('Changing label position to:', randomPosition);
    currentPosition = randomPosition;
    updatePosition(currentPosition);
    onPositionChange?.(randomPosition);
  }, changeInterval);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    wrapper.remove();
  };
}
