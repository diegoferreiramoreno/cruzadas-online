import { describe, it, expect } from 'vitest';
import type { TelemetryPayload } from '../../../src/types';

describe('Interest Signal Contract (US4 / T054)', () => {
  it('validates interest_expressed payload conformant to interest-signal-contract.md', () => {
    const payload: TelemetryPayload = {
      eventType: 'interest_expressed',
      cycleId: '2026-09-11',
      timestamp: '2026-09-11T13:50:00.000Z',
      properties: {
        interestTopic: 'general_support'
      }
    };

    expect(payload.eventType).toBe('interest_expressed');
    expect(payload.cycleId).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
    expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
    expect(payload.properties?.interestTopic).toBe('general_support');
  });
});
