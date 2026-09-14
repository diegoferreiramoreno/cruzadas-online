import React from 'react';

interface ThematicClueProps {
  clue: string;
}

export const ThematicClue: React.FC<ThematicClueProps> = React.memo(({ clue }) => {
  return (
    <div className="my-3 px-4 py-3 bg-amber-50 dark:bg-slate-800/80 border-l-4 border-amber-500 rounded-r-lg shadow-xs max-w-md mx-auto w-full text-center">
      <span className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider block mb-1">
        Pista do Dia
      </span>
      <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 italic">
        "{clue}"
      </p>
    </div>
  );
});
