# Tasks: Desafio Diário Web-First (Shape 1)

**Input**: Design documents from `/specs/001-daily-challenge/`
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/), [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story according to Spec-Driven Development.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3], [US4])
- Every task includes exact file paths and verbatim data constraints where applicable

## Path Conventions

- **Application Root**: `cruzadas-online/`
- **SPA Source**: `src/` (components, engine, hooks, services, types)
- **Worker API**: `worker/` (`worker/index.ts`, `worker/migrations/`, `worker/generated/`)
- **Editorial Content**: `content/challenges/` (versioned production editorial source of truth)
- **Test Fixtures**: `tests/fixtures/challenges/` (isolated from production registry)
- **Public Assets & Dictionaries**: `public/` (`public/data/`)
- **Tests**: `tests/` (`tests/unit/`, `tests/integration/`, `tests/a11y/`, `tests/contracts/`)
- **Build & CI Scripts**: `scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, `.gitignore`, pinned 2026 toolchain, self-enforcing build scripts, D1 configuration, and shared build tools.

- [ ] T001 Initialize repository directory structure per implementation plan (`content/challenges/`, `tests/fixtures/challenges/`, `worker/migrations/`, `public/data/`, `src/engine/`, `src/services/`, `src/components/game/`, `src/components/layout/`, `src/components/modals/`, `src/components/ui/`, `src/hooks/`, `src/types/`, `tests/unit/engine/`, `tests/unit/services/`, `tests/unit/contracts/`, `tests/unit/worker/`, `tests/integration/`, `tests/a11y/`, `scripts/`)
- [ ] T002 [P] Configure `.gitignore` in repository root to ignore `dist/`, `.wrangler/`, `.dev.vars*`, and `worker/generated/`, ensuring `content/challenges/` remains tracked as the versioned editorial source of truth
- [ ] T003 Initialize `package.json` with pinned 2026 toolchain dependencies under Node.js 24 LTS (React and React DOM `~19.3.0`, Vite `~8.1.0`, TypeScript `~6.0.2`, Tailwind CSS `~4.3.0`, Vitest `~5.0.0`, ESLint `~10.0.0`, `@vitejs/plugin-react`, `@cloudflare/vite-plugin`, `@tailwindcss/vite`, `wrangler`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest-axe`, `lucide-react`, `@radix-ui/react-dialog`, `typescript-eslint`, `eslint-plugin-react-hooks`, `jsdom`, `ajv`, `ajv-formats`, `@types/react`, `@types/react-dom`, `tsx`) and explicit project scripts: `"dev": "vite"`, `"predev": "npm run generate:registry"`, `"build": "vite build"`, `"prebuild": "npm run validate:content && npm run generate:registry"`, `"typecheck": "tsc --noEmit"`, `"lint": "eslint ."`, `"test": "vitest run"`, `"validate:content": "tsx scripts/validate-challenges.ts"`, and `"generate:registry": "tsx scripts/generate-challenge-registry.ts"`, enforcing the prebuild invariant where `npm run build` cannot bypass content validation or registry generation
- [ ] T004 [P] Configure TypeScript compiler options in `tsconfig.json` with `"strict": true`, `"target": "ES2022"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`, `"jsx": "react-jsx"`, and worker/DOM type declarations
- [ ] T005 [P] Configure ESLint 10 Flat Config in `eslint.config.js` using `typescript-eslint` compatible with TypeScript 6.0 and `eslint-plugin-react-hooks`
- [ ] T006 [P] Configure Vite 8 bundler in `vite.config.ts` loading `@vitejs/plugin-react`, `@tailwindcss/vite`, and `@cloudflare/vite-plugin` for Workers Static Assets development
- [ ] T007 [P] Configure Tailwind CSS 4 design tokens in `src/index.css` defining color palette, high-contrast focus rings (`focus-visible`), and ergonomic touch target dimensions (>= 44/48px)
- [ ] T008 [P] Configure Cloudflare Workers topology in `wrangler.jsonc` defining `"$schema": "node_modules/wrangler/config-schema.json"`, `name: "cruzadas-online"`, `compatibility_date: "2026-09-11"`, `main: "./worker/index.ts"`, `assets: { "not_found_handling": "single-page-application", "run_worker_first": ["/api/*"] }` (omitting hardcoded assets directory which is auto-resolved by `@cloudflare/vite-plugin`, avoiding unused ASSETS binding), and D1 database binding `DB` with `migrations_dir: "worker/migrations"` and environment-specific `database_id` obtained upon provisioning
- [ ] T009 [P] Configure Vitest 5 test runner in `vitest.config.ts` and test environment setup in `tests/setup.ts` with `jsdom`, `@testing-library/jest-dom`, and `vitest-axe` matchers
- [ ] T010 Configure Cloudflare D1 provisioning and local migration workflow: document CLI instructions to provision or bind `cruzadas-telemetry-d1` when authenticated (`wrangler d1 create cruzadas-telemetry-d1` or lookup), populate real `database_id` without inventing fake UUIDs, and establish local development migration command (`wrangler d1 migrations apply cruzadas-telemetry-d1 --local`) keeping local D1 SQLite separate from remote production data

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain engine, data models, contracts, content compilation pipeline, and Cloudflare Worker API skeleton.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T011 [P] Define core domain evaluation types in `src/engine/types.ts` verbatim from data-model: `LetterStatus` (`"correct" | "present" | "absent"`), `LetterEvaluation` (`letter: string`, `status: LetterStatus`), and `GuessAttempt` (`attemptIndex: number` 0 to 5, `rawInput: string`, `normalizedInput: string`, `evaluations: LetterEvaluation[]`, `submittedAt: string`)
- [ ] T012 [P] Define application-wide data contracts and entity interfaces in `src/types/index.ts` quoting verbatim data-model definitions: `SourceCategory` (8 categories enum: `"Sagrada Escritura" | "Magistério e Documentos Conciliares" | "Catecismo da Igreja Católica" | "Patrística e Doutores da Igreja" | "Liturgia Oficial e Calendário Geral" | "História Eclesiástica Documentada" | "Tradição e Devoção Popular" | "Opiniões ou Hipóteses Teológicas"`), `EditorialStatus` (`"Draft" | "Verified" | "Published"`), `DailyChallenge` (all fields required: `id: string` matching `^cruzadas-[0-9]{4}-[0-9]{2}-[0-9]{2}$`, `cycleDate: string` YYYY-MM-DD, `word: string`, `normalizedWord: string` pattern `^[A-Z]+$`, `wordLength: number` invariant `wordLength === normalizedWord.length`, `initialClue: string`, `postGameContext: string`, `sourceCitation: string`, `sourceCategory: SourceCategory`, `editorialStatus: EditorialStatus`), `GameSession` (`version: 1`, `originCycleId: string`, `wordLength: number`, `guesses: GuessAttempt[]`, `status: "IN_PROGRESS" | "WON" | "LOST"`, `startedAt: string`, `completedAt: string | null`, `lastActivityAt: string`), `PlayerStats` (`version: 1`, `gamesPlayed: number`, `gamesWon: number`, `currentStreak: number`, `maxStreak: number`, `guessDistribution: Record<1|2|3|4|5|6, number>`, `lastCompletedCycleId: string | null`, `completedCycleIds: string[]`, `cohortCycleId: string | null`, `reportedMilestones: Array<"D1" | "D7" | "D14">`), and `TelemetryPayload` (`eventType: TelemetryEventType`, `cycleId: string`, `timestamp: string`, `properties?: object`)
- [ ] T013 [P] Implement unit tests for text normalization in `tests/unit/engine/normalizer.test.ts` asserting removal of all diacritics (á, à, â, ã → A; é, ê → E; í → I; ó, ô, õ → O; ú → U; ç → C), case insensitivity, and explicit equivalence `normalizeWord('ACAO') === normalizeWord('AÇÃO')`
- [ ] T014 Implement orthographic normalizer in `src/engine/normalizer.ts` using `String.prototype.normalize('NFD')` and regex removal of diacritical marks `[\u0300-\u036f]` returning uppercase A-Z string
- [ ] T015 [P] Implement unit tests for vocabulary validation in `tests/unit/engine/vocabulary.test.ts` verifying fast O(1) set membership, rejecting terms with spaces, hyphens, numbers, or symbols, and accepting common Portuguese vocabulary as well as Catholic/biblical proper nouns (`MARIA`, `PEDRO`, `JESUS`, `BENTO`)
- [ ] T016 Create accepted vocabulary dataset in `public/data/vocabulary-pt.json` and implement vocabulary lookup validator in `src/engine/vocabulary.ts` using `Set<string>` with fast O(1) membership check
- [ ] T017 [P] Implement unit tests for guess evaluation in `tests/unit/engine/evaluator.test.ts` asserting strict positional rules, variable word length support (`normalizedWord.length`), and canonical duplicate letters case (`MARIA` vs `ARARA`: 5th 'A' correct, 1st 'A' present, 3rd 'A' absent; 4th 'R' absent, 2nd 'R' present)
- [ ] T018 Implement deterministic evaluation algorithm in `src/engine/evaluator.ts` implementing the two-pass algorithm: 1st pass for exact matches (`correct`) consuming secret letter occurrences, 2nd pass for displaced matches (`present`) up to remaining secret counts, marking surplus as `absent`
- [ ] T019 [P] Implement unit tests for time service in `tests/unit/services/timeService.test.ts` verifying Brasília Time (UTC-3), calculation of midnight 00:00:00 boundary, date formatting `YYYY-MM-DD`, and milliseconds remaining until next cycle
- [ ] T020 Implement time service in `src/services/timeService.ts` providing injectable date/time utilities calculating civil calendar dates and midnight boundaries in America/Sao_Paulo (UTC-3)
- [ ] T021 [P] Implement content validation script in `scripts/validate-challenges.ts` validating all files in `content/challenges/*.json` using Ajv and Ajv-formats against `specs/001-daily-challenge/contracts/challenge-schema.json`, verifying `wordLength === normalizedWord.length`, and enforcing that production build strictly rejects `editorialStatus === "Draft"` and fails if zero publishable challenges (`editorialStatus` of `"Verified"` or `"Published"`) exist in `content/challenges/`, blocking release on an empty production registry without accepting test fixtures
- [ ] T022 [P] Create development and test fixture challenges in `tests/fixtures/challenges/` (isolated from `content/challenges/` to guarantee test fixtures are never bundled into production registry) complying with `challenge-schema.json` across liturgical/biblical categories
- [ ] T023 Implement registry compiler script in `scripts/generate-challenge-registry.ts` reading strictly from `content/challenges/*.json` (ignoring `tests/fixtures/challenges/`) and generating server-side TypeScript registry `worker/generated/challenge-registry.ts` (keeping future challenges hidden from client static bundles)
- [ ] T024 [P] Implement initial Cloudflare D1 migration in `worker/migrations/0001_initial_schema.sql` creating `daily_metrics` table `(cycle_date TEXT, metric_name TEXT, dimension TEXT, count INTEGER, PRIMARY KEY (cycle_date, metric_name, dimension))` and `cohort_metrics` table `(cohort_cycle_id TEXT, milestone TEXT, count INTEGER, PRIMARY KEY (cohort_cycle_id, milestone))`
- [ ] T025 Implement Cloudflare Worker API entrypoint in `worker/index.ts` handling `GET /api/challenge/today` with optional `?date=YYYY-MM-DD` query parameter: no date defaults to current official Brasília cycle (UTC-3); valid past date returns corresponding historical challenge from `challenge-registry.ts`; future date returns HTTP 404; malformed date returns HTTP 400; unavailable past challenge returns HTTP 404; and skeleton for `POST /api/telemetry` with D1 database binding `env.DB`

