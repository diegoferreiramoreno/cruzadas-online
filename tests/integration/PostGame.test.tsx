import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostGameModal } from '../../src/components/modals/PostGameModal';
import type { DailyChallenge } from '../../src/types';
import type { GuessAttempt } from '../../src/engine/types';

const mockChallenge: DailyChallenge = {
  id: 'cruzadas-2026-09-11',
  cycleDate: '2026-09-11',
  word: 'GRAÇA',
  normalizedWord: 'GRACA',
  wordLength: 5,
  initialClue: 'Dom gratuito de Deus',
  postGameContext: 'Graça santificante',
  sourceCitation: 'Catecismo § 1996',
  sourceCategory: 'Catecismo da Igreja Católica',
  editorialStatus: 'Verified'
};

const mockGuesses: GuessAttempt[] = [
  {
    attemptIndex: 0,
    rawInput: 'GRAÇA',
    normalizedInput: 'GRACA',
    submittedAt: '2026-09-11T12:00:00.000Z',
    evaluations: [
      { letter: 'G', status: 'correct' },
      { letter: 'R', status: 'correct' },
      { letter: 'A', status: 'correct' },
      { letter: 'C', status: 'correct' },
      { letter: 'A', status: 'correct' }
    ]
  }
];

describe('PostGameModal Integration (US3 & US4 / T051, T055)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('US3: Sharing Action', () => {
    it('copies spoiler-free text to clipboard and invokes onShareCompleted exactly once', async () => {
      const clipboardMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        share: undefined,
        clipboard: { writeText: clipboardMock }
      });

      const onShareCompleted = vi.fn();

      render(
        <PostGameModal
          isOpen={true}
          onClose={() => {}}
          status="WON"
          attemptsCount={1}
          challenge={mockChallenge}
          guesses={mockGuesses}
          onShareCompleted={onShareCompleted}
        />
      );

      const shareButton = screen.getByRole('button', { name: /Compartilhar Desempenho/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Copiado para a área de transferência!')).toBeInTheDocument();
      });

      expect(clipboardMock).toHaveBeenCalledTimes(1);
      const copiedText = clipboardMock.mock.calls[0][0] as string;
      expect(copiedText).toContain('Cruzadas.online');
      expect(copiedText).toContain('1/6');
      expect(copiedText).toContain('🟩🟩🟩🟩🟩');
      expect(copiedText).not.toContain('GRAÇA');
      expect(copiedText).not.toContain('GRACA');

      expect(onShareCompleted).toHaveBeenCalledTimes(1);
      expect(onShareCompleted).toHaveBeenCalledWith('clipboard');
    });
  });

  describe('US4: Interest Support Card', () => {
    it('displays voluntary support card, responds to click, persists in localStorage, and calls onInterestExpressed exactly once', async () => {
      const onInterestExpressed = vi.fn();

      render(
        <PostGameModal
          isOpen={true}
          onClose={() => {}}
          status="WON"
          attemptsCount={1}
          challenge={mockChallenge}
          guesses={mockGuesses}
          onInterestExpressed={onInterestExpressed}
        />
      );

      expect(screen.getByText('Gostou da proposta do Cruzadas.online?')).toBeInTheDocument();
      const interestBtn = screen.getByRole('button', { name: /Tenho interesse no projeto/i });

      fireEvent.click(interestBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Que alegria saber disso! Obrigado pelo seu incentivo./i)
        ).toBeInTheDocument();
      });

      expect(onInterestExpressed).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('cruzadas_interest_2026-09-11')).toBe('true');
    });

    it('renders disabled gratitude message if interest was already expressed for this cycle', () => {
      localStorage.setItem('cruzadas_interest_2026-09-11', 'true');
      const onInterestExpressed = vi.fn();

      render(
        <PostGameModal
          isOpen={true}
          onClose={() => {}}
          status="WON"
          attemptsCount={1}
          challenge={mockChallenge}
          guesses={mockGuesses}
          onInterestExpressed={onInterestExpressed}
        />
      );

      expect(
        screen.getByText(/Que alegria saber disso! Obrigado pelo seu incentivo./i)
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Tenho interesse no projeto/i })).not.toBeInTheDocument();
      expect(onInterestExpressed).not.toHaveBeenCalled();
    });
  });
});
