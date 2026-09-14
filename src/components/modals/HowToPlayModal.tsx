import React from 'react';
import { Modal } from '../ui/Modal';
import { Cell } from '../game/Cell';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Como Jogar"
      description="Adivinhe a palavra temática do dia em até 6 tentativas."
    >
      <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <p>
          Cada palpite deve ser uma palavra válida da língua portuguesa ou termo próprio do universo católico e bíblico.
        </p>
        <p>
          Após cada tentativa, os blocos mudarão de cor e exibirão um símbolo acessível para indicar o quão perto você está da resposta:
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <Cell letter="G" status="correct" />
            <span>
              <strong>Correta (verde / ✓):</strong> A letra faz parte da palavra e está na posição exata.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Cell letter="R" status="present" />
            <span>
              <strong>Presente (âmbar / △):</strong> A letra faz parte da palavra, mas em outra posição.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Cell letter="T" status="absent" />
            <span>
              <strong>Ausente (cinza / —):</strong> A letra não faz parte da palavra nesta tentativa.
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-lg text-xs space-y-1.5 border border-amber-200 dark:border-slate-700">
          <p className="font-bold text-amber-800 dark:text-amber-400">Normalização Ortográfica:</p>
          <p>
            Acentuações e cedilha são flexibilizadas na digitação (ex: <code>ACAO</code> é aceito como <code>AÇÃO</code>).
          </p>
          <p>
            A cada dia, um novo enigma litúrgico ou bíblico é disponibilizado à meia-noite (Horário de Brasília).
          </p>
        </div>
      </div>
    </Modal>
  );
};
