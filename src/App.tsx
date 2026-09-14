import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { DailyChallenge, GameSession, PlayerStats, GameSessionStatus, ShareChannel } from './types';
import type { GuessAttempt, LetterStatus } from './engine/types';
import { normalizeWord } from './engine/normalizer';
import {
  isAcceptedWord,
  isVocabularyLoading,
  loadVocabulary,
  setActiveChallengeSecret
} from './services/vocabularyService';
import { evaluateGuess } from './engine/evaluator';
import { fetchChallenge } from './services/challengeService';
import {
  loadSession,
  saveSession,
  loadStats,
  saveStats
} from './services/storageService';
import { calculateStreaks } from './services/streakService';
import { getBrasiliaCycleId } from './services/timeService';
import { emitTelemetry, checkAndEmitCohortMilestones } from './services/telemetryService';
import { Header } from './components/layout/Header';
import { ThematicClue } from './components/game/ThematicClue';
import { Board } from './components/game/Board';
import { Keyboard } from './components/game/Keyboard';
import { FeedbackAlert } from './components/layout/FeedbackAlert';
import { HowToPlayModal } from './components/modals/HowToPlayModal';
import { PostGameModal } from './components/modals/PostGameModal';
import { StatsModal } from './components/modals/StatsModal';
import { usePhysicalKeyboard } from './hooks/usePhysicalKeyboard';

