import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MicroscopicCloseButton } from '../src/components/MicroscopicCloseButton';
import { createMicroscopicCloseButton } from '../src/vanilla/microscopicCloseButton';

describe('MicroscopicCloseButton (React)', () => {
  it('renders without content (just buttons)', () => {
    const { container } = render(<MicroscopicCloseButton />);

    // Should have the close buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(6); // 5 fake + 1 real
  });

  it('renders with custom content', () => {
    render(
      <MicroscopicCloseButton>
        <strong>Custom Title</strong>
        <p>Custom description</p>
      </MicroscopicCloseButton>
    );

    expect(screen.getByText(/Custom Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom description/i)).toBeInTheDocument();
  });

  it('renders 5 fake close buttons and 1 real close button', () => {
    const { container } = render(<MicroscopicCloseButton />);

    // Count all buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(6); // 5 fake + 1 real

    // Real button should have aria-label="Close"
    const realButton = container.querySelector('button[aria-label="Close"]');
    expect(realButton).toBeInTheDocument();

    // Real button should be 4x4 pixels
    expect(realButton).toHaveStyle({ width: '4px', height: '4px' });
  });

  it('calls onRealClose when real button is clicked', () => {
    const onRealClose = vi.fn();
    const { container } = render(<MicroscopicCloseButton onRealClose={onRealClose} />);

    const realButton = container.querySelector('button[aria-label="Close"]');
    expect(realButton).toBeInTheDocument();

    fireEvent.click(realButton!);
    expect(onRealClose).toHaveBeenCalledTimes(1);
  });

  it('calls onFakeClose when fake button is clicked', () => {
    const onFakeClose = vi.fn();
    const { container } = render(<MicroscopicCloseButton onFakeClose={onFakeClose} />);

    // Click one of the fake buttons (aria-label="Fake close button")
    const fakeButtons = container.querySelectorAll('button[aria-label="Fake close button"]');
    expect(fakeButtons.length).toBe(5);

    fireEvent.click(fakeButtons[0]);
    expect(onFakeClose).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <MicroscopicCloseButton className="my-custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toBe('my-custom-class');
  });

  it('applies custom styles', () => {
    const { container } = render(
      <MicroscopicCloseButton
        style={{ background: 'red', padding: '20px' }}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.background).toBe('red');
    expect(wrapper.style.padding).toBe('20px');
  });

  it('can customize number of fake buttons', () => {
    const { container } = render(
      <MicroscopicCloseButton fakeButtonCount={3} />
    );

    const fakeButtons = container.querySelectorAll('button[aria-label="Fake close button"]');
    expect(fakeButtons.length).toBe(3);
  });

  it('fake buttons have visible × symbols', () => {
    const { container } = render(<MicroscopicCloseButton />);

    const fakeButtons = container.querySelectorAll('button[aria-label="Fake close button"]');

    // First 3 fake buttons should have "×" text
    expect(fakeButtons[0].textContent).toBe('×');
    expect(fakeButtons[1].textContent).toBe('×');
    expect(fakeButtons[2].textContent).toBe('×');
  });

  it('real button is positioned in top-right corner', () => {
    const { container } = render(<MicroscopicCloseButton />);

    const realButton = container.querySelector('button[aria-label="Close"]');
    expect(realButton).toHaveStyle({
      position: 'absolute',
      top: '8px',
      right: '8px',
    });
  });
});

describe('createMicroscopicCloseButton (Vanilla)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('creates buttons in container', () => {
    const cleanup = createMicroscopicCloseButton({ container });

    // Should have created 6 buttons (5 fake + 1 real)
    expect(container.children.length).toBe(6);
    expect(container.querySelectorAll('button').length).toBe(6);

    cleanup();
  });

  it('creates 6 buttons (5 fake + 1 real)', () => {
    const cleanup = createMicroscopicCloseButton({ container });

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(6);

    // Real button should have aria-label="Close"
    const realButton = container.querySelector('button[aria-label="Close"]');
    expect(realButton).toBeTruthy();

    cleanup();
  });

  it('calls onRealClose when real button is clicked', () => {
    const onRealClose = vi.fn();
    const cleanup = createMicroscopicCloseButton({
      container,
      onRealClose
    });

    const realButton = container.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    realButton.click();

    expect(onRealClose).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it('calls onFakeClose when fake button is clicked', () => {
    const onFakeClose = vi.fn();
    const cleanup = createMicroscopicCloseButton({
      container,
      onFakeClose
    });

    const fakeButtons = container.querySelectorAll('button[aria-label="Fake close button"]');
    (fakeButtons[0] as HTMLButtonElement).click();

    expect(onFakeClose).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it('sets container to position relative if static', () => {
    container.style.position = 'static';
    const cleanup = createMicroscopicCloseButton({ container });

    expect(container.style.position).toBe('relative');

    cleanup();
  });

  it('can customize number of fake buttons', () => {
    const cleanup = createMicroscopicCloseButton({
      container,
      fakeButtonCount: 3
    });

    const fakeButtons = container.querySelectorAll('button[aria-label="Fake close button"]');
    expect(fakeButtons.length).toBe(3);

    cleanup();
  });

  it('cleanup removes all buttons', () => {
    const cleanup = createMicroscopicCloseButton({ container });

    // Should have 6 buttons
    expect(container.querySelectorAll('button').length).toBe(6);

    // Cleanup should remove all buttons
    cleanup();
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('real button is 4x4 pixels', () => {
    const cleanup = createMicroscopicCloseButton({ container });

    const realButton = container.querySelector('button[aria-label="Close"]') as HTMLElement;
    expect(realButton.style.width).toBe('4px');
    expect(realButton.style.height).toBe('4px');

    cleanup();
  });

  it('real button is positioned top-right', () => {
    const cleanup = createMicroscopicCloseButton({ container });

    const realButton = container.querySelector('button[aria-label="Close"]') as HTMLElement;
    expect(realButton.style.top).toBe('8px');
    expect(realButton.style.right).toBe('8px');
    expect(realButton.style.position).toBe('absolute');

    cleanup();
  });

  it('fake buttons have varying sizes', () => {
    const cleanup = createMicroscopicCloseButton({ container });

    const fakeButtons = container.querySelectorAll('button[aria-label="Fake close button"]');

    // Button 1: 30x30px square
    expect((fakeButtons[0] as HTMLElement).style.width).toBe('30px');
    expect((fakeButtons[0] as HTMLElement).style.height).toBe('30px');

    // Button 2: 30x30px circle
    expect((fakeButtons[1] as HTMLElement).style.width).toBe('30px');
    expect((fakeButtons[1] as HTMLElement).style.height).toBe('30px');

    // Button 4: 8x8px tiny decoy
    expect((fakeButtons[3] as HTMLElement).style.width).toBe('8px');
    expect((fakeButtons[3] as HTMLElement).style.height).toBe('8px');

    cleanup();
  });
});
