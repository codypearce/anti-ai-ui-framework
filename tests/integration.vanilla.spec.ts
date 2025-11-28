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

    // CookieHell - now needs a container
    const cookieContainer = document.createElement('div');
    document.body.appendChild(cookieContainer);
    let acceptCalled = false;
    makeCookieHell({
      container: cookieContainer,
      onAcceptAll: () => { acceptCalled = true; }
    });
    const accept = Array.from(cookieContainer.querySelectorAll('button'))
      .find((b) => b.textContent?.toLowerCase() === 'accept all');
    expect(accept).toBeTruthy();
    (accept as HTMLButtonElement).click();
    expect(acceptCalled).toBe(true);
  });
});

