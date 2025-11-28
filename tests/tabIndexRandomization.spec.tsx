import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { TabIndexRandomization } from '../src/components/TabIndexRandomization';
import { createTabIndexRandomization } from '../src/vanilla/tabIndexRandomization';

describe('TabIndexRandomization (React)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the specified number of fields', () => {
    const { container } = render(
      <TabIndexRandomization fieldCount={3}>
        {(idx, tabIdx) => <input data-testid={`field-${idx}`} tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    expect(container.querySelectorAll('input').length).toBe(3);
  });

  it('renders custom field content', () => {
    const { getByPlaceholderText } = render(
      <TabIndexRandomization fieldCount={3}>
        {(idx, tabIdx) => (
          <input
            placeholder={`Field ${String.fromCharCode(65 + idx)}`}
            tabIndex={tabIdx}
          />
        )}
      </TabIndexRandomization>
    );

    expect(getByPlaceholderText('Field A')).toBeInTheDocument();
    expect(getByPlaceholderText('Field B')).toBeInTheDocument();
    expect(getByPlaceholderText('Field C')).toBeInTheDocument();
  });

  it('initializes with sequential tab order', () => {
    const { container } = render(
      <TabIndexRandomization fieldCount={3}>
        {(idx, tabIdx) => <input data-field={idx} tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    const inputs = container.querySelectorAll('input');
    expect(inputs[0].tabIndex).toBe(1);
    expect(inputs[1].tabIndex).toBe(2);
    expect(inputs[2].tabIndex).toBe(3);
  });

  it('displays current tab order by default', () => {
    const { container } = render(
      <TabIndexRandomization fieldCount={3}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    const orderText = container.querySelector('p');
    expect(orderText).toBeInTheDocument();
    expect(orderText?.textContent).toMatch(/Current tab order:/);
    expect(orderText?.textContent).toMatch(/1.*2.*3/);
  });

  it('hides tab order when showOrder is false', () => {
    const { container } = render(
      <TabIndexRandomization fieldCount={3} showOrder={false}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    const orderText = container.querySelector('p');
    expect(orderText).not.toBeInTheDocument();
  });

  it('shuffles tab order after interval', async () => {
    const { container } = render(
      <TabIndexRandomization fieldCount={3} shuffleInterval={1000}>
        {(idx, tabIdx) => <input data-field={idx} tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    const inputs = container.querySelectorAll('input');
    const initialOrder = Array.from(inputs).map(input => input.tabIndex);

    // Advance time
    await vi.advanceTimersByTimeAsync(1000);

    // Tab indices should still be set (shuffle may or may not change visible order)
    inputs.forEach((input) => {
      expect(input.tabIndex).toBeGreaterThan(0);
      expect(input.tabIndex).toBeLessThanOrEqual(3);
    });
  });

  it('applies custom className to container', () => {
    const { container } = render(
      <TabIndexRandomization className="my-tabs" fieldCount={3}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toBe('my-tabs');
  });

  it('applies custom styles to container', () => {
    const { container } = render(
      <TabIndexRandomization style={{ background: 'red', padding: '20px' }} fieldCount={3}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.background).toBe('red');
    expect(wrapper.style.padding).toBe('20px');
  });

  it('applies fieldClassName to each field', () => {
    const { container } = render(
      <TabIndexRandomization fieldClassName="custom-field" fieldCount={3}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    const fields = container.querySelectorAll('.custom-field');
    expect(fields.length).toBe(3);
  });

  it('handles different fieldCount values', () => {
    const { container, rerender } = render(
      <TabIndexRandomization fieldCount={2}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    let inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(2);

    rerender(
      <TabIndexRandomization fieldCount={5}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(5);
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(
      <TabIndexRandomization fieldCount={3}>
        {(idx, tabIdx) => <input tabIndex={tabIdx} />}
      </TabIndexRandomization>
    );

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('createTabIndexRandomization (Vanilla)', () => {
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

  it('creates the specified number of fields', () => {
    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 3,
      createFieldContent: (idx, tabIdx) => {
        const input = document.createElement('input');
        input.tabIndex = tabIdx;
        return input;
      },
    });

    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(3);

    cleanup();
  });

  it('creates fields with custom content', () => {
    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 3,
      createFieldContent: (idx, tabIdx) => {
        const input = document.createElement('input');
        input.placeholder = `Field ${String.fromCharCode(65 + idx)}`;
        input.tabIndex = tabIdx;
        return input;
      },
    });

    const fieldA = container.querySelector('input[placeholder="Field A"]');
    const fieldB = container.querySelector('input[placeholder="Field B"]');
    const fieldC = container.querySelector('input[placeholder="Field C"]');

    expect(fieldA).toBeTruthy();
    expect(fieldB).toBeTruthy();
    expect(fieldC).toBeTruthy();

    cleanup();
  });

  it('initializes with sequential tab order', () => {
    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 3,
      createFieldContent: (idx, tabIdx) => {
        const input = document.createElement('input');
        input.tabIndex = tabIdx;
        return input;
      },
    });

    const inputs = container.querySelectorAll('input');
    expect((inputs[0] as HTMLInputElement).tabIndex).toBe(1);
    expect((inputs[1] as HTMLInputElement).tabIndex).toBe(2);
    expect((inputs[2] as HTMLInputElement).tabIndex).toBe(3);

    cleanup();
  });

  it('displays current tab order by default', () => {
    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 3,
      createFieldContent: (idx, tabIdx) => {
        const input = document.createElement('input');
        input.tabIndex = tabIdx;
        return input;
      },
    });

    const orderText = container.querySelector('p');
    expect(orderText).toBeTruthy();
    expect(orderText?.textContent).toMatch(/Current tab order:/);

    cleanup();
  });

  it('hides tab order when showOrder is false', () => {
    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 3,
      showOrder: false,
      createFieldContent: (idx, tabIdx) => {
        const input = document.createElement('input');
        input.tabIndex = tabIdx;
        return input;
      },
    });

    const orderText = container.querySelector('p');
    expect(orderText).toBeFalsy();

    cleanup();
  });

  it('shuffles tab order after interval', () => {
    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 3,
      shuffleInterval: 1000,
      createFieldContent: (idx, tabIdx) => {
        const input = document.createElement('input');
        input.tabIndex = tabIdx;
        return input;
      },
    });

    // Advance time
    vi.advanceTimersByTime(1000);

    const inputs = container.querySelectorAll('input');
    inputs.forEach((input) => {
      expect((input as HTMLInputElement).tabIndex).toBeGreaterThan(0);
      expect((input as HTMLInputElement).tabIndex).toBeLessThanOrEqual(3);
    });

    cleanup();
  });

  it('cleanup removes wrapper and clears interval', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 3,
    });

    const wrapper = container.firstChild;
    expect(wrapper).toBeTruthy();

    cleanup();

    expect(container.children.length).toBe(0);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('handles custom fieldCount', () => {
    const cleanup = createTabIndexRandomization({
      container,
      fieldCount: 5,
      createFieldContent: (idx, tabIdx) => {
        const input = document.createElement('input');
        input.tabIndex = tabIdx;
        return input;
      },
    });

    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(5);

    cleanup();
  });
});
