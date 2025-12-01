export interface InputMisdirectionOptions {
  /**
   * Container element to append generated fields to (not needed if using `inputs`)
   */
  container?: HTMLElement;

  /**
   * Field definitions for auto-generated inputs
   */
  fields?: Array<{ label: string; placeholder: string; type?: string }>;

  /**
   * Existing input elements to apply misdirection to (use instead of fields)
   */
  inputs?: HTMLInputElement[];

  /**
   * How often to reshuffle which field receives input (ms)
   * @default 3000
   */
  shuffleInterval?: number;

  /**
   * Callback when input is redirected
   */
  onMisdirect?: (intended: number, actual: number) => void;
}

const DEFAULT_FIELDS = [
  { label: 'Username', placeholder: 'Enter username', type: 'text' },
  { label: 'Password', placeholder: 'Enter password', type: 'password' },
  { label: 'Email', placeholder: 'Enter email', type: 'email' },
];

/**
 * Creates input misdirection where typing in one field sends text to another.
 *
 * Two modes:
 * 1. Auto-generate inputs: pass `container` and optionally `fields`
 * 2. Use existing inputs: pass `inputs` array of your own input elements
 *
 * @example
 * // Mode 1: Auto-generate inputs
 * createInputMisdirection({
 *   container: document.getElementById('form'),
 *   fields: [
 *     { label: 'Username', placeholder: 'Enter username' },
 *     { label: 'Password', placeholder: 'Enter password', type: 'password' },
 *   ]
 * });
 *
 * @example
 * // Mode 2: Use your own inputs
 * const myInputs = [
 *   document.getElementById('username'),
 *   document.getElementById('email'),
 *   document.getElementById('password'),
 * ];
 * createInputMisdirection({ inputs: myInputs });
 */
export function createInputMisdirection(options: InputMisdirectionOptions) {
  const {
    container,
    fields = DEFAULT_FIELDS,
    inputs: existingInputs,
    shuffleInterval = 3000,
    onMisdirect,
  } = options;

  let wrapper: HTMLDivElement | null = null;
  let inputs: HTMLInputElement[] = [];
  let targetMap: number[] = [];
  const keydownHandlers: Map<HTMLInputElement, (e: KeyboardEvent) => void> = new Map();

  // Shuffle the target map so inputs route to wrong fields
  function shuffleTargets() {
    const indices = inputs.map((_, i) => i);
    let shuffled: number[];

    do {
      shuffled = [...indices].sort(() => Math.random() - 0.5);
    } while (shuffled.some((val, idx) => val === idx && inputs.length > 1));

    targetMap = shuffled;
  }

  function attachMisdirection(input: HTMLInputElement, index: number) {
    const handler = (e: KeyboardEvent) => {
      const target = targetMap[index];

      if (target !== index && inputs[target]) {
        e.preventDefault();

        const targetInput = inputs[target];

        if (e.key === 'Backspace') {
          targetInput.value = targetInput.value.slice(0, -1);
        } else if (e.key.length === 1) {
          targetInput.value += e.key;
        }

        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        onMisdirect?.(index, target);
      }
    };

    input.addEventListener('keydown', handler);
    keydownHandlers.set(input, handler);
  }

  // Mode 2: Use existing inputs
  if (existingInputs && existingInputs.length > 0) {
    inputs = existingInputs;
    inputs.forEach((input, index) => attachMisdirection(input, index));
  }
  // Mode 1: Auto-generate inputs
  else if (container) {
    wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    });

    fields.forEach((field, index) => {
      const fieldWrapper = document.createElement('div');

      const label = document.createElement('label');
      label.textContent = field.label;
      Object.assign(label.style, {
        display: 'block',
        fontWeight: '500',
        fontSize: '14px',
        color: '#374151',
        marginBottom: '4px',
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

      inputs.push(input);
      attachMisdirection(input, index);

      fieldWrapper.appendChild(label);
      fieldWrapper.appendChild(input);
      wrapper!.appendChild(fieldWrapper);
    });

    container.appendChild(wrapper);
  }

  // Initial shuffle
  shuffleTargets();

  // Periodically reshuffle targets
  const interval = setInterval(shuffleTargets, shuffleInterval);

  return {
    destroy() {
      clearInterval(interval);
      // Remove event listeners
      keydownHandlers.forEach((handler, input) => {
        input.removeEventListener('keydown', handler);
      });
      keydownHandlers.clear();
      // Remove generated DOM if we created it
      if (wrapper) {
        wrapper.remove();
      }
    },
    getValues() {
      return inputs.map(input => input.value);
    },
    shuffleNow() {
      shuffleTargets();
    },
    getTargetMap() {
      return [...targetMap];
    },
  };
}
