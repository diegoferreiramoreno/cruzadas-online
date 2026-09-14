import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../../src/App';
import type { DailyChallenge } from '../../src/types';

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

describe('GameFlow Integration (US1)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/challenge/today')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockChallenge
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  const clickLetter = (letter: string) => {
    const button = document.querySelector(`button[data-key="${letter}"]`);
    if (!button) throw new Error(`Key button ${letter} not found`);
    fireEvent.click(button);
  };

  it('renders board, clue, header, and keyboard when challenge loads', async () => {
    render(<App />);

    expect(screen.getByText(/Carregando o enigma de hoje.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    expect(screen.getByRole('region', { name: /tabuleiro do jogo/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /teclado virtual/i })).toBeInTheDocument();
  });

  it('rejects short guesses with FeedbackAlert and does not consume attempt', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    // Type 3 letters: G, R, A
    clickLetter('G');
    clickLetter('R');
    clickLetter('A');

    // Press ENTER
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    // Feedback alert appears
    expect(screen.getByText('Letras insuficientes')).toBeInTheDocument();

    // No evaluated attempts submitted
    expect(screen.queryByLabelText(/Tentativa submetida/i)).not.toBeInTheDocument();
  });

  it('rejects unknown vocabulary words with FeedbackAlert', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    // Type 5 letters not in vocabulary: Z, Z, Z, Z, Z
    for (let i = 0; i < 5; i++) {
      clickLetter('Z');
    }

    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    expect(screen.getByText('Palavra não encontrada no vocabulário')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Tentativa submetida/i)).not.toBeInTheDocument();
  });

  it('submits valid guess, updates keyboard colors, and opens PostGameModal on win', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    // Guess 'PEDRO' (present/absent)
    ['P', 'E', 'D', 'R', 'O'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    // Attempt consumed
    await waitFor(() => {
      expect(screen.getByLabelText(/Tentativa submetida: PEDRO/i)).toBeInTheDocument();
    });

    // Keyboard updated: R should now be present
    expect(screen.getByRole('button', { name: /^R, presente/i })).toBeInTheDocument();

    // Now guess 'GRACA' (win!)
    ['G', 'R', 'A', 'C', 'A'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    // Win modal opens with post game context and citation
    await waitFor(() => {
      expect(screen.getByText(/Parabéns!/i)).toBeInTheDocument();
      expect(screen.getByText(/^GRAÇA$/i)).toBeInTheDocument();
      expect(screen.getByText(/"Graça santificante"/i)).toBeInTheDocument();
      expect(screen.getByText(/Catecismo § 1996/i)).toBeInTheDocument();
      expect(screen.getByText(/Catecismo da Igreja Católica/i)).toBeInTheDocument();
    });
  });

  it('allows losing after 6 failed attempts and shows PostGameModal with word', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    // Submit 6 valid guesses that are not GRACA, e.g. PEDRO 6 times
    for (let attempt = 0; attempt < 6; attempt++) {
      ['P', 'E', 'D', 'R', 'O'].forEach(clickLetter);
      fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));
      await waitFor(() => {
        expect(screen.getAllByLabelText(/Tentativa submetida: PEDRO/i)).toHaveLength(attempt + 1);
      });
    }

    // Modal opens for loss
    await waitFor(() => {
      expect(screen.getByText(/Fim de Jogo/i)).toBeInTheDocument();
      expect(screen.getByText(/Você esgotou as 6 tentativas de hoje./i)).toBeInTheDocument();
      expect(screen.getByText(/^GRAÇA$/i)).toBeInTheDocument();
    });
  });

  it('accepts MISSA as a legitimate attempt, consumes one attempt, and gives feedback', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    ['M', 'I', 'S', 'S', 'A'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Tentativa submetida: MISSA/i)).toBeInTheDocument();
    });

    // Attempt consumed (1 out of 6 rows filled)
    expect(screen.getAllByLabelText(/Tentativa submetida/i)).toHaveLength(1);
    // Letter A is present in GRACA at 5th position (correct)
    expect(screen.getByRole('button', { name: /^A, correta/i })).toBeInTheDocument();
  });

  it('rejects invalid nonwords like AAAAA without consuming attempts', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    for (let i = 0; i < 5; i++) {
      clickLetter('A');
    }
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    expect(screen.getByText('Palavra não encontrada no vocabulário')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Tentativa submetida/i)).not.toBeInTheDocument();
  });
});


