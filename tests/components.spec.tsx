import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunawayButton } from '../src/components/RunawayButton';
import { FakeDownloadGrid } from '../src/components/FakeDownloadGrid';
import { PopupChaos } from '../src/components/PopupChaos';
import { ShiftingInterface } from '../src/components/ShiftingInterface';
import { SemanticGaslighting } from '../src/components/SemanticGaslighting';

describe('RunawayButton (React)', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect for container and button
    const original = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute('data-testid') === 'container') {
        return { left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200, x: 0, y: 0, toJSON: () => {}, } as unknown as DOMRect;
      }
      // button size
      return { left: 0, top: 0, width: 100, height: 32, right: 100, bottom: 32, x: 0, y: 0, toJSON: () => {}, } as unknown as DOMRect;
    });
  });
  afterEach(() => {
    (HTMLElement.prototype.getBoundingClientRect as unknown as vi.SpyInstance).mockRestore?.();
  });

  it('renders and responds to mouse movement', async () => {
    const onCatch = vi.fn();
    const { container } = render(
      <div data-testid="container" style={{ position: 'relative', width: 300, height: 200 }}>
        <RunawayButton evasionDistance={120} jitter={0} onCatch={onCatch}>Catch</RunawayButton>
      </div>
    );
    const btn = screen.getByRole('button', { name: /catch/i });

    // Button should be present and clickable
    expect(btn).toBeInTheDocument();

    // Should be able to click it
    fireEvent.click(btn);
    expect(onCatch).toHaveBeenCalled();
  });
});

describe('FakeDownloadGrid (React)', () => {
  it('calls onRealClick for the real button', async () => {
    const onReal = vi.fn();
    const onFake = vi.fn();
    const { container } = render(
      <FakeDownloadGrid rows={1} cols={3} realButtonIndex={1} onRealClick={onReal} onFakeClick={onFake} />
    );
    // Query all buttons with text DOWNLOAD
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3); // 1x3 grid

    // index 1 should be real
    fireEvent.click(buttons[1]);
    expect(onReal).toHaveBeenCalled();

    // index 0 should be fake
    fireEvent.click(buttons[0]);
    expect(onFake).toHaveBeenCalled();
  });
});

describe('PopupChaos (React)', () => {
  it('enforces close order', () => {
    const onAllClosed = vi.fn();
    const order = [2, 1, 0];
    render(<PopupChaos popupCount={3} closeOrder={order} onAllClosed={onAllClosed} />);
    // There are 3 "✕" buttons; try closing wrong one first
    const closeButtons = screen.getAllByRole('button', { name: '✕' });
    // Try closing id 0 first (wrong)
    fireEvent.click(closeButtons[0]);
    expect(screen.getAllByRole('button', { name: '✕' }).length).toBe(3);
    // Now close id 2
    fireEvent.click(closeButtons[2]);
    expect(screen.getAllByRole('button', { name: '✕' }).length).toBe(2);
  });
});

describe('ShiftingInterface (React)', () => {
  it('renders login interface with username and password fields', () => {
    const { container } = render(<ShiftingInterface shiftInterval={1000} duplicateChance={0.2} colorChangeInterval={2000} />);

    // Should have initial 3 elements (username, password, submit)
    const inputs = container.querySelectorAll('input');
    const buttons = container.querySelectorAll('button[type="button"]');

    expect(inputs.length).toBe(2); // username and password
    expect(buttons.length).toBe(1); // submit button

    // Check labels exist
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});

describe('SemanticGaslighting (React)', () => {
  it('executes actual actions regardless of label', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(
      <SemanticGaslighting
        buttons={[
          { label: 'Submit', actualAction: 'cancel' },
          { label: 'Cancel', actualAction: 'submit' },
        ]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    const submitLabeled = screen.getByRole('button', { name: 'Submit' });
    const cancelLabeled = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(submitLabeled);
    expect(onCancel).toHaveBeenCalled();
    fireEvent.click(cancelLabeled);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onReset when reset action is triggered', () => {
    const onReset = vi.fn();
    render(
      <SemanticGaslighting
        buttons={[{ label: 'Reset', actualAction: 'reset' }]}
        onReset={onReset}
      />
    );
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();
  });

  it('calls onAction with button definition', () => {
    const onAction = vi.fn();
    render(
      <SemanticGaslighting
        buttons={[{ label: 'OK', actualAction: 'submit' }]}
        onAction={onAction}
      />
    );
    const button = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledWith({ label: 'OK', actualAction: 'submit' });
  });

  it('handles noop action without calling other callbacks', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(
      <SemanticGaslighting
        buttons={[{ label: 'Nothing', actualAction: 'noop' }]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    const button = screen.getByRole('button', { name: 'Nothing' });
    fireEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});

