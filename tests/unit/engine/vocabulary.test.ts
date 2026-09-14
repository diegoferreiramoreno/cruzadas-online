import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadVocabulary,
  isAcceptedWord,
  isValidWord,
  clearVocabularyCache,
  setActiveChallengeSecret,
  isVocabularyLoaded,
  injectVocabulary,
  getVocabularySize
} from '../../../src/services/vocabularyService';
import fs from 'node:fs';
import path from 'node:path';

describe('VocabularyService and Lexicon Validation', () => {
  beforeEach(async () => {
    clearVocabularyCache();
    await loadVocabulary(5);
    await loadVocabulary(4);
  });

  describe('Accepted Legitimate Words (MVP and Domain Supplement)', () => {
    it('accepts key Catholic, Biblical, and common words in length 5', () => {
      expect(isAcceptedWord('MISSA', 5)).toBe(true);
      expect(isValidWord('MISSA', 5)).toBe(true);
      expect(isAcceptedWord('PEDRO', 5)).toBe(true);
      expect(isValidWord('PEDRO', 5)).toBe(true);
      expect(isAcceptedWord('PAULO', 5)).toBe(true);
      expect(isAcceptedWord('MARIA', 5)).toBe(true);
      expect(isAcceptedWord('JESUS', 5)).toBe(true);
      expect(isAcceptedWord('BENTO', 5)).toBe(true);
      expect(isAcceptedWord('GRAÇA', 5)).toBe(true);
      expect(isAcceptedWord('GRACA', 5)).toBe(true);
      expect(isAcceptedWord('ALTAR', 5)).toBe(true);
      expect(isAcceptedWord('CASAS', 5)).toBe(true);
    });

    it('accepts lowercase input transparently via normalization', () => {
      expect(isAcceptedWord('missa', 5)).toBe(true);
      expect(isAcceptedWord('pedro', 5)).toBe(true);
      expect(isAcceptedWord('maria', 5)).toBe(true);
      expect(isAcceptedWord('graça', 5)).toBe(true);
    });

    it('accepts legitimate 4-letter words in length 4 bucket', () => {
      expect(isAcceptedWord('CASA', 4)).toBe(true);
      expect(isAcceptedWord('ACAO', 4)).toBe(true);
      expect(isAcceptedWord('AÇÃO', 4)).toBe(true);
      expect(isAcceptedWord('JOAO', 4)).toBe(true);
      expect(isAcceptedWord('JOÃO', 4)).toBe(true);
    });
  });

  describe('Rejected Inputs and Nonwords', () => {
    it('rejects obvious nonsense not present in the lexicon', () => {
      expect(isAcceptedWord('AAAAA', 5)).toBe(false);
      expect(isAcceptedWord('BRASI', 5)).toBe(false);
      expect(isAcceptedWord('QWERT', 5)).toBe(false);
      expect(isAcceptedWord('XYZWQ', 5)).toBe(false);
      expect(isAcceptedWord('ZZZZZ', 5)).toBe(false);
    });

    it('rejects words of incorrect length', () => {
      expect(isAcceptedWord('MISSA', 4)).toBe(false);
      expect(isAcceptedWord('MISSA', 6)).toBe(false);
      expect(isAcceptedWord('DEUS', 5)).toBe(false);
    });

    it('rejects invalid characters, numbers, spaces, and hyphens', () => {
      expect(isAcceptedWord('MIS SA', 5)).toBe(false);
      expect(isAcceptedWord('MIS-S', 5)).toBe(false);
      expect(isAcceptedWord('MISS1', 5)).toBe(false);
      expect(isAcceptedWord('MISS!', 5)).toBe(false);
      expect(isAcceptedWord('', 5)).toBe(false);
    });
  });

  describe('Orthographic Normalization Equivalence', () => {
    it('treats accented and unaccented versions as identical', () => {
      expect(isAcceptedWord('AÇÃO', 4)).toBe(true);
      expect(isAcceptedWord('ACAO', 4)).toBe(true);
      expect(isAcceptedWord('GRAÇA', 5)).toBe(true);
      expect(isAcceptedWord('GRACA', 5)).toBe(true);
      expect(isAcceptedWord('JOÃO', 4)).toBe(true);
      expect(isAcceptedWord('JOAO', 4)).toBe(true);
    });
  });

  describe('Secret-Answer Safety Invariant', () => {
    it('always accepts the active challenge secret even if absent from generic dictionary', () => {
      const syntheticSecret = 'ZZZQX'; // guaranteed not in generic pt-BR dictionary
      expect(isAcceptedWord(syntheticSecret, 5)).toBe(false);

      // When passed as activeSecret parameter
      expect(isAcceptedWord(syntheticSecret, 5, syntheticSecret)).toBe(true);

      // When set as the active challenge secret in the service
      setActiveChallengeSecret(syntheticSecret);
      expect(isAcceptedWord(syntheticSecret, 5)).toBe(true);
      expect(isAcceptedWord('zzzqx', 5)).toBe(true);

      // Other arbitrary nonwords remain rejected
      expect(isAcceptedWord('AAAAA', 5)).toBe(false);
    });

    it('proves future challenge answers are not bundled into public vocabulary generator', () => {
      // Future challenge answers in content/challenges/*.json must NOT be forcibly included
      // in public/data/vocabulary unless they independently exist in the licensed lexicon
      const futurePath = path.join(process.cwd(), 'content', 'challenges', '2026-09-14.json');
      if (fs.existsSync(futurePath)) {
        const data = JSON.parse(fs.readFileSync(futurePath, 'utf8'));
        expect(data.id).toBeDefined();
        // Verify the vocabulary generator reads ONLY vendor/ and content/vocabulary/
        const scriptCode = fs.readFileSync(
          path.join(process.cwd(), 'scripts', 'generate-vocabulary.ts'),
          'utf8'
        );
        expect(scriptCode).not.toContain('content/challenges');
        expect(scriptCode).not.toContain('tests/fixtures');
      }
    });
  });

  describe('Caching and Performance', () => {
    it('caches length buckets in memory with O(1) lookup after loading', async () => {
      expect(isVocabularyLoaded(5)).toBe(true);
      const initialSize = getVocabularySize(5);
      expect(initialSize).toBeGreaterThan(5000);

      // Second load returns the same cached instance immediately
      const secondSet = await loadVocabulary(5);
      expect(secondSet.size).toBe(initialSize);
    });

    it('supports test injection via injectVocabulary', () => {
      clearVocabularyCache();
      injectVocabulary(5, ['TESTE', 'BENTO']);
      expect(isAcceptedWord('TESTE', 5)).toBe(true);
      expect(isAcceptedWord('BENTO', 5)).toBe(true);
      expect(isAcceptedWord('MISSA', 5)).toBe(false);
    });
  });
});
