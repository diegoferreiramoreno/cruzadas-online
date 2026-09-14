import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateShareText, shareResult } from '../../../src/services/shareService';
import type { GuessAttempt } from '../../../src/engine/types';

describe('Share Service (US3 / T050)', () => {
  const mockGuesses: GuessAttempt[] = [
    {
      attemptIndex: 0,
      rawInput: 'PEDRO',
      normalizedInput: 'PEDRO',
      evaluations: [
        { letter: 'P', status: 'absent' },
        { letter: 'E', status: 'absent' },
        { letter: 'D', status: 'absent' },
        { letter: 'R', status: 'present' },
        { letter: 'O', status: 'absent' }
      ],
      submittedAt: '2026-09-11T12:00:00.000Z'
    },
    {
      attemptIndex: 1,
      rawInput: 'GRAÇA',
      normalizedInput: 'GRACA',
      evaluations: [
        { letter: 'G', status: 'correct' },
        { letter: 'R', status: 'correct' },
        { letter: 'A', status: 'correct' },
        { letter: 'C', status: 'correct' },
        { letter: 'A', status: 'correct' }
      ],
      submittedAt: '2026-09-11T12:02:00.000Z'
    }
  ];

  it('generates correct spoiler-free share text on win (2/6)', () => {
    const text = generateShareText({
      cycleId: '2026-09-11',
      status: 'WON',
      guesses: mockGuesses
    });

    expect(text).toContain('Cruzadas.online');
    expect(text).toContain('2026-09-11');
    expect(text).toContain('2/6');
    expect(text).toContain('⬛⬛⬛🟨⬛');
    expect(text).toContain('🟩🟩🟩🟩🟩');
    expect(text).toContain('https://cruzadas.online');

    // Strict spoiler-free assertions
    expect(text).not.toContain('GRAÇA');
    expect(text).not.toContain('GRACA');
    expect(text).not.toContain('PEDRO');
  });

  it('generates correct spoiler-free share text on loss (X/6)', () => {
    const sixFailedGuesses: GuessAttempt[] = Array.from({ length: 6 }, (_, i) => ({
      attemptIndex: i,
      rawInput: 'PEDRO',
      normalizedInput: 'PEDRO',
      evaluations: [
        { letter: 'P', status: 'absent' },
        { letter: 'E', status: 'absent' },
        { letter: 'D', status: 'absent' },
        { letter: 'R', status: 'absent' },
        { letter: 'O', status: 'absent' }
      ],
      submittedAt: '2026-09-11T12:00:00.000Z'
    }));

    const text = generateShareText({
      cycleId: '2026-09-11',
      status: 'LOST',
      guesses: sixFailedGuesses
    });

    expect(text).toContain('Cruzadas.online');
    expect(text).toContain('X/6');
    expect(text).toContain('⬛⬛⬛⬛⬛');
    expect(text).not.toContain('PEDRO');
    expect(text).not.toContain('GRAÇA');
  });

  describe('shareResult dispatcher', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('uses navigator.share when available and invokes callback', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { share: shareMock });

      const onShareCompleted = vi.fn();
      const result = await shareResult({
        text: 'test share text',
        onShareCompleted
      });

      expect(shareMock).toHaveBeenCalledWith({ text: 'test share text' });
      expect(onShareCompleted).toHaveBeenCalledWith('web_share');
      expect(result.channel).toBe('web_share');
      expect(result.success).toBe(true);
    });

    it('falls back to navigator.clipboard.writeText when navigator.share is unavailable', async () => {
      // Delete or set navigator.share to undefined
      Object.assign(navigator, { share: undefined });
      const clipboardMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: clipboardMock }
      });

      const onShareCompleted = vi.fn();
      const result = await shareResult({
        text: 'test share text',
        onShareCompleted
      });

      expect(clipboardMock).toHaveBeenCalledWith('test share text');
      expect(onShareCompleted).toHaveBeenCalledWith('clipboard');
      expect(result.channel).toBe('clipboard');
      expect(result.success).toBe(true);
    });
  });
});
