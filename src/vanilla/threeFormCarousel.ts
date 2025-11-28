import { componentLoggers } from '../utils/logger';

/**
 * Options for creating a three-form carousel
 */
export interface ThreeFormCarouselOptions {
  /**
   * Container element to append the carousel to
   */
  container: HTMLElement;

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
   * Function to create form content for each form index
   * Should return an HTMLElement to be inserted into each form
   */
  createFormContent?: (formIndex: number) => HTMLElement;
}

/**
 * Creates a three-form carousel with vanilla JavaScript.
 *
 * This function creates multiple identical forms that randomly shuffle their
 * positions at regular intervals. AI automation that relies on stable DOM
 * positions will be confused by the constant shuffling.
 *
 * The forms are absolutely positioned and animate via CSS transforms.
 *
 * @param options - Configuration options for the carousel
 * @returns Cleanup function to remove the carousel and stop shuffling
 *
 * @example
 * ```typescript
 * const container = document.getElementById('carousel-container');
 *
 * const cleanup = createThreeFormCarousel({
 *   container,
 *   formCount: 3,
 *   shuffleInterval: 2000,
 *   createFormContent: (formIndex) => {
 *     const form = document.createElement('div');
 *     form.innerHTML = `
 *       <h3>Application ${formIndex + 1}</h3>
 *       <input type="text" placeholder="Name" />
 *       <input type="email" placeholder="Email" />
 *       <button>Submit</button>
 *     `;
 *     return form;
 *   }
 * });
 *
 * // Later, cleanup when done
 * cleanup();
 * ```
 */
export function createThreeFormCarousel(
  options: ThreeFormCarouselOptions
): () => void {
  const logger = componentLoggers.threeFormCarousel;

  const {
    container,
    formCount = 3,
    shuffleInterval = 2000,
    formWidth = 220,
    gap = 16,
    createFormContent,
  } = options;

  // Initialize positions array [0, 1, 2, ...formCount-1]
  let positions: number[] = Array.from({ length: formCount }, (_, i) => i);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Create wrapper
  const wrapper = document.createElement('div');
  const containerWidth = formCount * formWidth + (formCount - 1) * gap;
  Object.assign(wrapper.style, {
    position: 'relative',
    width: `${containerWidth}px`,
    height: 'auto',
    overflow: 'visible',
  });

  // Create forms
  const forms: HTMLElement[] = [];
  for (let formIndex = 0; formIndex < formCount; formIndex++) {
    const formDiv = document.createElement('div');
    Object.assign(formDiv.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: `${formWidth}px`,
      transform: `translateX(${formIndex * (formWidth + gap)}px)`,
      transition: 'transform 0.5s ease',
    });

    // Add user-provided content
    if (createFormContent) {
      const content = createFormContent(formIndex);
      formDiv.appendChild(content);
    }

    wrapper.appendChild(formDiv);
    forms.push(formDiv);
  }

  // Update form positions based on current shuffle state
  const updatePositions = () => {
    positions.forEach((originalIndex, currentPosition) => {
      const translateX = currentPosition * (formWidth + gap);
      forms[originalIndex].style.transform = `translateX(${translateX}px)`;
    });
  };

  // Start shuffle timer
  const timer = setInterval(() => {
    positions = shuffleArray(positions);
    logger.debug('Forms shuffled:', positions);
    updatePositions();
  }, shuffleInterval);

  // Add to container
  container.appendChild(wrapper);

  // Return cleanup function
  return () => {
    clearInterval(timer);
    wrapper.remove();
  };
}