**Checkpoint**: Core domain engine, validation scripts, time boundaries, isolated test fixtures, and Worker API skeleton verified. User stories can now proceed.

---

## Phase 3: User Story 1 - Jogar o Desafio Periódico Aberto e Visualizar o Conteúdo Cultural/Litúrgico Pós-Jogo (Priority: P1) 🎯 MVP

**Goal**: Permitir que qualquer usuário acesse a aplicação web diretamente sem cadastro ou login, jogue o enigma do dia com até 6 tentativas, receba feedback acessível por letra (símbolo + cor + aria-label), e ao finalizar visualize a tela pós-jogo com o termo correto, nota de contextualização formativa e citação documental verificável (Princípio IX).

**Independent Test**: Carregar a aplicação com desafio mock ativo, submeter tentativas via teclado em tela e físico, verificar que cada letra recebe feedback posicional com símbolos acessíveis, concluir a partida (por vitória ou por esgotamento de 6 tentativas) e verificar a exibição da tela pós-jogo com termo acentuado (`word`), `postGameContext`, `sourceCitation` e `sourceCategory`.

### Tests for User Story 1 ⚠️

- [ ] T026 [P] [US1] Unit test for challenge loading service in `tests/unit/services/challengeService.test.ts` testing successful fetch from `GET /api/challenge/today` for current cycle, historical challenge query (`?date=YYYY-MM-DD`), future date returning HTTP 404, malformed date returning HTTP 400, unavailable past challenge returning HTTP 404, and network failure fallback
- [ ] T027 [P] [US1] Integration test for complete gameplay loop in `tests/integration/GameFlow.test.tsx` verifying board rendering, rejection of invalid-length guesses and unknown words (confirming feedback displays, attempt is NOT consumed, row does not advance, and game does not start), guess submissions, feedback reflection on virtual keyboard, winning state, and loss after 6 attempts

