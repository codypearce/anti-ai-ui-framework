import { componentLoggers } from '../utils/logger';

/**
 * Field configuration for pendulum fields
 */
export interface PendulumField {
  /**
   * Unique identifier for the field
   */
  name: string;

  /**
   * Field label text (used by default renderer)
   */
  label?: string;

  /**
   * Input type (used by default renderer)
   * @default 'text'
   */
  type?: string;

  /**
   * Placeholder text (used by default renderer)
   */
  placeholder?: string;
}

/**
 * Energy state for a pendulum
 */
export type EnergyState = 'healthy' | 'dying' | 'stopped';

/**
 * Context passed to renderField function
 */
export interface RenderFieldContext {
  /**
   * Field configuration
   */
  field: PendulumField;

  /**
   * Index of the field
   */
  index: number;

  /**
   * Current energy level (0-1)
   */
  energy: number;

  /**
   * Energy state category
   */
  energyState: EnergyState;

  /**
   * Boost energy - call this on keydown events
   */
  boostEnergy: () => void;

  /**
   * Update field value - call this on input events
   */
  setValue: (value: string) => void;

  /**
   * Get current value
   */
  getValue: () => string;
}

/**
 * Options for creating pendulum fields
 */
export interface PendulumFieldsOptions {
  /**
   * Container element to render the form into
   */
  container: HTMLElement;

  /**
   * Array of field configurations
   */
  fields: PendulumField[];

  /**
   * Custom render function for fields. Return the HTML element to use.
   * If not provided, uses default rendering.
   */
  renderField?: (context: RenderFieldContext) => HTMLElement;

  /**
   * Maximum swing angle in degrees at full energy
   * @default 40
   */
  maxAngle?: number;

  /**
   * Energy lost per millisecond
   * @default 0.000095
   */
  energyDecay?: number;

  /**
   * Energy gained per keystroke (0-1 scale)
   * @default 0.15
   */
  energyBoost?: number;

  /**
   * Decay multiplier per field index (higher = later fields decay faster)
   * @default 0.5
   */
  decayMultiplier?: number;

  /**
   * Callback when form values change
   */
  onChange?: (values: Record<string, string>) => void;

  /**
   * Callback when all-pendulums-moving status changes
   */
  onAllMoving?: (allMoving: boolean) => void;

  /**
   * Whether to show the default dark background
   * @default true
   */
  showBackground?: boolean;
}

interface PendulumState {
  arm: HTMLElement;
  fieldElement: HTMLElement;
  rod: HTMLElement;
  phase: number;
  energy: number;
  decayRate: number;
  fieldConfig: PendulumField;
  index: number;
}

const MIN_ENERGY = 0.05;
const DYING_THRESHOLD = 0.25;
const BASE_DURATION = 2000;

/**
 * Get energy state from energy level
 */
function getEnergyState(energy: number): EnergyState {
  if (energy < MIN_ENERGY) return 'stopped';
  if (energy < DYING_THRESHOLD) return 'dying';
  return 'healthy';
}

/**
 * Creates pendulum fields with vanilla JavaScript.
 *
 * Form fields swing like pendulums powered by keystrokes. Each keystroke adds
 * energy/momentum to that field's pendulum. Energy decays over time, and later
 * fields decay faster. All pendulums must be moving to enable form submission.
 *
 * @param options - Configuration options
 * @returns Object with cleanup and utility methods
 *
 * @example
 * // Basic usage
 * ```typescript
 * const form = createPendulumFields({
 *   container: document.getElementById('form-container'),
 *   fields: [
 *     { name: 'username', label: 'Username', type: 'text' },
 *     { name: 'email', label: 'Email', type: 'email' },
 *   ],
 *   onAllMoving: (allMoving) => {
 *     submitBtn.disabled = !allMoving;
 *   },
 * });
 * ```
 *
 * @example
 * // Custom field rendering
 * ```typescript
 * const form = createPendulumFields({
 *   container: document.getElementById('form-container'),
 *   fields: [{ name: 'username' }, { name: 'email' }],
 *   showBackground: false,
 *   renderField: ({ field, boostEnergy, setValue }) => {
 *     const div = document.createElement('div');
 *     div.className = 'my-custom-field';
 *
 *     const input = document.createElement('input');
 *     input.name = field.name;
 *     input.addEventListener('keydown', boostEnergy);
 *     input.addEventListener('input', (e) => setValue((e.target as HTMLInputElement).value));
 *
 *     div.appendChild(input);
 *     return div;
 *   },
 * });
 * ```
 */
