import {
  loadVocabulary,
  isAcceptedWord,
  isValidWord,
  isVocabularyLoaded,
  isVocabularyLoading,
  setActiveChallengeSecret,
  clearVocabularyCache,
  injectVocabulary,
  getVocabularySize
} from '../services/vocabularyService';

export {
  loadVocabulary,
  isAcceptedWord,
  isValidWord,
  isVocabularyLoaded,
  isVocabularyLoading,
  setActiveChallengeSecret,
  clearVocabularyCache,
  injectVocabulary,
  getVocabularySize
};

/**
 * Initializes or injects vocabulary for a given length (defaults to 5) or multiple lengths.
 * Preserved for test compatibility.
 */
export function initVocabulary(words: string[], wordLength = 5): void {
  injectVocabulary(wordLength, words);
}
