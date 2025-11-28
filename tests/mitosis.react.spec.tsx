import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MitosisButton } from '../src/components/MitosisButton';

describe('MitosisButton (React)', () => {
  it('renders initial buttons and handles clicks', () => {
    const onClick = vi.fn();
    const onWin = vi.fn();
    const { container } = render(
      <div style={{ width: 300, height: 200 }}>
        <MitosisButton initialCount={3} maxButtons={10} multiplyBy={2} onClick={onClick} onWin={onWin}>
          Click me
        </MitosisButton>
      </div>
    );

    // Should start with initialCount buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);

    // Click a button - should multiply (add 2 more)
    fireEvent.click(buttons[0]);
    expect(onClick).toHaveBeenCalledTimes(1);

    const afterClick = container.querySelectorAll('button');
    expect(afterClick.length).toBe(5); // 3 + 2
  });

  it('switches to removal mode after reaching maxButtons', () => {
    const onClick = vi.fn();
    const { container } = render(
      <div style={{ width: 300, height: 200 }}>
        <MitosisButton initialCount={4} maxButtons={6} multiplyBy={2} onClick={onClick}>
          Click me
        </MitosisButton>
      </div>
    );

    // Start with 4, click to add 2 = 6, which hits max
    let buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(4);

    fireEvent.click(buttons[0]);
    buttons = container.querySelectorAll('button');
    // Should switch to removal mode and remove the clicked button
    expect(buttons.length).toBe(3);
  });

  it('calls onWin when last button is clicked', () => {
    const onWin = vi.fn();
    const { container } = render(
      <div style={{ width: 300, height: 200 }}>
        <MitosisButton initialCount={1} onWin={onWin}>
          Click me
        </MitosisButton>
      </div>
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(1);

    fireEvent.click(buttons[0]);
    expect(onWin).toHaveBeenCalledTimes(1);
  });
});

