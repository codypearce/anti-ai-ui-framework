import React, { useState, useEffect, useCallback } from 'react';

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
 * Props passed to the renderField function
 */
export interface RenderFieldProps {
  /** The current label text (may not match the field due to shuffling) */
  label: string;
  /** The field's placeholder text */
  placeholder: string;
  /** The field's input type */
  type: string;
  /** The current value of the input */
  value: string;
  /** Handler to update the value */
  onChange: (value: string) => void;
  /** Whether labels are currently fading during shuffle */
  isFading: boolean;
  /** The field index */
  index: number;
}

/**
 * Props for the LabelPositionSwap component
 */
export interface LabelPositionSwapProps {
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

  /**
   * Custom render function for each field.
   * Use this to render your own field component.
   */
  renderField?: (props: RenderFieldProps) => React.ReactNode;

  /**
   * Custom CSS class for the container
   */
  className?: string;

  /**
   * Custom inline styles for the container
   */
  style?: React.CSSProperties;
}

const DEFAULT_FIELDS: LabelShuffleField[] = [
  { label: 'Full Name', placeholder: 'John Doe', type: 'text' },
  { label: 'Email', placeholder: 'you@example.com', type: 'email' },
  { label: 'Password', placeholder: 'Enter password', type: 'password' },
];

/**
 * LabelPositionSwap component where labels randomly shuffle between different inputs.
 *
 * The "Email" label might appear above the password field, "Name" above email, etc.
 * Users can't trust that labels match their inputs.
 *
 * @example
 * ```tsx
 * <LabelPositionSwap
 *   fields={[
 *     { label: 'Username', placeholder: 'Enter username' },
 *     { label: 'Email', placeholder: 'Enter email', type: 'email' },
 *     { label: 'Password', placeholder: 'Enter password', type: 'password' },
 *   ]}
 *   shuffleInterval={3000}
 * />
 * ```
 */
export function LabelPositionSwap({
  fields = DEFAULT_FIELDS,
  shuffleInterval = 2500,
  onShuffle,
  renderField,
  className,
  style,
}: LabelPositionSwapProps) {
  const [values, setValues] = useState<string[]>(() => fields.map(() => ''));
  const [labelOrder, setLabelOrder] = useState<number[]>(() => fields.map((_, i) => i));
  const [fading, setFading] = useState(false);

  const shuffleLabels = useCallback(() => {
    setFading(true);

    setTimeout(() => {
      setLabelOrder(prev => {
        const newOrder = [...prev].sort(() => Math.random() - 0.5);

        // Make sure at least one label moved
        if (fields.length > 1 && newOrder.every((val, idx) => val === prev[idx])) {
          [newOrder[0], newOrder[1]] = [newOrder[1], newOrder[0]];
        }

        onShuffle?.(newOrder);
        return newOrder;
      });

      setFading(false);
    }, 150);
  }, [fields.length, onShuffle]);

  useEffect(() => {
    const timeout = setTimeout(shuffleLabels, 500);
    const interval = setInterval(shuffleLabels, shuffleInterval);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [shuffleInterval, shuffleLabels]);

  const handleChange = (index: number, value: string) => {
    setValues(prev => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });
  };

  const defaultRenderField = ({ label, placeholder, type, value, onChange, isFading }: RenderFieldProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontWeight: 500,
          fontSize: '14px',
          color: '#374151',
          opacity: isFading ? 0 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );

  const renderFn = renderField ?? defaultRenderField;

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {fields.map((field, index) => (
        <React.Fragment key={index}>
          {renderFn({
            label: fields[labelOrder[index]].label,
            placeholder: field.placeholder,
            type: field.type || 'text',
            value: values[index],
            onChange: (value) => handleChange(index, value),
            isFading: fading,
            index,
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
