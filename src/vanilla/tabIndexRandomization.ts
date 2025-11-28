import { componentLoggers } from '../utils/logger';

/**
 * Options for creating tab index randomization
 */
export interface TabIndexRandomizationOptions {
  /**
   * Container element to append the fields to
   */
  container: HTMLElement;

  /**
   * Number of fields to render
   * @default 3
   */
  fieldCount?: number;

  /**
   * Interval in milliseconds between tab order shuffles
   * @default 3000
   */
  shuffleInterval?: number;

  /**
   * Show the current tab order to users
   * @default true
   */
  showOrder?: boolean;

  /**
   * Function to create field content for each field index
   * Receives fieldIndex and currentTabIndex, should return an HTMLElement
   */
  createFieldContent?: (fieldIndex: number, currentTabIndex: number) => HTMLElement;
}

/**
 * Creates tab index randomization with vanilla JavaScript.
 *
 * This function creates form fields whose tab order (keyboard navigation order)
 * shuffles at regular intervals. AI automation that relies on predictable tab
 * key navigation will be broken by the constant shuffling.
 *
 * @param options - Configuration options
 * @returns Cleanup function to remove fields and stop shuffling
 *
 * @example
 * ```typescript
 * const container = document.getElementById('tab-container');
 *
 * const cleanup = createTabIndexRandomization({
 *   container,
 *   fieldCount: 3,
 *   shuffleInterval: 3000,
 *   createFieldContent: (fieldIndex, tabIndex) => {
 *     const input = document.createElement('input');
 *     input.type = 'text';
 *     input.placeholder = `Field ${String.fromCharCode(65 + fieldIndex)}`;
 *     input.tabIndex = tabIndex;
 *     input.style.cssText = 'margin: 8px; padding: 8px;';
 *     return input;
 *   }
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createTabIndexRandomization(
  options: TabIndexRandomizationOptions
): () => void {
  const logger = componentLoggers.tabIndexRandomization;

  const {
    container,
    fieldCount = 3,
    shuffleInterval = 3000,
    showOrder = true,
    createFieldContent,
  } = options;

  // Initialize tab order array [1, 2, 3, ...fieldCount]
  let tabOrder: number[] = Array.from({ length: fieldCount }, (_, i) => i + 1);

  // Shuffle array using simple random sort
  const shuffleArray = (array: number[]): number[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // Create wrapper
  const wrapper = document.createElement('div');

  // Create field containers
  const fields: HTMLElement[] = [];
  for (let fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
    const fieldDiv = document.createElement('div');

    if (createFieldContent) {
      const content = createFieldContent(fieldIndex, tabOrder[fieldIndex]);
      fieldDiv.appendChild(content);
    }

    wrapper.appendChild(fieldDiv);
    fields.push(fieldDiv);
  }

  // Create order display
  let orderDisplay: HTMLParagraphElement | null = null;
  if (showOrder) {
    orderDisplay = document.createElement('p');
    orderDisplay.style.cssText = `
      font-size: 0.875rem;
      color: #425466;
      margin-top: 0.5rem;
    `;
    orderDisplay.textContent = `Current tab order: ${tabOrder.join(' → ')}`;
    wrapper.appendChild(orderDisplay);
  }

  // Update tab indices based on current order
  const updateTabIndices = () => {
    fields.forEach((fieldDiv, fieldIndex) => {
      const currentTabIndex = tabOrder[fieldIndex];

      // Find all interactive elements in the field
      const interactives = fieldDiv.querySelectorAll<HTMLElement>(
        'input, button, select, textarea, a[href]'
      );

      interactives.forEach((elem) => {
        elem.tabIndex = currentTabIndex;
      });

      // If user provided createFieldContent, regenerate content with new tabIndex
      if (createFieldContent) {
        fieldDiv.innerHTML = '';
        const content = createFieldContent(fieldIndex, currentTabIndex);
        fieldDiv.appendChild(content);
      }
    });

    // Update order display
    if (orderDisplay) {
      orderDisplay.textContent = `Current tab order: ${tabOrder.join(' → ')}`;
    }
  };

  // Start shuffle timer
  const timer = setInterval(() => {
    tabOrder = shuffleArray(tabOrder);
    logger.debug('Tab order shuffled:', tabOrder);
    updateTabIndices();
  }, shuffleInterval);

  // Add to container
  container.appendChild(wrapper);

  // Return cleanup function
  return () => {
    clearInterval(timer);
    wrapper.remove();
  };
}
