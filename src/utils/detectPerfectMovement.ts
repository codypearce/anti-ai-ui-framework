/**
 * Detects suspiciously perfect mouse movements that may indicate bot behavior
 *
 * Real humans have slight jitter and variation in their mouse movements,
 * while bots often move in perfectly straight lines or with exact intervals.
 */

export interface MouseMovementPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface PerfectMovementDetectorOptions {
  /** Minimum number of points to analyze */
  minPoints?: number;
  /** Threshold for considering movement "too perfect" (0-1, lower = stricter) */
  perfectnessThreshold?: number;
  /** Time window in ms to analyze */
  timeWindow?: number;
}

export class PerfectMovementDetector {
  private points: MouseMovementPoint[] = [];
  private options: Required<PerfectMovementDetectorOptions>;

  constructor(options: PerfectMovementDetectorOptions = {}) {
    this.options = {
      minPoints: options.minPoints ?? 10,
      perfectnessThreshold: options.perfectnessThreshold ?? 0.02,
      timeWindow: options.timeWindow ?? 1000,
    };
  }

  addPoint(x: number, y: number): void {
    const now = Date.now();
    this.points.push({ x, y, timestamp: now });

    // Remove old points outside time window
    this.points = this.points.filter(
      (p) => now - p.timestamp <= this.options.timeWindow
    );
  }

  isPerfectMovement(): boolean {
    if (this.points.length < this.options.minPoints) {
      return false;
    }

    // Check for perfectly straight lines
    const straightnessScore = this.calculateStraightnessScore();

    // Check for uniform timing between points
    const timingUniformity = this.calculateTimingUniformity();

    // Check for lack of natural jitter
    const jitterScore = this.calculateJitterScore();

    const botScore = (straightnessScore + timingUniformity + (1 - jitterScore)) / 3;

    return botScore > (1 - this.options.perfectnessThreshold);
  }

  private calculateStraightnessScore(): number {
    if (this.points.length < 3) return 0;

    let totalDeviation = 0;
    let maxPossibleDeviation = 0;

    // Calculate deviation from straight line between first and last point
    const first = this.points[0];
    const last = this.points[this.points.length - 1];

    for (let i = 1; i < this.points.length - 1; i++) {
      const point = this.points[i];
      const deviation = this.pointToLineDistance(point, first, last);
      totalDeviation += deviation;

      // Calculate max possible deviation (perpendicular distance)
      const dx = last.x - first.x;
      const dy = last.y - first.y;
      maxPossibleDeviation += Math.sqrt(dx * dx + dy * dy) / 2;
    }

    if (maxPossibleDeviation === 0) return 1;

    // Lower deviation = higher straightness = more suspicious
    return 1 - Math.min(totalDeviation / maxPossibleDeviation, 1);
  }

  private calculateTimingUniformity(): number {
    if (this.points.length < 3) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < this.points.length; i++) {
      intervals.push(this.points[i].timestamp - this.points[i - 1].timestamp);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    const stdDev = Math.sqrt(variance);

    // Low standard deviation = uniform timing = suspicious
    const normalizedStdDev = avgInterval > 0 ? stdDev / avgInterval : 0;

    return Math.max(0, 1 - normalizedStdDev * 10);
  }

  private calculateJitterScore(): number {
    if (this.points.length < 3) return 1;

    let totalJitter = 0;

    for (let i = 1; i < this.points.length - 1; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      const next = this.points[i + 1];

      // Calculate angle change
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const angleDiff = Math.abs(angle2 - angle1);

      totalJitter += angleDiff;
    }

    // Normalize jitter (more jitter = more human-like)
    const avgJitter = totalJitter / (this.points.length - 2);
    return Math.min(avgJitter * 2, 1);
  }

  private pointToLineDistance(
    point: MouseMovementPoint,
    lineStart: MouseMovementPoint,
    lineEnd: MouseMovementPoint
  ): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.sqrt(
        Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
      );
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
          lengthSquared
      )
    );

    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    return Math.sqrt(
      Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2)
    );
  }

  reset(): void {
    this.points = [];
  }

  getScore(): number {
    if (this.points.length < this.options.minPoints) {
      return 0;
    }

    const straightnessScore = this.calculateStraightnessScore();
    const timingUniformity = this.calculateTimingUniformity();
    const jitterScore = this.calculateJitterScore();

    return (straightnessScore + timingUniformity + (1 - jitterScore)) / 3;
  }
}

/**
 * Simple function to detect perfect movement from event
 */
export function detectPerfectMovement(
  event: MouseEvent,
  detector: PerfectMovementDetector
): boolean {
  detector.addPoint(event.clientX, event.clientY);
  return detector.isPerfectMovement();
}
