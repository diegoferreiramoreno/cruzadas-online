import { describe, it, expect } from 'vitest';
import { calculateStreaks } from '../../../src/services/streakService';

describe('Streak Calculation Service (US2 / T043)', () => {
  it('returns zero streaks when no games are completed', () => {
    const result = calculateStreaks([], '2026-09-11');
    expect(result).toEqual({ currentStreak: 0, maxStreak: 0 });
  });

  it('calculates current streak of 1 when today is the only completed day', () => {
    const result = calculateStreaks(['2026-09-11'], '2026-09-11');
    expect(result).toEqual({ currentStreak: 1, maxStreak: 1 });
  });

  it('calculates current streak of 1 when yesterday was completed and today is not completed yet', () => {
    // If today is 2026-09-12 and yesterday (2026-09-11) was completed, streak is alive at 1 until today expires
    const result = calculateStreaks(['2026-09-11'], '2026-09-12');
    expect(result).toEqual({ currentStreak: 1, maxStreak: 1 });
  });

  it('increments streak on consecutive days', () => {
    const completed = ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'];
    const result = calculateStreaks(completed, '2026-09-11');
    expect(result).toEqual({ currentStreak: 4, maxStreak: 4 });
  });

  it('resets current streak to 0 if more than 1 day has passed without play', () => {
    // Played on 2026-09-08 and 2026-09-09. Then missed 2026-09-10. Today is 2026-09-11.
    const completed = ['2026-09-08', '2026-09-09'];
    const result = calculateStreaks(completed, '2026-09-11');
    expect(result).toEqual({ currentStreak: 0, maxStreak: 2 });
  });

  it('handles canonical delayed session scenario: Day 10 start, Day 11 missed, Day 12 completion', () => {
    // Scenario: User starts Day 10 game, abandons/leaves tab open. Day 11 passes.
    // User resumes and completes Day 10 game on Day 12.
    // Step 1: Completion is attributed strictly to Day 10 ('2026-09-10').
    // As of Day 12 ('2026-09-12'), Day 11 was missed, so currentStreak is 0.
    const step1 = calculateStreaks(['2026-09-10'], '2026-09-12');
    expect(step1).toEqual({ currentStreak: 0, maxStreak: 1 });

    // Step 2: User now plays and completes Day 12 ('2026-09-12').
    // Day 11 is still missing, so Day 12 starts a new streak of 1.
    const step2 = calculateStreaks(['2026-09-10', '2026-09-12'], '2026-09-12');
    expect(step2).toEqual({ currentStreak: 1, maxStreak: 1 });
  });

  it('preserves historical maxStreak even if current streak resets to 0', () => {
    // Historical 5-day streak in August
    const completed = [
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
      '2026-08-05'
    ];
    const result = calculateStreaks(completed, '2026-09-11');
    expect(result).toEqual({ currentStreak: 0, maxStreak: 5 });
  });

  it('handles unordered or duplicate dates cleanly', () => {
    const completed = ['2026-09-10', '2026-09-09', '2026-09-10', '2026-09-11'];
    const result = calculateStreaks(completed, '2026-09-11');
    expect(result).toEqual({ currentStreak: 3, maxStreak: 3 });
  });
});
