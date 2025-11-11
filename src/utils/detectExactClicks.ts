/**
 * Detects suspiciously exact click patterns that may indicate bot behavior
 *
 * Real humans rarely click on the exact same pixel coordinates repeatedly,
 * while bots often click with pixel-perfect precision.
 */

export interface ClickPoint {
  x: number;
  y: number;
  timestamp: number;
  target?: string;
}

export interface ExactClickDetectorOptions {
  /** Maximum distance in pixels to consider clicks "exact" */
  exactnessRadius?: number;
  /** Minimum number of clicks to analyze */
  minClicks?: number;
  /** Time window in ms to analyze */
  timeWindow?: number;
  /** Threshold for suspicious exact clicks ratio (0-1) */
  suspicionThreshold?: number;
}

export class ExactClickDetector {
  private clicks: ClickPoint[] = [];
  private options: Required<ExactClickDetectorOptions>;

  constructor(options: ExactClickDetectorOptions = {}) {
    this.options = {
      exactnessRadius: options.exactnessRadius ?? 2,
      minClicks: options.minClicks ?? 5,
      timeWindow: options.timeWindow ?? 5000,
      suspicionThreshold: options.suspicionThreshold ?? 0.7,
    };
  }

  addClick(x: number, y: number, target?: HTMLElement): void {
    const now = Date.now();
    this.clicks.push({
      x,
      y,
      timestamp: now,
      target: target?.tagName,
    });

    // Remove old clicks outside time window
    this.clicks = this.clicks.filter(
      (c) => now - c.timestamp <= this.options.timeWindow
    );
  }

  hasExactClickPattern(): boolean {
    if (this.clicks.length < this.options.minClicks) {
      return false;
    }

    const exactClickRatio = this.calculateExactClickRatio();
    const centerClickRatio = this.calculateCenterClickRatio();
    const gridPattern = this.detectGridPattern();

    const suspicionScore = (exactClickRatio + centerClickRatio + gridPattern) / 3;

    return suspicionScore > this.options.suspicionThreshold;
  }

  private calculateExactClickRatio(): number {
    let exactMatches = 0;

    for (let i = 0; i < this.clicks.length - 1; i++) {
      for (let j = i + 1; j < this.clicks.length; j++) {
        const distance = this.distance(this.clicks[i], this.clicks[j]);
        if (distance <= this.options.exactnessRadius) {
          exactMatches++;
        }
      }
    }

    const totalPairs = (this.clicks.length * (this.clicks.length - 1)) / 2;
    return totalPairs > 0 ? exactMatches / totalPairs : 0;
  }

  private calculateCenterClickRatio(): number {
    // Bots often click exactly in the center of elements
    // This would require element bounds, so we check for clicks at rounded coordinates
    let centerLikeClicks = 0;

    for (const click of this.clicks) {
      // Check if coordinates are suspiciously round (multiples of 5 or 10)
      const xRoundness = (click.x % 10 === 0 ? 1 : click.x % 5 === 0 ? 0.5 : 0);
      const yRoundness = (click.y % 10 === 0 ? 1 : click.y % 5 === 0 ? 0.5 : 0);

      if (xRoundness + yRoundness >= 1) {
        centerLikeClicks++;
      }
    }

    return centerLikeClicks / this.clicks.length;
  }

  private detectGridPattern(): number {
    if (this.clicks.length < 4) return 0;

    // Check if clicks form a grid-like pattern (common in automated testing)
    const xCoords = this.clicks.map((c) => c.x).sort((a, b) => a - b);
    const yCoords = this.clicks.map((c) => c.y).sort((a, b) => a - b);

    const xIntervals = this.calculateIntervals(xCoords);
    const yIntervals = this.calculateIntervals(yCoords);

    const xUniformity = this.calculateUniformity(xIntervals);
    const yUniformity = this.calculateUniformity(yIntervals);

    return (xUniformity + yUniformity) / 2;
  }

  private calculateIntervals(coords: number[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < coords.length; i++) {
      const interval = coords[i] - coords[i - 1];
      if (interval > 0) {
        intervals.push(interval);
      }
    }
    return intervals;
  }

  private calculateUniformity(intervals: number[]): number {
    if (intervals.length < 2) return 0;

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      intervals.length;

    const stdDev = Math.sqrt(variance);
    const normalizedStdDev = avg > 0 ? stdDev / avg : 0;

    // Low std dev = uniform = suspicious
    return Math.max(0, 1 - normalizedStdDev * 5);
  }

  private distance(p1: ClickPoint, p2: ClickPoint): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  reset(): void {
    this.clicks = [];
  }

  getScore(): number {
    if (this.clicks.length < this.options.minClicks) {
      return 0;
    }

    const exactClickRatio = this.calculateExactClickRatio();
    const centerClickRatio = this.calculateCenterClickRatio();
    const gridPattern = this.detectGridPattern();

    return (exactClickRatio + centerClickRatio + gridPattern) / 3;
  }

  getClickCount(): number {
    return this.clicks.length;
  }
}

/**
 * Simple function to detect exact clicks from event
 */
export function detectExactClick(
  event: MouseEvent,
  detector: ExactClickDetector
): boolean {
  detector.addClick(event.clientX, event.clientY, event.target as HTMLElement);
  return detector.hasExactClickPattern();
}
