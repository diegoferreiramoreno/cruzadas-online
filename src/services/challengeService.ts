import type { DailyChallenge } from '../types';

export async function fetchChallenge(cycleId?: string): Promise<DailyChallenge> {
  const isDefaultToday = !cycleId;
  const preloadedPromise = isDefaultToday && typeof window !== 'undefined' ? (window as any).__todayChallengePromise : null;
  if (preloadedPromise) {
    (window as any).__todayChallengePromise = null;
    try {
      const response = await preloadedPromise;
      if (response.status === 404) {
        throw new Error('Challenge not found or future cycle requested');
      }
      if (response.status === 400) {
        throw new Error('Malformed date parameter');
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch challenge: HTTP ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as DailyChallenge;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Challenge not found') || error.message.includes('Malformed date'))) {
        throw error;
      }
      // Fallback to direct fetch on network or transient error
    }
  }

  const url = cycleId ? `/api/challenge/today?date=${encodeURIComponent(cycleId)}` : '/api/challenge/today';
  
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(`Network error: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (response.status === 404) {
    throw new Error('Challenge not found or future cycle requested');
  }

  if (response.status === 400) {
    throw new Error('Malformed date parameter');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch challenge: HTTP ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as DailyChallenge;
  return data;
}