export function App() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [guesses, setGuesses] = useState<GuessAttempt[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameStatus, setGameStatus] = useState<GameSessionStatus>('IN_PROGRESS');

  const [stats, setStats] = useState<PlayerStats>(() => loadStats());

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isPostGameOpen, setIsPostGameOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Synchronized refs to guarantee atomic access
  const guessesRef = useRef<GuessAttempt[]>([]);
  const currentInputRef = useRef('');
  const gameStatusRef = useRef<GameSessionStatus>('IN_PROGRESS');
  const currentSessionRef = useRef<GameSession | null>(null);

  useEffect(() => {
    guessesRef.current = guesses;
    currentInputRef.current = currentInput;
    gameStatusRef.current = gameStatus;
  }, [guesses, currentInput, gameStatus]);

  // Load stats and challenge/session
  useEffect(() => {
    let mounted = true;
    const savedSession = loadSession();
    currentSessionRef.current = savedSession;

    const loadGameData = async () => {
      try {
        if (savedSession) {
          // If session is in progress for a specific cycle (either today or historical delayed), load that cycle
          if (savedSession.status === 'IN_PROGRESS') {
            const data = await fetchChallenge(savedSession.originCycleId);
            if (!mounted) return;
            setChallenge(data);
            setGuesses(savedSession.guesses || []);
            setGameStatus('IN_PROGRESS');
            setLoading(false);
            emitTelemetry({ eventType: 'page_view', cycleId: data.cycleDate });
            return;
          }

          // If saved session was already completed, check today's challenge
          const todayData = await fetchChallenge();
          if (!mounted) return;

          if (savedSession.originCycleId === todayData.cycleDate) {
            // Replay lock: same day already finished
            setChallenge(todayData);
            setGuesses(savedSession.guesses || []);
            setGameStatus(savedSession.status);
            setIsPostGameOpen(true);
            setLoading(false);
            emitTelemetry({ eventType: 'page_view', cycleId: todayData.cycleDate });
            return;
          }

          // Saved session was from a previous cycle, start today's challenge fresh
          setChallenge(todayData);
          setGuesses([]);
          setGameStatus('IN_PROGRESS');
          setLoading(false);
          emitTelemetry({ eventType: 'page_view', cycleId: todayData.cycleDate });
          return;
        }

        // No saved session: fetch today's challenge fresh
        const data = await fetchChallenge();
        if (!mounted) return;
        setChallenge(data);
        setGuesses([]);
        setGameStatus('IN_PROGRESS');
        setLoading(false);
        emitTelemetry({ eventType: 'page_view', cycleId: data.cycleDate });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Falha ao carregar o desafio');
        setLoading(false);
      }
    };

    loadGameData();

    return () => {
      mounted = false;
    };
  }, []);

  // Pre-load vocabulary bucket and set secret invariant when challenge is active
  useEffect(() => {
    if (challenge) {
      loadVocabulary(challenge.wordLength);
      setActiveChallengeSecret(challenge.normalizedWord);
    }
  }, [challenge]);

  const showFeedback = useCallback((msg: string) => {
    setFeedbackMessage(msg);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedbackMessage(null);
  }, []);

  // Handle letter typing
  const handleLetter = useCallback(
    (letter: string) => {
      if (gameStatusRef.current !== 'IN_PROGRESS' || isHowToPlayOpen || isPostGameOpen || isStatsOpen) {
        return;
      }
      if (!challenge) return;
      if (currentInputRef.current.length >= challenge.wordLength) return;

      const upper = letter.toUpperCase();
      if (/^[A-Z]$/.test(upper)) {
        const next = currentInputRef.current + upper;
        currentInputRef.current = next;
        setCurrentInput(next);
      }
    },
    [challenge, isHowToPlayOpen, isPostGameOpen, isStatsOpen]
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (gameStatusRef.current !== 'IN_PROGRESS' || isHowToPlayOpen || isPostGameOpen || isStatsOpen) {
      return;
    }
    const current = currentInputRef.current;
    if (current.length > 0) {
      const next = current.slice(0, -1);
      currentInputRef.current = next;
      setCurrentInput(next);
    }
  }, [isHowToPlayOpen, isPostGameOpen, isStatsOpen]);

  // Handle enter submission
  const handleEnter = useCallback(() => {
    if (gameStatusRef.current !== 'IN_PROGRESS' || isHowToPlayOpen || isPostGameOpen || isStatsOpen) {
      return;
    }
    if (!challenge) return;

    const input = currentInputRef.current;
    if (input.length < challenge.wordLength) {
      showFeedback('Letras insuficientes');
      return;
    }

    const normalizedGuess = normalizeWord(input);

    if (isVocabularyLoading(challenge.wordLength)) {
      showFeedback('Carregando vocabulário...');
      return;
    }

    if (!isAcceptedWord(normalizedGuess, challenge.wordLength, challenge.normalizedWord)) {
      showFeedback('Palavra não encontrada no vocabulário');
      return;
    }

    // Telemetry: game_started on first valid attempt
    if (guessesRef.current.length === 0) {
      emitTelemetry({
        eventType: 'game_started',
        cycleId: challenge.cycleDate
      });
    }

    // Evaluate guess
    const evalResult = evaluateGuess(normalizedGuess, challenge.normalizedWord);
    currentInputRef.current = '';
    setCurrentInput('');

    const newAttempt: GuessAttempt = {
      attemptIndex: guessesRef.current.length,
      rawInput: input,
      normalizedInput: normalizedGuess,
      evaluations: evalResult.evaluations,
      submittedAt: new Date().toISOString()
    };

    const nextGuesses = [...guessesRef.current, newAttempt];
    guessesRef.current = nextGuesses;
    setGuesses(nextGuesses);

    const isWin = evalResult.isWin;
    const isLoss = !isWin && nextGuesses.length >= 6;
    const newStatus: GameSessionStatus = isWin ? 'WON' : isLoss ? 'LOST' : 'IN_PROGRESS';

    // Persist session
    const updatedSession: GameSession = {
      version: 1,
      originCycleId: challenge.cycleDate,
      wordLength: challenge.wordLength,
      status: newStatus,
      startedAt: currentSessionRef.current?.startedAt || new Date().toISOString(),
      completedAt: newStatus !== 'IN_PROGRESS' ? new Date().toISOString() : null,
      lastActivityAt: new Date().toISOString(),
      guesses: nextGuesses
    };
    saveSession(updatedSession);
    currentSessionRef.current = updatedSession;

    if (newStatus !== 'IN_PROGRESS') {
      gameStatusRef.current = newStatus;
      setGameStatus(newStatus);
      setIsPostGameOpen(true);

      // Update PlayerStats
      const currentStats = loadStats();
      const updatedCompleted = Array.from(
        new Set([...currentStats.completedCycleIds, challenge.cycleDate])
      ).sort();

      // Today's cycle date from current date (or challenge if later)
      const officialToday = getBrasiliaCycleId();
      const todayCycleId = challenge.cycleDate > officialToday
        ? challenge.cycleDate
        : officialToday;

      const { currentStreak, maxStreak } = calculateStreaks(updatedCompleted, todayCycleId);

      const attemptsUsed = isWin ? (nextGuesses.length as 1 | 2 | 3 | 4 | 5 | 6) : null;
      const updatedDistribution = { ...currentStats.guessDistribution };
      if (attemptsUsed && attemptsUsed >= 1 && attemptsUsed <= 6) {
        updatedDistribution[attemptsUsed] = (updatedDistribution[attemptsUsed] || 0) + 1;
      }

      // Telemetry: game_completed
      emitTelemetry({
        eventType: 'game_completed',
        cycleId: challenge.cycleDate,
        properties: {
          outcome: isWin ? 'won' : 'lost',
          attemptsUsed: nextGuesses.length,
          originCycleId: challenge.cycleDate,
          currentStreak
        }
      });

      // Telemetry: cohort_started on first lifetime completion
      const isFirstLifetimeCompletion = !currentStats.cohortCycleId;
      if (isFirstLifetimeCompletion) {
        emitTelemetry({
          eventType: 'cohort_started',
          cycleId: todayCycleId,
          properties: {
            cohortCycleId: challenge.cycleDate
          }
        });
      }

      // Check and emit cohort milestones
      const statsForMilestone: PlayerStats = {
        ...currentStats,
        cohortCycleId: currentStats.cohortCycleId ?? challenge.cycleDate
      };
      const updatedMilestones = checkAndEmitCohortMilestones(statsForMilestone, challenge.cycleDate);

      const updatedStats: PlayerStats = {
        version: 1,
        gamesPlayed: currentStats.gamesPlayed + 1,
        gamesWon: currentStats.gamesWon + (isWin ? 1 : 0),
        currentStreak,
        maxStreak,
        guessDistribution: updatedDistribution,
        lastCompletedCycleId: challenge.cycleDate,
        completedCycleIds: updatedCompleted,
        cohortCycleId: currentStats.cohortCycleId ?? challenge.cycleDate,
        reportedMilestones: updatedMilestones
      };

      saveStats(updatedStats);
      setStats(updatedStats);
    }
  }, [challenge, showFeedback, isHowToPlayOpen, isPostGameOpen, isStatsOpen]);

  // Telemetry callbacks
  const handleShareCompleted = useCallback(
    (channel: string) => {
      if (!challenge) return;
      const shareChannel: ShareChannel = channel === 'web_share' ? 'web_share' : 'clipboard';
      emitTelemetry({
        eventType: 'share_clicked',
        cycleId: challenge.cycleDate,
        properties: {
          shareChannel
        }
      });
    },
    [challenge]
  );

  const handleInterestExpressed = useCallback(() => {
    if (!challenge) return;
    emitTelemetry({
      eventType: 'interest_expressed',
      cycleId: challenge.cycleDate,
      properties: {
        interestTopic: 'general_support'
      }
    });
  }, [challenge]);

  const handleClosePostGame = useCallback(async () => {
    setIsPostGameOpen(false);

    if (!challenge) return;
    const officialToday = getBrasiliaCycleId();

    // If the completed game was a historical session (e.g. Day 10 completed on Day 12),
    // after closing the modal, automatically transition to today's official challenge (Day 12).
    if (challenge.cycleDate < officialToday) {
      try {
        setLoading(true);
        const todayChallenge = await fetchChallenge();
        setChallenge(todayChallenge);

        const existingSession = loadSession();
        if (existingSession && existingSession.originCycleId === todayChallenge.cycleDate) {
          currentSessionRef.current = existingSession;
          setGuesses(existingSession.guesses);
          setGameStatus(existingSession.status);
          gameStatusRef.current = existingSession.status;
          if (existingSession.status !== 'IN_PROGRESS') {
            setIsPostGameOpen(true);
          }
        } else {
          const nowIso = new Date().toISOString();
          const freshSession: GameSession = {
            version: 1,
            originCycleId: todayChallenge.cycleDate,
            wordLength: todayChallenge.wordLength,
            guesses: [],
            status: 'IN_PROGRESS',
            startedAt: nowIso,
            completedAt: null,
            lastActivityAt: nowIso
          };
          saveSession(freshSession);
          currentSessionRef.current = freshSession;
          setGuesses([]);
          setCurrentInput('');
          currentInputRef.current = '';
          setGameStatus('IN_PROGRESS');
          gameStatusRef.current = 'IN_PROGRESS';
        }
      } catch (err) {
        console.error('Failed to load current official challenge after historical session:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [challenge]);

  // Handle virtual keyboard press
  const handleVirtualKeyPress = useCallback(
    (key: string) => {
      if (key === 'ENTER') {
        handleEnter();
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      } else {
        handleLetter(key);
      }
    },
    [handleEnter, handleBackspace, handleLetter]
  );

  // Physical keyboard hook
  usePhysicalKeyboard({
    onLetter: handleLetter,
    onEnter: handleEnter,
    onBackspace: handleBackspace,
    disabled: gameStatus !== 'IN_PROGRESS' || isHowToPlayOpen || isPostGameOpen || isStatsOpen
  });

  // Calculate keyboard letter statuses
  const letterStatuses = useMemo(() => {
    const statuses: Record<string, LetterStatus> = {};
    for (const guess of guesses) {
      for (const ev of guess.evaluations) {
        const current = statuses[ev.letter];
        if (ev.status === 'correct') {
          statuses[ev.letter] = 'correct';
        } else if (ev.status === 'present' && current !== 'correct') {
          statuses[ev.letter] = 'present';
        } else if (ev.status === 'absent' && !current) {
          statuses[ev.letter] = 'absent';
        }
      }
    }
    return statuses;
  }, [guesses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="text-center p-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-4" />
          <p className="font-serif text-lg">Carregando o enigma de hoje...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="text-center max-w-md p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-red-200 dark:border-red-900">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Desafio Indisponível</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error || 'Não foi possível carregar o desafio.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 max-w-full overflow-x-hidden">
      <Header
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-2 py-4">
        <FeedbackAlert
          message={feedbackMessage}
          onDismiss={clearFeedback}
        />

        <ThematicClue clue={challenge.initialClue} />

        <Board
          wordLength={challenge.wordLength}
          guesses={guesses}
          currentInput={currentInput}
          maxAttempts={6}
        />
      </main>

      <footer className="w-full pb-4">
        <Keyboard
          onKeyPress={handleVirtualKeyPress}
          letterStatuses={letterStatuses}
        />
      </footer>

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {challenge && (
        <PostGameModal
          isOpen={isPostGameOpen}
          onClose={handleClosePostGame}
          status={gameStatus === 'WON' ? 'WON' : 'LOST'}
          attemptsCount={guesses.length}
          challenge={challenge}
          guesses={guesses}
          onShareCompleted={handleShareCompleted}
          onInterestExpressed={handleInterestExpressed}
        />
      )}

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />
    </div>
  );
}
