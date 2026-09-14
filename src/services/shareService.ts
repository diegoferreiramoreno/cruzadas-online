import type { GuessAttempt } from '../engine/types';

export interface GenerateShareTextParams {
  cycleId: string;
  status: 'WON' | 'LOST';
  guesses: GuessAttempt[];
}

export interface ShareResultParams {
  text: string;
  onShareCompleted?: (channel: 'web_share' | 'clipboard') => void;
}

export interface ShareResultOutput {
  success: boolean;
  channel: 'web_share' | 'clipboard';
}

/**
 * Generates a strictly spoiler-free share text for WhatsApp and social media.
 * Contains no secret words, no normalized words, no guess letters.
 */
export function generateShareText({
  cycleId,
  status,
  guesses
}: GenerateShareTextParams): string {
  const attemptsLabel = status === 'WON' ? `${guesses.length}/6` : 'X/6';

  const grid = guesses
    .map((guess) => {
      return guess.evaluations
        .map((ev) => {
          if (ev.status === 'correct') return '🟩';
          if (ev.status === 'present') return '🟨';
          return '⬛';
        })
        .join('');
    })
    .join('\n');

  return `Cruzadas.online • ${cycleId} ${attemptsLabel}\n\n${grid}\n\nhttps://cruzadas.online`;
}

/**
 * Dispatches share via Web Share API when supported, or falls back to clipboard.
 * Calls telemetry-agnostic onShareCompleted callback on success.
 */
export async function shareResult({
  text,
  onShareCompleted
}: ShareResultParams): Promise<ShareResultOutput> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      onShareCompleted?.('web_share');
      return { success: true, channel: 'web_share' };
    } catch (err: unknown) {
      // If user aborted/cancelled share sheet, don't fall back to clipboard unless error was unsupported
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, channel: 'web_share' };
      }
      // Otherwise fall through to clipboard fallback
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      onShareCompleted?.('clipboard');
      return { success: true, channel: 'clipboard' };
    } catch {
      return { success: false, channel: 'clipboard' };
    }
  }

  return { success: false, channel: 'clipboard' };
}
