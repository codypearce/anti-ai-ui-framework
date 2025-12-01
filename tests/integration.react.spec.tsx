import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CookieHell } from '../src/components/CookieHell';
import { PopupChaos } from '../src/components/PopupChaos';
import { FakeDownloadGrid } from '../src/components/FakeDownloadGrid';

describe('React integration', () => {
  it('CookieHell closes on Accept All, PopupChaos allows closing, FakeDownloadGrid real click fires', () => {
    const onAcceptAll = vi.fn();
    const onAllClosed = vi.fn();
    const onReal = vi.fn();
    const onFake = vi.fn();

    render(
      <div>
        <CookieHell categoryCount={1} partnersPerCategory={1} onAcceptAll={onAcceptAll} />
        <PopupChaos popupCount={2} onAllClosed={onAllClosed} />
        <FakeDownloadGrid buttonCount={3} onRealClick={onReal} onFakeClick={onFake} />
      </div>
    );

    // CookieHell
    const accept = screen.getByRole('button', { name: /accept all/i });
    fireEvent.click(accept);
    expect(onAcceptAll).toHaveBeenCalled();

    // PopupChaos: close first popup
    let closeButtons = screen.getAllByRole('button', { name: '✕' });
    expect(closeButtons.length).toBe(2);
    fireEvent.click(closeButtons[0]);

    // One remains
    closeButtons = screen.getAllByRole('button', { name: '✕' });
    expect(closeButtons.length).toBe(1);

    // Close last popup
    fireEvent.click(closeButtons[0]);
    expect(screen.queryAllByRole('button', { name: '✕' }).length).toBe(0);
    expect(onAllClosed).toHaveBeenCalled();

    // FakeDownloadGrid: click all remaining buttons (excluding Accept All which was already clicked)
    // The buttons will include Accept All (already clicked), Save preferences, and the download buttons
    const allButtonsAfterPopups = screen.getAllByRole('button');
    // Filter to buttons that contain download-related text
    const downloadButtons = allButtonsAfterPopups.filter(
      (btn) =>
        btn.textContent?.toLowerCase().includes('download') ||
        btn.textContent?.includes('Mirror') ||
        btn.textContent?.includes('FREE')
    );
    downloadButtons.forEach((btn) => fireEvent.click(btn));
    expect(onReal).toHaveBeenCalledTimes(1);
    expect(onFake.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
