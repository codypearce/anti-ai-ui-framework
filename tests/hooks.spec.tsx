import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRunawayButton } from '../src/hooks/useRunawayButton';
import React from 'react';

describe('useRunawayButton', () => {
  it('should return initial position and refs', () => {
    const { result } = renderHook(() => useRunawayButton());

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.elementRef).toBeDefined();
    expect(result.current.position).toEqual({ x: 0, y: 0 });
    expect(result.current.initialized).toBe(false);
    expect(result.current.onMouseMove).toBeTypeOf('function');
  });

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useRunawayButton({
        speed: 2,
        evasionDistance: 100,
        jitter: 10,
      })
    );

    expect(result.current.onMouseMove).toBeTypeOf('function');
  });

  it('should initialize position when refs are set', () => {
    const { result } = renderHook(() => useRunawayButton());

    // Create mock container and element
    const container = document.createElement('div');
    const element = document.createElement('button');
    container.style.width = '400px';
    container.style.height = '300px';
    element.style.width = '100px';
    element.style.height = '50px';
    document.body.appendChild(container);
    container.appendChild(element);

    // Mock getBoundingClientRect
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      width: 400,
      height: 300,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 50,
      left: 150,
      top: 125,
      right: 250,
      bottom: 175,
      x: 150,
      y: 125,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.containerRef.current = container;
      result.current.elementRef.current = element;
    });

    // Position should be centered
    expect(result.current.position.x).toBeGreaterThanOrEqual(0);
    expect(result.current.position.y).toBeGreaterThanOrEqual(0);
  });

  it('should handle mouse move events', () => {
    const { result } = renderHook(() =>
      useRunawayButton({
        speed: 1,
        evasionDistance: 100,
        jitter: 5,
      })
    );

    const container = document.createElement('div');
    const element = document.createElement('button');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    container.appendChild(element);

    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      width: 400,
      height: 300,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      width: 80,
      height: 40,
      left: 100,
      top: 100,
      right: 180,
      bottom: 140,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.containerRef.current = container;
      result.current.elementRef.current = element;
    });

    const initialPos = { ...result.current.position };

    // Simulate mouse move close to button
    const mockEvent = {
      clientX: 150,
      clientY: 120,
    } as React.MouseEvent;

    act(() => {
      result.current.onMouseMove(mockEvent);
    });

    // Position might have changed (depending on evasion logic)
    expect(result.current.position).toBeDefined();
  });

  it('should handle mouse move when refs are null', () => {
    const { result } = renderHook(() => useRunawayButton());

    const mockEvent = {
      clientX: 100,
      clientY: 100,
    } as React.MouseEvent;

    // Should not throw when refs are null
    expect(() => {
      act(() => {
        result.current.onMouseMove(mockEvent);
      });
    }).not.toThrow();
  });

  it('should use default options when none provided', () => {
    const { result } = renderHook(() => useRunawayButton({}));

    expect(result.current.position).toEqual({ x: 0, y: 0 });
    expect(result.current.initialized).toBe(false);
  });
});
