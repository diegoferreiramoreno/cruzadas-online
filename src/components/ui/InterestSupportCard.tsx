import React, { useState } from 'react';

interface InterestSupportCardProps {
  cycleId: string;
  onInterestExpressed?: () => void;
}

export const InterestSupportCard: React.FC<InterestSupportCardProps> = ({
  cycleId,
  onInterestExpressed
}) => {
  const storageKey = `cruzadas_interest_${cycleId}`;
  const [hasExpressedInterest, setHasExpressedInterest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const handleExpressInterest = () => {
    if (hasExpressedInterest) return;

    try {
      localStorage.setItem(storageKey, 'true');
    } catch (err) {
      console.warn('Failed to persist interest signal:', err);
    }

    setHasExpressedInterest(true);
    onInterestExpressed?.();
  };

  return (
    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
        Gostou da proposta do Cruzadas.online?
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
        Estamos construindo passatempos inteligentes com a riqueza da cultura e tradição católica.
        Toque abaixo se você deseja ver novos jogos e apoiar esta iniciativa.
      </p>

      {hasExpressedInterest ? (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          Que alegria saber disso! Obrigado pelo seu incentivo. Que Deus abençoe sua jornada.
        </div>
      ) : (
        <button
          type="button"
          onClick={handleExpressInterest}
          className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
        >
          Tenho interesse no projeto
        </button>
      )}
    </div>
  );
};
