import { componentLoggers } from '../utils/logger';

/**
 * Field configuration for traffic light form
 */
export interface TrafficLightField {
  /**
   * Field name attribute
   */
  name: string;

  /**
   * Field label text
   */
  label: string;

  /**
   * Input type
   * @default 'text'
   */
  type?: string;
}

/**
 * Duration range configuration
 */
export interface DurationRange {
  min: number;
  max: number;
}

type LightState = 'red' | 'yellow' | 'green';

/**
 * Options for creating a traffic light form
 */
export interface TrafficLightFormOptions {
  /**
   * Container element to render the form into (not needed if using `inputs`)
   */
  container?: HTMLElement;

  /**
   * Array of field configurations (for auto-generated mode)
   */
  fields?: TrafficLightField[];

  /**
   * Existing input elements to apply traffic light behavior to (use instead of fields)
   * When using this mode, you must also provide `lightContainers` for the traffic lights
   */
  inputs?: HTMLInputElement[];

  /**
   * Container elements where traffic lights will be rendered (for custom inputs mode)
   * Should have same length as `inputs`
   */
  lightContainers?: HTMLElement[];

  /**
   * Full cycle duration range in milliseconds
   * @default { min: 3000, max: 7000 }
   */
  cycleDuration?: DurationRange;

  /**
   * Green light duration range in milliseconds
   * @default { min: 1500, max: 3000 }
   */
  greenDuration?: DurationRange;

  /**
   * Yellow light duration in milliseconds
   * @default 500
   */
  yellowDuration?: number;

  /**
   * Callback when form values change
   */
  onChange?: (values: Record<string, string>) => void;

  /**
   * Callback when light state changes
   */
  onStateChange?: (index: number, state: LightState) => void;
}

interface FieldState {
  lightEl: HTMLElement;
  inputEl: HTMLInputElement;
  state: LightState;
  cycleTime: number;
  greenTime: number;
  yellowTime: number;
  active: boolean;
}

/**
 * Creates a traffic light form with vanilla JavaScript.
 *
 * Form fields only accept input when their traffic light is green.
 * Each field cycles at a different rate, forcing users to wait for the right moment.
 *
 * Two modes:
 * 1. Auto-generate: pass `container` and `fields`
 * 2. Use existing inputs: pass `inputs` and `lightContainers`
 *
 * @param options - Configuration options
 * @returns Object with cleanup and utility methods
 *
 * @example
 * // Mode 1: Auto-generate form
 * const form = createTrafficLightForm({
 *   container: document.getElementById('form-container'),
 *   fields: [
 *     { name: 'username', label: 'Username', type: 'text' },
 *     { name: 'email', label: 'Email', type: 'email' },
 *   ],
 * });
 *
 * // Later, cleanup
 * form.destroy();
 *
 * @example
 * // Mode 2: Use your own inputs
 * const form = createTrafficLightForm({
 *   inputs: [
 *     document.getElementById('my-username'),
 *     document.getElementById('my-email'),
 *   ],
 *   lightContainers: [
 *     document.getElementById('light-1'),
 *     document.getElementById('light-2'),
 *   ],
 * });
 */
