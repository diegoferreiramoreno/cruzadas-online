import React from 'react';
import type { LetterStatus } from '../../engine/types';

interface KeyProps {
  value: string;
  status?: LetterStatus;
  onClick: (value: string) => void;
  width?: 'normal' | 'wide';
  children?: React.ReactNode;
}

export const Key: React.FC<KeyProps> = React.memo(({
  value,
  status,
  onClick,
  width = 'normal',
  children
}) => {
  let statusClasses = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400';
  let ariaLabel = value;

  if (status === 'correct') {
    statusClasses = 'bg-emerald-600 text-white hover:bg-emerald-700';
    ariaLabel = `${value}, correta`;
  } else if (status === 'present') {
    statusClasses = 'bg-amber-500 text-white hover:bg-amber-600';
    ariaLabel = `${value}, presente em outra posição`;
  } else if (status === 'absent') {
    statusClasses = 'bg-slate-500 text-white hover:bg-slate-600 opacity-60';
    ariaLabel = `${value}, ausente`;
  }

  const widthClasses = width === 'wide' ? 'px-1 sm:px-3 flex-[1.5] max-w-[4.5rem]' : 'flex-1 max-w-[2.75rem]';

  return (
    <button
      type="button"
      data-key={value}
      onClick={() => onClick(value)}
      aria-label={ariaLabel}
      className={`min-h-[48px] h-12 select-none font-bold uppercase rounded-md text-xs sm:text-base flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 cursor-pointer overflow-hidden ${widthClasses} ${statusClasses}`}
    >
      {children || value}
    </button>
  );
});
