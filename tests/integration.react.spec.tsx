import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CookieHell } from '../src/components/CookieHell';
import { PopupChaos } from '../src/components/PopupChaos';
import { FakeDownloadGrid } from '../src/components/FakeDownloadGrid';

describe('React integration', () => {
  it('CookieHell closes on Accept All, PopupChaos enforces order, FakeDownloadGrid real click fires', () => {
    const onClose = vi.fn();
    const onAllClosed = vi.fn();
    const onReal = vi.fn();

    render(
      <div>
        <CookieHell onClose={onClose} />
        <PopupChaos popupCount={2} closeOrder={[1, 0]} onAllClosed={onAllClosed} />
        <FakeDownloadGrid rows={1} cols={3} realButtonIndex={1} onRealClick={onReal} />
      </div>
    );

    // CookieHell
    const accept = screen.getByRole('button', { name: /accept all/i });
    fireEvent.click(accept);
    expect(onClose).toHaveBeenCalled();

    // PopupChaos: wrong close first (id 0) should not remove
    const closeButtons = screen.getAllByRole('button', { name: '✕' });
    fireEvent.click(closeButtons[0]);
    expect(screen.getAllByRole('button', { name: '✕' }).length).toBe(2);
    // Now correct first id 1
    fireEvent.click(closeButtons[1]);
    // One remains
    expect(screen.getAllByRole('button', { name: '✕' }).length).toBe(1);

    // FakeDownloadGrid real click at index 1
    const allButtons = screen.getAllByRole('button');
    const downloadButtons = allButtons.filter(btn => btn.textContent === 'DOWNLOAD');
    fireEvent.click(downloadButtons[1]);
    expect(onReal).toHaveBeenCalled();
  });
});

