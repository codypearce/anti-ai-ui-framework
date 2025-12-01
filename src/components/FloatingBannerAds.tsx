import React, { useState, useEffect, useRef, useMemo } from 'react';
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
 * Props passed to renderAd function
 */
export interface RenderAdProps {
  /** The ad data */
  ad: FloatingAd;
  /** Default styles for the ad (position already applied) */
  style: React.CSSProperties;
}

/**
 * Props for the FloatingBannerAds component
 */
export interface FloatingBannerAdsProps {
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
   * Custom render function for all ads (full control)
   */
  children?: (ads: FloatingAd[]) => React.ReactNode;

  /**
   * Custom render function for individual ads
   */
  renderAd?: (props: RenderAdProps) => React.ReactNode;

  /**
   * Custom CSS class for the container
   */
  className?: string;

  /**
   * Custom inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Custom CSS class for each ad
   */
  adClassName?: string;

  /**
   * Custom inline styles for each ad
   */
  adStyle?: React.CSSProperties;
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
 * FloatingBannerAds component that spawns fake ads at random positions.
 *
 * This component creates a chaotic experience by constantly spawning
 * distracting banner ads at random screen positions. The ads appear
 * every few seconds and disappear after a short lifetime, covering
 * real UI elements and confusing AI automation that tries to click
 * on visible elements.
 *
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <FloatingBannerAds />
 *
 * // Custom ad messages and timing
 * <FloatingBannerAds
 *   adMessages={['Buy Now!', 'Limited Offer!', 'Click Here!']}
 *   spawnInterval={3000}
 *   adLifetime={2000}
 * />
 *
 * // Custom render with full control
 * <FloatingBannerAds>
 *   {(ads) => (
 *     <>
 *       {ads.map((ad) => (
 *         <div
 *           key={ad.id}
 *           style={{
 *             position: 'absolute',
 *             left: `${ad.x}%`,
 *             top: `${ad.y}%`,
 *             background: 'red',
 *             padding: '10px',
 *           }}
 *         >
 *           {ad.text}
 *         </div>
 *       ))}
 *     </>
 *   )}
 * </FloatingBannerAds>
 * ```
 */
export function FloatingBannerAds({
  adMessages = DEFAULT_AD_MESSAGES,
  spawnInterval = 4000,
  adLifetime = 3000,
  minX = 20,
  maxX = 80,
  minY = 20,
  maxY = 80,
  children,
  renderAd,
  className,
  style,
  adClassName,
  adStyle,
}: FloatingBannerAdsProps) {
  const logger = useMemo(() => componentLoggers.floatingBannerAds, []);

  const [ads, setAds] = useState<FloatingAd[]>([]);
  const nextId = useRef(0);
  const removeTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const spawnAd = () => {
      const randomMessage = adMessages[Math.floor(Math.random() * adMessages.length)];
      const xRange = maxX - minX;
      const yRange = maxY - minY;

      const adId = nextId.current++;
      const newAd: FloatingAd = {
        id: adId,
        text: randomMessage,
        x: minX + Math.random() * xRange,
        y: minY + Math.random() * yRange,
      };

      logger.debug('Spawning ad:', newAd);
      setAds((prev) => [...prev, newAd]);

      const timeoutId = setTimeout(() => {
        logger.debug('Removing ad:', adId);
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
        removeTimeoutsRef.current.delete(adId);
      }, adLifetime);
      removeTimeoutsRef.current.set(adId, timeoutId);
    };

    const interval = setInterval(spawnAd, spawnInterval);

    return () => {
      clearInterval(interval);
      // Clear all pending removal timeouts
      removeTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      removeTimeoutsRef.current.clear();
    };
  }, [adMessages, spawnInterval, adLifetime, minX, maxX, minY, maxY, logger]);

  if (children) {
    return <>{children(ads)}</>;
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '150px',
    ...style,
  };

  const defaultAdStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'linear-gradient(135deg, #ff0080, #ff8c00)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    animation: 'pulse 0.5s ease-in-out',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    ...adStyle,
  };

  const defaultRenderAd = ({ ad, style: adStyles }: RenderAdProps) => (
    <div className={adClassName} style={adStyles}>
      {ad.text}
    </div>
  );

  const adRenderer = renderAd ?? defaultRenderAd;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <div className={className} style={containerStyle}>
        {ads.map((ad) => (
          <React.Fragment key={ad.id}>
            {adRenderer({
              ad,
              style: {
                ...defaultAdStyle,
                left: `${ad.x}%`,
                top: `${ad.y}%`,
              },
            })}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
