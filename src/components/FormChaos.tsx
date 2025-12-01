import React, { useState, useEffect, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props for the FormChaos component
 */
export interface FormChaosProps {
  /**
   * Interval in milliseconds between rotation/scale changes
   * @default 800
   */
  changeInterval?: number;

  /**
   * Minimum rotation in degrees (negative value)
   * @default -20
   */
  minRotation?: number;

  /**
   * Maximum rotation in degrees (positive value)
   * @default 20
   */
  maxRotation?: number;

  /**
   * Minimum scale multiplier
   * @default 0.7
   */
  minScale?: number;

  /**
   * Maximum scale multiplier
   * @default 1.3
   */
  maxScale?: number;

  /**
   * Transition duration in CSS format
   * @default '0.5s ease'
   */
  transition?: string;

  /**
   * Form content. Can be either:
   * - A render function that receives (rotation, scale) for dynamic content
   * - Regular React children for static content
   */
  children?: ((rotation: number, scale: number) => React.ReactNode) | React.ReactNode;

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Additional inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Additional CSS class for the rotating/scaling element
   */
  formClassName?: string;

  /**
   * Additional inline styles for the rotating/scaling element
   */
  formStyle?: React.CSSProperties;
}

/**
 * Creates a form with dynamic rotation and scale transformations.
 *
 * This component applies random rotation (-20° to +20°) and scale (0.7x to 1.3x)
 * transformations at regular intervals. The motion ensures users visually
 * track the form and engage with it deliberately.
 *
 * @example
 * ```tsx
 * // Basic usage with default form
 * <FormChaos />
 *
 * // Custom change interval and ranges
 * <FormChaos
 *   changeInterval={1000}
 *   minRotation={-30}
 *   maxRotation={30}
 *   minScale={0.5}
 *   maxScale={1.5}
 * />
 *
 * // Custom content
 * <FormChaos>
 *   {(rotation, scale) => (
 *     <div>
 *       <h3>Login Form</h3>
 *       <input type="text" placeholder="Username" />
 *       <input type="password" placeholder="Password" />
 *       <button>Login</button>
 *       <p>Current: {rotation.toFixed(1)}° / {scale.toFixed(2)}x</p>
 *     </div>
 *   )}
 * </FormChaos>
 * ```
 */
export function FormChaos({
  changeInterval = 800,
  minRotation = -20,
  maxRotation = 20,
  minScale = 0.7,
  maxScale = 1.3,
  transition = '0.5s ease',
  children,
  className,
  style,
  formClassName,
  formStyle,
}: FormChaosProps) {
  const logger = useMemo(() => componentLoggers.formChaos, []);

  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateTransform = () => {
      const rotationRange = maxRotation - minRotation;
      const newRotation = minRotation + Math.random() * rotationRange;

      const scaleRange = maxScale - minScale;
      const newScale = minScale + Math.random() * scaleRange;

      logger.debug('Applying transform:', {
        rotation: newRotation.toFixed(1),
        scale: newScale.toFixed(2),
      });

      setRotation(newRotation);
      setScale(newScale);
    };

    const interval = setInterval(updateTransform, changeInterval);

    return () => clearInterval(interval);
  }, [changeInterval, minRotation, maxRotation, minScale, maxScale, logger]);

  const containerStyle: React.CSSProperties = {
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const transformStyle: React.CSSProperties = {
    transform: `rotate(${rotation}deg) scale(${scale})`,
    transition: `transform ${transition}`,
    ...formStyle,
  };

  // Determine what to render
  const content = typeof children === 'function'
    ? children(rotation, scale)
    : children || (
        <>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#0a2540',
            }}
          >
            Message
          </label>
          <input
            type="text"
            placeholder="Enter message..."
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              marginBottom: '12px',
              border: '1px solid #e3e8ee',
              borderRadius: '4px',
              fontSize: '0.9375rem',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            style={{
              padding: '8px 16px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </>
      );

  return (
    <div className={className} style={containerStyle}>
      <div className={formClassName} style={transformStyle}>
        {content}
      </div>
    </div>
  );
}
