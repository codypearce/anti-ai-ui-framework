import React, { useState, useEffect, useRef, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Fake field configuration
 */
export interface FakeField {
  label: string;
  placeholder: string;
}

/**
 * Active marquee element
 */
interface MarqueeElement {
  id: number;
  label: string;
  placeholder: string;
  top: number;
}

/**
 * Props passed to the renderField function
 */
export interface RenderFieldProps {
  id: number;
  label: string;
  placeholder: string;
  top: number;
}

/**
 * Props for the FakeMarqueeFields component
 */
export interface FakeMarqueeFieldsProps {
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
   * Custom render function for each field.
   * Use this to render your own field component.
   */
  renderField?: (props: RenderFieldProps) => React.ReactNode;

  /**
   * Custom render function for each field (alias for renderField)
   * @deprecated Use renderField instead
   */
  children?: (field: RenderFieldProps) => React.ReactNode;

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Additional inline styles for the container
   */
  style?: React.CSSProperties;
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
 * Creates fake form fields that scroll across the screen to distract AI automation.
 *
 * This component displays random fake input fields (SSN, credit card, etc.) that
 * scroll horizontally across the screen. AI form-filling automation tries to
 * fill these fields thinking they're real, creating noise and confusion.
 *
 * @example
 * ```tsx
 * // Basic usage with default fields
 * <FakeMarqueeFields />
 *
 * // Custom spawn rate and duration
 * <FakeMarqueeFields
 *   spawnInterval={2000}
 *   scrollDuration={10000}
 * />
 *
 * // Custom fields
 * <FakeMarqueeFields
 *   fields={[
 *     { label: 'API Key', placeholder: 'sk-...' },
 *     { label: 'Secret Token', placeholder: 'Enter token' },
 *   ]}
 * />
 *
 * // Custom render
 * <FakeMarqueeFields>
 *   {(field) => (
 *     <div style={{ background: 'red', padding: '20px' }}>
 *       <label>{field.label}</label>
 *       <input type="password" placeholder={field.placeholder} />
 *     </div>
 *   )}
 * </FakeMarqueeFields>
 * ```
 */
export function FakeMarqueeFields({
  fields = DEFAULT_FAKE_FIELDS,
  spawnInterval = 1500,
  scrollDuration = 12000,
  minTop = 10,
  maxTop = 70,
  contained = true,
  renderField: renderFieldProp,
  children,
  className,
  style,
}: FakeMarqueeFieldsProps) {
  const logger = useMemo(() => componentLoggers.fakeMarqueeFields, []);

  const [marqueeElements, setMarqueeElements] = useState<MarqueeElement[]>([]);
  const nextId = useRef(0);
  const removeTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const spawnField = () => {
      const randomField = fields[Math.floor(Math.random() * fields.length)];
      const topRange = maxTop - minTop;
      const elementId = nextId.current++;
      const newElement: MarqueeElement = {
        id: elementId,
        label: randomField.label,
        placeholder: randomField.placeholder,
        top: minTop + Math.random() * topRange,
      };

      logger.debug('Spawning fake marquee field:', randomField.label);
      setMarqueeElements((prev) => [...prev, newElement]);

      // Remove after scroll duration
      const timeoutId = setTimeout(() => {
        setMarqueeElements((prev) => prev.filter((el) => el.id !== elementId));
        removeTimeoutsRef.current.delete(elementId);
      }, scrollDuration);
      removeTimeoutsRef.current.set(elementId, timeoutId);
    };

    // Spawn first field immediately
    spawnField();

    // Then spawn new fields at intervals
    const interval = setInterval(spawnField, spawnInterval);

    return () => {
      clearInterval(interval);
      // Clear all pending removal timeouts
      removeTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      removeTimeoutsRef.current.clear();
    };
  }, [fields, spawnInterval, scrollDuration, minTop, maxTop, logger]);

  // Use renderField prop or children (for backwards compatibility)
  const customRender = renderFieldProp || children;

  // Default rendering
  const renderField = (element: MarqueeElement) => {
    if (customRender) {
      return customRender(element);
    }

    const fieldStyle: React.CSSProperties = {
      position: contained ? 'absolute' : 'fixed',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      top: `${element.top}%`,
      left: '-400px',
      animation: `scrollAcross ${scrollDuration}ms linear`,
      whiteSpace: 'nowrap',
      zIndex: contained ? 5 : 10,
    };

    return (
      <div key={element.id} style={fieldStyle}>
        <label
          style={{
            fontWeight: 600,
            color: '#0a2540',
            minWidth: '150px',
          }}
        >
          {element.label}
        </label>
        <input
          type="text"
          placeholder={element.placeholder}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e3e8ee',
            borderRadius: '4px',
            fontSize: '0.9375rem',
            minWidth: '200px',
            background: 'white',
            cursor: 'text',
          }}
        />
      </div>
    );
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: contained ? 'hidden' : 'visible',
    minHeight: '250px',
    isolation: 'isolate',
    ...style,
  };

  return (
    <>
      <style>{`
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
      `}</style>
      <div className={className} style={containerStyle}>
        {marqueeElements.map((element) => renderField(element))}
        {marqueeElements.length === 0 && (
          <div
            style={{
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p style={{ color: '#425466', fontSize: '0.875rem' }}>
              Watch fake fields scroll by every {spawnInterval}ms...
            </p>
          </div>
        )}
      </div>
    </>
  );
}
