import { componentLoggers } from '../utils/logger';

/**
 * Options for creating opacity flash
 */
export interface OpacityFlashOptions {
  /**
   * Container element to append the field to
   */
  container: HTMLElement;

  /**
   * Label text
   * @default 'Username'
   */
  label?: string;

  /**
   * Input placeholder
   * @default 'Can you even see this?'
   */
  placeholder?: string;

  /**
   * Interval in milliseconds between opacity changes
   * @default 800
   */
  changeInterval?: number;

  /**
   * Minimum opacity value (0-1)
   * @default 0.2
   */
  minOpacity?: number;

  /**
   * Maximum opacity value (0-1)
   * @default 1.0
   */
  maxOpacity?: number;

  /**
   * CSS transition duration
   * @default '0.3s ease'
   */
  transition?: string;

  /**
   * Callback when opacity changes
   */
  onOpacityChange?: (opacity: number) => void;

  /**
   * Custom function to create field element
   */
  createFieldElement?: (opacity: number, label: string, placeholder: string) => HTMLElement;

  /**
   * Show opacity indicator
   * @default true
   */
  showOpacityIndicator?: boolean;
}

/**
 * Creates elements that flash between visible and nearly invisible with vanilla JavaScript.
 *
 * This function creates confusion by rapidly changing the opacity of form elements
 * between visible (1.0) and nearly invisible (0.2). AI computer vision systems
 * need stable visual elements to detect and interact with UI components. Rapid
 * opacity changes confuse object detection and make element detection fail when
 * elements become too transparent.
 *
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('app');
 *
 * const cleanup = createOpacityFlash({
 *   container,
 *   label: 'Email',
 *   placeholder: 'Enter email...',
 *   changeInterval: 1000,
 *   minOpacity: 0.1,
 *   maxOpacity: 0.9,
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createOpacityFlash(
  options: OpacityFlashOptions
): () => void {
  const logger = componentLoggers.opacityFlash;

  const {
    container,
    label = 'Username',
    placeholder = 'Can you even see this?',
    changeInterval = 800,
    minOpacity = 0.2,
    maxOpacity = 1.0,
    transition = '0.3s ease',
    onOpacityChange,
    createFieldElement,
    showOpacityIndicator = true,
  } = options;

  let currentOpacity = maxOpacity;

  // Create wrapper
  const wrapper = document.createElement('div');

  // Create flashing container
  const flashContainer = document.createElement('div');
  flashContainer.style.transition = `opacity ${transition}`;
  flashContainer.style.opacity = String(currentOpacity);

  // Create label
  const labelElement = document.createElement('label');
  labelElement.textContent = label;
  Object.assign(labelElement.style, {
    display: 'block',
    fontWeight: '500',
    fontSize: '14px',
    color: '#374151',
    marginBottom: '4px',
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
    width: '100%',
  });

  // Add elements to flash container
  if (createFieldElement) {
    const customElement = createFieldElement(currentOpacity, label, placeholder);
    flashContainer.appendChild(customElement);
  } else {
    flashContainer.appendChild(labelElement);
    flashContainer.appendChild(inputElement);
  }

  // Create indicator
  let indicatorElement: HTMLElement | null = null;
  if (showOpacityIndicator) {
    indicatorElement = document.createElement('p');
    Object.assign(indicatorElement.style, {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '8px',
    });
  }

  const updateOpacity = () => {
    const opacityRange = maxOpacity - minOpacity;
    currentOpacity = minOpacity + Math.random() * opacityRange;
    logger.debug('Changing opacity to:', currentOpacity);

    if (createFieldElement) {
      // Custom rendering
      flashContainer.innerHTML = '';
      const customElement = createFieldElement(currentOpacity, label, placeholder);
      flashContainer.appendChild(customElement);
      flashContainer.style.opacity = String(currentOpacity);
    } else {
      // Default rendering - just update opacity
      flashContainer.style.opacity = String(currentOpacity);
    }

    // Update indicator
    if (indicatorElement) {
      indicatorElement.textContent = `Opacity flashes every ${changeInterval}ms (current: ${currentOpacity.toFixed(2)})`;
    }

    onOpacityChange?.(currentOpacity);
  };

  // Initial setup
  wrapper.appendChild(flashContainer);
  if (indicatorElement) {
    indicatorElement.textContent = `Opacity flashes every ${changeInterval}ms (current: ${currentOpacity.toFixed(2)})`;
    wrapper.appendChild(indicatorElement);
  }
  container.appendChild(wrapper);

  // Start opacity changing
  const interval = setInterval(updateOpacity, changeInterval);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    wrapper.remove();
  };
}
