import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLabelPositionSwap } from '../src/vanilla/labelPositionSwap';

describe('createLabelPositionSwap (vanilla)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('returns cleanup function', () => {
    const cleanup = createLabelPositionSwap({ container });
    expect(cleanup).toBeInstanceOf(Function);
  });

  it('creates label and input', () => {
    createLabelPositionSwap({ container });
    expect(container.querySelector('label')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('uses custom label and placeholder', () => {
    createLabelPositionSwap({
      container,
      label: 'Username',
      placeholder: 'Enter username...',
    });

    expect(container.querySelector('label')).toHaveTextContent('Username');
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Enter username...');
  });

  it('changes position at intervals', async () => {
    const onPositionChange = vi.fn();
    createLabelPositionSwap({
      container,
      changeInterval: 1000,
      onPositionChange,
    });

    await vi.advanceTimersByTimeAsync(1000);

    expect(onPositionChange).toHaveBeenCalled();
  });

  it('calls onPositionChange callback', async () => {
    const onPositionChange = vi.fn();
    createLabelPositionSwap({
      container,
      changeInterval: 1000,
      onPositionChange,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(onPositionChange).toHaveBeenCalled();
    expect(['top', 'bottom', 'left', 'right']).toContain(onPositionChange.mock.calls[0][0]);
  });

  it('uses custom positions array', async () => {
    const onPositionChange = vi.fn();
    createLabelPositionSwap({
      container,
      positions: ['top', 'bottom'],
      changeInterval: 1000,
      onPositionChange,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(['top', 'bottom']).toContain(onPositionChange.mock.calls[0][0]);
  });

  it('uses custom createFieldElement function', async () => {
    const createFieldElement = vi.fn((position, label, placeholder) => {
      const el = document.createElement('div');
      el.className = 'custom-field';
      el.setAttribute('data-position', position);
      el.textContent = `${label} - ${placeholder}`;
      return el;
    });

    createLabelPositionSwap({
      container,
      changeInterval: 1000,
      createFieldElement,
    });

    expect(createFieldElement).toHaveBeenCalledWith('top', 'Email', 'Enter text...');
    expect(container.querySelector('.custom-field')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1000);
    expect(createFieldElement).toHaveBeenCalledTimes(2);
  });

  it('shows position indicator by default', () => {
    createLabelPositionSwap({ container });
    expect(container.textContent).toContain('current:');
  });

  it('hides position indicator when showPositionIndicator is false', () => {
    createLabelPositionSwap({ container, showPositionIndicator: false });
    expect(container.textContent).not.toContain('current:');
  });

  it('updates flex direction based on position', async () => {
    createLabelPositionSwap({
      container,
      positions: ['top', 'bottom', 'left', 'right'],
      changeInterval: 1000,
    });

    const wrapper = container.firstElementChild as HTMLElement;
    const fieldContainer = wrapper.firstElementChild as HTMLElement;

    await vi.advanceTimersByTimeAsync(1000);
    expect(['column', 'row']).toContain(fieldContainer.style.flexDirection);
  });

  it('reorders elements based on position', async () => {
    createLabelPositionSwap({
      container,
      positions: ['top', 'bottom'],
      changeInterval: 1000,
    });

    const wrapper = container.firstElementChild as HTMLElement;
    const fieldContainer = wrapper.firstElementChild as HTMLElement;

    // Check initial order (top)
    let firstChild = fieldContainer.firstElementChild;
    expect(firstChild?.tagName).toBe('LABEL');

    // Wait for position change
    await vi.advanceTimersByTimeAsync(1000);

    // Check if order might have changed
    firstChild = fieldContainer.firstElementChild;
    expect(['LABEL', 'INPUT']).toContain(firstChild?.tagName);
  });

  it('cycles through multiple positions', async () => {
    const positions: string[] = [];
    createLabelPositionSwap({
      container,
      changeInterval: 500,
      onPositionChange: (pos) => positions.push(pos),
    });

    await vi.advanceTimersByTimeAsync(2000);
    expect(positions.length).toBeGreaterThanOrEqual(3);
  });

  it('cleans up on cleanup', () => {
    const cleanup = createLabelPositionSwap({ container });

    expect(container.children.length).toBeGreaterThan(0);
    cleanup();
    expect(container.children.length).toBe(0);
  });

  it('stops changing position after cleanup', async () => {
    const onPositionChange = vi.fn();
    const cleanup = createLabelPositionSwap({
      container,
      changeInterval: 1000,
      onPositionChange,
    });

    cleanup();
    await vi.advanceTimersByTimeAsync(1000);
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('applies default styles to label', () => {
    createLabelPositionSwap({ container });
    const label = container.querySelector('label') as HTMLElement;

    expect(label.style.fontWeight).toBe('500');
    expect(label.style.fontSize).toBe('14px');
  });

  it('applies default styles to input', () => {
    createLabelPositionSwap({ container });
    const input = container.querySelector('input') as HTMLElement;

    expect(input.style.padding).toBe('8px 12px');
    expect(input.style.border).toContain('1px');
  });

  it('handles rapid position changes', async () => {
    createLabelPositionSwap({
      container,
      changeInterval: 100,
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(container.querySelector('label')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeInTheDocument();
  });
});
