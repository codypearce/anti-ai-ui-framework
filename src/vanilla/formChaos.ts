import { componentLoggers } from '../utils/logger';

/**
 * Options for creating form chaos
 */
export interface FormChaosOptions {
  /**
   * Container element to append the form to
   */
  container: HTMLElement;

  /**
   * Interval in milliseconds between rotation/scale changes
   * @default 800
   */
  changeInterval?: number;

  /**
   * Minimum rotation in degrees (negative value)
   * @default -20
   */
  minRotation?: number;

  /**
   * Maximum rotation in degrees (positive value)
   * @default 20
   */
  maxRotation?: number;

  /**
   * Minimum scale multiplier
   * @default 0.7
   */
  minScale?: number;

  /**
   * Maximum scale multiplier
   * @default 1.3
   */
  maxScale?: number;

  /**
   * Transition duration in CSS format
   * @default '0.5s ease'
   */
  transition?: string;

  /**
   * Custom function to create form content
   */
  createFormContent?: (rotation: number, scale: number) => HTMLElement;
}

/**
 * Creates a form with dynamic rotation and scale transformations using vanilla JavaScript.
 *
 * This function applies random rotation (-20° to +20°) and scale (0.7x to 1.3x)
 * transformations at regular intervals. The motion ensures users visually track
 * the form and engage with it deliberately.
 *
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('chaos-container');
 *
 * const cleanup = createFormChaos({
 *   container,
 *   changeInterval: 1000,
 *   minRotation: -30,
 *   maxRotation: 30,
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createFormChaos(options: FormChaosOptions): () => void {
  const logger = componentLoggers.formChaos;

  const {
    container,
    changeInterval = 800,
    minRotation = -20,
    maxRotation = 20,
    minScale = 0.7,
    maxScale = 1.3,
    transition = '0.5s ease',
    createFormContent,
  } = options;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create transform element
  const formElement = document.createElement('div');
  formElement.style.transition = `transform ${transition}`;

  let currentRotation = 0;
  let currentScale = 1;

  // Create or use custom form content
  if (createFormContent) {
    const content = createFormContent(currentRotation, currentScale);
    formElement.appendChild(content);
  } else {
    // Default form content
    const label = document.createElement('label');
    label.textContent = 'Message';
    label.style.cssText = `
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #0a2540;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter message...';
    input.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 12px;
      border: 1px solid #e3e8ee;
      border-radius: 4px;
      font-size: 0.9375rem;
      box-sizing: border-box;
    `;

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Submit';
    button.style.cssText = `
      padding: 8px 16px;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
    `;

    formElement.appendChild(label);
    formElement.appendChild(input);
    formElement.appendChild(button);
  }

  wrapper.appendChild(formElement);
  container.appendChild(wrapper);

  // Update transform function
  const updateTransform = () => {
    const rotationRange = maxRotation - minRotation;
    currentRotation = minRotation + Math.random() * rotationRange;

    const scaleRange = maxScale - minScale;
    currentScale = minScale + Math.random() * scaleRange;

    logger.debug('Applying transform:', {
      rotation: currentRotation.toFixed(1),
      scale: currentScale.toFixed(2),
    });

    formElement.style.transform = `rotate(${currentRotation}deg) scale(${currentScale})`;

    // If custom content creator exists, update content
    if (createFormContent) {
      formElement.innerHTML = '';
      const newContent = createFormContent(currentRotation, currentScale);
      formElement.appendChild(newContent);
    }
  };

  // Start interval
  const interval = setInterval(updateTransform, changeInterval);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    wrapper.remove();
  };
}
