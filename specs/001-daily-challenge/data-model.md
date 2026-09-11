# Data Model: Desafio Diário Web-First (Shape 1)

**Feature Branch**: `001-daily-challenge`  
**Date**: 2026-09-11  
**Status**: Proposed / Pending PO Gate  

---

## 1. Domain Entities & Type Definitions

### 1.1 `DailyChallenge` (Entidade Conceitual de Conteúdo)
Representa a unidade editorial do enigma vinculada a um dia civil específico no Horário de Brasília (UTC-3).
A única fonte da verdade para o comprimento do termo secreto é `normalizedWord.length`. O campo `wordLength` é mantido por conveniência estrutural no schema e no carregamento, sendo compulsoriamente validado por `validate-challenges.ts` (a compilação falha se `wordLength !== normalizedWord.length`).

| Campo | Tipo | Obrigatório | Descrição & Regras de Validação |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Sim | Identificador estável do desafio (ex.: `"cruzadas-2026-09-11"`). |
| `cycleDate` | `string` | Sim | Data civil oficial de publicação no formato `"YYYY-MM-DD"` (Horário de Brasília UTC-3). |
| `word` | `string` | Sim | Termo canônico editorial completo com grafia e acentuação correta (`minLength: 1`). |
| `normalizedWord` | `string` | Sim | Termo normalizado em caixa alta, sem diacríticos (A-Z) (`minLength: 1`, pattern `^[A-Z]+$`). |
| `wordLength` | `number` | Sim | Quantidade de letras da palavra secreta, obrigatoriamente igual a `normalizedWord.length`. |
| `initialClue` | `string` | Sim | Pista temática inicial para o jogador sem revelar letras (`minLength: 1`). |
| `postGameContext` | `string` | Sim | Nota de contextualização formativa pós-jogo (`minLength: 1`). |
| `sourceCitation` | `string` | Sim | Citação de fonte adequada, verificável e rastreável segundo a natureza da afirmação (`minLength: 1`). |
| `sourceCategory` | `SourceCategory` | Sim | Categoria formal da fonte documental segundo as 8 categorias do Princípio IX da Constituição. |
| `editorialStatus` | `EditorialStatus` | Sim | Status editorial de governança (`"Draft"` \| `"Verified"` \| `"Published"`). Somente `"Verified"` e `"Published"` são elegíveis para publicação. |

```typescript
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
  id: string;
  cycleDate: string; // YYYY-MM-DD
  word: string;
  normalizedWord: string;
  wordLength: number; // Invariante: wordLength === normalizedWord.length
  initialClue: string;
  postGameContext: string;
  sourceCitation: string;
  sourceCategory: SourceCategory;
  editorialStatus: EditorialStatus;
}
```

---

### 1.2 `LetterFeedback` & `GuessAttempt` (Entidades do Motor de Jogo)
Representa o resultado determinístico da avaliação posicional de uma tentativa. O número de letras avaliadas é determinado dinamicamente pelo `wordLength` do desafio ativo.

```typescript
export type LetterStatus = "correct" | "present" | "absent";

export interface LetterEvaluation {
  letter: string;         // Letra digitada normalizada (A-Z)
  status: LetterStatus;   // correct = exata; present = deslocada; absent = não existente ou excedente
}

export interface GuessAttempt {
  attemptIndex: number;            // 0 a 5 (até 6 tentativas)
  rawInput: string;                // Entrada digitada pelo usuário
  normalizedInput: string;         // Entrada normalizada A-Z
  evaluations: LetterEvaluation[]; // Array de avaliações (tamanho == wordLength)
  submittedAt: string;             // ISO 8601 timestamp UTC
}
```

---

### 1.3 `GameSession` (Estado da Partida Local)
Representa o estado transitório ou concluído da partida no dispositivo do jogador (`cruzadas_session_v1`).

| Campo | Tipo | Obrigatório | Descrição & Regras de Validação |
| :--- | :--- | :---: | :--- |
| `version` | `number` | Sim | Versão do schema de persistência (valor fixo: `1`). |
| `originCycleId` | `string` | Sim | Data civil de origem da partida no formato `"YYYY-MM-DD"`. |
| `wordLength` | `number` | Sim | Quantidade de letras exigida para as tentativas do desafio desta sessão. |
| `guesses` | `GuessAttempt[]` | Sim | Lista ordenada de tentativas realizadas (mínimo 0, máximo 6). |
| `status` | `GameSessionStatus` | Sim | Status da partida (`"IN_PROGRESS"` \| `"WON"` \| `"LOST"`). |
| `startedAt` | `string` | Sim | Timestamp ISO 8601 do início da partida. |
| `completedAt` | `string \| null` | Não | Timestamp ISO 8601 da conclusão (vitória ou término das tentativas). |
| `lastActivityAt` | `string` | Sim | Timestamp ISO 8601 da última interação do jogador. |

