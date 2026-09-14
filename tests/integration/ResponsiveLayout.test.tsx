import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Board } from '../../src/components/game/Board';
import { Keyboard } from '../../src/components/game/Keyboard';
import type { GuessAttempt } from '../../src/engine/types';

describe('Responsive Layout & Variable Word Lengths (PO Root Cause 6 / T063, T064)', () => {
  it('renders 5-letter board with adaptive grid and proper aria attributes', () => {
    const { container } = render(
      <Board
        wordLength={5}
        guesses={[]}
        currentInput="GRACA"
        maxAttempts={6}
      />
    );

    const cells = container.querySelectorAll('[role="text"]');
    expect(cells).toHaveLength(30); // 6 rows * 5 letters
    const row = container.querySelector('[role="group"]');
    expect(row).toBeInTheDocument();
    expect(row?.getAttribute('style')).toContain('grid-template-columns: repeat(5, minmax(0, 1fr))');
  });

  it('renders 9-letter board adaptively without truncation or layout failure', () => {
    const guess9: GuessAttempt = {
      attemptIndex: 0,
      rawInput: 'EUCHARIST',
      normalizedInput: 'EUCHARIST',
      submittedAt: new Date().toISOString(),
      evaluations: [
        { letter: 'E', status: 'correct' },
        { letter: 'U', status: 'present' },
        { letter: 'C', status: 'absent' },
        { letter: 'H', status: 'absent' },
        { letter: 'A', status: 'correct' },
        { letter: 'R', status: 'present' },
        { letter: 'I', status: 'absent' },
        { letter: 'S', status: 'correct' },
        { letter: 'T', status: 'absent' },
      ],
    };

    const { container } = render(
      <Board
        wordLength={9}
        guesses={[guess9]}
        currentInput=""
        maxAttempts={6}
      />
    );

    const cells = container.querySelectorAll('[role="text"]');
    expect(cells).toHaveLength(54); // 6 rows * 9 letters
    const row = container.querySelector('[role="group"]');
    expect(row?.getAttribute('style')).toContain('grid-template-columns: repeat(9, minmax(0, 1fr))');
  });

  it('renders 10-letter board adaptively', () => {
    const { container } = render(
      <Board
        wordLength={10}
        guesses={[]}
        currentInput="SACRAMENTO"
        maxAttempts={6}
      />
    );

    const cells = container.querySelectorAll('[role="text"]');
    expect(cells).toHaveLength(60); // 6 rows * 10 letters
    const row = container.querySelector('[role="group"]');
    expect(row?.getAttribute('style')).toContain('grid-template-columns: repeat(10, minmax(0, 1fr))');
  });

  it('renders keyboard with 10 keys in row 1, 9 in row 2, and 9 in row 3, all operable', () => {
    const handleKeyPress = vi.fn();
    const { container } = render(
      <Keyboard
        onKeyPress={handleKeyPress}
        letterStatuses={{ A: 'correct', E: 'present', Z: 'absent' }}
      />
    );

    const rows = container.querySelectorAll('[role="group"] > div');
    expect(rows).toHaveLength(3);

    // Row 1: Q W E R T Y U I O P (10 keys)
    const row1Buttons = rows[0].querySelectorAll('button[data-key]');
    expect(row1Buttons).toHaveLength(10);

    // Row 2: A S D F G H J K L (9 keys)
    const row2Buttons = rows[1].querySelectorAll('button[data-key]');
    expect(row2Buttons).toHaveLength(9);

    // Row 3: ENTER, Z, X, C, V, B, N, M, BACKSPACE (9 keys)
    const row3Buttons = rows[2].querySelectorAll('button[data-key]');
    expect(row3Buttons).toHaveLength(9);

    // Click keys and verify handler
    fireEvent.click(row1Buttons[0]); // Q
    expect(handleKeyPress).toHaveBeenCalledWith('Q');

    const enterBtn = screen.getByRole('button', { name: /^ENTER$/i });
    fireEvent.click(enterBtn);
    expect(handleKeyPress).toHaveBeenCalledWith('ENTER');
  });
});