export function createPendulumFields(options: PendulumFieldsOptions) {
  const logger = componentLoggers.pendulumFields;

  const {
    container,
    fields: fieldConfigs,
    renderField,
    maxAngle = 40,
    energyDecay = 0.000095,
    energyBoost = 0.15,
    decayMultiplier = 0.5,
    onChange,
    onAllMoving,
    showBackground = true,
  } = options;

  const pendulums: PendulumState[] = [];
  const values: Record<string, string> = {};
  let animationId: number | null = null;
  let active = true;
  let lastTime = performance.now();
  let wasAllMoving = true;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 4rem;
    align-items: center;
    padding: 3rem 2rem 2rem;
    ${showBackground ? 'background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);' : ''}
    border-radius: 8px;
    min-height: 300px;
    position: relative;
  `;

  // Default field renderer
  function defaultRenderField(
    fieldConfig: PendulumField,
    _state: PendulumState,
    boostEnergy: () => void,
    setValue: (value: string) => void
  ): HTMLElement {
    const fieldEl = document.createElement('div');
    fieldEl.style.cssText = `
      margin-top: 40px;
      background: #fff;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      min-width: 200px;
      border: 2px solid transparent;
      transition: box-shadow 0.15s ease, border-color 0.15s ease;
    `;

    if (fieldConfig.label) {
      const label = document.createElement('label');
      label.textContent = fieldConfig.label;
      label.style.cssText = `
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 4px;
      `;
      fieldEl.appendChild(label);
    }

    const input = document.createElement('input');
    input.type = fieldConfig.type || 'text';
    input.name = fieldConfig.name;
    input.placeholder = fieldConfig.placeholder || 'Type to keep swinging...';
    input.style.cssText = `
      width: 100%;
      padding: 8px 0;
      border: none;
      border-bottom: 2px solid #e5e7eb;
      font-size: 14px;
      outline: none;
      background: transparent;
      color: #111827;
      transition: border-color 0.2s;
      box-sizing: border-box;
    `;

    input.addEventListener('focus', () => {
      input.style.borderColor = '#3b82f6';
    });

    input.addEventListener('blur', () => {
      input.style.borderColor = '#e5e7eb';
    });

    input.addEventListener('input', () => {
      setValue(input.value);
    });

    input.addEventListener('keydown', boostEnergy);

    fieldEl.appendChild(input);

    // Store input reference for placeholder updates
    (fieldEl as any).__input = input;

    return fieldEl;
  }

  // Create each pendulum field
  fieldConfigs.forEach((fieldConfig, index) => {
    const row = document.createElement('div');
    row.style.cssText = `
      position: relative;
      width: 100%;
      display: flex;
      justify-content: center;
    `;

    // Pivot point
    const pivot = document.createElement('div');
    pivot.style.cssText = `
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 16px;
      background: #4a5568;
      border-radius: 50%;
      border: 3px solid #718096;
      z-index: 2;
    `;

    // Pendulum arm
    const arm = document.createElement('div');
    arm.style.cssText = `
      position: relative;
      transform-origin: top center;
      will-change: transform;
    `;

    // Arm rod
    const rod = document.createElement('div');
    rod.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 3px;
      height: 40px;
      background: linear-gradient(to bottom, #718096, #4a5568);
      border-radius: 2px;
      transition: background 0.3s;
    `;

    // Calculate decay rate for this field (later fields decay faster)
    const fieldDecayRate = energyDecay * (1 + index * decayMultiplier);

    const state: PendulumState = {
      arm,
      fieldElement: null!, // Will be set below
      rod,
      phase: Math.random() * Math.PI * 2,
      energy: 0.8 - index * 0.15,
      decayRate: fieldDecayRate,
      fieldConfig,
      index,
    };

    // Energy boost function for this field
    const boostEnergy = () => {
      state.energy = Math.min(1, state.energy + energyBoost);
    };

    // Set value function for this field
    const setValue = (value: string) => {
      values[fieldConfig.name] = value;
      onChange?.(values);
      logger.debug('Value changed:', fieldConfig.name, value);
    };

    // Get value function for this field
    const getValue = () => values[fieldConfig.name] || '';

    // Render field (custom or default)
    let fieldElement: HTMLElement;
    if (renderField) {
      fieldElement = renderField({
        field: fieldConfig,
        index,
        energy: state.energy,
        energyState: getEnergyState(state.energy),
        boostEnergy,
        setValue,
        getValue,
      });
      // Custom fields need margin-top for rod
      fieldElement.style.marginTop = '40px';
    } else {
      fieldElement = defaultRenderField(fieldConfig, state, boostEnergy, setValue);
    }

    state.fieldElement = fieldElement;
    pendulums.push(state);

    arm.appendChild(rod);
    arm.appendChild(fieldElement);
    row.appendChild(pivot);
    row.appendChild(arm);
    wrapper.appendChild(row);
  });

  container.appendChild(wrapper);

  // Check if all pendulums are moving
  function checkAllMoving(): boolean {
    return pendulums.every((p) => p.energy >= MIN_ENERGY);
  }

  // Update visual feedback for default-rendered fields
  function updateDefaultFieldVisuals(pendulum: PendulumState) {
    const input = (pendulum.fieldElement as any).__input as HTMLInputElement | undefined;
    if (!input) return; // Custom renderer, skip default visuals

    const energyState = getEnergyState(pendulum.energy);

    if (energyState === 'stopped') {
      pendulum.fieldElement.style.boxShadow =
        '0 0 20px rgba(239, 68, 68, 0.6), 0 4px 20px rgba(0, 0, 0, 0.3)';
      pendulum.fieldElement.style.borderColor = '#ef4444';
      pendulum.rod.style.background = 'linear-gradient(to bottom, #ef4444, #b91c1c)';
      input.placeholder = 'STOPPED! Type to restart!';
    } else if (energyState === 'dying') {
      pendulum.fieldElement.style.boxShadow =
        '0 0 15px rgba(245, 158, 11, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)';
      pendulum.fieldElement.style.borderColor = '#f59e0b';
      pendulum.rod.style.background = 'linear-gradient(to bottom, #f59e0b, #d97706)';
      input.placeholder = 'Slowing down...';
    } else {
      const intensity = Math.min(
        1,
        (pendulum.energy - DYING_THRESHOLD) / (1 - DYING_THRESHOLD)
      );
      pendulum.fieldElement.style.boxShadow = `0 0 ${10 + intensity * 10}px rgba(59, 130, 246, ${0.2 + intensity * 0.4}), 0 4px 20px rgba(0, 0, 0, 0.3)`;
      pendulum.fieldElement.style.borderColor = intensity > 0.5 ? '#3b82f6' : 'transparent';
      pendulum.rod.style.background = 'linear-gradient(to bottom, #718096, #4a5568)';
      input.placeholder = input.value ? '' : 'Type here...';
    }
  }

  // Animation loop
  function animate() {
    if (!active) return;

    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;

    pendulums.forEach((pendulum) => {
      // Decay energy over time
      pendulum.energy = Math.max(0, pendulum.energy - pendulum.decayRate * delta);

      // Calculate swing based on energy
      const currentAngle = maxAngle * pendulum.energy;
      const speed = 0.5 + pendulum.energy * 0.5;
      pendulum.phase += (delta / BASE_DURATION) * Math.PI * 2 * speed;

      const swing = Math.sin(pendulum.phase) * currentAngle;
      pendulum.arm.style.transform = `rotate(${swing}deg)`;

      // Update rod color based on energy
      const energyState = getEnergyState(pendulum.energy);
      if (energyState === 'stopped') {
        pendulum.rod.style.background = 'linear-gradient(to bottom, #ef4444, #b91c1c)';
      } else if (energyState === 'dying') {
        pendulum.rod.style.background = 'linear-gradient(to bottom, #f59e0b, #d97706)';
      } else {
        pendulum.rod.style.background = 'linear-gradient(to bottom, #718096, #4a5568)';
      }

      // Update default field visuals (only for default-rendered fields)
      updateDefaultFieldVisuals(pendulum);
    });

    // Notify about all-moving status changes
    const allMoving = checkAllMoving();
    if (allMoving !== wasAllMoving) {
      wasAllMoving = allMoving;
      onAllMoving?.(allMoving);
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();

  return {
    /**
     * Cleanup and remove all elements
     */
    destroy() {
      active = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      wrapper.remove();
    },

    /**
     * Get current form values
     */
    getValues() {
      return { ...values };
    },

    /**
     * Get the wrapper element
     */
    getElement() {
      return wrapper;
    },

    /**
     * Check if all pendulums are currently moving
     */
    isAllMoving() {
      return checkAllMoving();
    },

    /**
     * Get energy levels for all pendulums
     */
    getEnergyLevels() {
      return pendulums.map((p) => p.energy);
    },

    /**
     * Get energy states for all pendulums
     */
    getEnergyStates() {
      return pendulums.map((p) => getEnergyState(p.energy));
    },
  };
}
