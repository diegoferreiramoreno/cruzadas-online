import React from 'react';
import type { LetterStatus } from '../../engine/types';
import { Key } from './Key';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses: Record<string, LetterStatus>;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const Keyboard: React.FC<KeyboardProps> = React.memo(({ onKeyPress, letterStatuses }) => {
  return (
    <div className="w-full max-w-lg mx-auto px-1 py-1 flex flex-col gap-1 sm:gap-1.5 select-none" role="group" aria-label="Teclado virtual">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-0.5 sm:gap-1 w-full max-w-full">
          {row.map((key) => {
            if (key === 'ENTER') {
              return (
                <Key
                  key={key}
                  value={key}
                  width="wide"
                  onClick={onKeyPress}
                >
                  <span className="text-[10px] sm:text-xs font-semibold tracking-tight">ENTER</span>
                </Key>
              );
            }
            if (key === 'BACKSPACE') {
              return (
                <Key
                  key={key}
                  value={key}
                  width="wide"
                  onClick={onKeyPress}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </Key>
              );
            }
            return (
              <Key
                key={key}
                value={key}
                status={letterStatuses[key]}
                onClick={onKeyPress}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});
