import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface InputMisdirectionProps {
  /**
   * Field definitions for auto-generated inputs
   */
  fields?: Array<{ label: string; placeholder: string; type?: string }>;

  /**
   * How often to reshuffle which field receives input (ms)
   * @default 3000
   */
  shuffleInterval?: number;

  /**
   * Callback when input is redirected
   */
  onMisdirect?: (intended: number, actual: number) => void;

  /**
   * Custom content. Can be either:
   * - A render function that receives handlers to attach to each input
   * - Regular React children for static content
   */
  children?: ((props: {
    getInputProps: (index: number) => {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    };
    values: string[];
    targetMap: number[];
    shuffleNow: () => void;
  }) => React.ReactNode) | React.ReactNode;

  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_FIELDS = [
  { label: 'Username', placeholder: 'Enter username', type: 'text' },
  { label: 'Password', placeholder: 'Enter password', type: 'password' },
  { label: 'Email', placeholder: 'Enter email', type: 'email' },
];

/**
 * InputMisdirection component where typing in one field sends text to another.
 *
 * Two modes:
 * 1. Auto-generate inputs: just pass `fields` prop
 * 2. Use your own inputs: use render prop pattern with `children`
 *
 * @example
 * // Mode 1: Auto-generate inputs
 * <InputMisdirection
 *   fields={[
 *     { label: 'Username', placeholder: 'Enter username' },
 *     { label: 'Password', placeholder: 'Enter password', type: 'password' },
 *   ]}
 * />
 *
 * @example
 * // Mode 2: Use your own inputs
 * <InputMisdirection>
 *   {({ getInputProps, values }) => (
 *     <form>
 *       <input {...getInputProps(0)} className="my-input" />
 *       <input {...getInputProps(1)} className="my-input" />
 *       <input {...getInputProps(2)} className="my-input" />
 *     </form>
 *   )}
 * </InputMisdirection>
 */
export function InputMisdirection({
  fields = DEFAULT_FIELDS,
  shuffleInterval = 3000,
  onMisdirect,
  children,
  className,
  style,
}: InputMisdirectionProps) {
  const [values, setValues] = useState<string[]>(() => fields.map(() => ''));
  const [targetMap, setTargetMap] = useState<number[]>(() => fields.map((_, i) => i));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const shuffleTargets = useCallback(() => {
    const indices = fields.map((_, i) => i);
    let shuffled: number[];

    do {
      shuffled = [...indices].sort(() => Math.random() - 0.5);
    } while (shuffled.some((val, idx) => val === idx && fields.length > 1));

    setTargetMap(shuffled);
  }, [fields.length]);

  useEffect(() => {
    shuffleTargets();
    const interval = setInterval(shuffleTargets, shuffleInterval);
    return () => clearInterval(interval);
  }, [shuffleInterval, shuffleTargets]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = targetMap[index];

    if (target !== index) {
      e.preventDefault();

      setValues(prev => {
        const newValues = [...prev];
        if (e.key === 'Backspace') {
          newValues[target] = newValues[target].slice(0, -1);
        } else if (e.key.length === 1) {
          newValues[target] = newValues[target] + e.key;
        }
        return newValues;
      });

      onMisdirect?.(index, target);
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const target = targetMap[index];
    if (target === index) {
      setValues(prev => {
        const newValues = [...prev];
        newValues[index] = e.target.value;
        return newValues;
      });
    }
  };

  const getInputProps = (index: number) => ({
    value: values[index] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e),
  });

  // Render prop mode or regular children
  if (children) {
    if (typeof children === 'function') {
      return <>{children({ getInputProps, values, targetMap, shuffleNow: shuffleTargets })}</>;
    }
    // Regular children - just render them
    return <>{children}</>;
  }

  // Default render mode
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {fields.map((field, index) => (
        <div key={index}>
          <label
            style={{
              display: 'block',
              fontWeight: 500,
              fontSize: '14px',
              color: '#374151',
              marginBottom: '4px',
            }}
          >
            {field.label}
          </label>
          <input
            ref={el => inputRefs.current[index] = el}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            {...getInputProps(index)}
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
      ))}
    </div>
  );
}