### Implementation for User Story 1

- [ ] T028 [P] [US1] Implement challenge client service in `src/services/challengeService.ts` providing `fetchChallenge(cycleId?: string)` calling `/api/challenge/today` (or with `?date=${cycleId}`) with typed response parsing, validation, and error handling
- [ ] T029 [P] [US1] Implement accessible atomic UI components in `src/components/ui/Button.tsx`, `src/components/ui/Modal.tsx` (using Radix Dialog primitive with focus trap), and `src/components/ui/SymbolIcon.tsx` (rendering SVG check for `correct`, triangle for `present`, minus for `absent`)
- [ ] T030 [P] [US1] Implement Cell component in `src/components/game/Cell.tsx` rendering letter, state-based colors, embedded `SymbolIcon`, and `aria-label` announcing letter evaluation status
- [ ] T031 [US1] Implement Row component in `src/components/game/Row.tsx` rendering `wordLength` cells, handling empty, active input with cursor indicator, and evaluated attempts
- [ ] T032 [US1] Implement Board component in `src/components/game/Board.tsx` displaying 6 rows of attempts with dynamic column grid based on active challenge `wordLength`
- [ ] T033 [P] [US1] Implement Key component in `src/components/game/Key.tsx` with ergonomic touch target dimensions (>= 44/48px), keyboard status styling, and high-contrast `focus-visible` ring
- [ ] T034 [US1] Implement on-screen Keyboard component in `src/components/game/Keyboard.tsx` rendering QWERTY layout with Enter, Backspace, and keys reflecting best letter evaluation (`correct` > `present` > `absent`)
- [ ] T035 [P] [US1] Implement ThematicClue component in `src/components/game/ThematicClue.tsx` displaying `DailyChallenge.initialClue` prominently above the game board
- [ ] T036 [P] [US1] Implement Header component in `src/components/layout/Header.tsx` displaying game title, how-to-play button, and stats modal trigger button
- [ ] T037 [P] [US1] Implement FeedbackAlert component in `src/components/layout/FeedbackAlert.tsx` with `aria-live="polite"` or `assertive` for transient error messages ("Palavra não encontrada no vocabulário", "Letras insuficientes")
- [ ] T038 [P] [US1] Implement HowToPlayModal component in `src/components/modals/HowToPlayModal.tsx` explaining 6 attempts, thematic clue, letter feedback rules with symbols, and orthographic normalization examples (`ACAO` = `AÇÃO`)
- [ ] T039 [US1] Implement PostGameModal component in `src/components/modals/PostGameModal.tsx` displaying game outcome (win/loss), attempts count, canonical acented word (`DailyChallenge.word`), `postGameContext`, `sourceCitation`, and `sourceCategory`
- [ ] T040 [US1] Implement physical keyboard listener hook in `src/hooks/usePhysicalKeyboard.ts` handling A-Z input, Enter submission, Backspace deletion, and ignoring browser shortcut modifiers
- [ ] T041 [US1] Implement core game state orchestrator in `src/App.tsx` coordinating challenge loading, input buffer, strict guess validation against `wordLength` and accepted vocabulary (ensuring invalid inputs display `FeedbackAlert`, do NOT consume attempts, do NOT advance the row, and do NOT trigger game start until the first valid submission), attempt evaluations, win/loss transitions, and modal triggers

