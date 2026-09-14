import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadSession,
  saveSession,
  clearSession,
  loadStats,
  saveStats,
  INITIAL_STATS
} from '../../../src/services/storageService';
import type { GameSession, PlayerStats } from '../../../src/types';

describe('Storage Service (US2 / T044)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Session Storage (cruzadas_session_v1)', () => {
    const mockSession: GameSession = {
      version: 1,
      originCycleId: '2026-09-11',
      wordLength: 5,
      status: 'IN_PROGRESS',
      startedAt: '2026-09-11T10:00:00.000Z',
      completedAt: null,
      lastActivityAt: '2026-09-11T10:05:00.000Z',
      guesses: []
    };

    it('saves and reloads session correctly', () => {
      saveSession(mockSession);
      const loaded = loadSession();
      expect(loaded).toEqual(mockSession);
    });

    it('clears session correctly', () => {
      saveSession(mockSession);
      clearSession();
      expect(loadSession()).toBeNull();
    });

    it('returns null on corrupt JSON in localStorage', () => {
      localStorage.setItem('cruzadas_session_v1', 'NOT_VALID_JSON{{{');
      expect(loadSession()).toBeNull();
    });

    it('survives quota exceeded exceptions on save', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      expect(() => saveSession(mockSession)).not.toThrow();
    });
  });

  describe('Stats Storage (cruzadas_stats_v1)', () => {
    it('returns INITIAL_STATS when nothing is stored', () => {
      const stats = loadStats();
      expect(stats).toEqual(INITIAL_STATS);
    });

    it('saves and loads stats correctly', () => {
      const customStats: PlayerStats = {
        ...INITIAL_STATS,
        gamesPlayed: 5,
        gamesWon: 4,
        currentStreak: 2,
        maxStreak: 3
      };
      saveStats(customStats);
      const loaded = loadStats();
      expect(loaded).toEqual(customStats);
    });

    it('returns INITIAL_STATS on corrupt JSON', () => {
      localStorage.setItem('cruzadas_stats_v1', 'corrupted_content');
      expect(loadStats()).toEqual(INITIAL_STATS);
    });

    it('survives quota exceeded exceptions on saveStats', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      expect(() => saveStats(INITIAL_STATS)).not.toThrow();
    });
  });
});
