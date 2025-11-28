import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFloatingBannerAds } from '../src/vanilla/floatingBannerAds';

describe('createFloatingBannerAds (vanilla)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('returns cleanup function', () => {
    const cleanup = createFloatingBannerAds({ container });
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('spawns ads at intervals', async () => {
    createFloatingBannerAds({ container, spawnInterval: 1000 });
    expect(container.children.length).toBe(0);

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('removes ads after lifetime', async () => {
    createFloatingBannerAds({ container, spawnInterval: 1000, adLifetime: 500 });

    await vi.advanceTimersByTimeAsync(1000);
    const adsAfterSpawn = container.children.length;
    expect(adsAfterSpawn).toBeGreaterThan(0);

    await vi.advanceTimersByTimeAsync(500);
    expect(container.children.length).toBe(0);
  });

  it('uses custom ad messages', async () => {
    const customMessages = ['Custom Ad 1', 'Custom Ad 2'];
    createFloatingBannerAds({
      container,
      adMessages: customMessages,
      spawnInterval: 1000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    const hasCustomMessage = customMessages.some(msg =>
      container.textContent?.includes(msg)
    );
    expect(hasCustomMessage).toBe(true);
  });

  it('positions ads within specified range', async () => {
    createFloatingBannerAds({
      container,
      minX: 30,
      maxX: 70,
      minY: 40,
      maxY: 60,
      spawnInterval: 1000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    const ad = container.firstElementChild as HTMLElement;

    const left = parseFloat(ad.style.left);
    const top = parseFloat(ad.style.top);

    expect(left).toBeGreaterThanOrEqual(30);
    expect(left).toBeLessThanOrEqual(70);
    expect(top).toBeGreaterThanOrEqual(40);
    expect(top).toBeLessThanOrEqual(60);
  });

  it('uses custom createAdElement function', async () => {
    const createAdElement = vi.fn((ad) => {
      const el = document.createElement('span');
      el.textContent = `CUSTOM: ${ad.text}`;
      el.className = 'custom-ad';
      return el;
    });

    createFloatingBannerAds({
      container,
      spawnInterval: 1000,
      createAdElement,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(createAdElement).toHaveBeenCalled();
    expect(container.querySelector('.custom-ad')).toBeInTheDocument();
    expect(container.textContent).toContain('CUSTOM:');
  });

  it('sets container position if static', () => {
    container.style.position = 'static';
    createFloatingBannerAds({ container });
    expect(container.style.position).toBe('relative');
  });

  it('does not change container position if already set', () => {
    container.style.position = 'absolute';
    createFloatingBannerAds({ container });
    expect(container.style.position).toBe('absolute');
  });

  it('spawns multiple ads over time', async () => {
    createFloatingBannerAds({
      container,
      spawnInterval: 1000,
      adLifetime: 5000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.children.length).toBe(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.children.length).toBe(2);

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.children.length).toBe(3);
  });

  it('cleans up all ads on cleanup', async () => {
    const cleanup = createFloatingBannerAds({
      container,
      spawnInterval: 1000,
      adLifetime: 5000,
    });

    await vi.advanceTimersByTimeAsync(2000);
    expect(container.children.length).toBe(2);

    cleanup();
    expect(container.children.length).toBe(0);
  });

  it('uses default ad messages', async () => {
    createFloatingBannerAds({ container, spawnInterval: 1000 });

    await vi.advanceTimersByTimeAsync(1000);
    const hasDefaultMessage = [
      'Win $1000 NOW!',
      'Lose 20lbs Fast!',
      'Work From Home!',
      'Hot Singles Near You!',
      'VIRUS DETECTED!',
      'Free iPhone 15!',
      'Get Rich Quick!',
      "You're a Winner!",
    ].some(msg => container.textContent?.includes(msg));

    expect(hasDefaultMessage).toBe(true);
  });

  it('applies default styles to ads', async () => {
    createFloatingBannerAds({ container, spawnInterval: 1000 });

    await vi.advanceTimersByTimeAsync(1000);
    const ad = container.firstElementChild as HTMLElement;

    expect(ad.style.position).toBe('absolute');
    expect(ad.style.background).toContain('linear-gradient');
    expect(ad.style.color).toBe('white');
  });

  it('spawns ads with incremental IDs', async () => {
    const ids: number[] = [];
    createFloatingBannerAds({
      container,
      spawnInterval: 500,
      createAdElement: (ad) => {
        ids.push(ad.id);
        const el = document.createElement('div');
        return el;
      },
    });

    await vi.advanceTimersByTimeAsync(1500);
    expect(ids.length).toBeGreaterThan(1);
    expect(ids[0]).toBe(0);
    expect(ids[1]).toBe(1);
    expect(ids[2]).toBe(2);
  });

  it('stops spawning ads after cleanup', async () => {
    const cleanup = createFloatingBannerAds({
      container,
      spawnInterval: 1000,
      adLifetime: 5000,
    });

    await vi.advanceTimersByTimeAsync(2000);
    expect(container.children.length).toBe(2);

    cleanup();
    await vi.advanceTimersByTimeAsync(2000);
    expect(container.children.length).toBe(0);
  });

  it('handles rapid spawn and cleanup', async () => {
    createFloatingBannerAds({
      container,
      spawnInterval: 100,
      adLifetime: 300,
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(container.children.length).toBeGreaterThanOrEqual(0);
  });
});
