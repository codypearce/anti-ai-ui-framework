import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { CookieHell } from '../src/components/CookieHell';

describe('CookieHell (React)', () => {
  beforeEach(() => {
    cleanup();
  });

  it('calls onAcceptAll when Accept All is clicked', () => {
    const onAcceptAll = vi.fn();
    const { container } = render(<CookieHell categoryCount={1} partnersPerCategory={1} onAcceptAll={onAcceptAll} />);

    const acceptButton = container.querySelector('button');
    fireEvent.click(acceptButton!);

    expect(onAcceptAll).toHaveBeenCalledTimes(1);
  });

  it('calls onSavePreferences when Save Preferences is clicked', () => {
    const onSavePreferences = vi.fn();
    const { container } = render(<CookieHell categoryCount={1} partnersPerCategory={1} onSavePreferences={onSavePreferences} />);

    const buttons = container.querySelectorAll('button');
    const saveButton = Array.from(buttons).find((b) => b.textContent?.toLowerCase().includes('save'));
    fireEvent.click(saveButton!);

    expect(onSavePreferences).toHaveBeenCalled();
  });

  it('renders multiple toggles', () => {
    const { container } = render(<CookieHell categoryCount={2} partnersPerCategory={4} />);

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    // Should have at least 2 category toggles
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
  });

  it('handles custom rejectButtonSize', () => {
    const { container } = render(<CookieHell categoryCount={1} partnersPerCategory={2} rejectButtonSize={20} />);

    const buttons = container.querySelectorAll('button');
    const saveButton = Array.from(buttons).find((b) => b.textContent?.toLowerCase().includes('save'));
    expect(saveButton).toBeTruthy();
    // The save button should have some styling based on rejectButtonSize
    expect(saveButton!.style.fontSize).toBe('10px'); // rejectButtonSize / 2
  });

  it('renders with custom className', () => {
    const { container } = render(<CookieHell categoryCount={1} partnersPerCategory={1} className="custom-cookie" />);

    const wrapper = container.querySelector('.custom-cookie');
    expect(wrapper).toBeTruthy();
  });

  it('renders with custom style', () => {
    const { container } = render(
      <CookieHell
        categoryCount={1}
        partnersPerCategory={1}
        style={{ backgroundColor: 'red', padding: '20px' }}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('red');
    expect(wrapper.style.padding).toBe('20px');
  });

  it('renders category names', () => {
    const { container } = render(<CookieHell categoryCount={3} partnersPerCategory={2} />);

    // Should have multiple categories rendered
    const text = container.textContent;
    expect(text).toContain('Strictly Necessary');
  });

  it('allows expanding categories to see partners', () => {
    const { container } = render(<CookieHell categoryCount={2} partnersPerCategory={3} />);

    // Find and click expand button
    const expandButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('View') && b.textContent?.includes('partners')
    );
    expect(expandButtons.length).toBeGreaterThan(0);

    fireEvent.click(expandButtons[0]);

    // After expanding, should see "Hide partners" text
    const hideButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Hide partners')
    );
    expect(hideButton).toBeTruthy();
  });
});