**Checkpoint**: User Story 1 (MVP) is fully functional and independently testable without persistence or analytics.

---

## Phase 4: User Story 2 - Preservação de Estado Local e Acompanhamento de Ciclos Periódicos (Priority: P2)

**Goal**: Salvar o estado da partida e os indicadores pessoais de hábito no `localStorage` do navegador (`cruzadas_session_v1`, `cruzadas_stats_v1`), recuperar o estado ao recarregar a página, bloquear rejogabilidade no mesmo ciclo diário mantendo acesso à tela pós-jogo, suportar retomada de sessões atrasadas (`IN_PROGRESS` de ciclos passados) com recuperação do desafio histórico via `GET /api/challenge/today?date=YYYY-MM-DD`, e calcular sequências consecutivas (*streaks*) com suporte a sessões prolongadas por múltiplos dias (caso canônico Dia 10/11/12).

**Independent Test**: Concluir uma partida, recarregar a página e confirmar que o resultado permanece visível e o tabuleiro bloqueado para novos palpites. Simular a conclusão no Dia 12 de uma partida iniciada no Dia 10 (com Dia 11 ausente) e verificar que: o desafio histórico do Dia 10 é recuperado; a conclusão pontua exclusivamente para o Dia 10; o Dia 11 permanece ausente; `currentStreak = 0` no Dia 12; `maxStreak` preserva recordes passados; e o desafio do Dia 12 fica disponível em seguida.

