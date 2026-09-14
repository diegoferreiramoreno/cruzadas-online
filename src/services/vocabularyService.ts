import { normalizeWord } from '../engine/normalizer';

const vocabularyCache = new Map<number, Set<string>>();
const inFlightLoads = new Map<number, Promise<Set<string>>>();
let currentChallengeSecret: string | null = null;

async function fetchVocabularyText(wordLength: number): Promise<string> {
  // In browser environment:
  if (typeof window !== 'undefined') {
    const url = `/data/vocabulary/${wordLength}.txt`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Vocabulary file not found for length ${wordLength}: HTTP ${res.status}`);
    }
    return await res.text();
  }

  // In Node.js test environment (Vitest / JSDOM):
  try {
    // Dynamic import hidden from client bundler
    const dynamicImport = new Function('modulePath', 'return import(modulePath)');
    const fs = (await dynamicImport('node:fs')) as typeof import('node:fs');
    const path = (await dynamicImport('node:path')) as typeof import('node:path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'vocabulary', `${wordLength}.txt`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch {
    // Fallback to fetch if fs is unavailable
  }

  const url = `/data/vocabulary/${wordLength}.txt`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Vocabulary file not found for length ${wordLength}: HTTP ${res.status}`);
  }
  return await res.text();
}

/**
 * Loads and caches the vocabulary set for a specific word length.
 * Subsequent calls return the cached Set in O(1).
 */
export async function loadVocabulary(wordLength: number): Promise<Set<string>> {
  if (vocabularyCache.has(wordLength)) {
    return vocabularyCache.get(wordLength)!;
  }

  if (inFlightLoads.has(wordLength)) {
    return inFlightLoads.get(wordLength)!;
  }

  const loadPromise = (async () => {
    try {
      const text = await fetchVocabularyText(wordLength);
      const lines = text.split(/\r?\n/);
      const set = new Set<string>();
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          set.add(trimmed);
        }
      }
      vocabularyCache.set(wordLength, set);
      return set;
    } catch (err) {
      console.warn(`[VocabularyService] Could not load vocabulary for wordLength ${wordLength}:`, err);
      // Store an empty set so subsequent lookups don't repeatedly fail network calls
      const fallbackSet = new Set<string>();
      vocabularyCache.set(wordLength, fallbackSet);
      return fallbackSet;
    } finally {
      inFlightLoads.delete(wordLength);
    }
  })();

  inFlightLoads.set(wordLength, loadPromise);
  return loadPromise;
}

/**
 * Sets the active challenge secret word (normalized) to enforce the secret-answer safety invariant:
 * the active secret is always accepted as a valid guess for the active game.
 */
export function setActiveChallengeSecret(secret: string | null): void {
  currentChallengeSecret = secret ? normalizeWord(secret) : null;
}

/**
 * Checks if a word is accepted in the vocabulary for the specified length.
 * Ensures the active challenge secret (if provided) is always accepted.
 */
export function isAcceptedWord(word: string, wordLength: number, activeSecret?: string): boolean {
  if (!word) return false;

  // Basic format validation: reject spaces, numbers, hyphens, and non-letter symbols
  if (!/^[a-zA-ZáàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]+$/.test(word)) {
    return false;
  }

  const normalized = normalizeWord(word);
  if (normalized.length !== wordLength) {
    return false;
  }

  // Secret-answer safety invariant:
  // The active challenge answer is ALWAYS accepted as a legitimate guess
  if (activeSecret && normalized === normalizeWord(activeSecret)) {
    return true;
  }
  if (currentChallengeSecret && normalized === currentChallengeSecret) {
    return true;
  }

  const cachedSet = vocabularyCache.get(wordLength);
  if (!cachedSet) {
    return false;
  }

  return cachedSet.has(normalized);
}

/**
 * Convenience wrapper for backward compatibility.
 */
export function isValidWord(word: string, wordLength?: number, activeSecret?: string): boolean {
  const len = wordLength ?? word?.length ?? 0;
  return isAcceptedWord(word, len, activeSecret);
}

export function isVocabularyLoaded(wordLength: number): boolean {
  return vocabularyCache.has(wordLength);
}

export function isVocabularyLoading(wordLength: number): boolean {
  return inFlightLoads.has(wordLength);
}

export function clearVocabularyCache(): void {
  vocabularyCache.clear();
  inFlightLoads.clear();
  currentChallengeSecret = null;
}

export function injectVocabulary(wordLength: number, words: string[]): void {
  const set = new Set(words.map((w) => normalizeWord(w)));
  vocabularyCache.set(wordLength, set);
}

export function getVocabularySize(wordLength?: number): number {
  if (typeof wordLength === 'number') {
    return vocabularyCache.get(wordLength)?.size ?? 0;
  }
  let total = 0;
  for (const set of vocabularyCache.values()) {
    total += set.size;
  }
  return total;
}