export function createTrafficLightForm(options: TrafficLightFormOptions) {
  const logger = componentLoggers.trafficLightForm;

  const {
    container,
    fields: fieldConfigs,
    inputs: existingInputs,
    lightContainers,
    cycleDuration = { min: 3000, max: 7000 },
    greenDuration = { min: 1500, max: 3000 },
    yellowDuration = 500,
    onChange,
    onStateChange,
  } = options;

  const fieldStates: FieldState[] = [];
  const values: Record<string, string> = {};
  let wrapper: HTMLElement | null = null;

  // Helper to get random duration in range
  const randomInRange = (range: DurationRange) =>
    range.min + Math.random() * (range.max - range.min);

  // Create a traffic light element
  function createTrafficLight(): HTMLElement {
    const lightEl = document.createElement('div');
    lightEl.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: #1a1a1a;
      padding: 6px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;

    ['red', 'yellow', 'green'].forEach((color) => {
      const light = document.createElement('div');
      light.dataset.color = color;
      light.style.cssText = `
        width: 18px;
        height: 18px;
        border-radius: 50%;
        transition: all 0.2s ease;
        background: ${color === 'red' ? '#4a1515' : color === 'yellow' ? '#4a4515' : '#154a15'};
      `;
      lightEl.appendChild(light);
    });

    return lightEl;
  }

  function setLightState(field: FieldState, state: LightState, index: number) {
    field.state = state;
    logger.debug(`Field ${index} state changed to: ${state}`);

    const lights = field.lightEl.querySelectorAll('[data-color]') as NodeListOf<HTMLElement>;

    lights.forEach((light) => {
      const color = light.dataset.color;
      if (color === state) {
        const activeColors: Record<string, string> = {
          red: '#ff3b3b',
          yellow: '#ffd93b',
          green: '#3bff3b',
        };
        light.style.background = activeColors[color];
        light.style.boxShadow = `0 0 12px ${activeColors[color]}, 0 0 24px ${activeColors[color]}`;
      } else {
        const inactiveColors: Record<string, string> = {
          red: '#4a1515',
          yellow: '#4a4515',
          green: '#154a15',
        };
        light.style.background = inactiveColors[color!];
        light.style.boxShadow = 'none';
      }
    });

    if (state === 'red') {
      field.inputEl.disabled = true;
      field.inputEl.style.opacity = '0.5';
      field.inputEl.style.borderColor = '#e5e7eb';
    } else if (state === 'yellow') {
      field.inputEl.disabled = true;
      field.inputEl.style.opacity = '0.5';
      field.inputEl.style.borderColor = '#e5e7eb';
    } else {
      field.inputEl.disabled = false;
      field.inputEl.style.opacity = '1';
      field.inputEl.style.borderColor = '#3bff3b';
      field.inputEl.focus();
    }

    onStateChange?.(index, state);
  }

  function runCycle(field: FieldState, index: number) {
    if (!field.active) return;

    setLightState(field, 'red', index);

    const redTime = field.cycleTime - field.greenTime - field.yellowTime;

    setTimeout(() => {
      if (!field.active) return;
      setLightState(field, 'yellow', index);

      setTimeout(() => {
        if (!field.active) return;
        setLightState(field, 'green', index);

        setTimeout(() => {
          if (!field.active) return;
          // Randomize next cycle
          field.cycleTime = randomInRange(cycleDuration);
          field.greenTime = randomInRange(greenDuration);
          runCycle(field, index);
        }, field.greenTime);
      }, field.yellowTime);
    }, redTime);
  }

  // Mode 2: Use existing inputs
  if (existingInputs && existingInputs.length > 0) {
    existingInputs.forEach((input, index) => {
      const lightContainer = lightContainers?.[index];
      const lightEl = createTrafficLight();

      if (lightContainer) {
        lightContainer.appendChild(lightEl);
      }

      const state: FieldState = {
        lightEl,
        inputEl: input,
        state: 'red',
        cycleTime: randomInRange(cycleDuration),
        greenTime: randomInRange(greenDuration),
        yellowTime: yellowDuration,
        active: true,
      };

      // Track input changes
      input.addEventListener('input', () => {
        values[input.name || `field-${index}`] = input.value;
        onChange?.(values);
      });

      fieldStates.push(state);
      setLightState(state, 'red', index);
      setTimeout(() => runCycle(state, index), index * 1000);
    });
  }
  // Mode 1: Auto-generate form
  else if (container && fieldConfigs) {
    wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    `;

    fieldConfigs.forEach((fieldConfig, index) => {
      const fieldEl = document.createElement('div');
      fieldEl.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
      `;

      const lightEl = createTrafficLight();

      const fieldWrap = document.createElement('div');
      fieldWrap.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      `;

      const label = document.createElement('label');
      label.textContent = fieldConfig.label;
      label.style.cssText = `
        font-weight: 600;
        font-size: 14px;
      `;

      const input = document.createElement('input');
      input.type = fieldConfig.type || 'text';
      input.name = fieldConfig.name;
      input.placeholder = 'Wait for green...';
      input.disabled = true;
      input.style.cssText = `
        padding: 10px 14px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s, opacity 0.2s;
        opacity: 0.5;
      `;

      input.addEventListener('input', () => {
        values[fieldConfig.name] = input.value;
        onChange?.(values);
      });

      fieldWrap.appendChild(label);
      fieldWrap.appendChild(input);

      fieldEl.appendChild(lightEl);
      fieldEl.appendChild(fieldWrap);
      wrapper!.appendChild(fieldEl);

      const state: FieldState = {
        lightEl,
        inputEl: input,
        state: 'red',
        cycleTime: randomInRange(cycleDuration),
        greenTime: randomInRange(greenDuration),
        yellowTime: yellowDuration,
        active: true,
      };

      fieldStates.push(state);
      setTimeout(() => runCycle(state, index), index * 1000);
    });

    container.appendChild(wrapper);
  }

  // Initial light state
  fieldStates.forEach((field, index) => setLightState(field, 'red', index));

  return {
    /**
     * Cleanup and remove all elements
     */
    destroy() {
      fieldStates.forEach((field) => {
        field.active = false;
        field.lightEl.remove();
      });
      wrapper?.remove();
    },

    /**
     * Get current form values
     */
    getValues() {
      return { ...values };
    },

    /**
     * Get current light states
     */
    getLightStates() {
      return fieldStates.map((f) => f.state);
    },
  };
}