### Tests for User Story 2 ⚠️

- [ ] T042 [P] [US2] Contract test for storage schemas in `tests/unit/contracts/storageSchemas.test.ts` validating serialized structures against `session-storage-schema.json` and `stats-storage-schema.json`
- [ ] T043 [P] [US2] Unit test for streak calculation in `tests/unit/services/streakService.test.ts` validating single-day progression, consecutive streaks, missed day reset, and the canonical multi-day delayed completion scenario (Day 10 start, Day 11 missed, Day 12 completion: attributes to Day 10, Day 11 absent, `currentStreak = 0` as of Day 12, `maxStreak` updated if record, and subsequent Day 12 win yields `currentStreak = 1`)
- [ ] T044 [P] [US2] Unit test for storage service in `tests/unit/services/storageService.test.ts` verifying safe reads/writes to `cruzadas_session_v1` and `cruzadas_stats_v1`, corrupt JSON tolerance, and quota exception safety

### Implementation for User Story 2

- [ ] T045 [US2] Implement streak calculation service in `src/services/streakService.ts` according to the deterministic algorithm from `data-model.md` section 2 (`calculateStreaks(completedCycleIds: string[], todayCycleId: string)`)
- [ ] T046 [US2] Implement local storage service in `src/services/storageService.ts` providing typed getters and setters for `cruzadas_session_v1` (`GameSession`) and `cruzadas_stats_v1` (`PlayerStats`) with JSON parse error recovery and fallback defaults
- [ ] T047 [P] [US2] Implement StatsModal component in `src/components/modals/StatsModal.tsx` displaying `gamesPlayed`, `gamesWon`, win percentage, `currentStreak`, `maxStreak`, and guess distribution histogram (attempts 1 to 6)
- [ ] T048 [US2] Integrate session persistence, delayed-session retrieval, and replay lock in `src/App.tsx`: save session after each guess submission, restore active state on load; if an `IN_PROGRESS` session from an older origin cycle exists (canonical Day 10 → Day 12 scenario), call `fetchChallenge(savedSession.originCycleId)` to resume and finish that historical game, attribute completion solely to Day 10, update streaks (setting `currentStreak = 0` as of Day 12), and upon completion unlock the current official cycle (Day 12) for gameplay without duplicate scoring; if cycle is already `COMPLETED`, display PostGameModal immediately and block board input
- [ ] T049 [US2] Integrate stats calculation and streak updates on game completion in `src/App.tsx`, updating `PlayerStats` in `localStorage` and wiring StatsModal trigger in Header

**Checkpoint**: User Stories 1 and 2 work together independently. Session state persists across refreshes and streak rules handle delayed multi-day sessions deterministically.

---

## Phase 5: User Story 3 - Compartilhamento Voluntário sem Revelação da Resposta (Priority: P2)

**Goal**: Permitir que o jogador gere e copie voluntariamente um resumo de desempenho sem spoilers (identificador do ciclo, número de tentativas, grade simbólica de feedback e link da plataforma) via Web Share API ou cópia para a área de transferência, expondo callback para posterior integração de telemetria.

**Independent Test**: Concluir uma partida, acionar o botão de compartilhamento na tela pós-jogo, inspecionar o texto copiado para a área de transferência e confirmar que o invariant sem spoilers é satisfeito: não inclui `DailyChallenge.word`, não inclui `normalizedWord`, não inclui palpites submetidos e não inclui letras por célula do tabuleiro, contendo exclusivamente metadados não reveladores, indicador de tentativas (`X/6` ou `N/6`), grade simbólica (🟩, 🟨, ⬛) e link da aplicação.

### Tests for User Story 3 ⚠️

