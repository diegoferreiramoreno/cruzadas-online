import { describe, it, expect, beforeEach, vi } from 'vitest';
import { emitTelemetry, checkAndEmitCohortMilestones } from '../../../src/services/telemetryService';
import type { PlayerStats } from '../../../src/types';

describe('Client Telemetry Service (Phase 7 / T060)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('emitTelemetry', () => {
    it('dispatches via navigator.sendBeacon when available', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.assign(navigator, { sendBeacon: sendBeaconMock });

      emitTelemetry({
        eventType: 'page_view',
        cycleId: '2026-09-11'
      });

      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
      expect(sendBeaconMock.mock.calls[0][0]).toBe('/api/telemetry');
    });

    it('falls back to fetch(keepalive) when sendBeacon returns false or is absent', () => {
      Object.assign(navigator, { sendBeacon: undefined });
      const fetchMock = vi.fn().mockResolvedValue({ status: 204 });
      globalThis.fetch = fetchMock;

      emitTelemetry({
        eventType: 'game_started',
        cycleId: '2026-09-11'
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toBe('/api/telemetry');
      expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
    });

    it('does not throw or disrupt application when network throws', () => {
      Object.assign(navigator, { sendBeacon: undefined });
      globalThis.fetch = vi.fn().mockImplementation(() => {
        throw new Error('Network failure');
      });

      expect(() => {
        emitTelemetry({
          eventType: 'page_view',
          cycleId: '2026-09-11'
        });
      }).not.toThrow();
    });
  });

  describe('checkAndEmitCohortMilestones', () => {
    const baseStats: PlayerStats = {
      version: 1,
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0 },
      lastCompletedCycleId: '2026-09-10',
      completedCycleIds: ['2026-09-10'],
      cohortCycleId: '2026-09-10',
      reportedMilestones: []
    };

    it('emits D1 when completion occurs exactly 1 day after cohortCycleId', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.assign(navigator, { sendBeacon: sendBeaconMock });

      const updated = checkAndEmitCohortMilestones(baseStats, '2026-09-11');
      expect(updated).toEqual(['D1']);
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    });

    it('emits D7 when completion occurs exactly 7 days after cohortCycleId', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.assign(navigator, { sendBeacon: sendBeaconMock });

      const updated = checkAndEmitCohortMilestones(baseStats, '2026-09-17');
      expect(updated).toEqual(['D7']);
      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    });

    it('does not emit duplicate milestone if already present in reportedMilestones', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.assign(navigator, { sendBeacon: sendBeaconMock });

      const statsWithD1: PlayerStats = {
        ...baseStats,
        reportedMilestones: ['D1']
      };

      const updated = checkAndEmitCohortMilestones(statsWithD1, '2026-09-11');
      expect(updated).toEqual(['D1']);
      expect(sendBeaconMock).not.toHaveBeenCalled();
    });

    it('does not emit milestone when day gap does not match D1, D7, or D14 (e.g. Day 3)', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true);
      Object.assign(navigator, { sendBeacon: sendBeaconMock });

      const updated = checkAndEmitCohortMilestones(baseStats, '2026-09-13'); // 3 days after Day 10
      expect(updated).toEqual([]);
      expect(sendBeaconMock).not.toHaveBeenCalled();
    });
  });
});
