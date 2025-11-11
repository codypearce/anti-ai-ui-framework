import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PerfectMovementDetector } from '../src/utils/detectPerfectMovement';
import { ExactClickDetector } from '../src/utils/detectExactClicks';
import { TimingDetector } from '../src/utils/detectTiming';
import { PatternDetector, analyzeSequence } from '../src/utils/detectPatterns';
import { randomPosition, type Bounds } from '../src/utils/randomPosition';
import { calculateEvasion } from '../src/utils/evasionLogic';

describe('PerfectMovementDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('flags straight, uniform movement as suspicious', () => {
    const det = new PerfectMovementDetector({ minPoints: 10, timeWindow: 5000, perfectnessThreshold: 0.1 });
    const start = Date.now();
    for (let i = 0; i < 15; i++) {
      vi.setSystemTime(start + i * 50);
      det.addPoint(i * 10, i * 10);
    }
    expect(det.isPerfectMovement()).toBe(true);
    expect(det.getScore()).toBeGreaterThan(0.7);
  });

  it('does not flag jittery movement', () => {
    const det = new PerfectMovementDetector({ minPoints: 10, timeWindow: 5000, perfectnessThreshold: 0.1 });
    const start = Date.now();
    for (let i = 0; i < 15; i++) {
      vi.setSystemTime(start + i * (30 + Math.round(Math.random() * 70)));
      det.addPoint(i * 10 + (Math.random() - 0.5) * 5, i * 10 + (Math.random() - 0.5) * 5);
    }
    expect(det.isPerfectMovement()).toBe(false);
  });
});

describe('ExactClickDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('detects repeated exact clicks', () => {
    const det = new ExactClickDetector({ minClicks: 6, timeWindow: 5000, exactnessRadius: 1, suspicionThreshold: 0.5 });
    const start = Date.now();
    for (let i = 0; i < 6; i++) {
      vi.setSystemTime(start + i * 200);
      det.addClick(100, 200);
    }
    expect(det.hasExactClickPattern()).toBe(true);
    expect(det.getScore()).toBeGreaterThan(0.5);
  });
});

describe('TimingDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('flags superhuman reaction speed', () => {
    const det = new TimingDetector({ minEvents: 5, minHumanReactionTime: 150, suspicionThreshold: 0.5 });
    for (let i = 0; i < 5; i++) {
      det.recordStimulus();
      // respond too quickly
      vi.advanceTimersByTime(20);
      det.recordResponse('click');
      vi.advanceTimersByTime(60);
    }
    expect(det.hasSuspiciousTiming()).toBe(true);
    expect(det.getScore()).toBeGreaterThan(0.5);
  });
});

describe('PatternDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('detects repeating sequences', () => {
    const det = new PatternDetector({ minPatternLength: 3, minRepetitions: 3, timeWindow: 10000, suspicionThreshold: 0.5 });
    const seq = ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'];
    const start = Date.now();
    seq.forEach((s, i) => {
      vi.setSystemTime(start + i * 100);
      det.recordAction(s);
    });
    expect(det.hasRepetitivePattern()).toBe(true);
    const analysis = analyzeSequence(seq);
    expect(analysis.hasPattern).toBe(true);
    expect(analysis.repetitions).toBeGreaterThanOrEqual(3);
  });
});

describe('randomPosition', () => {
  it('returns a position within bounds', () => {
    const bounds: Bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    const pos = randomPosition(bounds, { edgePadding: 10 });
    expect(pos.x).toBeGreaterThanOrEqual(10);
    expect(pos.x).toBeLessThanOrEqual(90);
    expect(pos.y).toBeGreaterThanOrEqual(10);
    expect(pos.y).toBeLessThanOrEqual(90);
  });
});

describe('evasionLogic.calculateEvasion', () => {
  it('evades when threat is close and moves away from it', () => {
    const element = { x: 100, y: 100 };
    const threat = { x: 110, y: 110 };
    const res = calculateEvasion(element, threat, { evasionDistance: 50, speed: 1 });
    expect(res.shouldEvade).toBe(true);
    expect(res.newPosition).not.toBeNull();
    if (res.newPosition) {
      // New position should be further from the threat than original center
      const origDist = Math.hypot(element.x - threat.x, element.y - threat.y);
      const newDist = Math.hypot(res.newPosition.x - threat.x, res.newPosition.y - threat.y);
      expect(newDist).toBeGreaterThan(origDist);
    }
  });
});
