/**
 * Detects superhuman timing and reaction speeds that indicate bot behavior
 *
 * Real humans have reaction times typically between 150-300ms,
 * while bots can react instantaneously or with suspiciously consistent timing.
 */

export interface TimingEvent {
  type: 'click' | 'keypress' | 'hover' | 'custom';
  timestamp: number;
  responseTime?: number;
}

export interface TimingDetectorOptions {
  /** Minimum human reaction time in ms */
  minHumanReactionTime?: number;
  /** Maximum consistent timing variance in ms */
  maxConsistentVariance?: number;
  /** Minimum number of events to analyze */
  minEvents?: number;
  /** Threshold for suspicious timing score (0-1) */
  suspicionThreshold?: number;
}

export class TimingDetector {
  private events: TimingEvent[] = [];
  private options: Required<TimingDetectorOptions>;
  private lastStimulusTime: number | null = null;

  constructor(options: TimingDetectorOptions = {}) {
    this.options = {
      minHumanReactionTime: options.minHumanReactionTime ?? 150,
      maxConsistentVariance: options.maxConsistentVariance ?? 20,
      minEvents: options.minEvents ?? 5,
      suspicionThreshold: options.suspicionThreshold ?? 0.7,
    };
  }

  recordStimulus(): void {
    this.lastStimulusTime = Date.now();
  }

  recordResponse(type: TimingEvent['type'] = 'click'): void {
    const now = Date.now();
    const responseTime = this.lastStimulusTime ? now - this.lastStimulusTime : undefined;

    this.events.push({
      type,
      timestamp: now,
      responseTime,
    });

    this.lastStimulusTime = null;
  }

  hasSuspiciousTiming(): boolean {
    if (this.events.length < this.options.minEvents) {
      return false;
    }

    const superhumanScore = this.detectSuperhumanSpeed();
    const consistencyScore = this.detectSuspiciousConsistency();
    const instantScore = this.detectInstantaneousActions();

    const suspicionScore = (superhumanScore + consistencyScore + instantScore) / 3;

    return suspicionScore > this.options.suspicionThreshold;
  }

  private detectSuperhumanSpeed(): number {
    const eventsWithResponseTime = this.events.filter((e) => e.responseTime !== undefined);

    if (eventsWithResponseTime.length === 0) return 0;

    let superhumanCount = 0;
    for (const event of eventsWithResponseTime) {
      if (event.responseTime! < this.options.minHumanReactionTime) {
        superhumanCount++;
      }
    }

    return superhumanCount / eventsWithResponseTime.length;
  }

  private detectSuspiciousConsistency(): number {
    const responseTimes = this.events
      .filter((e) => e.responseTime !== undefined)
      .map((e) => e.responseTime!);

    if (responseTimes.length < 3) return 0;

    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const variance =
      responseTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) /
      responseTimes.length;

    const stdDev = Math.sqrt(variance);

    // Very low variance = suspiciously consistent = bot-like
    if (stdDev < this.options.maxConsistentVariance) {
      return Math.max(0, 1 - stdDev / this.options.maxConsistentVariance);
    }

    return 0;
  }

  private detectInstantaneousActions(): number {
    if (this.events.length < 2) return 0;

    // Check time between consecutive actions
    let instantCount = 0;
    for (let i = 1; i < this.events.length; i++) {
      const timeDiff = this.events[i].timestamp - this.events[i - 1].timestamp;

      // Less than 50ms between actions is essentially instantaneous
      if (timeDiff < 50) {
        instantCount++;
      }
    }

    return instantCount / (this.events.length - 1);
  }

  getAverageResponseTime(): number | null {
    const responseTimes = this.events
      .filter((e) => e.responseTime !== undefined)
      .map((e) => e.responseTime!);

    if (responseTimes.length === 0) return null;

    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  getScore(): number {
    if (this.events.length < this.options.minEvents) {
      return 0;
    }

    const superhumanScore = this.detectSuperhumanSpeed();
    const consistencyScore = this.detectSuspiciousConsistency();
    const instantScore = this.detectInstantaneousActions();

    return (superhumanScore + consistencyScore + instantScore) / 3;
  }

  reset(): void {
    this.events = [];
    this.lastStimulusTime = null;
  }

  getEventCount(): number {
    return this.events.length;
  }
}

/**
 * Helper to measure reaction time for a task
 */
export function measureReactionTime(
  stimulusCallback: () => void,
  detector: TimingDetector
): Promise<number> {
  return new Promise((resolve) => {
    detector.recordStimulus();
    stimulusCallback();

    const startTime = Date.now();

    const handler = () => {
      const reactionTime = Date.now() - startTime;
      detector.recordResponse();
      resolve(reactionTime);
    };

    // This would typically be attached to the actual response event
    document.addEventListener('click', handler, { once: true });
  });
}
