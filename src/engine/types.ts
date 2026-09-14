export type LetterStatus = "correct" | "present" | "absent";

export interface LetterEvaluation {
  letter: string; // Letra digitada normalizada (A-Z)
  status: LetterStatus; // correct = exata; present = deslocada; absent = não existente ou excedente
}

export interface GuessAttempt {
  attemptIndex: number; // 0 a 5 (até 6 tentativas)
  rawInput: string; // Entrada digitada pelo usuário
  normalizedInput: string; // Entrada normalizada A-Z
  evaluations: LetterEvaluation[]; // Array de avaliações (tamanho == wordLength)
  submittedAt: string; // ISO 8601 timestamp UTC
}
