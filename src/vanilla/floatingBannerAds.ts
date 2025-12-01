import { componentLoggers } from '../utils/logger';

/**
 * Represents a single floating ad
 */
export interface FloatingAd {
  id: number;
  text: string;
  x: number;
  y: number;
}

/**
 * Options for creating floating banner ads
 */
export interface FloatingBannerAdsOptions {
  /**
   * Container element to append the ads to
   */
  container: HTMLElement;

  /**
   * Array of ad messages to randomly display
   * @default ['Win $1000 NOW!', 'Lose 20lbs Fast!', ...]
   */
  adMessages?: string[];

  /**
   * Interval in milliseconds between spawning new ads
   * @default 4000
   */
  spawnInterval?: number;

  /**
   * Duration in milliseconds that each ad lives before disappearing
   * @default 3000
   */
  adLifetime?: number;

  /**
   * Minimum X position as percentage (0-100)
   * @default 20
   */
  minX?: number;

  /**
   * Maximum X position as percentage (0-100)
   * @default 80
   */
  maxX?: number;

  /**
   * Minimum Y position as percentage (0-100)
   * @default 20
   */
  minY?: number;

  /**
   * Maximum Y position as percentage (0-100)
   * @default 80
   */
  maxY?: number;

  /**
   * Custom function to create ad element
   */
  createAdElement?: (ad: FloatingAd) => HTMLElement;

  /**
   * Callback when an ad is clicked
   */
  onAdClick?: (ad: FloatingAd) => void;

  /**
   * Whether to show close buttons on some ads
   * @default true
   */
  showCloseButtons?: boolean;
}

const DEFAULT_AD_MESSAGES = [
  'YOU WON $10,000!!!',
  'HOT SINGLES NEAR YOU',
  'VIRUS DETECTED!!!',
  'FREE iPHONE 15 PRO',
  'CLICK HERE NOW!!!',
  'CONGRATULATIONS!!!',
  'YOUR PC IS AT RISK',
  'DOWNLOAD NOW!!!',
];