```typescript
export type GameSessionStatus = "IN_PROGRESS" | "WON" | "LOST";

export interface GameSession {
  version: 1;
  originCycleId: string; // YYYY-MM-DD
  wordLength: number;
  guesses: GuessAttempt[];
  status: GameSessionStatus;
  startedAt: string;
  completedAt: string | null;
  lastActivityAt: string;
}
```

---

### 1.4 `PlayerStats` (Indicadores de Hábito Locais)
Armazena os indicadores acumulados do jogador no dispositivo (`cruzadas_stats_v1`), estruturado com chaves formatadas e arrays sem duplicatas para suportar o algoritmo de sequências com sessões atrasadas e coortes anônimas.

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `version` | `number` | Sim | Versão do schema de persistência (valor fixo: `1`). |
| `gamesPlayed` | `number` | Sim | Total de partidas concluídas (vitórias + términos de tentativas válidos). |
| `gamesWon` | `number` | Sim | Total de partidas concluídas com vitória. |
| `currentStreak` | `number` | Sim | Sequência atual de dias consecutivos jogados em relação ao ciclo corrente oficial. |
| `maxStreak` | `number` | Sim | Maior sequência histórica de dias consecutivos alcançada. |
| `guessDistribution` | `Record<1 \| 2 \| 3 \| 4 \| 5 \| 6, number>` | Sim | Distribuição quantitativa de vitórias pelo número de tentativas necessárias. |
| `lastCompletedCycleId` | `string \| null` | Não | Data civil (`"YYYY-MM-DD"`) do ciclo de origem do último desafio concluído. |
| `completedCycleIds` | `string[]` | Sim | Lista única e ordenada de datas civis de ciclos de origem concluídos. |
| `cohortCycleId` | `string \| null` | Não | Data civil (`"YYYY-MM-DD"`) do `originCycleId` da primeira partida concluída no dispositivo. |
| `reportedMilestones` | `Array<"D1" \| "D7" \| "D14">` | Sim | Lista única de marcos de retorno já emitidos por este dispositivo. |

```typescript
export interface PlayerStats {
  version: 1;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
  };
  lastCompletedCycleId: string | null; // YYYY-MM-DD
  completedCycleIds: string[];         // YYYY-MM-DD sem duplicatas
  cohortCycleId: string | null;        // YYYY-MM-DD (originCycleId da 1ª conclusão)
  reportedMilestones: Array<"D1" | "D7" | "D14">; // sem duplicatas
}
```

---

### 1.5 `TelemetryPayload` (Contrato de Sinais Analíticos Agregados)
Eventos minimizados emitidos via `POST /api/telemetry` para agregação no Cloudflare D1.
*Nota*: O evento `game_abandoned` foi excluído do MVP, pois o abandono permanente não é confiavelmente observável no modelo anônimo/local-state sem timeouts artificiais.

```typescript
export type TelemetryEventType =
  | "page_view"
  | "game_started"
  | "game_completed"
  | "cohort_started"
  | "cohort_milestone"
  | "share_clicked"
  | "interest_expressed";

export interface TelemetryPayload {
  eventType: TelemetryEventType;
  cycleId: string;
  timestamp: string; // ISO 8601 UTC
  properties?: {
    outcome?: "won" | "lost";
    attemptsUsed?: number;
    originCycleId?: string;
    cohortCycleId?: string; // YYYY-MM-DD
    milestone?: "D1" | "D7" | "D14";
    currentStreak?: number;
    shareChannel?: string;
    interestTopic?: string;
  };
}
```

---

## 2. Algoritmo Determinístico de Sequências (*Streaks*) e Sessões Prolongadas

### 2.1 Caso Crítico Aprovado: Partida Prolongada por Múltiplos Dias
- **Dia 10**: Jogador inicia o desafio do Dia 10 (`originCycleId = "2026-09-10"`).
- **Dia 11**: Nenhuma partida é concluída neste ciclo diário oficial (00:00:00 às 23:59:59 UTC-3).
- **Dia 12**: Jogador retorna à aba aberta e finalmente conclui o desafio do Dia 10.

