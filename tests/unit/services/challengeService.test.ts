import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchChallenge } from '../../../src/services/challengeService';
import type { DailyChallenge } from '../../../src/types';

const mockChallenge: DailyChallenge = {
  id: 'cruzadas-2026-09-11',
  cycleDate: '2026-09-11',
  word: 'GRAÇA',
  normalizedWord: 'GRACA',
  wordLength: 5,
  initialClue: 'Dom gratuito concedido por Deus para a salvação',
  postGameContext: 'Na teologia católica, a graça santificante é a infusão sobrenatural que nos faz participar da vida divina.',
  sourceCitation: 'Catecismo da Igreja Católica, § 1996-2000',
  sourceCategory: 'Catecismo da Igreja Católica',
  editorialStatus: 'Verified'
};

describe('challengeService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches current challenge from /api/challenge/today when no cycleId provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockChallenge
    } as Response);

    const challenge = await fetchChallenge();
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/challenge/today');
    expect(challenge).toEqual(mockChallenge);
  });

  it('fetches historical challenge from /api/challenge/today?date=YYYY-MM-DD when cycleId provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockChallenge
    } as Response);

    const challenge = await fetchChallenge('2026-09-11');
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/challenge/today?date=2026-09-11');
    expect(challenge).toEqual(mockChallenge);
  });

  it('throws 404 error when future date requested', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Challenge not found or future cycle requested' })
    } as Response);

    await expect(fetchChallenge('2099-01-01')).rejects.toThrow('Challenge not found');
  });

  it('throws 400 error when malformed date requested', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: 'Malformed date query parameter' })
    } as Response);

    await expect(fetchChallenge('invalid-date')).rejects.toThrow('Malformed date parameter');
  });

  it('handles network failure gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(fetchChallenge()).rejects.toThrow('Network error');
  });
});
