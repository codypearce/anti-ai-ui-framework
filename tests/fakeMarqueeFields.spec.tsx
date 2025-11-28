import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FakeMarqueeFields } from '../src/components/FakeMarqueeFields';

describe('FakeMarqueeFields', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders container', () => {
      const { container } = render(<FakeMarqueeFields />);
      // Component renders a fragment with style + div, so firstChild is the style tag
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      const { container } = render(<FakeMarqueeFields className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('includes keyframe animation styles', () => {
      render(<FakeMarqueeFields />);
      const styles = document.querySelector('style');
      expect(styles).toBeInTheDocument();
      expect(styles?.textContent).toContain('@keyframes scrollAcross');
    });
  });

  describe('Field Spawning', () => {
    it('spawns first field immediately', () => {
      const { container } = render(<FakeMarqueeFields />);
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('spawns fields at specified interval', async () => {
      const { container } = render(<FakeMarqueeFields spawnInterval={2000} />);

      const initialCount = container.querySelectorAll('input').length;
      expect(initialCount).toBeGreaterThanOrEqual(1);

      await vi.advanceTimersByTimeAsync(2000);
      expect(container.querySelectorAll('input').length).toBeGreaterThan(initialCount);
    });

    it('removes fields after scroll duration', async () => {
      const { container } = render(<FakeMarqueeFields spawnInterval={10000} scrollDuration={500} />);

      // Initial field spawns
      expect(container.querySelectorAll('input').length).toBe(1);

      // After scroll duration, first field removed
      await vi.advanceTimersByTimeAsync(600);
      expect(container.querySelectorAll('input').length).toBe(0);
    });
  });

  describe('Custom Fields', () => {
    it('uses custom fields when provided', () => {
      const customFields = [
        { label: 'API Key', placeholder: 'sk-...' },
        { label: 'Secret Token', placeholder: 'Enter token' },
      ];

      render(<FakeMarqueeFields fields={customFields} />);
      const label = screen.getByText(/API Key|Secret Token/);
      expect(label).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('uses children render prop when provided', () => {
      const customFields = [{ label: 'Test', placeholder: 'test' }];
      render(
        <FakeMarqueeFields fields={customFields}>
          {(field) => (
            <div key={field.id} data-testid="custom-field">
              Custom: {field.label}
            </div>
          )}
        </FakeMarqueeFields>
      );

      const customField = screen.getByTestId('custom-field');
      expect(customField).toBeInTheDocument();
      expect(customField.textContent).toContain('Custom: Test');
    });
  });

  describe('Cleanup', () => {
    it('cleans up intervals on unmount', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<FakeMarqueeFields spawnInterval={1000} />);

      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('renders inputs with placeholders', () => {
      render(<FakeMarqueeFields />);
      const inputs = screen.queryAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('placeholder');
      });
    });

    it('renders labels for inputs', () => {
      const { container } = render(<FakeMarqueeFields />);
      const labels = container.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });
  });
});
