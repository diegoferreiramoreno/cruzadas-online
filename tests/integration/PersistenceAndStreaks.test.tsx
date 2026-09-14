import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { App } from '../../src/App';
import { saveSession, loadStats, saveStats, INITIAL_STATS } from '../../src/services/storageService';
import type { DailyChallenge, GameSession } from '../../src/types';

const mockTodayChallenge: DailyChallenge = {
  id: 'cruzadas-2026-09-12',
  cycleDate: '2026-09-12',
  word: 'GRAÇA',
  normalizedWord: 'GRACA',
  wordLength: 5,
  initialClue: 'Dom gratuito de Deus',
  postGameContext: 'Graça santificante',
  sourceCitation: 'Catecismo § 1996',
  sourceCategory: 'Catecismo da Igreja Católica',
  editorialStatus: 'Verified'
};

const mockDay10Challenge: DailyChallenge = {
  id: 'cruzadas-2026-09-10',
  cycleDate: '2026-09-10',
  word: 'PEDRO',
  normalizedWord: 'PEDRO',
  wordLength: 5,
  initialClue: 'O Apóstolo e primeira rocha',
  postGameContext: 'Tu és Pedro',
  sourceCitation: 'Mateus 16:18',
  sourceCategory: 'Sagrada Escritura',
  editorialStatus: 'Verified'
};

describe('Persistence and Streaks Integration (US2 / T048, T049)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-12T12:00:00-03:00'));

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('date=2026-09-10')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockDay10Challenge
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockTodayChallenge
      } as Response);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const clickLetter = (letter: string) => {
    const button = document.querySelector(`button[data-key="${letter}"]`);
    if (!button) throw new Error(`Key button ${letter} not found`);
    fireEvent.click(button);
  };

  it('restores in-progress session and guesses on page load', async () => {
    const existingSession: GameSession = {
      version: 1,
      originCycleId: '2026-09-12',
      wordLength: 5,
      status: 'IN_PROGRESS',
      startedAt: '2026-09-12T10:00:00.000Z',
      completedAt: null,
      lastActivityAt: '2026-09-12T10:02:00.000Z',
      guesses: [
        {
          attemptIndex: 0,
          rawInput: 'PEDRO',
          normalizedInput: 'PEDRO',
          submittedAt: '2026-09-12T10:02:00.000Z',
          evaluations: [
            { letter: 'P', status: 'absent' },
            { letter: 'E', status: 'absent' },
            { letter: 'D', status: 'absent' },
            { letter: 'R', status: 'present' },
            { letter: 'O', status: 'absent' }
          ]
        }
      ]
    };
    saveSession(existingSession);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
      expect(screen.getByLabelText(/Tentativa submetida: PEDRO/i)).toBeInTheDocument();
    });

    // Keyboard status reflects loaded guess
    expect(screen.getByRole('button', { name: /^R, presente/i })).toBeInTheDocument();
  });

  it('locks replay when today cycle is already completed and displays post-game modal', async () => {
    const completedSession: GameSession = {
      version: 1,
      originCycleId: '2026-09-12',
      wordLength: 5,
      status: 'WON',
      startedAt: '2026-09-12T10:00:00.000Z',
      completedAt: '2026-09-12T10:05:00.000Z',
      lastActivityAt: '2026-09-12T10:05:00.000Z',
      guesses: [
        {
          attemptIndex: 0,
          rawInput: 'GRAÇA',
          normalizedInput: 'GRACA',
          submittedAt: '2026-09-12T10:05:00.000Z',
          evaluations: [
            { letter: 'G', status: 'correct' },
            { letter: 'R', status: 'correct' },
            { letter: 'A', status: 'correct' },
            { letter: 'C', status: 'correct' },
            { letter: 'A', status: 'correct' }
          ]
        }
      ]
    };
    saveSession(completedSession);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Parabéns!/i)).toBeInTheDocument();
      expect(screen.getByText(/^GRAÇA$/i)).toBeInTheDocument();
    });
  });

  it('handles canonical delayed session (Day 10 resumed on Day 12), attributes to Day 10, sets currentStreak = 0 as of Day 12', async () => {
    // In-progress session from Day 10
    const delayedSession: GameSession = {
      version: 1,
      originCycleId: '2026-09-10',
      wordLength: 5,
      status: 'IN_PROGRESS',
      startedAt: '2026-09-10T20:00:00.000Z',
      completedAt: null,
      lastActivityAt: '2026-09-10T20:02:00.000Z',
      guesses: []
    };
    saveSession(delayedSession);

    render(<App />);

    // Resumes Day 10 challenge
    await waitFor(() => {
      expect(screen.getByText('"O Apóstolo e primeira rocha"')).toBeInTheDocument();
    });

    // Win the Day 10 challenge
    ['P', 'E', 'D', 'R', 'O'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Parabéns!/i)).toBeInTheDocument();
      expect(screen.getByText(/^PEDRO$/i)).toBeInTheDocument();
    });

    // Verify stats in localStorage:
    // Attributed to Day 10 ('2026-09-10')
    // As of today (2026-09-12), Day 11 was missed, so currentStreak = 0, maxStreak = 1
    const stats = loadStats();
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.gamesWon).toBe(1);
    expect(stats.completedCycleIds).toContain('2026-09-10');
    expect(stats.completedCycleIds).not.toContain('2026-09-11');
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(1);
    expect(stats.cohortCycleId).toBe('2026-09-10');

    // Close/acknowledge the historical result modal
    const closeBtn = screen.getByRole('button', { name: /Fechar/i });
    fireEvent.click(closeBtn);

    // Day 12 challenge automatically becomes playable without page reload
    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
      expect(screen.queryByText(/Parabéns!/i)).not.toBeInTheDocument();
    });

    // Complete Day 12 challenge
    ['G', 'R', 'A', 'C', 'A'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Parabéns!/i)).toBeInTheDocument();
      expect(screen.getByText(/^GRAÇA$/i)).toBeInTheDocument();
    });

    // Verify stats after Day 12 completion:
    // Both Day 10 and Day 12 completed, Day 11 absent
    // With today = 2026-09-12 and Day 12 completed, currentStreak is 1!
    const statsAfterDay12 = loadStats();
    expect(statsAfterDay12.gamesPlayed).toBe(2);
    expect(statsAfterDay12.gamesWon).toBe(2);
    expect(statsAfterDay12.completedCycleIds).toEqual(['2026-09-10', '2026-09-12']);
    expect(statsAfterDay12.currentStreak).toBe(1);
    expect(statsAfterDay12.maxStreak).toBe(1);
  });

  it('opens and closes StatsModal via Header button', async () => {
    saveStats({
      ...INITIAL_STATS,
      gamesPlayed: 5,
      gamesWon: 4,
      currentStreak: 2,
      maxStreak: 3
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    const statsBtn = screen.getByRole('button', { name: /Estatísticas/i });
    fireEvent.click(statsBtn);

    expect(screen.getByText('Estatísticas do Jogador')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument(); // 4/5 = 80%
    expect(screen.getByText('Sequência')).toBeInTheDocument();
  });
});
