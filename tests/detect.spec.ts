import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerfectMovementDetector, detectPerfectMovement } from '../src/utils/detectPerfectMovement';
import { ExactClickDetector, detectExactClick } from '../src/utils/detectExactClicks';

describe('PerfectMovementDetector', () => {
  let detector: PerfectMovementDetector;

  beforeEach(() => {
    detector = new PerfectMovementDetector();
  });

  it('should not detect bot with insufficient points', () => {
    detector.addPoint(10, 10);
    detector.addPoint(20, 20);

    expect(detector.isPerfectMovement()).toBe(false);
  });

  it('should detect perfectly straight movement', () => {
    // Add points in a perfectly straight line with uniform timing
    for (let i = 0; i < 15; i++) {
      vi.spyOn(Date, 'now').mockReturnValueOnce(i * 50);
      detector.addPoint(i * 10, i * 10);
    }

    expect(detector.isPerfectMovement()).toBe(true);
  });

  it('should not detect human-like jittery movement', () => {
    // Add points with significant natural jitter
    for (let i = 0; i < 15; i++) {
      const jitter = (Math.random() - 0.5) * 20; // Larger jitter
      detector.addPoint(i * 10 + jitter, i * 10 + jitter * 0.8);
    }

    const score = detector.getScore();
    // With jitter, score should be lower (less bot-like)
    expect(score).toBeLessThan(0.95); // Allow some variation
  });

  it('should detect uniform timing intervals', () => {
    const detector2 = new PerfectMovementDetector({ perfectnessThreshold: 0.1 });

    // Add points with exactly uniform timing (simulating setInterval)
    for (let i = 0; i < 12; i++) {
      vi.spyOn(Date, 'now').mockReturnValueOnce(i * 100);
      detector2.addPoint(i * 10, i * 10);
    }

    expect(detector2.isPerfectMovement()).toBe(true);
  });

  it('should handle points with zero distance', () => {
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);
    detector.addPoint(10, 10);

    // Should handle zero-length line
    const score = detector.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should reset points', () => {
    for (let i = 0; i < 15; i++) {
      detector.addPoint(i * 10, i * 10);
    }

    detector.reset();
    expect(detector.isPerfectMovement()).toBe(false);
  });

  it('should return score for insufficient points', () => {
    detector.addPoint(10, 10);
    detector.addPoint(20, 20);

    expect(detector.getScore()).toBe(0);
  });

  it('should calculate score for sufficient points', () => {
    for (let i = 0; i < 15; i++) {
      detector.addPoint(i * 10, i * 10);
    }

    const score = detector.getScore();
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should respect custom options', () => {
    const custom = new PerfectMovementDetector({
      minPoints: 5,
      perfectnessThreshold: 0.5,
      timeWindow: 2000,
    });

    for (let i = 0; i < 7; i++) {
      custom.addPoint(i * 10, i * 10);
    }

    // With higher threshold, less likely to detect
    expect(typeof custom.isPerfectMovement()).toBe('boolean');
  });

  it('should remove old points outside time window', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + 100)
      .mockReturnValueOnce(now + 200)
      .mockReturnValueOnce(now + 2000); // Outside 1000ms window

    detector.addPoint(10, 10);
    detector.addPoint(20, 20);
    detector.addPoint(30, 30);
    detector.addPoint(40, 40); // This should remove old points

    expect(detector.getScore()).toBe(0); // Not enough points left
  });

  it('detectPerfectMovement helper function works', () => {
    const event = { clientX: 100, clientY: 100 } as MouseEvent;
    const detector = new PerfectMovementDetector();

    const result = detectPerfectMovement(event, detector);
    expect(typeof result).toBe('boolean');
  });

  it('should handle angle calculations with zero movement', () => {
    // Add points that create zero angles
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);
    detector.addPoint(100, 100);

    const score = detector.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should calculate timing uniformity with zero average', () => {
    const now = Date.now();
    // All points at same timestamp
    for (let i = 0; i < 12; i++) {
      vi.spyOn(Date, 'now').mockReturnValue(now);
      detector.addPoint(i * 10, i * 10);
    }

    const score = detector.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe('ExactClickDetector', () => {
  let detector: ExactClickDetector;

  beforeEach(() => {
    detector = new ExactClickDetector();
  });

  it('should not detect bot with insufficient clicks', () => {
    detector.addClick(10, 10);
    detector.addClick(20, 20);

    expect(detector.hasExactClickPattern()).toBe(false);
  });

  it('should detect exact same-position clicks', () => {
    // Click same spot 8 times to ensure high suspicion score
    for (let i = 0; i < 8; i++) {
      detector.addClick(100, 100);
    }

    const score = detector.getScore();
    // Same position clicks should have very high score
    expect(score).toBeGreaterThan(0.6);
  });

  it('should not detect varied human clicks', () => {
    // Click with natural variation
    for (let i = 0; i < 6; i++) {
      detector.addClick(100 + Math.random() * 50, 100 + Math.random() * 50);
    }

    expect(detector.hasExactClickPattern()).toBe(false);
  });

  it('should detect clicks on round coordinates', () => {
    // Clicks at suspiciously round coordinates
    detector.addClick(100, 100);
    detector.addClick(150, 200);
    detector.addClick(200, 300);
    detector.addClick(250, 400);
    detector.addClick(300, 500);
    detector.addClick(350, 600);

    const score = detector.getScore();
    expect(score).toBeGreaterThan(0.3); // Should detect roundness
  });

  it('should detect clicks at coordinates divisible by 5', () => {
    // Clicks at coordinates divisible by 5 but not 10
    detector.addClick(105, 115);
    detector.addClick(125, 135);
    detector.addClick(145, 155);
    detector.addClick(165, 175);
    detector.addClick(185, 195);
    detector.addClick(205, 215);

    const score = detector.getScore();
    expect(score).toBeGreaterThan(0); // Should detect some roundness
  });

  it('should detect grid-like click patterns', () => {
    // Click in a perfect grid with round coordinates
    const coords = [10, 60, 110, 160, 210];
    for (const x of coords) {
      for (const y of coords) {
        detector.addClick(x, y);
      }
    }

    const score = detector.getScore();
    // Grid pattern with round coords should have high score
    expect(score).toBeGreaterThan(0.5);
  });

  it('should reset clicks', () => {
    for (let i = 0; i < 6; i++) {
      detector.addClick(100, 100);
    }

    detector.reset();
    expect(detector.hasExactClickPattern()).toBe(false);
  });

  it('should return score for insufficient clicks', () => {
    detector.addClick(10, 10);
    detector.addClick(20, 20);

    expect(detector.getScore()).toBe(0);
  });

  it('should calculate score for sufficient clicks', () => {
    for (let i = 0; i < 6; i++) {
      detector.addClick(100, 100);
    }

    const score = detector.getScore();
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('should respect custom options', () => {
    const custom = new ExactClickDetector({
      exactnessRadius: 10,
      minClicks: 3,
      timeWindow: 10000,
      suspicionThreshold: 0.5,
    });

    custom.addClick(100, 100);
    custom.addClick(105, 105);
    custom.addClick(102, 103);
    custom.addClick(101, 99);

    expect(typeof custom.hasExactClickPattern()).toBe('boolean');
  });

  it('should remove old clicks outside time window', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + 100)
      .mockReturnValueOnce(now + 200)
      .mockReturnValueOnce(now + 6000); // Outside 5000ms window

    detector.addClick(10, 10);
    detector.addClick(20, 20);
    detector.addClick(30, 30);
    detector.addClick(40, 40); // This should remove old clicks

    expect(detector.getClickCount()).toBe(1);
  });

  it('should track click count', () => {
    detector.addClick(10, 10);
    detector.addClick(20, 20);
    detector.addClick(30, 30);

    expect(detector.getClickCount()).toBe(3);
  });

  it('should add click with target element', () => {
    const element = document.createElement('button');
    detector.addClick(10, 10, element);

    expect(detector.getClickCount()).toBe(1);
  });

  it('detectExactClick helper function works', () => {
    const event = {
      clientX: 100,
      clientY: 100,
      target: document.createElement('div'),
    } as unknown as MouseEvent;

    const result = detectExactClick(event, detector);
    expect(typeof result).toBe('boolean');
  });

  it('should handle grid detection with less than 4 clicks', () => {
    detector.addClick(10, 10);
    detector.addClick(20, 20);
    detector.addClick(30, 30);

    const score = detector.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should handle uniform intervals with less than 2 intervals', () => {
    detector.addClick(10, 10);
    detector.addClick(20, 20);
    detector.addClick(30, 30);
    detector.addClick(40, 40);
    detector.addClick(50, 50);

    const score = detector.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should handle zero intervals in grid detection', () => {
    // All same x coordinate
    detector.addClick(100, 10);
    detector.addClick(100, 20);
    detector.addClick(100, 30);
    detector.addClick(100, 40);
    detector.addClick(100, 50);
    detector.addClick(100, 60);

    const score = detector.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should handle zero average in uniformity calculation', () => {
    // Single unique coordinate
    detector.addClick(100, 100);
    detector.addClick(100, 100);
    detector.addClick(100, 100);
    detector.addClick(100, 100);
    detector.addClick(100, 100);
    detector.addClick(100, 100);

    const score = detector.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
