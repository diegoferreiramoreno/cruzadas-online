import type { GuessAttempt } from "../engine/types";

export type SourceCategory =
  | "Sagrada Escritura"
  | "Magistério e Documentos Conciliares"
  | "Catecismo da Igreja Católica"
  | "Patrística e Doutores da Igreja"
  | "Liturgia Oficial e Calendário Geral"
  | "História Eclesiástica Documentada"
  | "Tradição e Devoção Popular"
  | "Opiniões ou Hipóteses Teológicas";

export type EditorialStatus = "Draft" | "Verified" | "Published";

export interface DailyChallenge {
  id: string; // cruzadas-YYYY-MM-DD
  cycleDate: string; // YYYY-MM-DD
  word: string; // Termo canônico editorial completo com grafia e acentuação correta
  normalizedWord: string; // Termo em maiúsculas sem diacríticos (A-Z)
  wordLength: number; // Invariante: wordLength === normalizedWord.length
  initialClue: string;
  postGameContext: string;
  sourceCitation: string;
  sourceCategory: SourceCategory;
  editorialStatus: EditorialStatus;
}

export type GameSessionStatus = "IN_PROGRESS" | "WON" | "LOST";

export interface GameSession {
  version: 1;
  originCycleId: string; // YYYY-MM-DD
  wordLength: number;
  guesses: GuessAttempt[];
  status: GameSessionStatus;
  startedAt: string; // ISO 8601 UTC
  completedAt: string | null; // ISO 8601 UTC
  lastActivityAt: string; // ISO 8601 UTC
}

export interface PlayerStats {
  version: 1;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
  lastCompletedCycleId: string | null; // YYYY-MM-DD
  completedCycleIds: string[]; // YYYY-MM-DD sem duplicatas
  cohortCycleId: string | null; // YYYY-MM-DD (originCycleId da 1ª conclusão)
  reportedMilestones: Array<"D1" | "D7" | "D14">; // sem duplicatas
}

export type TelemetryEventType =
  | "page_view"
  | "game_started"
  | "game_completed"
  | "cohort_started"
  | "cohort_milestone"
  | "share_clicked"
  | "interest_expressed";

export type ShareChannel = "web_share" | "clipboard";
export type InterestTopic = "general_support";

export interface TelemetryPayload {
  eventType: TelemetryEventType;
  cycleId: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601 UTC
  properties?: {
    outcome?: "won" | "lost";
    attemptsUsed?: number;
    originCycleId?: string;
    cohortCycleId?: string; // YYYY-MM-DD
    milestone?: "D1" | "D7" | "D14";
    currentStreak?: number;
    shareChannel?: ShareChannel;
    interestTopic?: InterestTopic;
  };
}