- [ ] T050 [P] [US3] Unit test for share text generation in `tests/unit/services/shareService.test.ts` verifying cycle identification, attempts indicator (`X/6` or `N/6`), emoji grid (🟩 for `correct`, 🟨 for `present`, ⬛ for `absent`), platform URL inclusion, and asserting the strict spoiler-free invariant: no inclusion of `DailyChallenge.word`, no inclusion of `normalizedWord`, no inclusion of submitted guesses, and no inclusion of per-cell letters from the game board
- [ ] T051 [P] [US3] Integration test for sharing action in `tests/integration/PostGame.test.tsx` verifying user-initiated trigger, Web Share API invocation with fallback to `navigator.clipboard.writeText`, invocation of the telemetry-agnostic `onShareCompleted` callback exactly once, and user confirmation feedback

### Implementation for User Story 3

- [ ] T052 [US3] Implement telemetry-agnostic share message generator and clipboard dispatcher in `src/services/shareService.ts` formatting spoiler-free summary, dispatching via `navigator.share` or `navigator.clipboard.writeText`, and exposing `onShareCompleted?: (channel: string) => void` callback (without importing or invoking Phase 7 telemetry services)
- [ ] T053 [US3] Add Share button and copy feedback toast/alert to PostGameModal in `src/components/modals/PostGameModal.tsx` with clear action feedback ("Copiado para a área de transferência!") invoking shareService

**Checkpoint**: User Stories 1, 2, and 3 are functionally complete and testable before telemetry is introduced.

---

## Phase 6: User Story 4 - Manifestação Opcional de Interesse e Apoio Comunitário (Priority: P3)

**Goal**: Apresentar um card não obstrutivo e acolhedor na tela pós-jogo permitindo que o usuário sinalize voluntariamente seu interesse na continuidade do projeto ou em futuras opções de apoio comunitário (`FR-003`), sem barreiras coercitivas, sem coleta de dados pessoais (PII), com bloqueio de submissões duplicadas no mesmo ciclo e expondo callback para posterior integração de telemetria.

**Independent Test**: Concluir um desafio, navegar pela tela pós-jogo, acionar o botão "Tenho interesse no projeto", confirmar que o botão é desabilitado apresentando mensagem de gratidão, que o clique dispara o callback `onInterestExpressed` exatamente uma vez, que o estado é registrado localmente para evitar reenvio no mesmo ciclo, e que a recusa/ignorar a seção não afeta a jogabilidade.

### Tests for User Story 4 ⚠️

- [ ] T054 [P] [US4] Contract test for interest signal in `tests/unit/contracts/interestSignal.test.ts` validating payload structure (`eventType: "interest_expressed"`, `properties: { interestTopic: "general_support" }`) against `specs/001-daily-challenge/contracts/interest-signal-contract.md`
- [ ] T055 [P] [US4] Integration test for interest card in `tests/integration/PostGame.test.tsx` verifying card display, voluntary click interaction, invocation of the telemetry-agnostic `onInterestExpressed` callback exactly once, gratitude feedback message, and persistence of click state in `localStorage`

### Implementation for User Story 4

- [ ] T056 [US4] Implement telemetry-agnostic InterestSupportCard component in `src/components/modals/InterestSupportCard.tsx` with title, supportive description, action button `[ Tenho interesse no projeto ]`, post-click gratitude feedback state, and exposing `onInterestExpressed?: () => void` callback (without importing or invoking Phase 7 telemetry services)
- [ ] T057 [US4] Integrate InterestSupportCard into `src/components/modals/PostGameModal.tsx` checking cycle-scoped state `cruzadas_interest_<cycleId>` in `localStorage` to prevent multiple submissions within the same active cycle

**Checkpoint**: All 4 User Stories are functional, accessible, and independently verifiable. Telemetry integration can now proceed as a single cross-cutting phase.

---

## Phase 7: Telemetry, Observability & Edge Persistence (Workers + D1)

**Purpose**: Ingestão unificada e blindada de sinais analíticos agregados no Cloudflare D1 via Worker API (`POST /api/telemetry`), rastreamento anônimo de coortes no cliente (marcos D1, D7 e D14), transporte não bloqueante (*fire-and-forget*), validação estrita server-side e fiação única de todos os 7 eventos analíticos.

