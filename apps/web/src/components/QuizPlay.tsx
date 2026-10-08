import React, { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '../types';

interface QuizPlayProps {
  quizTitle: string;
  totalQuestions: number;
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, string>) => void;
  onQuit: () => void;
  isSubmitting: boolean;
  difficultyLevel?: string;
}

const getDifficultyClass = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'iniciante':
      return 'iniciante';
    case 'intermediário':
    case 'intermediario':
      return 'intermediario';
    case 'avançado':
    case 'avancado':
      return 'avancado';
    default:
      return 'iniciante';
  }
};

export const QuizPlay: React.FC<QuizPlayProps> = ({
  quizTitle,
  totalQuestions,
  questions,
  onComplete,
  onQuit,
  isSubmitting,
  difficultyLevel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const selectedOptionId = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (!selectedOptionId) return;

    if (isLastQuestion) {
      onComplete(selectedAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [selectedOptionId, isLastQuestion, onComplete, selectedAnswers]);

  // Keyboard navigation support: keys 1..4 or A..D select options, Enter advances
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion || isSubmitting) return;

      const key = e.key.toUpperCase();
      const optionIndex = ['1', '2', '3', '4'].indexOf(key);
      const letterIndex = ['A', 'B', 'C', 'D'].indexOf(key);

      const targetIndex = optionIndex !== -1 ? optionIndex : letterIndex;
      if (targetIndex !== -1 && currentQuestion.options[targetIndex]) {
        handleSelectOption(currentQuestion.options[targetIndex].id);
      } else if (e.key === 'Enter' && selectedOptionId) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, isSubmitting, handleSelectOption, selectedOptionId, handleNext]);

  if (!currentQuestion) {
    return null;
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="quiz-container">
      <div className="quiz-card" role="region" aria-label="Partida de Quiz em andamento">
        {/* Top bar */}
        <div className="quiz-header-bar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.85rem',
                  color: 'var(--color-gold-light)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {quizTitle}
              </span>
              {difficultyLevel && (
                <span className={`badge-difficulty ${getDifficultyClass(difficultyLevel)}`}>
                  Nível: {difficultyLevel}
                </span>
              )}
            </div>
            <span className="quiz-progress-text">
              Questão {currentIndex + 1} de {totalQuestions}
            </span>
          </div>
          <button
            onClick={onQuit}
            className="quiz-quit-btn"
            aria-label="Desistir da partida e voltar ao catálogo"
          >
            ✕ Sair
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="progress-bar-container"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso: ${currentIndex + 1} de ${totalQuestions} questões`}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Question Title */}
        <h2 className="question-text" id="active-question-text">
          {currentQuestion.text}
        </h2>

        {/* Options */}
        <div
          className="options-list"
          role="radiogroup"
          aria-labelledby="active-question-text"
        >
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const letter = optionLetters[idx] || (idx + 1).toString();

            return (
              <button
                key={option.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectOption(option.id)}
                className={`option-button ${isSelected ? 'selected' : ''}`}
                tabIndex={0}
              >
                <span className="option-letter" aria-hidden="true">
                  {letter}
                </span>
                <span className="option-text">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="quiz-controls">
          <button
            onClick={handleNext}
            disabled={!selectedOptionId || isSubmitting}
            className="btn btn-primary"
            aria-label={isLastQuestion ? 'Concluir Quiz' : 'Próxima Questão'}
          >
            {isSubmitting ? (
              'Calculando pontuação...'
            ) : isLastQuestion ? (
              'Concluir Quiz ➔'
            ) : (
              'Próxima Questão ➔'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
