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

  it('calls onClose when Accept All is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<CookieHell depth={1} toggleCount={2} onClose={onClose} />);

    const acceptButton = container.querySelector('button');
    fireEvent.click(acceptButton!);

    expect(onClose).toHaveBeenCalledTimes(1);
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

  it('renders with minimal configuration and closes on accept', () => {
    const { container } = render(<CookieHell depth={1} toggleCount={1} />);

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();

    const acceptButton = container.querySelector('button');
    fireEvent.click(acceptButton!);

    // Dialog should be removed after accept
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
