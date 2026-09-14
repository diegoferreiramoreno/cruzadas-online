import type { TelemetryEventType, TelemetryPayload, PlayerStats } from '../types';

const TELEMETRY_ENDPOINT = '/api/telemetry';

export interface EmitTelemetryOptions {
  eventType: TelemetryEventType;
  cycleId: string;
  properties?: TelemetryPayload['properties'];
}

/**
 * Dispatches an anonymous aggregated telemetry signal via sendBeacon or fetch(keepalive).
 * Fire-and-forget: completely safe against network failures.
 */
export function emitTelemetry({
  eventType,
  cycleId,
  properties
}: EmitTelemetryOptions): void {
  try {
    const payload: TelemetryPayload = {
      eventType,
      cycleId,
      timestamp: new Date().toISOString(),
      properties
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json'
    });

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const sent = navigator.sendBeacon(TELEMETRY_ENDPOINT, blob);
      if (sent) return;
    }

    // Fallback to fetch with keepalive: true
    if (typeof fetch === 'function') {
      fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {
        // Silently swallow network errors
      });
    }
  } catch (err) {
    // Non-blocking catch
    console.warn('Telemetry emission skipped:', err);
  }
}

/**
 * Checks if current completion matches a D1, D7, or D14 cohort milestone relative to cohortCycleId.
 * If eligible and not previously reported, emits cohort_milestone and returns updated reportedMilestones array.
 */
export function checkAndEmitCohortMilestones(
  stats: PlayerStats,
  currentCycleId: string
): Array<'D1' | 'D7' | 'D14'> {
  if (!stats.cohortCycleId) {
    return stats.reportedMilestones;
  }

  const cohortDate = new Date(stats.cohortCycleId + 'T12:00:00Z');
  const currentDate = new Date(currentCycleId + 'T12:00:00Z');
  const diffDays = Math.round(
    (currentDate.getTime() - cohortDate.getTime()) / 86400000
  );

  let targetMilestone: 'D1' | 'D7' | 'D14' | null = null;
  if (diffDays === 1) targetMilestone = 'D1';
  else if (diffDays === 7) targetMilestone = 'D7';
  else if (diffDays === 14) targetMilestone = 'D14';

  if (targetMilestone && !stats.reportedMilestones.includes(targetMilestone)) {
    emitTelemetry({
      eventType: 'cohort_milestone',
      cycleId: currentCycleId,
      properties: {
        cohortCycleId: stats.cohortCycleId,
        milestone: targetMilestone
      }
    });

    return [...stats.reportedMilestones, targetMilestone];
  }

  return stats.reportedMilestones;
}
