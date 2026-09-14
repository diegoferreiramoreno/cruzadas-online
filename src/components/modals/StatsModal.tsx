import React from 'react';
import { Modal } from '../ui/Modal';
import type { PlayerStats } from '../../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  const winPercentage =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDistributionCount = Math.max(
    1,
    ...Object.values(stats.guessDistribution)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Estatísticas do Jogador"
      description="Acompanhe seus indicadores de hábito e vitórias consecutivas neste dispositivo."
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.gamesPlayed}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Jogos
            </div>
          </div>

          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {winPercentage}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Vitórias
            </div>
          </div>

          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats.currentStreak}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Sequência
            </div>
          </div>

          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.maxStreak}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Recorde
            </div>
          </div>
        </div>

        {/* Guess Distribution Histogram */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Distribuição de Tentativas
          </h4>
          <div className="space-y-1.5" role="group" aria-label="Distribuição de palpites vitoriosos">
            {([1, 2, 3, 4, 5, 6] as const).map((attemptNum) => {
              const count = stats.guessDistribution[attemptNum] || 0;
              const percent = Math.round((count / maxDistributionCount) * 100);
              const minWidth = count > 0 ? `${Math.max(percent, 8)}%` : '8%';

              return (
                <div key={attemptNum} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-3 text-right font-bold text-slate-600 dark:text-slate-400">
                    {attemptNum}
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded h-6 flex items-center overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-end px-2 text-white font-bold transition-all duration-300 ${
                        count > 0 ? 'bg-amber-600' : 'bg-slate-400/30 text-slate-500 dark:text-slate-400'
                      }`}
                      style={{ width: minWidth }}
                      aria-label={`${count} vitórias na tentativa ${attemptNum}`}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Os dados são salvos exclusivamente no navegador deste dispositivo, sem necessidade de conta ou login.
        </p>
      </div>
    </Modal>
  );
};
