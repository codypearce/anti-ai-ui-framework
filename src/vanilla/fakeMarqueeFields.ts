import { componentLoggers } from '../utils/logger';

/**
 * Fake field configuration
 */
export interface FakeField {
  label: string;
  placeholder: string;
}

/**
 * Options for creating fake marquee fields
 */
export interface FakeMarqueeFieldsOptions {
  /**
   * Container element to append fields to
   */
  container: HTMLElement;

  /**
   * Array of fake field types to randomly show
   * @default Default sensitive fields (SSN, Credit Card, etc.)
   */
  fields?: FakeField[];

  /**
   * Interval in milliseconds between spawning new fields
   * @default 1500
   */
  spawnInterval?: number;

  /**
   * Duration in milliseconds that each field scrolls across
   * @default 12000
   */
  scrollDuration?: number;

  /**
   * Minimum top position as percentage (0-100)
   * @default 10
   */
  minTop?: number;

  /**
   * Maximum top position as percentage (0-100)
   * @default 70
   */
  maxTop?: number;

  /**
   * Whether fields are positioned absolutely within container or fixed on page
   * @default true (contained)
   */
  contained?: boolean;

  /**
   * Custom function to create field content
   */
  createFieldContent?: (field: {
    id: number;
    label: string;
    placeholder: string;
    top: number;
  }) => HTMLElement;
}

const DEFAULT_FAKE_FIELDS: FakeField[] = [
  { label: 'Social Security Number', placeholder: 'XXX-XX-XXXX' },
  { label: 'Credit Card Number', placeholder: '1234 5678 9012 3456' },
  { label: "Mother's Maiden Name", placeholder: 'Enter name' },
  { label: 'Bank Account', placeholder: 'Account number' },
  { label: 'Blood Type', placeholder: 'A+, B-, etc.' },
  { label: 'Passport Number', placeholder: 'Enter passport' },
  { label: "Driver's License", placeholder: 'License number' },
  { label: 'PIN Code', placeholder: '****' },
  { label: 'Security Code', placeholder: 'CVV' },
  { label: 'Date of Birth', placeholder: 'MM/DD/YYYY' },
];

/**
 * Creates fake form fields that scroll across the screen with vanilla JavaScript.
 *
 * This function displays random fake input fields (SSN, credit card, etc.) that
 * scroll horizontally across the screen. AI form-filling automation tries to
 * fill these fields thinking they're real, creating noise and confusion.
 *
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('marquee-container');
 *
 * const cleanup = createFakeMarqueeFields({
 *   container,
 *   spawnInterval: 2000,
 *   scrollDuration: 10000,
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createFakeMarqueeFields(
  options: FakeMarqueeFieldsOptions
): () => void {
  const logger = componentLoggers.fakeMarqueeFields;

  const {
    container,
    fields = DEFAULT_FAKE_FIELDS,
    spawnInterval = 1500,
    scrollDuration = 12000,
    minTop = 10,
    maxTop = 70,
    contained = true,
    createFieldContent,
  } = options;

  // Add keyframes for animation
  const styleId = `fake-marquee-style-${Date.now()}`;
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = `
    @keyframes scrollAcross {
      0% {
        left: -400px;
        opacity: 0;
      }
      5% {
        opacity: 1;
      }
      95% {
        opacity: 1;
      }
      100% {
        left: calc(100% + 400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleElement);

  // Set container styles
  const originalPosition = container.style.position;
  const originalOverflow = container.style.overflow;
  const originalIsolation = container.style.isolation;

  container.style.position = 'relative';
  container.style.overflow = contained ? 'hidden' : 'visible';
  container.style.minHeight = '250px';
  container.style.isolation = 'isolate';

  let nextId = 0;
  const activeElements = new Set<HTMLElement>();

  const spawnField = () => {
    const randomField = fields[Math.floor(Math.random() * fields.length)];
    const topRange = maxTop - minTop;
    const top = minTop + Math.random() * topRange;

    logger.debug('Spawning fake marquee field:', randomField.label);

    let fieldElement: HTMLElement;

    if (createFieldContent) {
      fieldElement = createFieldContent({
        id: nextId++,
        label: randomField.label,
        placeholder: randomField.placeholder,
        top,
      });
    } else {
      // Create default field element
      fieldElement = document.createElement('div');
      fieldElement.style.cssText = `
        position: ${contained ? 'absolute' : 'fixed'};
        display: flex;
        align-items: center;
        gap: 0.75rem;
        top: ${top}%;
        left: -400px;
        animation: scrollAcross ${scrollDuration}ms linear;
        white-space: nowrap;
        z-index: ${contained ? '5' : '10'};
      `;

      const label = document.createElement('label');
      label.textContent = randomField.label;
      label.style.cssText = `
        font-weight: 600;
        color: #0a2540;
        min-width: 150px;
      `;

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = randomField.placeholder;
      input.style.cssText = `
        padding: 0.5rem 0.75rem;
        border: 1px solid #e3e8ee;
        border-radius: 4px;
        font-size: 0.9375rem;
        min-width: 200px;
        background: white;
        cursor: text;
      `;

      fieldElement.appendChild(label);
      fieldElement.appendChild(input);
    }

    container.appendChild(fieldElement);
    activeElements.add(fieldElement);

    // Remove after scroll duration
    setTimeout(() => {
      fieldElement.remove();
      activeElements.delete(fieldElement);
    }, scrollDuration);
  };

  // Spawn first field immediately
  spawnField();

  // Then spawn new fields at intervals
  const interval = setInterval(spawnField, spawnInterval);

  // Return cleanup function
  return () => {
    clearInterval(interval);

    // Remove all active field elements
    activeElements.forEach((el) => el.remove());
    activeElements.clear();

    // Remove style element
    styleElement.remove();

    // Restore original container styles
    container.style.position = originalPosition;
    container.style.overflow = originalOverflow;
    container.style.isolation = originalIsolation;
  };
}
