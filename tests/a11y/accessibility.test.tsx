import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { Board } from '../../src/components/game/Board';
import { Keyboard } from '../../src/components/game/Keyboard';
import { ThematicClue } from '../../src/components/game/ThematicClue';
import { Header } from '../../src/components/layout/Header';
import { FeedbackAlert } from '../../src/components/layout/FeedbackAlert';
import { HowToPlayModal } from '../../src/components/modals/HowToPlayModal';
import { StatsModal } from '../../src/components/modals/StatsModal';
import { PostGameModal } from '../../src/components/modals/PostGameModal';
import { INITIAL_STATS } from '../../src/services/storageService';
import type { DailyChallenge } from '../../src/types';

const mockChallenge: DailyChallenge = {
  id: 'cruzadas-2026-09-11',
  cycleDate: '2026-09-11',
  word: 'GRAÇA',
  normalizedWord: 'GRACA',
  wordLength: 5,
  initialClue: 'Dom gratuito de Deus',
  postGameContext: 'Graça santificante',
  sourceCitation: 'Catecismo § 1996',
  sourceCategory: 'Catecismo da Igreja Católica',
  editorialStatus: 'Verified'
};

describe('Accessibility Audit (WCAG 2.2 AA / T062)', () => {
  it('Board component has zero accessibility violations', async () => {
    const { container } = render(
      <Board
        wordLength={5}
        guesses={[
          {
            attemptIndex: 0,
            rawInput: 'PEDRO',
            normalizedInput: 'PEDRO',
            submittedAt: '2026-09-11T12:00:00.000Z',
            evaluations: [
              { letter: 'P', status: 'absent' },
              { letter: 'E', status: 'absent' },
              { letter: 'D', status: 'absent' },
              { letter: 'R', status: 'present' },
              { letter: 'O', status: 'absent' }
            ]
          }
        ]}
        currentInput="GRAC"
        maxAttempts={6}
      />
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('Keyboard component has zero accessibility violations', async () => {
    const { container } = render(
      <Keyboard
        onKeyPress={() => {}}
        letterStatuses={{ R: 'present', G: 'correct', P: 'absent' }}
      />
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('Header and Clue components have zero accessibility violations', async () => {
    const { container } = render(
      <div>
        <Header onOpenHowToPlay={() => {}} onOpenStats={() => {}} />
        <ThematicClue clue="Dom gratuito de Deus" />
        <FeedbackAlert message="Palavra não encontrada no vocabulário" onDismiss={() => {}} />
      </div>
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('HowToPlayModal has zero accessibility violations', async () => {
    const { container } = render(
      <HowToPlayModal isOpen={true} onClose={() => {}} />
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('StatsModal has zero accessibility violations', async () => {
    const { container } = render(
      <StatsModal isOpen={true} onClose={() => {}} stats={INITIAL_STATS} />
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('PostGameModal has zero accessibility violations', async () => {
    const { container } = render(
      <PostGameModal
        isOpen={true}
        onClose={() => {}}
        status="WON"
        attemptsCount={3}
        challenge={mockChallenge}
      />
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
