import React, { useState, useEffect, useRef, useCallback } from 'react';
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
 * Energy state passed to render functions
 */
export type EnergyState = 'healthy' | 'dying' | 'stopped';

/**
 * Props passed to the renderField function
 */
export interface RenderFieldProps {
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
   * Current field value
   */
  value: string;

  /**
   * Change handler - call this when input value changes
   */
  onChange: (value: string) => void;

  /**
   * Key down handler - call this on keydown to boost energy
   */
  onKeyDown: () => void;
}

/**
 * Props for the PendulumFields component
 */
export interface PendulumFieldsProps {
  /**
   * Array of field configurations
   */
  fields: PendulumField[];

  /**
   * Custom render function for fields. If not provided, uses default rendering.
   */
  renderField?: (props: RenderFieldProps) => React.ReactNode;

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
   * Additional CSS class name for the container
   */
  className?: string;

  /**
   * Additional inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Class name for individual pendulum rows
   */
  rowClassName?: string;

  /**
   * Style for individual pendulum rows
   */
  rowStyle?: React.CSSProperties;

  /**
   * Whether to show the default dark background
   * @default true
   */
  showBackground?: boolean;
}

interface PendulumState {
  phase: number;
  energy: number;
  decayRate: number;
}

const logger = componentLoggers.pendulumFields;

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
 * Form fields that swing like pendulums powered by keystrokes.
 * Each keystroke adds energy/momentum to that field's pendulum.
 * Energy decays over time, and later fields decay faster.
 * All pendulums must be moving to enable form submission.
 *
 * @example
 * // Basic usage with default rendering
 * ```tsx
 * <PendulumFields
 *   fields={[
 *     { name: 'username', label: 'Username', type: 'text' },
 *     { name: 'email', label: 'Email', type: 'email' },
 *   ]}
 *   onAllMoving={(allMoving) => setCanSubmit(allMoving)}
 * />
 * ```
 *
 * @example
 * // Custom field rendering
 * ```tsx
 * <PendulumFields
 *   fields={[{ name: 'username' }, { name: 'email' }]}
 *   renderField={({ field, value, onChange, onKeyDown, energyState }) => (
 *     <MyCustomInput
 *       name={field.name}
 *       value={value}
 *       onChange={(e) => onChange(e.target.value)}
 *       onKeyDown={onKeyDown}
 *       className={energyState === 'stopped' ? 'error' : ''}
 *     />
 *   )}
 * />
 * ```
 */
