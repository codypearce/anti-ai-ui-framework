import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormChaos } from '../src/components/FormChaos';

describe('FormChaos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders container', () => {
      const { container } = render(<FormChaos />);
      expect(container.firstChild).not.toBeNull();
    });

    it('renders with custom className', () => {
      const { container } = render(<FormChaos className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders default form content', () => {
      const { container } = render(<FormChaos />);
      expect(container.querySelector('input')).not.toBeNull();
      expect(container.querySelector('button')).not.toBeNull();
    });
  });

  describe('Transform Updates', () => {
    it('updates transform at specified interval', async () => {
      const { container } = render(<FormChaos changeInterval={500} />);

      // Container div > transform div
      const outerDiv = container.firstChild as HTMLElement;
      const formElement = outerDiv.firstChild as HTMLElement;

      // Initial transform should be set (rotation=0, scale=1)
      expect(formElement.style.transform).toContain('rotate');
      expect(formElement.style.transform).toContain('scale');

      // After interval, transform values should change
      await vi.advanceTimersByTimeAsync(600);
      expect(formElement.style.transform).toContain('rotate');
      expect(formElement.style.transform).toContain('scale');
    });

    it('applies rotation within configured range', async () => {
      const { container } = render(
        <FormChaos changeInterval={100} minRotation={-10} maxRotation={10} />
      );

      await vi.advanceTimersByTimeAsync(100);

      const formElement = container.querySelector('div > div') as HTMLElement;
      const transform = formElement.style.transform;
      const rotationMatch = transform.match(/rotate\(([-\d.]+)deg\)/);

      if (rotationMatch) {
        const rotation = parseFloat(rotationMatch[1]);
        expect(rotation).toBeGreaterThanOrEqual(-10);
        expect(rotation).toBeLessThanOrEqual(10);
      }
    });

    it('applies scale within configured range', async () => {
      const { container } = render(
        <FormChaos changeInterval={100} minScale={0.8} maxScale={1.2} />
      );

      await vi.advanceTimersByTimeAsync(100);

      const formElement = container.querySelector('div > div') as HTMLElement;
      const transform = formElement.style.transform;
      const scaleMatch = transform.match(/scale\(([\d.]+)\)/);

      if (scaleMatch) {
        const scale = parseFloat(scaleMatch[1]);
        expect(scale).toBeGreaterThanOrEqual(0.8);
        expect(scale).toBeLessThanOrEqual(1.2);
      }
    });
  });

  describe('Custom Rendering', () => {
    it('uses children render prop when provided', async () => {
      render(
        <FormChaos>
          {(rotation, scale) => (
            <div data-testid="custom-content">
              Rotation: {rotation.toFixed(1)}, Scale: {scale.toFixed(2)}
            </div>
          )}
        </FormChaos>
      );

      await vi.advanceTimersByTimeAsync(100);

      const customContent = screen.getByTestId('custom-content');
      expect(customContent).toBeInTheDocument();
      expect(customContent.textContent).toContain('Rotation:');
      expect(customContent.textContent).toContain('Scale:');
    });

    it('passes rotation and scale to render prop', async () => {
      let capturedRotation = 0;
      let capturedScale = 0;

      render(
        <FormChaos changeInterval={100} minRotation={5} maxRotation={10} minScale={1.1} maxScale={1.2}>
          {(rotation, scale) => {
            capturedRotation = rotation;
            capturedScale = scale;
            return <div>Test</div>;
          }}
        </FormChaos>
      );

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedRotation).toBeGreaterThanOrEqual(5);
      expect(capturedRotation).toBeLessThanOrEqual(10);
      expect(capturedScale).toBeGreaterThanOrEqual(1.1);
      expect(capturedScale).toBeLessThanOrEqual(1.2);
    });
  });

  describe('Styling', () => {
    it('applies custom formClassName', () => {
      const { container } = render(<FormChaos formClassName="form-class" />);
      expect(container.querySelector('.form-class')).toBeInTheDocument();
    });

    it('applies transition style', () => {
      const { container } = render(<FormChaos transition="1s linear" />);
      const outerDiv = container.firstChild as HTMLElement;
      const formElement = outerDiv.firstChild as HTMLElement;
      // The transition is applied as "transform 1s linear"
      expect(formElement.style.transition).toContain('1s linear');
    });
  });

  describe('Cleanup', () => {
    it('clears interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<FormChaos />);

      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
