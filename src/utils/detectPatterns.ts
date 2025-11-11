/**
 * Detects repetitive behavioral patterns that indicate bot/automation
 *
 * Bots often exhibit perfectly repetitive patterns in their interactions,
 * while humans show natural variation and randomness.
 */

export interface ActionSequence {
  type: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PatternDetectorOptions {
  /** Minimum sequence length to consider a pattern */
  minPatternLength?: number;
  /** Time window in ms to analyze */
  timeWindow?: number;
  /** Minimum number of repetitions to flag as suspicious */
  minRepetitions?: number;
  /** Threshold for pattern suspicion score (0-1) */
  suspicionThreshold?: number;
}

export class PatternDetector {
  private actions: ActionSequence[] = [];
  private options: Required<PatternDetectorOptions>;

  constructor(options: PatternDetectorOptions = {}) {
    this.options = {
      minPatternLength: options.minPatternLength ?? 3,
      timeWindow: options.timeWindow ?? 10000,
      minRepetitions: options.minRepetitions ?? 3,
      suspicionThreshold: options.suspicionThreshold ?? 0.7,
    };
  }

  recordAction(type: string, metadata?: Record<string, unknown>): void {
    const now = Date.now();
    this.actions.push({
      type,
      timestamp: now,
      metadata,
    });

    // Remove old actions outside time window
    this.actions = this.actions.filter(
      (a) => now - a.timestamp <= this.options.timeWindow
    );
  }

  hasRepetitivePattern(): boolean {
    if (this.actions.length < this.options.minPatternLength * this.options.minRepetitions) {
      return false;
    }

    const sequenceScore = this.detectRepeatingSequence();
    const intervalScore = this.detectUniformIntervals();
    const cyclicScore = this.detectCyclicBehavior();

    const suspicionScore = (sequenceScore + intervalScore + cyclicScore) / 3;

    return suspicionScore > this.options.suspicionThreshold;
  }

  private detectRepeatingSequence(): number {
    const types = this.actions.map((a) => a.type);
    let maxRepetitions = 0;

    // Try different pattern lengths
    for (
      let patternLength = this.options.minPatternLength;
      patternLength <= Math.floor(types.length / 2);
      patternLength++
    ) {
      let repetitions = 1;
      let currentMatch = 0;

      for (let i = patternLength; i < types.length; i++) {
        const patternIndex = i % patternLength;
        if (types[i] === types[patternIndex]) {
          currentMatch++;
          if (currentMatch === patternLength) {
            repetitions++;
            currentMatch = 0;
          }
        } else {
          break;
        }
      }

      maxRepetitions = Math.max(maxRepetitions, repetitions);
    }

    // Normalize score
    const score = Math.min(maxRepetitions / this.options.minRepetitions, 1);
    return maxRepetitions >= this.options.minRepetitions ? score : 0;
  }

  private detectUniformIntervals(): number {
    if (this.actions.length < 3) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < this.actions.length; i++) {
      intervals.push(this.actions[i].timestamp - this.actions[i - 1].timestamp);
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avg, 2), 0) /
      intervals.length;

    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avg > 0 ? stdDev / avg : 1;

    // Low coefficient of variation = uniform intervals = suspicious
    return Math.max(0, 1 - coefficientOfVariation * 5);
  }

  private detectCyclicBehavior(): number {
    if (this.actions.length < 4) return 0;

    const types = this.actions.map((a) => a.type);
    const uniqueTypes = Array.from(new Set(types));

    // Check if actions cycle through the same set of types
    const typeCounts = uniqueTypes.map(
      (type) => types.filter((t) => t === type).length
    );

    // Calculate how evenly distributed the types are
    const avgCount = types.length / uniqueTypes.length;
    const variance =
      typeCounts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) /
      typeCounts.length;

    const stdDev = Math.sqrt(variance);
    const uniformity = avgCount > 0 ? 1 - stdDev / avgCount : 0;

    // High uniformity + multiple types = cyclic pattern
    return uniqueTypes.length > 2 ? Math.max(0, uniformity) : 0;
  }

  getScore(): number {
    if (this.actions.length < this.options.minPatternLength * this.options.minRepetitions) {
      return 0;
    }

    const sequenceScore = this.detectRepeatingSequence();
    const intervalScore = this.detectUniformIntervals();
    const cyclicScore = this.detectCyclicBehavior();

    return (sequenceScore + intervalScore + cyclicScore) / 3;
  }

  getActionSequence(): string[] {
    return this.actions.map((a) => a.type);
  }

  reset(): void {
    this.actions = [];
  }

  getActionCount(): number {
    return this.actions.length;
  }
}

/**
 * Analyzes a sequence of actions for patterns
 */
export function analyzeSequence(sequence: string[]): {
  hasPattern: boolean;
  patternLength: number | null;
  repetitions: number;
} {
  if (sequence.length < 6) {
    return { hasPattern: false, patternLength: null, repetitions: 0 };
  }

  for (let patternLength = 2; patternLength <= Math.floor(sequence.length / 2); patternLength++) {
    let isPattern = true;
    let repetitions = 1;

    for (let i = patternLength; i < sequence.length; i++) {
      const patternIndex = i % patternLength;
      if (sequence[i] !== sequence[patternIndex]) {
        isPattern = false;
        break;
      }
      if (i > 0 && i % patternLength === 0) {
        repetitions++;
      }
    }

    if (isPattern && repetitions >= 3) {
      return { hasPattern: true, patternLength, repetitions };
    }
  }

  return { hasPattern: false, patternLength: null, repetitions: 0 };
}
