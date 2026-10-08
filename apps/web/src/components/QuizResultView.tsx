import React from 'react';
import type { QuizResult } from '../types';

interface QuizResultViewProps {
  result: QuizResult;
  onPlayAgain: () => void;
  onBackToCatalog: () => void;
  onOpenDonation?: () => void;
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

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  result,
  onPlayAgain,
  onBackToCatalog,
  onOpenDonation,
}) => {
  const getFeedbackMessage = (percentage: number) => {
    if (percentage >= 90) {
      return 'Excelente domínio! Sua formação bíblica e doutrinária demonstrou notável solidez e precisão.';
    }
    if (percentage >= 70) {
      return 'Muito bom desempenho! Você demonstra uma base segura sobre a Sagrada Escritura, os sacramentos e a Tradição.';
    }
    if (percentage >= 50) {
      return 'Bom aproveitamento. Há fundamentos firmes e belas oportunidades para continuar enriquecendo seu conhecimento sobre a fé.';
    }
    return 'Um convite ao aprofundamento. A tradição bíblica e o Catecismo oferecem tesouros riquíssimos para fortalecer seus fundamentos.';
  };

  return (
    <div className="result-container" role="region" aria-label="Resultado da Partida">
      {/* Score Summary */}
      <section className="result-hero">
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <p className="result-badge" style={{ margin: 0 }}>Partida Concluída</p>
          {result.difficultyLevel && (
            <span className={`badge-difficulty ${getDifficultyClass(result.difficultyLevel)}`}>
              Nível: {result.difficultyLevel}
            </span>
          )}
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          {result.quizTitle}
        </h2>
        <h1 className="result-score-number">
          {Math.round(result.scorePercentage)}
          <span>%</span>
        </h1>
        <p className="result-message">{getFeedbackMessage(result.scorePercentage)}</p>

        <div className="result-stats-row">
          <div className="stat-item">
            <p className="stat-value">{result.correctAnswersCount}</p>
            <p className="stat-label">Acertos</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{result.totalQuestions - result.correctAnswersCount}</p>
            <p className="stat-label">Erros</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{result.totalQuestions}</p>
            <p className="stat-label">Total de Questões</p>
          </div>
        </div>

        <div className="result-actions">
          <button
            onClick={onPlayAgain}
            className="btn btn-primary"
            aria-label="Jogar Novamente"
          >
            ↻ Jogar Novamente
          </button>
          <button
            onClick={onBackToCatalog}
            className="btn btn-secondary"
            aria-label="Voltar aos Jogos"
          >
            ← Voltar aos Jogos
          </button>
        </div>
      </section>

      {/* Support / Donation Callout */}
      {onOpenDonation && (
        <section className="result-donation-card" aria-label="Apoio ao Projeto">
          <div className="result-donation-content">
            <div className="result-donation-icon" aria-hidden="true">♥</div>
            <div>
              <h3 className="result-donation-title">Gostou deste Quiz? Apoie o Cruzadas.online</h3>
              <p className="result-donation-text">
                Somos um projeto independente dedicado à cultura e formação católica. Sua contribuição via PIX nos ajuda a cobrir custos de servidores e a criar novos desafios bíblicos e teológicos.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDonation}
            className="btn btn-donation-cta"
            aria-label="Apoiar com PIX"
          >
            ✠ Contribuir via PIX
          </button>
        </section>
      )}

      {/* Review Section */}
      <section className="reviews-section" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="reviews-title">
          Revisão Detalhada das Respostas
        </h2>

        {result.questions.map((q, idx) => (
          <article
            key={q.questionId}
            className={`review-card ${q.isCorrect ? 'correct' : 'incorrect'}`}
          >
            <div className="review-card-header">
              <span className="review-question-num">Questão {idx + 1}</span>
              <span
                className={`review-status-pill ${q.isCorrect ? 'correct' : 'incorrect'}`}
              >
                {q.isCorrect ? '✓ Acertou' : '✕ Incorreta'}
              </span>
            </div>

            <h3 className="review-question-text">{q.questionText}</h3>

            <div className="review-answers-box">
              <div className="review-answer-line">
                <strong>Sua resposta: </strong>
                <span style={{ color: q.isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {q.selectedOptionText || '(Não respondida)'}
                </span>
              </div>
              {!q.isCorrect && (
                <div className="review-answer-line">
                  <strong>Resposta correta: </strong>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                    {q.correctOptionText}
                  </span>
                </div>
              )}
            </div>

            <p className="review-explanation">{q.explanation}</p>

            {q.sourceReference && (
              <p className="review-reference">
                <span>📖 Fonte:</span> {q.sourceReference}
              </p>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};