const AD_STYLES = [
  // Classic spam banner
  {
    bg: 'linear-gradient(135deg, #ff0000, #cc0000)',
    color: '#ffff00',
    border: '3px dashed #ffff00',
    fontSize: '14px',
    padding: '12px 20px',
    borderRadius: '0',
  },
  // Fake virus alert
  {
    bg: '#1a1a2e',
    color: '#ff4444',
    border: '2px solid #ff4444',
    fontSize: '12px',
    padding: '10px 14px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  // Flashy winner
  {
    bg: 'linear-gradient(45deg, #ffd700, #ff8c00, #ffd700)',
    color: '#000',
    border: '3px solid #8b4513',
    fontSize: '15px',
    padding: '14px 22px',
    borderRadius: '8px',
    textShadow: '1px 1px 0 #fff',
  },
  // Dating site pink
  {
    bg: 'linear-gradient(135deg, #ff69b4, #ff1493)',
    color: '#fff',
    border: '2px solid #fff',
    fontSize: '13px',
    padding: '10px 16px',
    borderRadius: '20px',
  },
  // Fake download button
  {
    bg: 'linear-gradient(180deg, #5cb85c, #449d44)',
    color: '#fff',
    border: '1px solid #398439',
    fontSize: '14px',
    padding: '12px 24px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  // Urgent red box
  {
    bg: '#fff',
    color: '#cc0000',
    border: '4px solid #cc0000',
    fontSize: '13px',
    padding: '10px 16px',
    borderRadius: '0',
    textTransform: 'uppercase',
  },
  // Neon cyber
  {
    bg: '#0d0d0d',
    color: '#0ff',
    border: '2px solid #0ff',
    fontSize: '12px',
    padding: '10px 14px',
    borderRadius: '2px',
    textShadow: '0 0 10px #0ff',
    fontFamily: 'monospace',
  },
];

const AD_ANIMATIONS = [
  'adPulse 0.3s ease-in-out infinite alternate',
  'adShake 0.15s ease-in-out infinite',
  'adBounce 0.5s ease-in-out infinite',
  'adGlow 1s ease-in-out infinite',
  'adWiggle 0.4s ease-in-out infinite',
  'none',
];

// Inject keyframes once
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes adPulse {
      from { transform: scale(1); }
      to { transform: scale(1.05); }
    }
    @keyframes adShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
    @keyframes adBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @keyframes adGlow {
      0%, 100% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5); }
      50% { box-shadow: 0 4px 24px rgba(255, 255, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.4); }
    }
    @keyframes adWiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-2deg); }
      75% { transform: rotate(2deg); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Creates floating banner ads that spawn at random positions with vanilla JavaScript.
 *
 * This function creates a chaotic experience by constantly spawning
 * distracting banner ads at random screen positions. The ads appear
 * every few seconds and disappear after a short lifetime, covering
 * real UI elements and confusing AI automation that tries to click
 * on visible elements.
 *
 * @param options - Configuration options
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('app');
 *
 * const cleanup = createFloatingBannerAds({
 *   container,
 *   adMessages: ['Buy Now!', 'Limited Offer!', 'Click Here!'],
 *   spawnInterval: 3000,
 *   adLifetime: 2000,
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export function createFloatingBannerAds(
  options: FloatingBannerAdsOptions
): () => void {
  const logger = componentLoggers.floatingBannerAds;

  const {
    container,
    adMessages = DEFAULT_AD_MESSAGES,
    spawnInterval = 4000,
    adLifetime = 3000,
    minX = 20,
    maxX = 80,
    minY = 20,
    maxY = 80,
    createAdElement,
    onAdClick,
    showCloseButtons = true,
  } = options;

  // Inject animation styles
  injectStyles();

  // Ensure container is positioned
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  let nextId = 0;
  const activeAds = new Set<HTMLElement>();

  const createDefaultAdElement = (ad: FloatingAd): HTMLElement => {
    const adElement = document.createElement('div');

    // Pick random style and animation
    const style = AD_STYLES[Math.floor(Math.random() * AD_STYLES.length)];
    const animation = AD_ANIMATIONS[Math.floor(Math.random() * AD_ANIMATIONS.length)];

    // Apply styles
    Object.assign(adElement.style, {
      position: 'absolute',
      left: `${ad.x}%`,
      top: `${ad.y}%`,
      background: style.bg,
      color: style.color,
      padding: style.padding,
      borderRadius: style.borderRadius,
      border: style.border,
      fontWeight: 'bold',
      fontSize: style.fontSize,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
      zIndex: '1000',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      animation: animation,
      fontFamily: style.fontFamily || 'inherit',
      textShadow: style.textShadow || 'none',
      textTransform: style.textTransform || 'none',
      letterSpacing: style.letterSpacing || 'normal',
    });

    adElement.textContent = ad.text;

    // Add click handler
    if (onAdClick) {
      adElement.addEventListener('click', (e) => {
        e.stopPropagation();
        onAdClick(ad);
      });
    }

    // Add close button to some ads
    if (showCloseButtons && Math.random() > 0.5) {
      const closeBtn = document.createElement('span');
      closeBtn.textContent = 'X';
      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        width: '18px',
        height: '18px',
        background: '#666',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      });
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adElement.remove();
        activeAds.delete(adElement);
      });
      adElement.appendChild(closeBtn);
    }

    return adElement;
  };

  const spawnAd = () => {
    const randomMessage = adMessages[Math.floor(Math.random() * adMessages.length)];
    const xRange = maxX - minX;
    const yRange = maxY - minY;

    const newAd: FloatingAd = {
      id: nextId++,
      text: randomMessage,
      x: minX + Math.random() * xRange,
      y: minY + Math.random() * yRange,
    };

    logger.debug('Spawning ad:', newAd);

    const adElement = createAdElement
      ? createAdElement(newAd)
      : createDefaultAdElement(newAd);

    container.appendChild(adElement);
    activeAds.add(adElement);

    setTimeout(() => {
      logger.debug('Removing ad:', newAd.id);
      adElement.remove();
      activeAds.delete(adElement);
    }, adLifetime);
  };

  const interval = setInterval(spawnAd, spawnInterval);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    activeAds.forEach((ad) => ad.remove());
    activeAds.clear();
  };
}
