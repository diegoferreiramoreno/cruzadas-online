import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../../../worker/index';

describe('Telemetry Contract & Ingestion (US4 / T058)', () => {
  let mockStatements: string[] = [];
  let mockEnv: { DB: any };

  beforeEach(() => {
    mockStatements = [];
    const mockDb = {
      prepare: vi.fn().mockImplementation((query: string) => {
        return {
          bind: vi.fn().mockImplementation((...args: any[]) => {
            mockStatements.push(JSON.stringify({ query, args }));
            return {
              run: vi.fn().mockResolvedValue({ success: true })
            };
          })
        };
      })
    };
    mockEnv = { DB: mockDb };
  });

  const sendTelemetry = (payload: any) => {
    return worker.fetch(
      new Request('https://cruzadas.online/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      mockEnv
    );
  };

  describe('Validation of Supported Events (HTTP 204 on success)', () => {
    it('accepts valid page_view event', async () => {
      const res = await sendTelemetry({
        eventType: 'page_view',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:45:00.000Z'
      });
      expect(res.status).toBe(204);
      expect(mockStatements.length).toBe(1);
      expect(mockStatements[0]).toContain('page_view');
    });

    it('accepts valid game_started event', async () => {
      const res = await sendTelemetry({
        eventType: 'game_started',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:46:10.000Z'
      });
      expect(res.status).toBe(204);
      expect(mockStatements[0]).toContain('game_started');
    });

    it('accepts valid game_completed event with attemptsUsed and outcome', async () => {
      const res = await sendTelemetry({
        eventType: 'game_completed',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:48:30.000Z',
        properties: {
          outcome: 'won',
          attemptsUsed: 4,
          originCycleId: '2026-09-11',
          currentStreak: 1
        }
      });
      expect(res.status).toBe(204);
      expect(mockStatements[0]).toContain('won_attempt_4');
    });

    it('accepts valid cohort_started event', async () => {
      const res = await sendTelemetry({
        eventType: 'cohort_started',
        cycleId: '2026-09-12',
        timestamp: '2026-09-12T13:48:30.000Z',
        properties: {
          cohortCycleId: '2026-09-10'
        }
      });
      expect(res.status).toBe(204);
      expect(mockStatements[0]).toContain('cohort_metrics');
      expect(mockStatements[0]).toContain('started');
    });

    it('accepts valid cohort_milestone event for D1, D7, and D14', async () => {
      for (const milestone of ['D1', 'D7', 'D14'] as const) {
        mockStatements = [];
        const res = await sendTelemetry({
          eventType: 'cohort_milestone',
          cycleId: '2026-09-17',
          timestamp: '2026-09-17T10:15:00.000Z',
          properties: {
            cohortCycleId: '2026-09-10',
            milestone
          }
        });
        expect(res.status).toBe(204);
        expect(mockStatements[0]).toContain(milestone);
      }
    });

    it('accepts valid share_clicked event', async () => {
      const res = await sendTelemetry({
        eventType: 'share_clicked',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:49:00.000Z',
        properties: {
          shareChannel: 'clipboard'
        }
      });
      expect(res.status).toBe(204);
      expect(mockStatements[0]).toContain('share_clicked');
    });

    it('accepts valid interest_expressed event', async () => {
      const res = await sendTelemetry({
        eventType: 'interest_expressed',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: {
          interestTopic: 'general_support'
        }
      });
      expect(res.status).toBe(204);
      expect(mockStatements[0]).toContain('interest_expressed');
    });
  });

  describe('Rejection of Malformed / Unsupported Payloads (HTTP 400)', () => {
    it('rejects game_abandoned event (intentionally excluded from MVP)', async () => {
      const res = await sendTelemetry({
        eventType: 'game_abandoned',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z'
      });
      expect(res.status).toBe(400);
    });

    it('rejects unknown eventType', async () => {
      const res = await sendTelemetry({
        eventType: 'arbitrary_event',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z'
      });
      expect(res.status).toBe(400);
    });

    it('rejects malformed or impossible cycleId', async () => {
      const res1 = await sendTelemetry({
        eventType: 'page_view',
        cycleId: 'invalid-date',
        timestamp: '2026-09-11T13:50:00.000Z'
      });
      expect(res1.status).toBe(400);

      const res2 = await sendTelemetry({
        eventType: 'page_view',
        cycleId: '2026-02-30', // Impossible calendar date
        timestamp: '2026-09-11T13:50:00.000Z'
      });
      expect(res2.status).toBe(400);
    });

    it('rejects invalid or non-ISO timestamps', async () => {
      const res1 = await sendTelemetry({
        eventType: 'page_view',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11' // Missing time/ISO parts
      });
      expect(res1.status).toBe(400);

      const res2 = await sendTelemetry({
        eventType: 'page_view',
        cycleId: '2026-09-11',
        timestamp: 'invalid-timestamp'
      });
      expect(res2.status).toBe(400);
    });

    it('rejects share_clicked with invalid or missing shareChannel without silent coercion', async () => {
      const res1 = await sendTelemetry({
        eventType: 'share_clicked',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: { shareChannel: 'twitter' }
      });
      expect(res1.status).toBe(400);

      const res2 = await sendTelemetry({
        eventType: 'share_clicked',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: {}
      });
      expect(res2.status).toBe(400);
    });

    it('rejects interest_expressed with invalid or missing interestTopic', async () => {
      const res1 = await sendTelemetry({
        eventType: 'interest_expressed',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: { interestTopic: 'newsletter' }
      });
      expect(res1.status).toBe(400);

      const res2 = await sendTelemetry({
        eventType: 'interest_expressed',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z'
      });
      expect(res2.status).toBe(400);
    });

    it('rejects cohort_started with impossible cohortCycleId date', async () => {
      const res = await sendTelemetry({
        eventType: 'cohort_started',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: { cohortCycleId: '2026-13-45' }
      });
      expect(res.status).toBe(400);
    });

    it('rejects game_completed with attemptsUsed outside 1..6', async () => {
      const res1 = await sendTelemetry({
        eventType: 'game_completed',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: { outcome: 'won', attemptsUsed: 7 }
      });
      expect(res1.status).toBe(400);

      const res2 = await sendTelemetry({
        eventType: 'game_completed',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: { outcome: 'won', attemptsUsed: 0 }
      });
      expect(res2.status).toBe(400);
    });

    it('rejects cohort_milestone with invalid milestone name (e.g. D30)', async () => {
      const res = await sendTelemetry({
        eventType: 'cohort_milestone',
        cycleId: '2026-09-11',
        timestamp: '2026-09-11T13:50:00.000Z',
        properties: {
          cohortCycleId: '2026-09-01',
          milestone: 'D30'
        }
      });
      expect(res.status).toBe(400);
    });

    it('gracefully returns HTTP 204 when D1 throws quota error', async () => {
      const errorDb = {
        prepare: vi.fn().mockImplementation(() => ({
          bind: vi.fn().mockImplementation(() => ({
            run: vi.fn().mockRejectedValue(new Error('D1_ERROR: storage limit reached'))
          }))
        }))
      };

      const res = await worker.fetch(
        new Request('https://cruzadas.online/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'page_view',
            cycleId: '2026-09-11',
            timestamp: '2026-09-11T13:45:00.000Z'
          })
        }),
        { DB: errorDb as any }
      );

      expect(res.status).toBe(204);
    });
  });

  describe('Worker GET /api/challenge/today Validations', () => {
    it('returns 400 for invalid date format', async () => {
      const res = await worker.fetch(
        new Request('https://cruzadas.online/api/challenge/today?date=invalid-date'),
        mockEnv
      );
      expect(res.status).toBe(400);
    });

    it('returns 400 for impossible calendar date', async () => {
      const res = await worker.fetch(
        new Request('https://cruzadas.online/api/challenge/today?date=2026-02-30'),
        mockEnv
      );
      expect(res.status).toBe(400);
    });

    it('returns 404 for valid future date', async () => {
      const res = await worker.fetch(
        new Request('https://cruzadas.online/api/challenge/today?date=2099-01-01'),
        mockEnv
      );
      expect(res.status).toBe(404);
    });

    it('returns 404 for valid unavailable past date', async () => {
      const res = await worker.fetch(
        new Request('https://cruzadas.online/api/challenge/today?date=2020-01-01'),
        mockEnv
      );
      expect(res.status).toBe(404);
    });
  });
});
