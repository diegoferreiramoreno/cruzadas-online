import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../../src/App';
import { saveStats, INITIAL_STATS } from '../../src/services/storageService';
import type { DailyChallenge, PlayerStats } from '../../src/types';

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

describe('Cross-Cutting Telemetry Integration (Phase 7 / T061)', () => {
  let emittedEvents: Array<{ eventType: string; cycleId: string; properties?: any }> = [];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    emittedEvents = [];

    // Mock sendBeacon and clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      sendBeacon: vi.fn().mockImplementation((_url: string, data: any) => {
        if (data instanceof Blob) {
          // Parse blob text synchronously for assertions
          const reader = new FileReader();
          reader.onload = () => {
            try {
              emittedEvents.push(JSON.parse(reader.result as string));
            } catch {}
          };
          reader.readAsText(data);
        }
        return true;
      })
    });

    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: any) => {
      if (url.includes('/api/telemetry')) {
        if (init?.body) {
          try {
            emittedEvents.push(JSON.parse(init.body as string));
          } catch {}
        }
        return Promise.resolve({ ok: true, status: 204 } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockChallenge
      } as Response);
    });
  });

  const clickLetter = (letter: string) => {
    const button = document.querySelector(`button[data-key="${letter}"]`);
    if (!button) throw new Error(`Key button ${letter} not found`);
    fireEvent.click(button);
  };

  it('emits page_view, game_started, game_completed, cohort_started, share_clicked, and interest_expressed across gameplay', async () => {
    render(<App />);

    // 1. page_view emitted on initial load
    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
      expect(emittedEvents.some((e) => e.eventType === 'page_view')).toBe(true);
    });

    // 2. First guess submission triggers game_started
    ['P', 'E', 'D', 'R', 'O'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    await waitFor(() => {
      expect(emittedEvents.some((e) => e.eventType === 'game_started')).toBe(true);
    });

    // 3. Winning guess triggers game_completed and cohort_started (first lifetime win)
    ['G', 'R', 'A', 'C', 'A'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Parabéns!/i)).toBeInTheDocument();
      expect(
        emittedEvents.some(
          (e) =>
            e.eventType === 'game_completed' &&
            e.properties?.outcome === 'won' &&
            e.properties?.attemptsUsed === 2
        )
      ).toBe(true);
      expect(
        emittedEvents.some(
          (e) =>
            e.eventType === 'cohort_started' &&
            e.properties?.cohortCycleId === '2026-09-11'
        )
      ).toBe(true);
    });

    // 4. Clicking share button triggers share_clicked
    const shareBtn = screen.getByRole('button', { name: /Compartilhar Desempenho/i });
    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(emittedEvents.some((e) => e.eventType === 'share_clicked')).toBe(true);
    });

    // 5. Clicking interest button triggers interest_expressed
    const interestBtn = screen.getByRole('button', { name: /Tenho interesse no projeto/i });
    fireEvent.click(interestBtn);

    await waitFor(() => {
      expect(
        emittedEvents.some(
          (e) =>
            e.eventType === 'interest_expressed' &&
            e.properties?.interestTopic === 'general_support'
        )
      ).toBe(true);
    });
  });

  it('emits cohort_milestone D1 when returning user with Day 10 cohort finishes on Day 11', async () => {
    // Setup pre-existing player with cohort on 2026-09-10
    const returningStats: PlayerStats = {
      ...INITIAL_STATS,
      gamesPlayed: 1,
      gamesWon: 1,
      completedCycleIds: ['2026-09-10'],
      lastCompletedCycleId: '2026-09-10',
      cohortCycleId: '2026-09-10',
      reportedMilestones: []
    };
    saveStats(returningStats);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('"Dom gratuito de Deus"')).toBeInTheDocument();
    });

    // Win today (2026-09-11 = Day 11, exactly 1 day after Day 10)
    ['G', 'R', 'A', 'C', 'A'].forEach(clickLetter);
    fireEvent.click(screen.getByRole('button', { name: /^ENTER$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Parabéns!/i)).toBeInTheDocument();
      expect(
        emittedEvents.some(
          (e) =>
            e.eventType === 'cohort_milestone' &&
            e.properties?.milestone === 'D1' &&
            e.properties?.cohortCycleId === '2026-09-10'
        )
      ).toBe(true);
    });
  });
});
