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
      buttonCount: 3,
      onRealClick: () => realClicked++,
      onFakeClick: () => fakeClicked++,
    });
    const buttons = host.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Click all buttons - one should be real, rest should be fake
    buttons.forEach((btn) => (btn as HTMLButtonElement).click());
    expect(realClicked).toBe(1);
    expect(fakeClicked).toBeGreaterThanOrEqual(1);

    // CookieHell - now needs a container
    const cookieContainer = document.createElement('div');
    document.body.appendChild(cookieContainer);
    let acceptCalled = false;
    makeCookieHell({
      container: cookieContainer,
      categoryCount: 1,
      partnersPerCategory: 1,
      onAcceptAll: () => {
        acceptCalled = true;
      },
    });
    const accept = Array.from(cookieContainer.querySelectorAll('button')).find((b) =>
      b.textContent?.toLowerCase().includes('accept')
    );
    expect(accept).toBeTruthy();
    (accept as HTMLButtonElement).click();
    expect(acceptCalled).toBe(true);
  });
});
