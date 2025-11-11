import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PasswordHell } from '../src/components/PasswordHell';

describe('PasswordHell (React)', () => {
  beforeEach(() => {
    cleanup();
  });
  it('accepts a password that satisfies a fixed rule set', () => {
    const onSubmit = vi.fn();
    const rules = [
      { id: 'minLength', description: 'At least 8 chars', validate: (pw: string) => pw.length >= 8 },
      { id: 'numbers', description: 'At least 2 numbers', validate: (pw: string) => (pw.match(/\d/g) || []).length >= 2 },
      { id: 'symbols', description: 'At least one symbol', validate: (pw: string) => /[^a-zA-Z0-9\s]/.test(pw) },
    ];
    render(<PasswordHell rules={rules} freezeRules onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/password/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abcd12$#' } });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('rejects password that does not meet requirements', () => {
    const onSubmit = vi.fn();
    const rules = [
      { id: 'minLength', description: 'At least 10 chars', validate: (pw: string) => pw.length >= 10 },
    ];
    const { container } = render(<PasswordHell rules={rules} freezeRules onSubmit={onSubmit} />);
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = input.closest('form')!;
    fireEvent.change(input, { target: { value: 'short' } });
    fireEvent.submit(form);
    expect(onSubmit).not.toHaveBeenCalled();
    // Error message should be displayed
    expect(screen.getByText(/does not meet/i)).toBeInTheDocument();
  });

  it('updates requirement validation on input change', () => {
    const rules = [
      { id: 'minLength', description: 'At least 5 chars', validate: (pw: string) => pw.length >= 5 },
    ];
    const { container } = render(<PasswordHell rules={rules} freezeRules />);
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;

    // Type a short password
    fireEvent.change(input, { target: { value: 'ab' } });

    // Requirements should be visible
    const requirement = screen.getByText(/at least 5 chars/i);
    expect(requirement).toBeInTheDocument();

    // Type a valid password
    fireEvent.change(input, { target: { value: 'abcdef' } });

    // Requirement should still be there
    expect(screen.getByText(/at least 5 chars/i)).toBeInTheDocument();
  });

  it('handles changing requirements when not frozen', () => {
    vi.useFakeTimers();

    render(<PasswordHell requirementChangeInterval={1000} freezeRules={false} />);

    // Get initial requirements
    const initialRequirements = screen.getAllByRole('listitem');
    expect(initialRequirements.length).toBeGreaterThan(0);

    // Advance time to trigger requirement change
    vi.advanceTimersByTime(1100);

    // Requirements should still exist (may have changed)
    const newRequirements = screen.getAllByRole('listitem');
    expect(newRequirements.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it('displays default error message on failed validation', () => {
    const rules = [
      { id: 'custom', description: 'Custom rule', validate: () => false },
    ];
    const { container } = render(
      <PasswordHell rules={rules} freezeRules />
    );
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(form);

    // Should show the default error message within this container
    const errorDiv = container.querySelector('div[style*="color: rgb(239, 68, 68)"]');
    expect(errorDiv?.textContent).toContain('does not meet');
  });
});

