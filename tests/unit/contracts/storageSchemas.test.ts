import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import fs from 'node:fs';
import path from 'node:path';
import type { GameSession, PlayerStats } from '../../../src/types';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const sessionSchemaPath = path.resolve(
  __dirname,
  '../../../specs/001-daily-challenge/contracts/session-storage-schema.json'
);
const statsSchemaPath = path.resolve(
  __dirname,
  '../../../specs/001-daily-challenge/contracts/stats-storage-schema.json'
);

const sessionSchema = JSON.parse(fs.readFileSync(sessionSchemaPath, 'utf-8'));
const statsSchema = JSON.parse(fs.readFileSync(statsSchemaPath, 'utf-8'));

const validateSession = ajv.compile<GameSession>(sessionSchema);
const validateStats = ajv.compile<PlayerStats>(statsSchema);

describe('Contract: Storage Schemas (US2 / T042)', () => {
  describe('GameSession Schema (cruzadas_session_v1)', () => {
    it('validates a valid in-progress game session', () => {
      const validSession: GameSession = {
        version: 1,
        originCycleId: '2026-09-11',
        wordLength: 5,
        status: 'IN_PROGRESS',
        startedAt: '2026-09-11T12:00:00.000Z',
        completedAt: null,
        lastActivityAt: '2026-09-11T12:05:00.000Z',
        guesses: [
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
            submittedAt: '2026-09-11T12:02:00.000Z'
          }
        ]
      };

      const isValid = validateSession(validSession);
      expect(isValid).toBe(true);
      expect(validateSession.errors).toBeNull();
    });

    it('validates a valid won session with completedAt timestamp', () => {
      const wonSession: GameSession = {
        version: 1,
        originCycleId: '2026-09-11',
        wordLength: 5,
        status: 'WON',
        startedAt: '2026-09-11T12:00:00.000Z',
        completedAt: '2026-09-11T12:04:30.000Z',
        lastActivityAt: '2026-09-11T12:04:30.000Z',
        guesses: [
          {
            attemptIndex: 0,
            rawInput: 'GRAÇA',
            normalizedInput: 'GRACA',
            evaluations: [
              { letter: 'G', status: 'correct' },
              { letter: 'R', status: 'correct' },
              { letter: 'A', status: 'correct' },
              { letter: 'C', status: 'correct' },
              { letter: 'A', status: 'correct' }
            ],
            submittedAt: '2026-09-11T12:04:30.000Z'
          }
        ]
      };

      const isValid = validateSession(wonSession);
      expect(isValid).toBe(true);
    });

    it('rejects session with invalid date or malformed properties', () => {
      const invalid = {
        version: 1,
        originCycleId: 'invalid-date',
        wordLength: 5,
        status: 'UNKNOWN_STATUS',
        startedAt: 'not-iso',
        completedAt: null,
        lastActivityAt: 'not-iso',
        guesses: []
      };

      const isValid = validateSession(invalid as any);
      expect(isValid).toBe(false);
      expect(validateSession.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('PlayerStats Schema (cruzadas_stats_v1)', () => {
    it('validates initial player stats state', () => {
      const initialStats: PlayerStats = {
        version: 1,
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        lastCompletedCycleId: null,
        completedCycleIds: [],
        cohortCycleId: null,
        reportedMilestones: []
      };

      const isValid = validateStats(initialStats);
      expect(isValid).toBe(true);
      expect(validateStats.errors).toBeNull();
    });

    it('validates stats with active streak and cohorts', () => {
      const activeStats: PlayerStats = {
        version: 1,
        gamesPlayed: 3,
        gamesWon: 3,
        currentStreak: 3,
        maxStreak: 3,
        guessDistribution: { 1: 0, 2: 1, 3: 2, 4: 0, 5: 0, 6: 0 },
        lastCompletedCycleId: '2026-09-11',
        completedCycleIds: ['2026-09-09', '2026-09-10', '2026-09-11'],
        cohortCycleId: '2026-09-09',
        reportedMilestones: ['D1']
      };

      const isValid = validateStats(activeStats);
      expect(isValid).toBe(true);
    });

    it('rejects stats with negative counters or missing histogram bins', () => {
      const invalidStats = {
        version: 1,
        gamesPlayed: -1,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0 },
        lastCompletedCycleId: null,
        completedCycleIds: [],
        cohortCycleId: null,
        reportedMilestones: []
      };

      const isValid = validateStats(invalidStats as any);
      expect(isValid).toBe(false);
    });
  });
});
