import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { InterestSupportCard } from '../ui/InterestSupportCard';
import { generateShareText, shareResult } from '../../services/shareService';
import type { DailyChallenge } from '../../types';
import type { GuessAttempt } from '../../engine/types';

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'WON' | 'LOST';
  attemptsCount: number;
  challenge: DailyChallenge;
  guesses?: GuessAttempt[];
  onShareCompleted?: (channel: string) => void;
  onInterestExpressed?: () => void;
}

export const PostGameModal: React.FC<PostGameModalProps> = ({
  isOpen,
  onClose,
  status,
  attemptsCount,
  challenge,
  guesses = [],
  onShareCompleted,
  onInterestExpressed
}) => {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const isWon = status === 'WON';

  const handleShare = async () => {
    const text = generateShareText({
      cycleId: challenge.cycleDate,
      status,
      guesses
    });

    const result = await shareResult({
      text,
      onShareCompleted
    });

    if (result.success) {
      setShareFeedback('Copiado para a área de transferência!');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isWon ? 'Parabéns!' : 'Fim de Jogo'}
      description={
        isWon
          ? `Você acertou a palavra em ${attemptsCount} ${attemptsCount === 1 ? 'tentativa' : 'tentativas'}!`
          : 'Você esgotou as 6 tentativas de hoje.'
      }
    >
      <div className="space-y-5">
        {/* Solution Card */}
        <div className="text-center py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Palavra do Dia</span>
          <p className="text-3xl font-serif font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase mt-1">
            {challenge.word}
          </p>
        </div>

        {/* Liturgical / Cultural Context */}
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 bg-amber-50/50 dark:bg-slate-800/40 p-3 rounded-lg border-l-4 border-amber-500">
          <div className="font-semibold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400">
            Contextualização Cultural e Litúrgica
          </div>
          <p className="italic leading-relaxed text-sm">
            "{challenge.postGameContext}"
          </p>
        </div>

        {/* Source Citation */}
        <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Fonte Documental:</span> {challenge.sourceCitation}
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Categoria:</span> {challenge.sourceCategory}
          </div>
        </div>

        {/* Share Section */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-full min-h-[48px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartilhar Desempenho
          </button>

          {shareFeedback && (
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fadeIn" role="status">
              {shareFeedback}
            </div>
          )}
        </div>

        {/* Voluntary Community Support Card (US4) */}
        <InterestSupportCard
          cycleId={challenge.cycleDate}
          onInterestExpressed={onInterestExpressed}
        />
      </div>
    </Modal>
  );
};
