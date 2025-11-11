import { describe, it, expect, vi } from 'vitest';
import { makeMitosisButton } from '../src/vanilla/mitosisButton';

describe('makeMitosisButton (vanilla)', () => {
  it('creates clones and tracks real vs fake clicks', () => {
    const host = document.createElement('div');
    host.style.width = '300px';
    host.style.height = '200px';
    document.body.appendChild(host);

    const seed = document.createElement('button');
    seed.textContent = 'Click me';
    host.appendChild(seed);

    const onReal = vi.fn();
    const onFake = vi.fn();
    makeMitosisButton(seed, { maxClones: 2, decayMs: 5000, realIndexStrategy: 'rotate', onRealClick: onReal, onFakeClick: onFake });

    // Initial click is real
    seed.click();
    expect(onReal).toHaveBeenCalledTimes(1);

    // Should now have at least 2 buttons
    const buttons = host.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(1);

    // Click a fake (one without data-real)
    const real = host.querySelector('button[data-real="true"]');
    const fake = Array.from(buttons).find((b) => b !== real) as HTMLButtonElement;
    fake.click();
    expect(onFake).toHaveBeenCalledTimes(1);

    // Clone count bounded
    const buttonsNow = host.querySelectorAll('button');
    expect(buttonsNow.length).toBeLessThanOrEqual(1 + 2);
  });
});