- [ ] T058 [P] Contract and unit test for telemetry payload validation and Worker ingestion in `tests/unit/contracts/telemetryContract.test.ts` validating all 7 event types (`page_view`, `game_started`, `game_completed`, `cohort_started`, `cohort_milestone`, `share_clicked`, `interest_expressed`), verifying omission of `game_abandoned`, and verifying server-side rejection (HTTP 400) of malformed payloads, invalid dates, invalid enum values, attemptsUsed outside 1..6, invalid milestones, and arbitrary metric names
- [ ] T059 Implement strict server-side validation and Cloudflare D1 atomic UPSERT in `worker/index.ts` handling `POST /api/telemetry`: allow only the 7 supported event types; validate cycleId/date formats (`YYYY-MM-DD`); validate event-specific property shapes and accepted enum values (enforcing `attemptsUsed` between 1 and 6, `outcome` as `"won" | "lost"`, `milestone` strictly `"D1" | "D7" | "D14"`); derive database metric names/dimensions exclusively from server-controlled mappings without persisting arbitrary client-provided keys; retain no IP or raw payload; return HTTP 400 for malformed/unsupported payloads; execute atomic UPSERT statements (`INSERT ... ON CONFLICT DO UPDATE SET count = count + 1`) into `daily_metrics` and `cohort_metrics`; and gracefully handle D1 quota errors returning HTTP 204
- [ ] T060 [P] Implement client telemetry service in `src/services/telemetryService.ts` maintaining local cohort milestones (`cohortCycleId`, `reportedMilestones` in `PlayerStats`), dispatching events via `navigator.sendBeacon` with fallback to `fetch(..., { keepalive: true })` wrapped in try/catch
- [ ] T061 Integrate and wire all seven telemetry events as the single cross-cutting integration path in `src/App.tsx`: wire `page_view` on initial mount, `game_started` on first valid guess submission, `game_completed` on win/loss with attempts used, `cohort_started` on first lifetime completion, `cohort_milestone` when completing D1, D7, or D14 relative to `cohortCycleId`, `share_clicked` via the `onShareCompleted` callback from US3, and `interest_expressed` via the `onInterestExpressed` callback from US4

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Auditoria automatizada de acessibilidade WCAG 2.2 AA no axe complementada por testes manuais, responsividade, dimensionamento de texto a 200%, portão editorial de release humano, verificação de Core Web Vitals e bundle size em build de produção, validação dos cenários de homologação e documentação.

- [ ] T062 [P] Implement automated accessibility tests with `axe-core` in `tests/a11y/accessibility.test.tsx` asserting zero automated accessibility violations detectable by axe for the configured WCAG 2.2 AA rules, complemented by manual Quickstart accessibility checks across Board, Virtual Keyboard, Modals, and Alerts
- [ ] T063 [P] Verify touch target sizes (>= 44/48px) and focus indicators in `src/index.css` and all interactive components
- [ ] T064 Verify 200% zoom text scaling and responsive viewport behavior in `src/index.css` ensuring no text truncation or overlapping elements
- [ ] T065 [P] Create application documentation in `README.md` documenting architecture, 2026 toolchain scripts, Cloudflare Workers Static Assets deployment, and editorial guidelines
- [ ] T066 Enforce human editorial release gate in `scripts/validate-challenges.ts` and release verification: ensure content/challenges/ contains at least one publishable challenge with editorialStatus "Verified" or "Published" covering the target release cycle with human-reviewed factual sources, stop release and report gate pending if only "Draft" or zero challenges exist (rejecting autonomous agent promotion of Drafts), and confirm test fixtures under tests/fixtures/challenges/ are never used to satisfy the gate
- [ ] T067 Verify performance and Core Web Vitals lab baselines on production build (dist/client/) under mobile network and CPU throttling: measure and record client bundle size baseline, lab LCP (target <= 2.5s), lab INP (target <= 200ms), and lab CLS (target <= 0.1), distinguishing pre-release lab measurements from production field p75 metrics (which require active traffic to observe), and documenting any significant deviations before release
- [ ] T068 Execute end-to-end verification of Quickstart validation scenarios A through E in `specs/001-daily-challenge/quickstart.md` (`npm run typecheck`, `npm run lint`, `npm run test`, `npm run validate:content`, `npm run generate:registry`, and `npm run build`)

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1: Setup (T001-T010)
   │
   ▼
Phase 2: Foundational (T011-T025) ──► BLOCKING PREREQUISITE
   │
   ├──────────────────┬──────────────────┬──────────────────┐
   ▼                  ▼                  ▼                  ▼
Phase 3: US1 (P1)  Phase 4: US2 (P2)  Phase 5: US3 (P2)  Phase 6: US4 (P3)
(T026-T041)        (T042-T049)        (T050-T053)        (T054-T057)
   │                  │                  │                  │
   └──────────────────┴──────────────────┴──────────────────┘
                              │
                              ▼
                   Phase 7: Telemetry & D1 (T058-T061)
                              │
                              ▼
                   Phase 8: Polish & E2E (T062-T068)
