import type { LetterEvaluation } from "./types";
import { normalizeWord } from "./normalizer";

export interface EvaluationResult {
  evaluations: LetterEvaluation[];
  isWin: boolean;
}

/**
 * Two-pass evaluation algorithm implementing strict positional duplicate-letter priority.
 * 
 * 1st pass: marks exact positional matches ("correct") and decrements secret letter occurrences.
 * 2nd pass: marks displaced matches ("present") up to remaining secret letter counts; surplus is "absent".
 */
export function evaluateGuess(rawGuess: string, rawSecret: string): EvaluationResult {
  const guess = normalizeWord(rawGuess);
  const secret = normalizeWord(rawSecret);

  if (guess.length !== secret.length) {
    throw new Error(
      `Tamanho do palpite (${guess.length}) diferente do tamanho da palavra secreta (${secret.length}).`
    );
  }

  const length = secret.length;
  const evaluations: LetterEvaluation[] = new Array(length);
  const secretLetterCounts: Record<string, number> = {};

  // Count frequencies of each letter in secret word
  for (let i = 0; i < length; i++) {
    const char = secret[i];
    secretLetterCounts[char] = (secretLetterCounts[char] || 0) + 1;
  }

  // Pass 1: Find all exact matches ('correct')
  for (let i = 0; i < length; i++) {
    const guessChar = guess[i];
    if (guessChar === secret[i]) {
      evaluations[i] = { letter: guessChar, status: "correct" };
      secretLetterCounts[guessChar]--;
    }
  }

  // Pass 2: Find displaced matches ('present') or surplus/non-existent ('absent')
  for (let i = 0; i < length; i++) {
    if (evaluations[i]) {
      continue; // already marked as 'correct'
    }

    const guessChar = guess[i];
    if (secretLetterCounts[guessChar] && secretLetterCounts[guessChar] > 0) {
      evaluations[i] = { letter: guessChar, status: "present" };
      secretLetterCounts[guessChar]--;
    } else {
      evaluations[i] = { letter: guessChar, status: "absent" };
    }
  }

  const isWin = evaluations.every((e) => e.status === "correct");

  return { evaluations, isWin };
}