export function PendulumFields({
  fields,
  renderField,
  maxAngle = 40,
  energyDecay = 0.000095,
  energyBoost = 0.15,
  decayMultiplier = 0.5,
  onChange,
  onAllMoving,
  className,
  style,
  rowClassName,
  rowStyle,
  showBackground = true,
}: PendulumFieldsProps): React.ReactElement {
  const [values, setValues] = useState<Record<string, string>>({});
  const [angles, setAngles] = useState<number[]>(() => fields.map(() => 0));
  const [energyLevels, setEnergyLevels] = useState<number[]>(() =>
    fields.map((_, i) => 0.8 - i * 0.15)
  );
  const pendulumStates = useRef<PendulumState[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const wasAllMovingRef = useRef<boolean>(true);

  // Initialize pendulum states
  useEffect(() => {
    pendulumStates.current = fields.map((_, index) => ({
      phase: Math.random() * Math.PI * 2,
      energy: 0.8 - index * 0.15,
      decayRate: energyDecay * (1 + index * decayMultiplier),
    }));
    setEnergyLevels(pendulumStates.current.map((s) => s.energy));
  }, [fields.length, energyDecay, decayMultiplier]);

  // Animation loop
  useEffect(() => {
    let active = true;

    const animate = () => {
      if (!active) return;

      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const newAngles: number[] = [];
      const newEnergyLevels: number[] = [];

      pendulumStates.current.forEach((state) => {
        // Decay energy over time
        state.energy = Math.max(0, state.energy - state.decayRate * delta);
        newEnergyLevels.push(state.energy);

        // Calculate swing based on energy
        const currentAngle = maxAngle * state.energy;
        const speed = 0.5 + state.energy * 0.5;
        state.phase += (delta / BASE_DURATION) * Math.PI * 2 * speed;

        const swing = Math.sin(state.phase) * currentAngle;
        newAngles.push(swing);
      });

      setAngles(newAngles);
      setEnergyLevels(newEnergyLevels);

      // Check all moving status
      const allMoving = pendulumStates.current.every((s) => s.energy >= MIN_ENERGY);
      if (allMoving !== wasAllMovingRef.current) {
        wasAllMovingRef.current = allMoving;
        onAllMoving?.(allMoving);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      active = false;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [maxAngle, onAllMoving]);

  const handleChange = useCallback(
    (name: string, value: string) => {
      const newValues = { ...values, [name]: value };
      setValues(newValues);
      onChange?.(newValues);
      logger.debug('Value changed:', name, value);
    },
    [values, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number) => {
      if (pendulumStates.current[index]) {
        pendulumStates.current[index].energy = Math.min(
          1,
          pendulumStates.current[index].energy + energyBoost
        );
      }
    },
    [energyBoost]
  );

  // Get visual styles based on energy (used by default renderer)
  const getFieldStyle = (energy: number) => {
    const state = getEnergyState(energy);
    if (state === 'stopped') {
      return {
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 4px 20px rgba(0, 0, 0, 0.3)',
        borderColor: '#ef4444',
      };
    } else if (state === 'dying') {
      return {
        boxShadow: '0 0 15px rgba(245, 158, 11, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)',
        borderColor: '#f59e0b',
      };
    } else {
      const intensity = Math.min(1, (energy - DYING_THRESHOLD) / (1 - DYING_THRESHOLD));
      return {
        boxShadow: `0 0 ${10 + intensity * 10}px rgba(59, 130, 246, ${0.2 + intensity * 0.4}), 0 4px 20px rgba(0, 0, 0, 0.3)`,
        borderColor: intensity > 0.5 ? '#3b82f6' : 'transparent',
      };
    }
  };

  const getRodStyle = (energy: number) => {
    const state = getEnergyState(energy);
    if (state === 'stopped') {
      return 'linear-gradient(to bottom, #ef4444, #b91c1c)';
    } else if (state === 'dying') {
      return 'linear-gradient(to bottom, #f59e0b, #d97706)';
    }
    return 'linear-gradient(to bottom, #718096, #4a5568)';
  };

  const getPlaceholder = (field: PendulumField, energy: number, hasValue: boolean) => {
    if (field.placeholder) return field.placeholder;
    const state = getEnergyState(energy);
    if (state === 'stopped') return 'STOPPED! Type to restart!';
    if (state === 'dying') return 'Slowing down...';
    return hasValue ? '' : 'Type here...';
  };

  // Default field renderer
  const defaultRenderField = ({ field, energy, value, onChange, onKeyDown }: RenderFieldProps) => {
    const fieldStyle = getFieldStyle(energy);
    return (
      <div
        style={{
          marginTop: 40,
          background: '#fff',
          borderRadius: 8,
          padding: '12px 16px',
          boxShadow: fieldStyle.boxShadow,
          minWidth: 200,
          border: `2px solid ${fieldStyle.borderColor}`,
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        }}
      >
        {field.label && (
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#6b7280',
              marginBottom: 4,
            }}
          >
            {field.label}
          </label>
        )}
        <input
          type={field.type || 'text'}
          name={field.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={getPlaceholder(field, energy, !!value)}
          style={{
            width: '100%',
            padding: '8px 0',
            border: 'none',
            borderBottom: '2px solid #e5e7eb',
            fontSize: 14,
            outline: 'none',
            background: 'transparent',
            color: '#111827',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
      </div>
    );
  };

  const fieldRenderer = renderField || defaultRenderField;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4rem',
    alignItems: 'center',
    padding: '3rem 2rem 2rem',
    borderRadius: 8,
    minHeight: 300,
    position: 'relative',
    ...(showBackground && {
      background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
    }),
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {fields.map((field, index) => {
        const energy = energyLevels[index] ?? 0.8;
        const energyState = getEnergyState(energy);

        return (
          <div
            key={field.name}
            className={rowClassName}
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              ...rowStyle,
            }}
          >
            {/* Pivot point */}
            <div
              style={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 16,
                background: '#4a5568',
                borderRadius: '50%',
                border: '3px solid #718096',
                zIndex: 2,
              }}
            />

            {/* Pendulum arm */}
            <div
              style={{
                position: 'relative',
                transformOrigin: 'top center',
                transform: `rotate(${angles[index] || 0}deg)`,
                willChange: 'transform',
              }}
            >
              {/* Rod */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 3,
                  height: 40,
                  background: getRodStyle(energy),
                  borderRadius: 2,
                  transition: 'background 0.3s',
                }}
              />

              {/* Field - either custom or default */}
              {fieldRenderer({
                field,
                index,
                energy,
                energyState,
                value: values[field.name] || '',
                onChange: (value: string) => handleChange(field.name, value),
                onKeyDown: () => handleKeyDown(index),
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
