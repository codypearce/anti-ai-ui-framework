/**
 * Options for creating a microscopic close button
 */
export interface MicroscopicCloseButtonOptions {
  /**
   * Container element to append the component to
   */
  container: HTMLElement;

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
}

/**
 * Creates a microscopic close button component with vanilla JavaScript.
 *
 * This function adds ONLY the close button mechanism to your existing container.
 * The close buttons are absolutely positioned, so ensure your container has
 * position: relative.
 *
 * Features a compact 4×4px primary close button in the top-right corner and multiple
 * secondary close buttons that trigger the alternative callback when clicked.
 *
 * @param options - Configuration options for the component
 * @returns Cleanup function to remove the buttons and their event listeners
 *
 * @example
 * ```typescript
 * // Get your modal/dialog container
 * const modal = document.getElementById('my-modal');
 *
 * // Add microscopic close buttons to it
 * const cleanup = createMicroscopicCloseButton({
 *   container: modal,
 *   onRealClose: () => {
 *     modal.style.display = 'none';
 *     console.log('Modal closed!');
 *   },
 *   onFakeClose: () => console.log('Nice try!'),
 * });
 *
 * // Later, when you want to remove the buttons
 * cleanup();
 * ```
 */
export function createMicroscopicCloseButton(
  options: MicroscopicCloseButtonOptions
): () => void {
  const {
    container,
    onRealClose,
    onFakeClose,
    fakeButtonCount = 5,
  } = options;

  // Ensure container has position: relative
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  const createdButtons: HTMLButtonElement[] = [];

  // Helper function to create fake close button
  const createFakeButton = (styles: Partial<CSSStyleDeclaration>, text = '×') => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.setAttribute('aria-label', 'Fake close button');
    Object.assign(btn.style, {
      position: 'absolute',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      cursor: 'pointer',
      zIndex: '50',
      color: '#666',
      transition: 'all 0.2s ease',
      ...styles,
    });

    const originalBg = styles.background || '#f0f0f0';
    btn.addEventListener('mouseenter', () => {
      if (originalBg.includes('rgba')) {
        btn.style.background = originalBg.replace(/0\.\d+/, '0.6');
      } else {
        btn.style.background = '#e0e0e0';
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = originalBg;
    });
    btn.addEventListener('click', () => {
      onFakeClose?.();
    });

    return btn;
  };

  // Fake button configurations
  const fakeButtonConfigs = [
    // Large obvious button - top left, square
    {
      styles: {
        top: '10px',
        left: '10px',
        width: '30px',
        height: '30px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: '700',
      },
      text: '×',
    },
    // Large obvious button - top left, circle
    {
      styles: {
        top: '10px',
        left: '50px',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: '700',
      },
      text: '×',
    },
    // Medium button - top left, text style
    {
      styles: {
        top: '12px',
        left: '90px',
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '700',
      },
      text: '×',
    },
    // Tiny decoy - near real button
    {
      styles: {
        top: '6px',
        right: '25px',
        width: '8px',
        height: '8px',
        background: 'rgba(120, 120, 120, 0.4)',
        border: 'none',
        borderRadius: '1px',
        fontSize: '0',
      },
      text: '',
    },
    // Small decoy - near real button
    {
      styles: {
        top: '5px',
        right: '40px',
        width: '10px',
        height: '10px',
        background: 'rgba(100, 100, 100, 0.35)',
        border: 'none',
        borderRadius: '2px',
        fontSize: '6px',
        lineHeight: '10px',
        color: '#fff',
      },
      text: '×',
    },
  ];

  // Create fake buttons
  fakeButtonConfigs.slice(0, fakeButtonCount).forEach(config => {
    const btn = createFakeButton(config.styles, config.text);
    container.appendChild(btn);
    createdButtons.push(btn);
  });

  // Create REAL close button (4×4px)
  const realButton = document.createElement('button');
  realButton.setAttribute('aria-label', 'Close');
  Object.assign(realButton.style, {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '4px',
    height: '4px',
    background: 'rgba(100, 100, 100, 0.3)',
    border: 'none',
    cursor: 'pointer',
    zIndex: '60',
    fontSize: '0',
    padding: '0',
    transition: 'all 0.2s ease',
  });

  realButton.addEventListener('mouseenter', () => {
    realButton.style.background = 'rgba(100, 100, 100, 0.5)';
  });
  realButton.addEventListener('mouseleave', () => {
    realButton.style.background = 'rgba(100, 100, 100, 0.3)';
  });
  realButton.addEventListener('click', () => {
    onRealClose?.();
  });

  container.appendChild(realButton);
  createdButtons.push(realButton);

  // Cleanup function
  return () => {
    createdButtons.forEach(btn => btn.remove());
  };
}
