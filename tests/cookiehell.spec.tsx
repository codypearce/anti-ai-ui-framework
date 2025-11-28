import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CookieHell } from '../src/components/CookieHell';

describe('CookieHell (React)', () => {
  beforeEach(() => {
    cleanup();
  });

  it('calls onAcceptAll when Accept All is clicked', () => {
    const onAcceptAll = vi.fn();
    const { container } = render(<CookieHell depth={1} onAcceptAll={onAcceptAll} />);

    const acceptButton = container.querySelector('button');
    fireEvent.click(acceptButton!);

    expect(onAcceptAll).toHaveBeenCalledTimes(1);
  });

  it('calls onRejectAll when Reject All is clicked', () => {
    const onRejectAll = vi.fn();
    const { container } = render(<CookieHell depth={1} onRejectAll={onRejectAll} />);

    const buttons = container.querySelectorAll('button');
    const rejectButton = Array.from(buttons).find(b => b.textContent?.includes('reject all'));
    fireEvent.click(rejectButton!);

    expect(onRejectAll).toHaveBeenCalledTimes(1);
  });

  it('renders multiple toggles', () => {
    const { container } = render(<CookieHell depth={1} toggleCount={4} />);

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('handles custom rejectButtonSize', () => {
    const { container } = render(<CookieHell depth={1} toggleCount={2} rejectButtonSize={20} />);

    const buttons = container.querySelectorAll('button');
    const rejectButton = Array.from(buttons).find(b => b.textContent?.includes('reject all'));
    expect(rejectButton).toBeTruthy();
    expect(rejectButton!.style.height).not.toBe('');
  });

  it('renders with custom className', () => {
    const { container } = render(<CookieHell depth={1} toggleCount={1} className="custom-cookie" />);

    const wrapper = container.querySelector('.custom-cookie');
    expect(wrapper).toBeTruthy();
  });

  it('renders with custom style', () => {
    const { container } = render(
      <CookieHell
        depth={1}
        toggleCount={1}
        style={{ backgroundColor: 'red', padding: '20px' }}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('red');
    expect(wrapper.style.padding).toBe('20px');
  });

  it('renders custom children content', () => {
    const { container } = render(
      <CookieHell depth={1} toggleCount={1}>
        <div data-testid="custom-header">Custom Header</div>
      </CookieHell>
    );

    const customHeader = container.querySelector('[data-testid="custom-header"]');
    expect(customHeader).toBeTruthy();
    expect(customHeader?.textContent).toBe('Custom Header');
  });

  it('still renders toggles and buttons with custom children', () => {
    const { container } = render(
      <CookieHell depth={1} toggleCount={2}>
        <h2>Custom Title</h2>
      </CookieHell>
    );

    // Should have custom content
    const h2 = container.querySelector('h2');
    expect(h2?.textContent).toBe('Custom Title');

    // Should still have toggles
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Should still have buttons
    const acceptButton = container.querySelector('button');
    expect(acceptButton?.textContent).toBe('Accept All');
  });
});
