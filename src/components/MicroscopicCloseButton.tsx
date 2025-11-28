import React from 'react';

/**
 * Props for the MicroscopicCloseButton component
 */
export interface MicroscopicCloseButtonProps {
  /**
   * Callback when the real (microscopic) close button is clicked
   */
  onRealClose?: () => void;

  /**
   * Callback when a fake close button is clicked
   */
  onFakeClose?: () => void;

  /**
   * Number of fake close buttons to render
   * @default 5
   */
  fakeButtonCount?: number;

  /**
   * Custom CSS class for the button container
   */
  className?: string;

  /**
   * Custom inline styles for the button container
   */
  style?: React.CSSProperties;

  /**
   * Content to display (your modal/dialog content)
   * The buttons will be positioned absolutely over this content
   */
  children?: React.ReactNode;
}

/**
 * MicroscopicCloseButton - Renders a 4×4px real close button with multiple decoy buttons
 *
 * This component provides ONLY the close button mechanism. You provide your own modal/dialog
 * content as children. The close buttons are absolutely positioned, so ensure your container
 * has position: relative.
 *
 * The component creates multiple close button targets, requiring users to identify and
 * interact with the correct control. This design pattern ensures intentional engagement
 * by leveraging precision-based interaction.
 *
 * @example
 * ```tsx
 * // In your own modal/dialog
 * <div style={{ position: 'relative', padding: '2rem', background: '#fff', borderRadius: '8px' }}>
 *   <MicroscopicCloseButton
 *     onRealClose={() => setModalOpen(false)}
 *     onFakeClose={() => console.log('Nice try!')}
 *   />
 *   <h2>Your Modal Title</h2>
 *   <p>Your modal content here...</p>
 *   <button>Your Action Button</button>
 * </div>
 * ```
 */
export function MicroscopicCloseButton({
  onRealClose,
  onFakeClose,
  fakeButtonCount = 5,
  className,
  style,
  children,
}: MicroscopicCloseButtonProps) {
  const handleRealClose = () => {
    onRealClose?.();
  };

  const handleFakeClose = () => {
    onFakeClose?.();
  };

  // Predefined positions for fake buttons to create a realistic close button cluster
  const fakeButtonStyles: React.CSSProperties[] = [
    // Large obvious button - top left, square
    {
      position: 'absolute',
      top: '10px',
      left: '10px',
      width: '30px',
      height: '30px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      fontWeight: 700,
      cursor: 'pointer',
      zIndex: 50,
      color: '#666',
      transition: 'all 0.2s ease',
    },
    // Large obvious button - top left, circle
    {
      position: 'absolute',
      top: '10px',
      left: '50px',
      width: '30px',
      height: '30px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      fontWeight: 700,
      cursor: 'pointer',
      zIndex: 50,
      color: '#666',
      transition: 'all 0.2s ease',
    },
    // Medium button - top left, text style
    {
      position: 'absolute',
      top: '12px',
      left: '90px',
      padding: '4px 12px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 700,
      cursor: 'pointer',
      zIndex: 50,
      color: '#666',
      transition: 'all 0.2s ease',
    },
    // Tiny decoy - near real button
    {
      position: 'absolute',
      top: '6px',
      right: '25px',
      width: '8px',
      height: '8px',
      background: 'rgba(120, 120, 120, 0.4)',
      border: 'none',
      borderRadius: '1px',
      fontSize: 0,
      cursor: 'pointer',
      zIndex: 50,
      transition: 'all 0.2s ease',
    },
    // Small decoy - near real button
    {
      position: 'absolute',
      top: '5px',
      right: '40px',
      width: '10px',
      height: '10px',
      background: 'rgba(100, 100, 100, 0.35)',
      border: 'none',
      borderRadius: '2px',
      fontSize: '6px',
      lineHeight: '10px',
      cursor: 'pointer',
      zIndex: 50,
      color: '#fff',
      transition: 'all 0.2s ease',
    },
  ];

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {/* Fake close buttons */}
      {fakeButtonStyles.slice(0, fakeButtonCount).map((btnStyle, idx) => (
        <button
          key={`fake-${idx}`}
          onClick={handleFakeClose}
          aria-label="Fake close button"
          style={btnStyle}
          onMouseEnter={(e) => {
            const bg = btnStyle.background;
            if (typeof bg === 'string' && bg.includes('rgba')) {
              e.currentTarget.style.background = bg.replace(/0\.\d+/, '0.6');
            } else {
              e.currentTarget.style.background = '#e0e0e0';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = btnStyle.background as string;
          }}
        >
          {idx < 3 ? '×' : ''}
        </button>
      ))}

      {/* REAL close button - 4×4 pixels, top right corner */}
      <button
        onClick={handleRealClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '4px',
          height: '4px',
          background: 'rgba(100, 100, 100, 0.3)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 60,
          fontSize: 0,
          padding: 0,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(100, 100, 100, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(100, 100, 100, 0.3)';
        }}
      />

      {/* User's content */}
      {children}
    </div>
  );
}
