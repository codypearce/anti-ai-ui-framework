import React, { useState, useEffect, useRef, useCallback } from 'react';
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
 * Traffic light component for a single field
 */
export interface TrafficLightProps {
  state: LightState;
  style?: React.CSSProperties;
}

/**
 * Props passed to children render function
 */
export interface TrafficLightRenderProps {
  /**
   * Get props to spread onto an input element
   */
  getInputProps: (index: number) => {
    disabled: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
  };
  /**
   * Current light states for each field
   */
  lightStates: LightState[];
  /**
   * Current form values
   */
  values: Record<string, string>;
  /**
   * Render a traffic light component
   */
  TrafficLight: React.FC<TrafficLightProps>;
}

/**
 * Props for the TrafficLightForm component
 */
export interface TrafficLightFormProps {
  /**
   * Array of field configurations (required for both modes)
   */
  fields: TrafficLightField[];

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
   * Custom render function to use your own inputs.
   * Receives props to build your own form UI.
   */
  children?: (props: TrafficLightRenderProps) => React.ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;
}

interface FieldInternalState {
  state: LightState;
  cycleTime: number;
  greenTime: number;
}

const logger = componentLoggers.trafficLightForm;

/**
 * A form where fields only accept input when their traffic light is green.
 * Each field cycles at a different rate, forcing users to wait for the right moment.
 *
 * Two modes:
 * 1. Auto-generate inputs: just pass `fields` prop
 * 2. Use your own inputs: use render prop pattern with `children`
 *
 * @example
 * // Mode 1: Auto-generate inputs
 * <TrafficLightForm
 *   fields={[
 *     { name: 'username', label: 'Username', type: 'text' },
 *     { name: 'email', label: 'Email', type: 'email' },
 *   ]}
 *   cycleDuration={{ min: 3000, max: 7000 }}
 *   greenDuration={{ min: 1500, max: 3000 }}
 *   onChange={(values) => console.log(values)}
 * />
 *
 * @example
 * // Mode 2: Use your own inputs
 * <TrafficLightForm fields={[{ name: 'user', label: 'User' }, { name: 'pass', label: 'Pass' }]}>
 *   {({ getInputProps, lightStates, TrafficLight }) => (
 *     <div>
 *       <TrafficLight state={lightStates[0]} />
 *       <input {...getInputProps(0)} className="my-input" />
 *       <TrafficLight state={lightStates[1]} />
 *       <input {...getInputProps(1)} className="my-input" />
 *     </div>
 *   )}
 * </TrafficLightForm>
 */
export function TrafficLightForm({
  fields,
  cycleDuration = { min: 3000, max: 7000 },
  greenDuration = { min: 1500, max: 3000 },
  yellowDuration = 500,
  onChange,
  children,
  className,
  style,
}: TrafficLightFormProps): React.ReactElement {
  const [fieldStates, setFieldStates] = useState<FieldInternalState[]>(() =>
    fields.map(() => ({
      state: 'red' as LightState,
      cycleTime: cycleDuration.min + Math.random() * (cycleDuration.max - cycleDuration.min),
      greenTime: greenDuration.min + Math.random() * (greenDuration.max - greenDuration.min),
    }))
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const activeRef = useRef(true);

  const randomInRange = useCallback(
    (range: DurationRange) => range.min + Math.random() * (range.max - range.min),
    []
  );

  useEffect(() => {
    activeRef.current = true;

    const runCycle = (index: number) => {
      if (!activeRef.current) return;

      const state = fieldStates[index];
      const redTime = state.cycleTime - state.greenTime - yellowDuration;

      // Start with red
      setFieldStates((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], state: 'red' };
        return next;
      });

      setTimeout(() => {
        if (!activeRef.current) return;

        // Yellow
        setFieldStates((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], state: 'yellow' };
          return next;
        });

        setTimeout(() => {
          if (!activeRef.current) return;

          // Green
          setFieldStates((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], state: 'green' };
            return next;
          });

          // Focus the input (only in default mode)
          if (!children) {
            inputRefs.current[index]?.focus();
          }

          setTimeout(() => {
            if (!activeRef.current) return;

            // Randomize next cycle and restart
            setFieldStates((prev) => {
              const next = [...prev];
              next[index] = {
                ...next[index],
                cycleTime: randomInRange(cycleDuration),
                greenTime: randomInRange(greenDuration),
              };
              return next;
            });

            runCycle(index);
          }, state.greenTime);
        }, yellowDuration);
      }, redTime);
    };

    // Start each field with staggered timing
    fields.forEach((_, index) => {
      setTimeout(() => runCycle(index), index * 1000);
    });

    return () => {
      activeRef.current = false;
    };
  }, [fields.length]); // Only re-run if field count changes

  const handleInputChange = (index: number, value: string) => {
    const fieldName = fields[index]?.name;
    if (!fieldName) return;

    const newValues = { ...values, [fieldName]: value };
    setValues(newValues);
    onChange?.(newValues);
    logger.debug('Form values changed:', newValues);
  };

  const getLightStyle = (color: string, isActive: boolean): React.CSSProperties => {
    const activeColors: Record<string, string> = {
      red: '#ff3b3b',
      yellow: '#ffd93b',
      green: '#3bff3b',
    };

    const inactiveColors: Record<string, string> = {
      red: '#4a1515',
      yellow: '#4a4515',
      green: '#154a15',
    };

    return {
      width: 18,
      height: 18,
      borderRadius: '50%',
      transition: 'all 0.2s ease',
      background: isActive ? activeColors[color] : inactiveColors[color],
      boxShadow: isActive
        ? `0 0 12px ${activeColors[color]}, 0 0 24px ${activeColors[color]}`
        : 'none',
    };
  };

  // Traffic Light component for render prop mode
  const TrafficLight: React.FC<TrafficLightProps> = ({ state, style: customStyle }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: '#1a1a1a',
        padding: 6,
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        ...customStyle,
      }}
    >
      <div style={getLightStyle('red', state === 'red')} />
      <div style={getLightStyle('yellow', state === 'yellow')} />
      <div style={getLightStyle('green', state === 'green')} />
    </div>
  );

  const getInputProps = (index: number) => {
    const fieldState = fieldStates[index];
    const isGreen = fieldState?.state === 'green';
    const fieldName = fields[index]?.name || '';

    return {
      disabled: !isGreen,
      value: values[fieldName] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value),
    };
  };

  // Render prop mode
  if (children) {
    return (
      <>
        {children({
          getInputProps,
          lightStates: fieldStates.map((s) => s.state),
          values,
          TrafficLight,
        })}
      </>
    );
  }

  // Default render mode
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        ...style,
      }}
    >
      {fields.map((field, index) => {
        const fieldState = fieldStates[index];
        const isGreen = fieldState?.state === 'green';

        return (
          <div
            key={field.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {/* Traffic Light */}
            <TrafficLight state={fieldState?.state || 'red'} />

            {/* Field */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {field.label}
              </label>
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type={field.type || 'text'}
                name={field.name}
                {...getInputProps(index)}
                placeholder={
                  fieldState?.state === 'green'
                    ? 'Type now!'
                    : fieldState?.state === 'yellow'
                      ? 'Get ready...'
                      : 'Wait for green...'
                }
                style={{
                  padding: '10px 14px',
                  border: `2px solid ${isGreen ? '#3bff3b' : '#e5e7eb'}`,
                  borderRadius: 6,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s, opacity 0.2s',
                  opacity: isGreen ? 1 : 0.5,
                  cursor: isGreen ? 'text' : 'not-allowed',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
