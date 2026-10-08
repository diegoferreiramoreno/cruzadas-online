import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { GameCatalog } from './components/GameCatalog';
import { QuizPlay } from './components/QuizPlay';
import { QuizResultView } from './components/QuizResultView';
import { DonationModal } from './components/DonationModal';
import { api, ApiError } from './api/client';
import type { GameItem, QuizGroup, StartAttemptResponse, QuizResult } from './types';

type ViewMode = 'catalog' | 'loading_quiz' | 'playing' | 'submitting' | 'result' | 'error';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [games, setGames] = useState<GameItem[]>([]);
  const [groups, setGroups] = useState<QuizGroup[]>([]);
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isStartingRandom, setIsStartingRandom] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Active quiz session state
  const [activeQuizSlug, setActiveQuizSlug] = useState<string>('fundamentos-da-fe');
  const [activeAttempt, setActiveAttempt] = useState<StartAttemptResponse | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoadingCatalog(true);
    setErrorMessage(null);
    try {
      const [gamesData, groupsData] = await Promise.all([
        api.getGamesCatalog(),
        api.getQuizGroups(),
      ]);
      setGames(gamesData);
      setGroups(groupsData);
    } catch (err) {
      const message = err instanceof ApiError
        ? `${err.message}${err.details ? `: ${err.details}` : ''}`
        : 'Não foi possível carregar os jogos. Verifique a conexão com a API.';
      setErrorMessage(message);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([api.getGamesCatalog(), api.getQuizGroups()])
      .then(([gamesData, groupsData]) => {
        if (!ignore) {
          setGames(gamesData);
          setGroups(groupsData);
          setErrorMessage(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          const message = err instanceof ApiError
            ? `${err.message}${err.details ? `: ${err.details}` : ''}`
            : 'Não foi possível carregar os jogos. Verifique a conexão com a API.';
          setErrorMessage(message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingCatalog(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSelectGroup = async (groupSlug: string | null) => {
    setSelectedGroupSlug(groupSlug);
    setIsLoadingCatalog(true);
    setErrorMessage(null);
    try {
      const data = await api.getGamesCatalog(groupSlug || undefined);
      setGames(data);
    } catch (err) {
      const message = err instanceof ApiError
        ? `${err.message}${err.details ? `: ${err.details}` : ''}`
        : 'Não foi possível filtrar os jogos.';
      setErrorMessage(message);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const handleStartQuiz = async (game: GameItem) => {
    setViewMode('loading_quiz');
    setErrorMessage(null);
    setActiveQuizSlug(game.slug);

    try {
      const attemptData = await api.startAttempt(game.slug);
      setActiveAttempt(attemptData);
      setActiveQuizSlug(attemptData.quizSlug || game.slug);
      setViewMode('playing');
    } catch (err) {
      const msg = err instanceof ApiError
        ? `${err.message}${err.details ? ` (${err.details})` : ''}`
        : 'Falha ao iniciar a partida. Tente novamente.';
      setErrorMessage(msg);
      setViewMode('error');
    }
  };

  const handleStartRandomQuiz = async () => {
    setIsStartingRandom(true);
    setViewMode('loading_quiz');
    setErrorMessage(null);

    try {
      const attemptData = await api.startRandomAttempt();
      setActiveAttempt(attemptData);
      setActiveQuizSlug(attemptData.quizSlug);
      setViewMode('playing');
    } catch (err) {
      const msg = err instanceof ApiError
        ? `${err.message}${err.details ? ` (${err.details})` : ''}`
        : 'Falha ao sortear e iniciar a partida rápida.';
      setErrorMessage(msg);
      setViewMode('error');
    } finally {
      setIsStartingRandom(false);
    }
  };

  const handleCompleteQuiz = async (answers: Record<string, string>) => {
    if (!activeAttempt) return;

    setViewMode('submitting');
    setErrorMessage(null);

    try {
      const resultData = await api.completeAttempt(activeQuizSlug, activeAttempt.attemptId, answers);
      setQuizResult(resultData);
      setViewMode('result');
    } catch (err) {
      const msg = err instanceof ApiError
        ? `${err.message}${err.details ? ` (${err.details})` : ''}`
        : 'Falha ao enviar respostas para o servidor.';
      setErrorMessage(msg);
      setViewMode('error');
    }
  };

  const handlePlayAgain = async () => {
    setViewMode('loading_quiz');
    setErrorMessage(null);

    try {
      const attemptData = await api.startAttempt(activeQuizSlug);
      setActiveAttempt(attemptData);
      setQuizResult(null);
      setViewMode('playing');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao iniciar nova partida.';
      setErrorMessage(msg);
      setViewMode('error');
    }
  };

  const handleGoHome = () => {
    setActiveAttempt(null);
    setQuizResult(null);
    setErrorMessage(null);
    setViewMode('catalog');
  };

  return (
    <div className="app-shell">
      <Header
        onGoHome={handleGoHome}
        onOpenDonation={() => setIsDonationModalOpen(true)}
      />

      <main className="main-content" id="main-content">
        <div className="container">
          {viewMode === 'catalog' && (
            <GameCatalog
              games={games}
              groups={groups}
              selectedGroupSlug={selectedGroupSlug}
              onSelectGroup={handleSelectGroup}
              onSelectGame={handleStartQuiz}
              onStartRandomQuiz={handleStartRandomQuiz}
              isLoading={isLoadingCatalog}
              isStartingRandom={isStartingRandom}
            />
          )}

          {viewMode === 'loading_quiz' && (
            <div className="state-box" aria-live="polite">
              <div className="spinner" />
              <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                Preparando Partida...
              </h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Sorteando perguntas e organizando o desafio.
              </p>
            </div>
          )}

          {(viewMode === 'playing' || viewMode === 'submitting') && activeAttempt && (
            <QuizPlay
              quizTitle={activeAttempt.quizTitle}
              difficultyLevel={activeAttempt.difficultyLevel}
              totalQuestions={activeAttempt.totalQuestions}
              questions={activeAttempt.questions}
              onComplete={handleCompleteQuiz}
              onQuit={handleGoHome}
              isSubmitting={viewMode === 'submitting'}
            />
          )}

          {viewMode === 'result' && quizResult && (
            <QuizResultView
              result={quizResult}
              onPlayAgain={handlePlayAgain}
              onBackToCatalog={handleGoHome}
              onOpenDonation={() => setIsDonationModalOpen(true)}
            />
          )}

          {viewMode === 'error' && (
            <div className="state-box" role="alert">
              <h2 className="error-title">Ops! Algo deu errado</h2>
              <p className="error-text">{errorMessage}</p>
              <button
                onClick={() => {
                  handleGoHome();
                  void loadInitialData();
                }}
                className="btn btn-primary"
                style={{ maxWidth: '240px', margin: '0 auto' }}
              >
                Voltar à Página Inicial
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer onOpenDonation={() => setIsDonationModalOpen(true)} />

      {/* PIX Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </div>
  );
};

export default App;
