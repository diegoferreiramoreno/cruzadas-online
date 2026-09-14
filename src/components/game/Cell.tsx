import React from 'react';
import type { LetterStatus } from '../../engine/types';
import { SymbolIcon } from '../ui/SymbolIcon';

interface CellProps {
  letter?: string;
  status?: LetterStatus;
  isActive?: boolean;
}

export const Cell: React.FC<CellProps> = React.memo(({ letter = '', status, isActive = false }) => {
  let statusClasses = 'border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800';
  let ariaLabel = letter ? `Letra ${letter}` : 'Vazio';

  if (status === 'correct') {
    statusClasses = 'bg-emerald-600 text-white border-emerald-700';
    ariaLabel = `Letra ${letter}, correta e na posição exata`;
  } else if (status === 'present') {
    statusClasses = 'bg-amber-500 text-white border-amber-600';
    ariaLabel = `Letra ${letter}, presente na palavra em outra posição`;
  } else if (status === 'absent') {
    statusClasses = 'bg-slate-500 text-white border-slate-600';
    ariaLabel = `Letra ${letter}, não faz parte da palavra`;
  } else if (isActive) {
    statusClasses = 'border-amber-500 ring-2 ring-amber-400/50 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800';
  } else if (letter) {
    statusClasses = 'border-slate-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800';
  }

  return (
    <div
      role="text"
      aria-label={ariaLabel}
      className={`relative flex flex-col items-center justify-center font-bold uppercase select-none rounded-md border-2 aspect-[5/6] w-full transition-all duration-200 text-base sm:text-2xl md:text-3xl ${statusClasses}`}
    >
      <span>{letter}</span>
      {status && (
        <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 opacity-80 scale-60 sm:scale-75">
          <SymbolIcon status={status} />
        </span>
      )}
    </div>
  );
});
