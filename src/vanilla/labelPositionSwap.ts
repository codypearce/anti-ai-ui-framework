/**
 * Label position options (legacy, kept for backwards compatibility)
 */
export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Field definition for label shuffle
 */
export interface LabelShuffleField {
  label: string;
  placeholder: string;
  type?: string;
}

/**
 * Options for creating label shuffle
 */
export interface LabelPositionSwapOptions {
  /**
   * Container element to append the fields to
   */
  container: HTMLElement;

  /**
   * Field definitions (label, placeholder, type)
   */
  fields?: LabelShuffleField[];

  /**
   * Interval in milliseconds between label shuffles
   * @default 2500
   */
  shuffleInterval?: number;

  /**
   * Callback when labels shuffle
   */
  onShuffle?: (labelOrder: number[]) => void;
}

const DEFAULT_FIELDS: LabelShuffleField[] = [
  { label: 'Full Name', placeholder: 'John Doe', type: 'text' },
  { label: 'Email', placeholder: 'you@example.com', type: 'email' },
  { label: 'Password', placeholder: 'Enter password', type: 'password' },
];

/**
 * Creates a form where labels randomly shuffle between different inputs.
 *
 * The "Email" label might appear above the password field, "Name" above email, etc.
 * Users can't trust that labels match their inputs.
 *
 * @example
 * ```typescript
 * createLabelPositionSwap({
 *   container: document.getElementById('form'),
 *   fields: [
 *     { label: 'Username', placeholder: 'Enter username' },
 *     { label: 'Email', placeholder: 'Enter email', type: 'email' },
 *     { label: 'Password', placeholder: 'Enter password', type: 'password' },
 *   ],
 *   shuffleInterval: 3000,
 * });
 * ```
 */
export function createLabelPositionSwap(options: LabelPositionSwapOptions) {
  const {
    container,
    fields = DEFAULT_FIELDS,
    shuffleInterval = 2500,
    onShuffle,
  } = options;

  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  });

  // Create label elements
  const labelElements: HTMLLabelElement[] = [];
  const fieldWrappers: HTMLDivElement[] = [];
  const inputs: HTMLInputElement[] = [];

  // Track which label index is displayed above which field
  let labelOrder = fields.map((_, i) => i);

  fields.forEach((field) => {
    const fieldWrapper = document.createElement('div');
    Object.assign(fieldWrapper.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    });

    const label = document.createElement('label');
    label.textContent = field.label;
    Object.assign(label.style, {
      fontWeight: '500',
      fontSize: '14px',
      color: '#374151',
      transition: 'opacity 0.2s',
    });

    const input = document.createElement('input');
    input.type = field.type || 'text';
    input.placeholder = field.placeholder;
    Object.assign(input.style, {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = '#3b82f6';
      input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = '#d1d5db';
      input.style.boxShadow = 'none';
    });

    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(input);
    wrapper.appendChild(fieldWrapper);

    labelElements.push(label);
    fieldWrappers.push(fieldWrapper);
    inputs.push(input);
  });

  function shuffleLabels() {
    // Create new random order
    const newOrder = [...labelOrder].sort(() => Math.random() - 0.5);

    // Make sure at least one label moved
    if (fields.length > 1 && newOrder.every((val, idx) => val === labelOrder[idx])) {
      // Swap first two if nothing changed
      [newOrder[0], newOrder[1]] = [newOrder[1], newOrder[0]];
    }

    labelOrder = newOrder;

    // Update label text in each position
    labelElements.forEach((labelEl, fieldIndex) => {
      const labelIndex = labelOrder[fieldIndex];
      labelEl.style.opacity = '0';

      setTimeout(() => {
        labelEl.textContent = fields[labelIndex].label;
        labelEl.style.opacity = '1';
      }, 150);
    });

    onShuffle?.(labelOrder);
  }

  container.appendChild(wrapper);

  // Initial shuffle after a short delay
  const initialTimeout = setTimeout(shuffleLabels, 500);

  // Start shuffling
  const interval = setInterval(shuffleLabels, shuffleInterval);

  return {
    destroy() {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      wrapper.remove();
    },
    getValues() {
      return inputs.map(input => input.value);
    },
    getLabelOrder() {
      return [...labelOrder];
    },
    shuffleNow() {
      shuffleLabels();
    },
  };
}
