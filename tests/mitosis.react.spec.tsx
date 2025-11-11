import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MitosisButton } from '../src/components/MitosisButton';

describe('MitosisButton (React)', () => {
  it('duplicates on click and distinguishes real vs fake', () => {
    const onReal = vi.fn();
    const onFake = vi.fn();
    const { container } = render(
      <div style={{ width: 300, height: 200 }}>
        <MitosisButton maxClones={2} decayMs={5000} realIndexStrategy="rotate" onRealClick={onReal} onFakeClick={onFake}>
          Click me
        </MitosisButton>
      </div>
    );

    // Initially one button
    const first = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(first);
    expect(onReal).toHaveBeenCalledTimes(1);

    // After click, clones should appear
    const afterButtons = container.querySelectorAll('button');
    expect(afterButtons.length).toBeGreaterThan(1);

    // Find the fake (one without data-testid=mitosis-real) and click it
    const real = container.querySelector('button[data-testid="mitosis-real"]');
    const fake = Array.from(afterButtons).find((b) => b !== real) as HTMLButtonElement;
    expect(fake).toBeTruthy();
    fireEvent.click(fake);
    expect(onFake).toHaveBeenCalledTimes(1);

    // Cap clones to maxClones
    const buttonsNow = container.querySelectorAll('button');
    // total buttons = 1 real + up to maxClones clones
    expect(buttonsNow.length).toBeLessThanOrEqual(1 + 2);
  });
});

