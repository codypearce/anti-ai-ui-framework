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

    render(
      <div>
        <CookieHell onAcceptAll={onAcceptAll} />
        <PopupChaos popupCount={2} onAllClosed={onAllClosed} />
        <FakeDownloadGrid rows={1} cols={3} realButtonIndex={1} onRealClick={onReal} />
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

    // FakeDownloadGrid real click at index 1
    const allButtons = screen.getAllByRole('button');
    const downloadButtons = allButtons.filter(btn => btn.textContent === 'DOWNLOAD');
    fireEvent.click(downloadButtons[1]);
    expect(onReal).toHaveBeenCalled();
  });
});

