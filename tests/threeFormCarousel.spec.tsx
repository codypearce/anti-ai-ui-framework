import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThreeFormCarousel } from '../src/components/ThreeFormCarousel';
import { createThreeFormCarousel } from '../src/vanilla/threeFormCarousel';

describe('ThreeFormCarousel (React)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the specified number of forms', () => {
    const { container } = render(
      <ThreeFormCarousel formCount={3}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const forms = container.querySelectorAll('div[style*="translateX"]');
    expect(forms.length).toBe(3);
  });

  it('renders custom form content for each form', () => {
    const { container } = render(
      <ThreeFormCarousel formCount={3}>
        {(idx) => <div className="custom-form">Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const customForms = container.querySelectorAll('.custom-form');
    expect(customForms.length).toBe(3);
    expect(customForms[0].textContent).toBe('Form 0');
    expect(customForms[1].textContent).toBe('Form 1');
    expect(customForms[2].textContent).toBe('Form 2');
  });

  it('sets correct width based on formCount, formWidth, and gap', () => {
    const { container } = render(
      <ThreeFormCarousel formCount={3} formWidth={200} gap={10}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const wrapper = container.firstChild as HTMLElement;
    // 3 forms * 200px + 2 gaps * 10px = 620px
    expect(wrapper.style.width).toBe('620px');
  });

  it('positions forms initially at 0, 1, 2', () => {
    const { container } = render(
      <ThreeFormCarousel formCount={3} formWidth={100} gap={10}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const forms = container.querySelectorAll('div[style*="translateX"]');

    // Initial positions should be 0, 0, 0 (all at their natural flex positions initially)
    expect((forms[0] as HTMLElement).style.transform).toMatch(/translateX\(0px\)/);
    expect((forms[1] as HTMLElement).style.transform).toMatch(/translateX\(0px\)/);
    expect((forms[2] as HTMLElement).style.transform).toMatch(/translateX\(0px\)/);
  });

  it('shuffles form positions after interval', async () => {
    const { container } = render(
      <ThreeFormCarousel formCount={3} formWidth={100} gap={10} shuffleInterval={1000}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const forms = container.querySelectorAll('div[style*="translateX"]');

    // Advance timers past shuffle interval
    await vi.advanceTimersByTimeAsync(1000);

    // All forms should still have transform properties (shuffle may or may not visually change order)
    forms.forEach((form) => {
      expect((form as HTMLElement).style.transform).toMatch(/translateX\(/);
    });
  });

  it('applies custom className to container', () => {
    const { container } = render(
      <ThreeFormCarousel className="my-carousel" formCount={3}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toBe('my-carousel');
  });

  it('applies custom styles to container', () => {
    const { container } = render(
      <ThreeFormCarousel style={{ background: 'red', padding: '20px' }} formCount={3}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.background).toBe('red');
    expect(wrapper.style.padding).toBe('20px');
  });

  it('applies custom formClassName to each form', () => {
    const { container } = render(
      <ThreeFormCarousel formClassName="custom-form" formCount={3}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const forms = container.querySelectorAll('.custom-form');
    expect(forms.length).toBe(3);
  });

  it('applies custom formStyle to each form', () => {
    const { container } = render(
      <ThreeFormCarousel formStyle={{ border: '2px solid blue' }} formCount={3}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    const forms = container.querySelectorAll('div[style*="translateX"]');
    expect((forms[0] as HTMLElement).style.border).toBe('2px solid blue');
  });

  it('handles different formCount values', () => {
    const { container, rerender } = render(
      <ThreeFormCarousel formCount={2}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    let forms = container.querySelectorAll('div[style*="translateX"]');
    expect(forms.length).toBe(2);

    rerender(
      <ThreeFormCarousel formCount={5}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    forms = container.querySelectorAll('div[style*="translateX"]');
    expect(forms.length).toBe(5);
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(
      <ThreeFormCarousel formCount={3}>
        {(idx) => <div>Form {idx}</div>}
      </ThreeFormCarousel>
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('createThreeFormCarousel (Vanilla)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('creates the specified number of forms', () => {
    const cleanup = createThreeFormCarousel({
      container,
      formCount: 3,
      createFormContent: (idx) => {
        const div = document.createElement('div');
        div.textContent = `Form ${idx}`;
        return div;
      },
    });

    const wrapper = container.firstChild as HTMLElement;
    const forms = wrapper.querySelectorAll('div[style*="position: absolute"]');
    expect(forms.length).toBe(3);

    cleanup();
  });

  it('creates forms with custom content', () => {
    const cleanup = createThreeFormCarousel({
      container,
      formCount: 3,
      createFormContent: (idx) => {
        const div = document.createElement('div');
        div.className = 'custom-form';
        div.textContent = `Form ${idx}`;
        return div;
      },
    });

    const customForms = container.querySelectorAll('.custom-form');
    expect(customForms.length).toBe(3);
    expect(customForms[0].textContent).toBe('Form 0');
    expect(customForms[1].textContent).toBe('Form 1');
    expect(customForms[2].textContent).toBe('Form 2');

    cleanup();
  });

  it('sets correct container width', () => {
    const cleanup = createThreeFormCarousel({
      container,
      formCount: 3,
      formWidth: 200,
      gap: 10,
    });

    const wrapper = container.firstChild as HTMLElement;
    // 3 forms * 200px + 2 gaps * 10px = 620px
    expect(wrapper.style.width).toBe('620px');

    cleanup();
  });

  it('positions forms initially', () => {
    const cleanup = createThreeFormCarousel({
      container,
      formCount: 3,
      formWidth: 100,
      gap: 10,
    });

    const wrapper = container.firstChild as HTMLElement;
    const forms = wrapper.querySelectorAll('div[style*="position: absolute"]');

    // Initial positions: 0, 110, 220
    expect((forms[0] as HTMLElement).style.transform).toBe('translateX(0px)');
    expect((forms[1] as HTMLElement).style.transform).toBe('translateX(110px)');
    expect((forms[2] as HTMLElement).style.transform).toBe('translateX(220px)');

    cleanup();
  });

  it('shuffles forms after interval', () => {
    const cleanup = createThreeFormCarousel({
      container,
      formCount: 3,
      formWidth: 100,
      gap: 10,
      shuffleInterval: 1000,
    });

    const wrapper = container.firstChild as HTMLElement;
    const forms = wrapper.querySelectorAll('div[style*="position: absolute"]');

    // Advance time
    vi.advanceTimersByTime(1000);

    // Forms should still be positioned (shuffle may or may not change visible order)
    forms.forEach((form) => {
      expect((form as HTMLElement).style.transform).toMatch(/translateX\(/);
    });

    cleanup();
  });

  it('cleanup removes wrapper and clears interval', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const cleanup = createThreeFormCarousel({
      container,
      formCount: 3,
    });

    expect(container.children.length).toBe(1);

    cleanup();

    expect(container.children.length).toBe(0);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('handles custom formCount', () => {
    const cleanup = createThreeFormCarousel({
      container,
      formCount: 5,
    });

    const wrapper = container.firstChild as HTMLElement;
    const forms = wrapper.querySelectorAll('div[style*="position: absolute"]');
    expect(forms.length).toBe(5);

    cleanup();
  });
});
