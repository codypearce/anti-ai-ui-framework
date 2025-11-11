import { describe, it, expect } from 'vitest';
import { makeFakeDownloadGrid } from '../src/vanilla/fakeDownloadGrid';
import { makeCookieHell } from '../src/vanilla/cookieHell';

describe('Vanilla integration', () => {
  it('FakeDownloadGrid real click fires and CookieHell Accept closes overlay', () => {
    // FakeDownloadGrid
    const host = document.createElement('div');
    document.body.appendChild(host);
    let realClicked = 0;
    let fakeClicked = 0;
    makeFakeDownloadGrid(host, {
      rows: 1,
      cols: 3,
      realButtonIndex: 2,
      onRealClick: () => realClicked++,
      onFakeClick: () => fakeClicked++,
    });
    const buttons = host.querySelectorAll('button');
    (buttons[2] as HTMLButtonElement).click();
    expect(realClicked).toBe(1);
    (buttons[0] as HTMLButtonElement).click();
    expect(fakeClicked).toBe(1);

    // CookieHell
    makeCookieHell();
    const accept = Array.from(document.querySelectorAll('button'))
      .find((b) => b.textContent?.toLowerCase() === 'accept all');
    expect(accept).toBeTruthy();
    (accept as HTMLButtonElement).click();
    // Overlay should be removed
    const overlay = Array.from(document.body.children).find((el) => el.getAttribute('role') === 'dialog');
    expect(overlay).toBeUndefined();
  });
});

