import type { GameSession, PlayerStats } from '../types';

export const SESSION_STORAGE_KEY = 'cruzadas_session_v1';
export const STATS_STORAGE_KEY = 'cruzadas_stats_v1';

export const INITIAL_STATS: PlayerStats = {
  version: 1,
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
  },
  lastCompletedCycleId: null,
  completedCycleIds: [],
  cohortCycleId: null,
  reportedMilestones: []
};

/**
 * Loads current game session from localStorage.
 * Returns null if no session is stored or on corrupt JSON.
 */
export function loadSession(): GameSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !parsed.originCycleId) {
      return null;
    }
    return parsed as GameSession;
  } catch {
    return null;
  }
}

/**
 * Saves game session to localStorage safely.
 */
export function saveSession(session: GameSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    // Catch QuotaExceededError or security exceptions gracefully
    console.warn('Failed to save game session to localStorage:', err);
  }
}

/**
 * Clears active game session from localStorage.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear session from localStorage:', err);
  }
}

/**
 * Loads player stats from localStorage, returning INITIAL_STATS fallback.
 */
export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return { ...INITIAL_STATS };
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.version !== 1 ||
      typeof parsed.gamesPlayed !== 'number' ||
      typeof parsed.gamesWon !== 'number' ||
      !parsed.guessDistribution
    ) {
      return { ...INITIAL_STATS };
    }
    return parsed as PlayerStats;
  } catch {
    return { ...INITIAL_STATS };
  }
}

/**
 * Saves player stats to localStorage safely.
 */
export function saveStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save player stats to localStorage:', err);
  }
}