### 2.2 Regras Determinísticas de Atualização
Ao concluir a partida de `originCycleId` na data oficial corrente `todayCycleId`:
1. **Atribuição**: A conclusão pertence **estritamente ao ciclo de origem** (`originCycleId = "2026-09-10"`), e `originCycleId` é adicionado à lista `completedCycleIds` (garantindo ausência de duplicatas);
2. **Ciclo Ausente**: O Dia 11 **permanece ausente** em `completedCycleIds`. A conclusão tardia do Dia 10 NÃO preenche retroativamente nem recupera o Dia 11;
3. **Não Contabilização para o Dia Atual**: A conclusão do Dia 10 **NÃO conta como conclusão do Dia 12**. O desafio do Dia 12 fica disponível para ser jogado em seguida;
4. **Comportamento de `currentStreak`**:
   - Como o ciclo oficial ativo é o Dia 12 e o Dia 11 não foi jogado, a sequência ativa de dias consecutivos encontra-se quebrada;
   - A conclusão tardia do Dia 10 **NÃO ressuscita a sequência quebrada**. Logo, como de Dia 12, **`currentStreak = 0`**;
   - Quando o jogador posteriormente jogar e concluir o desafio do Dia 12, inicia-se uma nova sequência: **`currentStreak = 1`**;
5. **Cálculo de `maxStreak`**:
   - Avalia-se a maior quantidade de dias civis consecutivos em `completedCycleIds`. Se a inclusão do Dia 10 formar uma cadeia consecutiva válida no passado (ex.: Dia 9 + Dia 10 = 2 dias), essa sequência é computada e atualiza `maxStreak` caso supere o recorde anterior.

```typescript
export function calculateStreaks(
  completedCycleIds: string[],
  todayCycleId: string
): { currentStreak: number; maxStreak: number } {
  // Ordena datas únicas no formato YYYY-MM-DD
  const sortedDates = Array.from(new Set(completedCycleIds)).sort();
  
  // 1. Calcula maxStreak histórico (maior sequência consecutiva em sortedDates)
  let maxStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;
  
  for (const dateStr of sortedDates) {
    const currDate = new Date(dateStr + "T12:00:00Z");
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
      if (diffDays === 1) {
        running += 1;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevDate = currDate;
    if (running > maxStreak) {
      maxStreak = running;
    }
  }

  // 2. Calcula currentStreak em relação a todayCycleId
  // currentStreak só é > 0 se o desafio de HOJE ou de ONTEM tiver sido concluído
  let currentStreak = 0;
  const today = new Date(todayCycleId + "T12:00:00Z");
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const completedSet = new Set(sortedDates);
  
  if (completedSet.has(todayCycleId)) {
    // Sequência ativa terminando hoje: conta para trás
    currentStreak = 1;
    let checkDate = yesterday;
    while (completedSet.has(checkDate.toISOString().slice(0, 10))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
  } else if (completedSet.has(yesterdayStr)) {
    // Jogou ontem mas ainda não jogou hoje: a sequência de ontem permanece ativa
    currentStreak = 1;
    let checkDate = new Date(yesterday.getTime() - 86400000);
    while (completedSet.has(checkDate.toISOString().slice(0, 10))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
  } else {
    // Nem hoje nem ontem foram concluídos: sequência atual é zero
    currentStreak = 0;
  }

  return { currentStreak, maxStreak };
}
```

---

## 3. Máquina de Estados da Partida (`GameSession`)

```text
       [ Acesso à Aplicação ]
                 │
                 ▼
          ┌──────────────┐
          │ NOT_STARTED  │
          └──────┬───────┘
                 │ 1ª tentativa submetida (palavra válida com wordLength)
                 ▼
          ┌──────────────┐
     ┌───►│ IN_PROGRESS  │
     │    └──────┬───────┘
     │           │
     │ Tentativa │ Palpite correto em <= 6 tentativas
     │ incorreta │ ──────────────────────────────────────┐
     │ (tent. <6)│                                       │
     │           │ 6ª tentativa incorreta                │
     └───────────┤                                       │
                 ▼                                       ▼
          ┌──────────────┐                        ┌──────────────┐
          │     LOST     │                        │     WON      │
          └──────┬───────┘                        └──────┬───────┘
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │    COMPLETED     │
                            │ (Replay Bloq.)   │
                            │ Tela Pós-Jogo    │
                            └──────────────────┘
```
