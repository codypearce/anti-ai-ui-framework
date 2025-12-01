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
   * Custom content. Can be either:
   * - A render function that receives the ads array for full control
   * - Regular React children (ads will render with default styling)
   */
  children?: ((ads: FloatingAd[]) => React.ReactNode) | React.ReactNode;

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

const AD_STYLES: React.CSSProperties[] = [
  // Classic spam banner
  { background: 'linear-gradient(135deg, #ff0000, #cc0000)', color: '#ffff00', border: '3px dashed #ffff00', fontSize: '14px', padding: '12px 20px', borderRadius: '0' },
  // Fake virus alert
  { background: '#1a1a2e', color: '#ff4444', border: '2px solid #ff4444', fontSize: '12px', padding: '10px 14px', borderRadius: '4px', fontFamily: 'monospace' },
  // Flashy winner
  { background: 'linear-gradient(45deg, #ffd700, #ff8c00, #ffd700)', color: '#000', border: '3px solid #8b4513', fontSize: '15px', padding: '14px 22px', borderRadius: '8px', textShadow: '1px 1px 0 #fff' },
  // Dating site pink
  { background: 'linear-gradient(135deg, #ff69b4, #ff1493)', color: '#fff', border: '2px solid #fff', fontSize: '13px', padding: '10px 16px', borderRadius: '20px' },
  // Fake download button
  { background: 'linear-gradient(180deg, #5cb85c, #449d44)', color: '#fff', border: '1px solid #398439', fontSize: '14px', padding: '12px 24px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' },
  // Urgent red box
  { background: '#fff', color: '#cc0000', border: '4px solid #cc0000', fontSize: '13px', padding: '10px 16px', borderRadius: '0', textTransform: 'uppercase' },
  // Neon cyber
  { background: '#0d0d0d', color: '#0ff', border: '2px solid #0ff', fontSize: '12px', padding: '10px 14px', borderRadius: '2px', textShadow: '0 0 10px #0ff', fontFamily: 'monospace' },
];

const AD_ANIMATIONS = [
  'adPulse 0.3s ease-in-out infinite alternate',
  'adShake 0.15s ease-in-out infinite',
  'adBounce 0.5s ease-in-out infinite',
  'adGlow 1s ease-in-out infinite',
  'none',
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
    // If children is a function, call it with ads
    if (typeof children === 'function') {
      return <>{children(ads)}</>;
    }
    // Otherwise, render children directly (ads still spawn but user controls layout)
    return <>{children}</>;
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '150px',
    ...style,
  };

  const getAdStyle = (adId: number): React.CSSProperties => {
    const randomStyle = AD_STYLES[adId % AD_STYLES.length];
    const randomAnimation = AD_ANIMATIONS[adId % AD_ANIMATIONS.length];
    return {
      position: 'absolute',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      ...randomStyle,
      animation: randomAnimation,
      ...adStyle,
    };
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
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
      `}</style>
      <div className={className} style={containerStyle}>
        {ads.map((ad) => (
          <React.Fragment key={ad.id}>
            {adRenderer({
              ad,
              style: {
                ...getAdStyle(ad.id),
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
