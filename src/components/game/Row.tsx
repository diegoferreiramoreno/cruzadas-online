import React from 'react';
import type { GuessAttempt } from '../../engine/types';
import { Cell } from './Cell';

interface RowProps {
  wordLength: number;
  attempt?: GuessAttempt;
  currentInput?: string;
  isCurrentRow?: boolean;
}

export const Row: React.FC<RowProps> = React.memo(({
  wordLength,
  attempt,
  currentInput = '',
  isCurrentRow = false
}) => {
  const cells = [];

  for (let i = 0; i < wordLength; i++) {
    if (attempt) {
      const evaluation = attempt.evaluations[i];
      cells.push(
        <Cell
          key={i}
          letter={evaluation?.letter || attempt.rawInput[i] || ''}
          status={evaluation?.status}
        />
      );
    } else if (isCurrentRow) {
      const letter = currentInput[i] || '';
      const isCursor = i === currentInput.length;
      cells.push(
        <Cell
          key={i}
          letter={letter}
          isActive={isCursor}
        />
      );
    } else {
      cells.push(<Cell key={i} />);
    }
  }

  return (
    <div
      className="grid gap-1 sm:gap-1.5 my-0.5 sm:my-1 w-full justify-center mx-auto"
      style={{
        gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))`,
        maxWidth: `min(100%, ${Math.min(wordLength * 56, 520)}px)`
      }}
      role="group"
      aria-label={attempt ? `Tentativa submetida: ${attempt.rawInput}` : isCurrentRow ? `Linha de tentativa atual: ${currentInput}` : 'Linha não preenchida'}
    >
      {cells}
    </div>
  );
});
