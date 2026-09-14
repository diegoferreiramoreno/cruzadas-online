import React from 'react';

interface HeaderProps {
  onOpenHowToPlay: () => void;
  onOpenStats?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ onOpenHowToPlay, onOpenStats }) => {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 py-2.5 px-2 sm:px-4 flex items-center justify-between max-w-2xl mx-auto">
      <button
        type="button"
        onClick={onOpenHowToPlay}
        aria-label="Como jogar"
        className="min-h-[44px] min-w-[44px] p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center justify-center font-bold text-lg cursor-pointer"
      >
        ?
      </button>

      <div className="text-center px-1">
        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight sm:tracking-wider text-slate-900 dark:text-amber-400 uppercase">
          Cruzadas<span className="text-amber-600 dark:text-slate-200 font-sans text-sm sm:text-xl md:text-2xl font-normal">.online</span>
        </h1>
      </div>

      <div className="flex items-center gap-1">
        {onOpenStats && (
          <button
            type="button"
            onClick={onOpenStats}
            aria-label="Estatísticas"
            className="min-h-[44px] min-w-[44px] p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center justify-center cursor-pointer"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
});
