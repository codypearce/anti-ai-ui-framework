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
}

const DEFAULT_AD_MESSAGES = [
  'Win $1000 NOW!',
  'Lose 20lbs Fast!',
  'Work From Home!',
  'Hot Singles Near You!',
  'VIRUS DETECTED!',
  'Free iPhone 15!',
  'Get Rich Quick!',
  "You're a Winner!",
];

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
  } = options;

  // Ensure container is positioned
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  let nextId = 0;
  const activeAds = new Set<HTMLElement>();

  const createDefaultAdElement = (ad: FloatingAd): HTMLElement => {
    const adElement = document.createElement('div');
    adElement.textContent = ad.text;

    // Apply styles
    Object.assign(adElement.style, {
      position: 'absolute',
      left: `${ad.x}%`,
      top: `${ad.y}%`,
      background: 'linear-gradient(135deg, #ff0080, #ff8c00)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: '1000',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    });

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
