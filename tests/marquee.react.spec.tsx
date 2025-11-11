import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarqueeInputs } from '../src/components/MarqueeInputs';
import React from 'react';

describe('MarqueeInputs (React)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render the specified number of inputs', () => {
    render(<MarqueeInputs count={4} />);

    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  it('should apply custom placeholder', () => {
    render(<MarqueeInputs count={2} placeholder="Custom placeholder" />);

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      expect(input.getAttribute('placeholder')).toBe('Custom placeholder');
    });
  });

  it('should apply custom className to inputs', () => {
    render(<MarqueeInputs count={2} className="custom-class" />);

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      expect(input.className).toContain('custom-class');
    });
  });

  it('should set initial value on all inputs', () => {
    render(<MarqueeInputs count={3} initialValue="initial" />);

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      expect((input as HTMLInputElement).value).toBe('initial');
    });
  });

  it('should position inputs absolutely', () => {
    render(<MarqueeInputs count={3} />);

    const inputs = Array.from(document.querySelectorAll('input'));
    inputs.forEach(input => {
      const style = window.getComputedStyle(input);
      expect(input.style.position || style.position).toBe('absolute');
    });
  });

  it('should render with custom container style', () => {
    const { container } = render(
      <MarqueeInputs count={2} style={{ backgroundColor: 'red', height: '300px' }} />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('red');
    expect(wrapper.style.height).toBe('300px');
  });

  it('should apply custom input style', () => {
    render(<MarqueeInputs count={2} inputStyle={{ border: '2px solid blue' }} />);

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      expect((input as HTMLInputElement).style.border).toBe('2px solid blue');
    });
  });

  it('should handle different lane configurations', () => {
    render(<MarqueeInputs count={4} lanes={2} />);

    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  it('should handle different directions', () => {
    const { rerender } = render(<MarqueeInputs count={2} direction="left" />);
    expect(document.querySelectorAll('input').length).toBe(2);

    rerender(<MarqueeInputs count={2} direction="right" />);
    expect(document.querySelectorAll('input').length).toBe(2);
  });

  it('should handle different speeds', () => {
    render(<MarqueeInputs count={2} speed={200} />);

    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBe(2);
  });

  it('should handle different input widths', () => {
    render(<MarqueeInputs count={2} inputWidth={200} />);

    const inputs = Array.from(document.querySelectorAll('input'));
    inputs.forEach(input => {
      expect((input as HTMLInputElement).style.width).toBe('200px');
    });
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    const { container } = render(<MarqueeInputs count={2} onChange={onChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'test' } });

    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('should call onSubmit when pressing Enter', () => {
    const onSubmit = vi.fn();
    const { container } = render(<MarqueeInputs count={2} onSubmit={onSubmit} />);

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'submit me' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledWith('submit me');
  });

  it('should not call onSubmit on other keys', () => {
    const onSubmit = vi.fn();
    const { container } = render(<MarqueeInputs count={2} onSubmit={onSubmit} />);

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'a' });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should sync value across all inputs', () => {
    const { container } = render(<MarqueeInputs count={3} initialValue="" />);

    const inputs = container.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    fireEvent.input(inputs[0], { target: { value: 'synced' } });

    // All inputs should have the same value
    inputs.forEach((input) => {
      expect(input.value).toBe('synced');
    });
  });
});