```

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. **BLOCKS all user stories**.
- **User Stories (Phases 3 to 6)**: All depend on Foundational phase completion. Can proceed sequentially in priority order (US1 → US2 → US3 → US4) or in parallel across different files.
- **Telemetry (Phase 7)**: Wires D1 edge sink and maps application actions to all 7 analytics signals.
- **Polish (Phase 8)**: Depends on all user stories and telemetry being implemented.

### User Story Dependencies

- **User Story 1 (P1)**: Core game loop. Depends only on Phase 2 (Foundational).
- **User Story 2 (P2)**: Persistence & Streaks. Depends on Phase 2 and hooks into US1 game loop state, supporting historical challenge retrieval for delayed sessions.
- **User Story 3 (P2)**: Sharing without spoilers. Depends on US1 (PostGameModal) and US2 (attempts used), exposing telemetry-agnostic callback.
- **User Story 4 (P3)**: Voluntary interest signal. Depends on US1 (PostGameModal), exposing telemetry-agnostic callback.

### Parallel Opportunities

- **Phase 1 Setup**: Tasks T002, T004, T005, T006, T007, T008, T009 can execute in parallel.
- **Phase 2 Foundational**: Types (T011, T012), Normalizer (T013, T014), Vocabulary (T015, T016), Evaluator (T017, T018), Time Service (T019, T020), and Content scripts/fixtures (T021, T022, T024) can be implemented in parallel.
- **Within Stories**: Unit tests marked `[P]` (e.g. T026, T042, T043, T050, T054, T058) can be written and verified failing before implementation components.
- **UI Components**: Atomic UI components (`Button`, `Modal`, `SymbolIcon`, `Cell`, `Key`, `Header`, `ThematicClue`, `FeedbackAlert`) can be developed in parallel before orchestrator integration.

---

## Parallel Example: User Story 1

```bash
# Launch test tasks for User Story 1 together:
Task T026: "Unit test for challenge loading service in tests/unit/services/challengeService.test.ts"
Task T027: "Integration test for complete gameplay loop in tests/integration/GameFlow.test.tsx"

# Launch independent UI components for User Story 1 together:
Task T028: "Implement challenge client service in src/services/challengeService.ts"
Task T029: "Implement accessible atomic UI components in src/components/ui/"
Task T030: "Implement Cell component in src/components/game/Cell.tsx"
Task T033: "Implement Key component in src/components/game/Key.tsx"
Task T035: "Implement ThematicClue component in src/components/game/ThematicClue.tsx"
Task T036: "Implement Header component in src/components/layout/Header.tsx"
Task T037: "Implement FeedbackAlert component in src/components/layout/FeedbackAlert.tsx"
Task T038: "Implement HowToPlayModal component in src/components/modals/HowToPlayModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1: Setup** (T001-T010)
2. Complete **Phase 2: Foundational** (T011-T025 - CRITICAL prerequisite)
3. Complete **Phase 3: User Story 1** (T026-T041)
4. **STOP and VALIDATE**: Run `tests/integration/GameFlow.test.tsx` and manual gameplay scenario. At this point, the game is fully playable and delivers the core cultural value without persistence or backend state.

### Incremental Delivery

1. Complete Setup + Foundational → Solid base with pure domain engine, self-enforcing build, D1 configuration, isolated test fixtures, and verified toolchain.
2. Add **User Story 1 (P1)** → Playable Daily Challenge with 6 attempts, clues, strict vocabulary validation, and cited sources (MVP).
3. Add **User Story 2 (P2)** → Habit building with local state persistence, replay blocking, historical session resumption, and streak calculation.
4. Add **User Story 3 (P2)** → Organic community distribution with spoiler-free WhatsApp sharing and callback.
5. Add **User Story 4 (P3)** → Product validation signal for community interest with callback.
6. Add **Telemetry (Phase 7)** → Edge persistence of aggregated metrics in Cloudflare D1 with strict validation, wiring all 7 events in one cross-cutting task.
7. Run **Polish & Accessibility (Phase 8)** → WCAG 2.2 AA automated audit on axe + manual Quickstart checks, 200% zoom verification, human editorial release gate verification, performance/Web Vitals lab baseline measurement, and full build check.

---

## Notes

- Every task strictly follows `- [ ] [TaskID] [P?] [Story?] Description with file path`.
- Setup and Foundational tasks have no story tag.
- User story tasks include `[US1]`, `[US2]`, `[US3]`, or `[US4]`.
- Polish tasks have no story tag.
- Verbatim constraints from `data-model.md` and contracts are quoted in task descriptions.
