import React from 'react';
import type { GuessAttempt } from '../../engine/types';
import { Row } from './Row';

interface BoardProps {
  wordLength: number;
  guesses: GuessAttempt[];
  currentInput: string;
  maxAttempts?: number;
}

export const Board: React.FC<BoardProps> = React.memo(({
  wordLength,
  guesses,
  currentInput,
  maxAttempts = 6
}) => {
  const rows = [];
  const currentRowIndex = guesses.length;

  for (let i = 0; i < maxAttempts; i++) {
    if (i < guesses.length) {
      rows.push(
        <Row
          key={i}
          wordLength={wordLength}
          attempt={guesses[i]}
        />
      );
    } else if (i === currentRowIndex) {
      rows.push(
        <Row
          key={i}
          wordLength={wordLength}
          currentInput={currentInput}
          isCurrentRow={true}
        />
      );
    } else {
      rows.push(
        <Row
          key={i}
          wordLength={wordLength}
        />
      );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-md mx-auto" role="region" aria-label="Tabuleiro do jogo">
      {rows}
    </div>
  );
});
