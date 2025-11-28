import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { FloatingBannerAds } from '../src/components/FloatingBannerAds';

describe('FloatingBannerAds', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders container', () => {
    const { container } = render(<FloatingBannerAds />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('spawns ads at intervals', async () => {
    const { container } = render(<FloatingBannerAds spawnInterval={1000} />);
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBe(0);

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBeGreaterThan(0);
  });

  it('removes ads after lifetime', async () => {
    const { container } = render(
      <FloatingBannerAds spawnInterval={1000} adLifetime={500} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    const adsAfterSpawn = container.querySelectorAll('[style*="position: absolute"]').length;
    expect(adsAfterSpawn).toBeGreaterThan(0);

    await vi.advanceTimersByTimeAsync(500);
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBe(0);
  });

  it('uses custom ad messages', async () => {
    const customMessages = ['Custom Ad 1', 'Custom Ad 2'];
    const { container } = render(
      <FloatingBannerAds adMessages={customMessages} spawnInterval={1000} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    const adText = container.textContent || '';
    const hasCustomMessage = customMessages.some(msg => adText.includes(msg));
    expect(hasCustomMessage).toBe(true);
  });

  it('positions ads within specified range', async () => {
    const { container } = render(
      <FloatingBannerAds minX={30} maxX={70} minY={40} maxY={60} spawnInterval={1000} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    const ads = container.querySelectorAll('[style*="position: absolute"]');

    ads.forEach((ad) => {
      const style = (ad as HTMLElement).style;
      const left = parseFloat(style.left);
      const top = parseFloat(style.top);

      expect(left).toBeGreaterThanOrEqual(30);
      expect(left).toBeLessThanOrEqual(70);
      expect(top).toBeGreaterThanOrEqual(40);
      expect(top).toBeLessThanOrEqual(60);
    });
  });

  it('uses children render prop', async () => {
    const { getByTestId } = render(
      <FloatingBannerAds spawnInterval={1000}>
        {(ads) => (
          <div data-testid="custom-container">
            {ads.map((ad) => (
              <span key={ad.id} data-testid={`ad-${ad.id}`}>
                {ad.text}
              </span>
            ))}
          </div>
        )}
      </FloatingBannerAds>
    );

    expect(getByTestId('custom-container')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1000);
    expect(getByTestId('ad-0')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FloatingBannerAds className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(
      <FloatingBannerAds style={{ backgroundColor: 'red' }} />
    );
    // The component renders a Fragment with <style> first, then the div container
    const element = container.querySelector('div') as HTMLElement;
    expect(element.style.backgroundColor).toBe('red');
  });

  it('applies custom ad className', async () => {
    const { container } = render(
      <FloatingBannerAds adClassName="custom-ad" spawnInterval={1000} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.querySelector('.custom-ad')).toBeInTheDocument();
  });

  it('applies custom ad style', async () => {
    const { container } = render(
      <FloatingBannerAds adStyle={{ fontSize: '20px' }} spawnInterval={1000} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    const ad = container.querySelector('[style*="position: absolute"]') as HTMLElement;
    expect(ad?.style.fontSize).toBe('20px');
  });

  it('spawns multiple ads over time', async () => {
    const { container } = render(
      <FloatingBannerAds spawnInterval={1000} adLifetime={5000} />
    );

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBe(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBe(2);

    await vi.advanceTimersByTimeAsync(1000);
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBe(3);
  });

  it('cleans up ads when unmounted', async () => {
    const { container, unmount } = render(
      <FloatingBannerAds spawnInterval={1000} adLifetime={5000} />
    );

    await vi.advanceTimersByTimeAsync(2000);
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBe(2);

    unmount();
    expect(container.querySelectorAll('[style*="position: absolute"]').length).toBe(0);
  });

  it('uses default ad messages', async () => {
    const { container } = render(<FloatingBannerAds spawnInterval={1000} />);

    await vi.advanceTimersByTimeAsync(1000);
    const adText = container.textContent || '';
    const hasDefaultMessage = [
      'Win $1000 NOW!',
      'Lose 20lbs Fast!',
      'Work From Home!',
      'Hot Singles Near You!',
      'VIRUS DETECTED!',
      'Free iPhone 15!',
      'Get Rich Quick!',
      "You're a Winner!",
    ].some(msg => adText.includes(msg));

    expect(hasDefaultMessage).toBe(true);
  });

  it('spawns ads with unique IDs', async () => {
    const ids = new Set<number>();

    render(
      <FloatingBannerAds spawnInterval={500}>
        {(ads) => {
          ads.forEach(ad => ids.add(ad.id));
          return null;
        }}
      </FloatingBannerAds>
    );

    await vi.advanceTimersByTimeAsync(1500);
    expect(ids.size).toBeGreaterThan(1);
  });
});
