# Implementation Plan: Desafio Diário Web-First (Shape 1)

**Branch**: `001-daily-challenge` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)  
**Status**: Proposed / Pending PO Gate  

**Input**: Especificação funcional aprovada em `specs/001-daily-challenge/spec.md`, Constituição v1.0.0 e deliberação executiva do Discovery em `.specify/assessments/cruzadas-online-platform/decision.md`.

---

## Summary

O **Shape 1 (Desafio Diário Web-First)** é a primeira entrega experimental do Cruzadas.online sob a estratégia **Build to Learn** e apetite **Small**, conduzida por um mantenedor individual. Seu propósito é produzir aprendizado comportamental sobre hipóteses de atração, hábito diário (`[HYPOTHESIS-03]`), compartilhamento orgânico (`[HYPOTHESIS-04]`) e disposição a apoiar (`[HYPOTHESIS-01]`) através de um passatempo cultural e católico com rigor documental e gameplay aberto sem conta obrigatória.

A abordagem técnica selecionada (conforme [ADR-001](./adrs/ADR-001-architecture-topology.md) e [research.md](./research.md)) adota a solução tecnicamente mais simples e alinhada à orientação oficial da Cloudflare para novos projetos: uma **Aplicação Web Estática (Single-Page Application em React 19.3.x + TypeScript 6.0.x + Vite 8.1.x + Tailwind CSS 4.3.x)** distribuída via **Cloudflare Workers Static Assets** com **Worker API dedicada (`worker/index.ts`)** e telemetry sink no **Cloudflare D1**. Os arquivos estáticos do cliente são servidos diretamente pela infraestrutura de assets estáticos sem invocar a CPU do Worker desnecessariamente. O Worker executa exclusivamente as rotas de API (`/api/*`). O motor de jogo determinístico (`src/engine/`) opera como código TypeScript puro e desacoplado de UI, validando tentativas em até 6 palpites com tamanho de palavra dinâmico derivado do desafio ativo (`wordLength === normalizedWord.length`), aplicando normalização ortográfica (`ACAO` = `AÇÃO`) e resolução estrita de letras repetidas (caso canônico `MARIA` vs `ARARA`). A persistência da jogabilidade reside integralmente no dispositivo do jogador via `localStorage`. A entrega do desafio diário é realizada pelo Worker API em `GET /api/challenge/today`, que valida o Horário de Brasília (UTC-3) na borda a partir de um registro server-side empacotado no build (`worker/generated/challenge-registry.ts`), garantindo que **nenhum desafio futuro seja emitido para os assets públicos do cliente**. A telemetria analítica utiliza coortes anônimas no cliente e persiste exclusivamente contadores agregados em **Cloudflare D1** (`daily_metrics` e `cohort_metrics`), operando sem cookies e com minimização estrita de dados em conformidade intencional com as diretrizes da LGPD e do ECA Digital.

---

## Technical Context

**Language/Version**: TypeScript 6.0.x (`~6.0.2`, modo estrito `strict: true`) executado sob **Node.js 24 LTS** (Active LTS em 2026).  
*Racional do TypeScript 6.0*: Não se adota TypeScript 7 prematuramente porque o suporte oficial de `typescript-eslint` e linters consolida-se em TypeScript 6.0 (com restrições acima de 6.1). A reprodutibilidade do build é assegurada via `package-lock.json` (`npm ci`).

**Primary Dependencies**: 
- Framework de UI: React 19.3.x (`~19.3.0`) + React DOM 19.3.x;
- Bundler & Dev Server: Vite 8.1.x (`~8.1.0`) com `@vitejs/plugin-react` e `@cloudflare/vite-plugin`;
- Estilização: Tailwind CSS 4.3.x (`~4.3.0`) com `@tailwindcss/vite`;
- Ícones / Acessibilidade: Lucide React (ou SVGs inline otimizados para símbolos de feedback acessível) + Radix UI Primitives (para modais com focus trap nativo).

**Storage**:
- **Jogabilidade e Estatísticas do Jogador**: Armazenamento local exclusivo no navegador via `localStorage` com esquemas versionados (`cruzadas_session_v1`, `cruzadas_stats_v1`). Zero banco de dados remoto para gameplay;
- **Telemetry Sink (Analytics do Experimento)**: Cloudflare D1 (banco relacional serverless SQLite na borda, binding `env.DB`) para contadores agregados consolidados (`daily_metrics`, `cohort_metrics`) via operações atômicas de UPSERT/incremento. Não há persistência de logs de eventos brutos individuais nem retenção de IPs.

**Testing**:
- Testes de Regras Determinísticas e Componentes: Vitest 5.x (`~5.0.0`) + React Testing Library + `@testing-library/jest-dom`;
- Testes Automatizados de Acessibilidade: `axe-core` / `vitest-axe`;
- Validação de Integridade Editorial: Script TypeScript em CI validando JSON Schema (`contracts/challenge-schema.json`) e a igualdade `wordLength === normalizedWord.length`.

**Target Platform**: Navegadores Web modernos em smartphones, tablets e computadores (Chrome, Safari iOS/macOS, Firefox, Edge). Aplicativos móveis nativos (Android/iOS) permanecem no escopo `OUT`.

**Project Type**: Single-Page Application (SPA) Web estática hospedada em Cloudflare Workers Static Assets com Worker API (`worker/index.ts`) para entrega do desafio diário (`GET /api/challenge/today`) e ingestão unificada de telemetria agregada (`POST /api/telemetry`), configurada via `wrangler.jsonc`.

**Performance Goals** (Metas com base no framework de recomendações do **Google Core Web Vitals**):
- LCP (Largest Contentful Paint): <= 2.5 segundos (medido no percentil 75 em dispositivos móveis reais);
- INP (Interaction to Next Paint): <= 200 milissegundos (medido no percentil 75);
- CLS (Cumulative Layout Shift): <= 0.1 (medido no percentil 75);
- Tamanho de Bundle: Monitorado como baseline durante o build e em CI para manter o pacote enxuto;
- Disponibilidade: Alta disponibilidade fornecida pela rede global de borda da Cloudflare em regime de melhor esforço (*best-effort*), ressalvando que planos gratuitos não possuem garantia formal de SLA.

**Constraints & Quota Semantics**:
- Custo fixo inicial: R$ 0,00 / mês dentro dos limites atuais do free tier da Cloudflare (100.000 gravações de linhas/dia no D1, 100.000 requisições/dia no Workers Free para as rotas `/api/*`);
- Assets Estáticos Desacoplados: Requisições de arquivos estáticos do cliente (HTML/JS/CSS/imagens) servidas por Static Assets não consomem a cota de execução do Worker API;
- Falha de Quota: O transporte de telemetria no cliente é não bloqueante (*fire-and-forget*). Se a quota do D1 for excedida com o Worker executando, o endpoint captura a falha e retorna HTTP 204. Se a quota do Workers Free for totalmente exaurida, a borda bloqueia a requisição antes de executar o Worker;
- Risco em `GET /api/challenge/today`: Exaustão da cota do Workers Free pode temporariamente impedir o carregamento do desafio diário. Risco operacional aceito sob o tráfego experimental previsto;
- Privacidade por Design: Proibição de cookies de rastreamento entre sites, identificadores persistentes de hardware e dados pessoais diretos (alinhamento intencional com LGPD e ECA Digital);
- Rigor Editorial: 100% dos desafios publicados devem possuir fontes adequadas, verificáveis e rastreáveis segundo a natureza da afirmação, dentro das 8 categorias constitucionais (Princípio IX);
- Acessibilidade: Conformidade normativa com WCAG 2.2 AA (SC 2.5.8 Target Size Minimum de 24x24px) com alvos ampliados (>= 44/48px) como meta ergonômica deliberada para adultos e idosos.

**Scale/Scope**:
- Apetite: `Small`;
- Volume Inicial de Desafios: Lote de 14 a 30 desafios curados `[CANDIDATE SCOPE / SCOPE ASSUMPTION]` para a validação pública + 5 a 10 fixtures para desenvolvimento/testes automatizados;
- 1 único desafio ativo por ciclo de 24 horas (00:00 UTC-3).

---

## Constitution Check

*Auditoria de conformidade deste plano técnico contra a [Constituição do Cruzadas.online v1.0.0](file:///c:/dev/cruzadas-online/.specify/memory/constitution.md):*

> **Status do Gate Constitucional**: Nenhuma violação constitucional conhecida identificada; pendente de ratificação formal pelo PO Gate.

| Princípio Constitucional | Avaliação | Justificativa e Mecanismo no Plano |
| :--- | :---: | :--- |
| **I. Spec as Source of Truth** | **CONFORME** | O plano técnico deriva estritamente dos requisitos funcionais (`FR-001` a `FR-025`) de `spec.md`, sem reabrir decisões ou omitir critérios. |
| **II. Simplicity & Complexity Control** | **CONFORME** | Adotada a arquitetura mais simples possível (Workers Static Assets + Worker API + D1 agregado). Rejeitados microsserviços, containers persistentes 24/7 e CMS em runtime. |
| **III. Build to Learn** | **CONFORME** | Foco estrito em instrumentar e observar as hipóteses de problema, hábito e compartilhamento sem otimizações prematuras de escala. |
| **IV. Reversibility** | **CONFORME** | Custo de descarte nulo: sem contratos fixos, sem infraestrutura provisionada e motor de jogo modular desacoplado da UI. |
| **V. Cost Consciousness** | **CONFORME** | Custo fixo inicial de R$ 0,00/mês dentro dos limites gratuitos da Cloudflare. |
| **VI. Architecture Decision Governance** | **CONFORME** | Quatro ADRs formais (`ADR-001` a `ADR-004`) documentando topologia Workers Static Assets, toolchain 2026, telemetria agregada e gestão de conteúdo com status `Proposed / Pending PO Gate`. |
| **VII. Traceability** | **CONFORME** | Cadeia ininterrupta: Discovery → Constitution v1.0.0 → Spec → Clarify → Plan → Contracts → Quickstart. |
| **VIII. No Premature Expansion** | **CONFORME** | Todos os itens classificados como `OUT` (apps nativos, contas, múltiplos jogos, sync em nuvem, rankings) foram estritamente preservados fora do plano. |
| **IX. Editorial Rigor** | **CONFORME** | Schema de desafio exige citação de fonte adequada, verificável e rastreável segundo a natureza da afirmação, dentro das 8 categorias constitucionais. |
| **X. AI is Assistive, Not Authoritative** | **CONFORME** | Desafios com auxílio de IA nascem como `Draft`; pipeline exige status `Verified` com fonte conferida antes da publicação. |
| **XI. Copyright & Licensing** | **CONFORME** | Redação autoral própria para pistas e contextualização, fatos históricos e obras em domínio público, respeitando o Art. 46 da Lei 9.610/1998. |
| **XII. Privacy by Design** | **CONFORME** | Sem contas, sem cookies de terceiros, sem coleta de IP ou dados sensíveis. Retenção estimada via coortes locais anônimas. |
| **XIII. Security by Default** | **CONFORME** | React escapa texto interpolado por padrão mitigando DOM-XSS comum, associado a CSP rigoroso e higiene de dependências; desafios futuros isolados em módulo server-side sem exposição em pastas estáticas públicas. |
| **XIV. Compliance as Product Req.** | **CONFORME** | Diretrizes do ECA Digital (Lei 15.211/2025) e LGPD integradas por design; enquadramentos legais específicos marcados como `[UNKNOWN — legal review required]`. |
| **XV. Responsive Behavior** | **CONFORME** | Layout Web responsivo para smartphones, tablets e desktop com CSS grid/flexbox e viewport dinâmico. |
| **XVI. I18n-Ready without Premature Loc.** | **CONFORME** | Strings de interface e dados de desafios desacoplados do motor de jogo, permitindo extensão futura sem construir múltiplos catálogos agora. |
| **XVII. Testing Requirement** | **CONFORME** | Todos os invariantes de domínio determinísticos identificados e casos de borda aprovados possuem testes automatizados obrigatórios no Vitest. |
| **XVIII. Accessibility as Part of DoD** | **CONFORME** | Normativa WCAG 2.2 AA com alvos ergonômicos de produto (>= 44/48px), suporte a teclado físico e virtual, leitor de tela (`aria-live`), contraste e símbolos para independência de cores. |
| **XIX. Observability without Intrusion** | **CONFORME** | Telemetria de sinais funcionais agregados no Cloudflare D1 sem identificadores individuais rastreáveis ou dados pessoais em logs. |
| **XX. Comprehensive Quality Gates** | **CONFORME** | Definition of Done rigorosa no Quickstart: lint, typecheck, testes unitários verdes, validação de schema e build de produção. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-daily-challenge/
├── plan.md              # Este documento técnico consolidado (/speckit-plan)
├── research.md          # Pesquisa e Architecture Discovery da Phase 0
├── data-model.md        # Modelo de dados, entidades e máquina de estados da Phase 1
├── quickstart.md        # Guia de homologação, execução e cenários da Phase 1
├── adrs/                # Architecture Decision Records formais (Proposed / Pending PO Gate)
│   ├── ADR-001-architecture-topology.md
│   ├── ADR-002-frontend-stack.md
│   ├── ADR-003-privacy-preserving-telemetry.md
│   └── ADR-004-daily-challenge-delivery-and-secrets.md
├── contracts/           # Contratos e Schemas da Phase 1
│   ├── challenge-schema.json
│   ├── session-storage-schema.json
│   ├── stats-storage-schema.json
│   ├── telemetry-contract.md
│   └── interest-signal-contract.md
├── checklists/
│   └── requirements.md  # Checklist de qualidade da especificação
└── spec.md              # Especificação funcional aprovada (Fonte da Verdade)
```

### Source Code (repository root layout)

A estrutura adota o modelo canônico de **Cloudflare Workers Static Assets + Worker API**, com scripts de compilação do acervo de desafios:

```text
cruzadas-online/
├── content/
│   └── challenges/                     # Acervo editorial versionado de desafios diários (servidor)
│       ├── 2026-09-11.json             # Desafio individual estruturado por data
│       └── ...
├── worker/                             # Cloudflare Worker API (Edge Serverless)
│   ├── index.ts                        # Rotas GET /api/challenge/today e POST /api/telemetry
│   └── generated/                      # Gerado pelo build (fora do git/public)
│       └── challenge-registry.ts       # Módulo TypeScript server-side com o acervo empacotado
├── public/
│   ├── data/
│   │   └── vocabulary-pt.json          # Léxico aceito de palavras em português e nomes católicos
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/                         # Elementos visuais e ícones
│   ├── components/
│   │   ├── game/
│   │   │   ├── Board.tsx               # Grade de 6 tentativas do desafio (tamanho dinâmico)
│   │   │   ├── Row.tsx                 # Linha de tentativa com feedback acessível
│   │   │   ├── Cell.tsx                # Célula individual (letra, símbolo e cor)
│   │   │   ├── Keyboard.tsx            # Teclado em tela com alvos ergonômicos (>= 44/48px)
│   │   │   ├── Key.tsx                 # Tecla individual com estado refletido
│   │   │   └── ThematicClue.tsx        # Faixa da pista inicial orientadora
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Cabeçalho com título e ações de topo
│   │   │   └── FeedbackAlert.tsx       # Alertas transitórios acessíveis (aria-live)
│   │   ├── modals/
│   │   │   ├── HowToPlayModal.tsx      # Modal de instruções com exemplos acessíveis
│   │   │   ├── StatsModal.tsx          # Modal de indicadores locais e sequências
│   │   │   └── PostGameModal.tsx       # Tela pós-jogo com contextualização, fonte e apoio
│   │   └── ui/
│   │       ├── Button.tsx              # Botão base ergonômico acessível
│   │       ├── Modal.tsx               # Shell de modal acessível com focus trap
│   │       └── SymbolIcon.tsx          # Ícones acessíveis de status (correto, presente, ausente)
│   ├── engine/                         # Motor determinístico puro (zero dependência de UI)
│   │   ├── evaluator.ts                # Algoritmo canônico de avaliação de tentativas
│   │   ├── normalizer.ts               # Normalização ortográfica (A-Z sem diacríticos)
│   │   ├── vocabulary.ts               # Validação de palavras aceitas em tempo O(1)
│   │   └── types.ts                    # Tipos e enums do motor de jogo
│   ├── services/
│   │   ├── challengeService.ts         # Carregamento do desafio ativo via GET /api/challenge/today
│   │   ├── storageService.ts           # Persistência resiliente em localStorage
│   │   ├── timeService.ts              # Abstração temporal injetável (Horário de Brasília)
│   │   ├── streakService.ts            # Algoritmo determinístico de sequências (streaks)
│   │   ├── shareService.ts             # Geração de texto para WhatsApp sem spoilers
│   │   └── telemetryService.ts         # Emissão de sinais analíticos e coortes
│   ├── types/
│   │   └── index.ts                    # Definições transversais de tipos da aplicação
│   ├── App.tsx                         # Orquestrador de fluxo da aplicação
│   ├── main.tsx                        # Ponto de entrada React
│   └── index.css                       # Estilos globais e Tailwind v4
├── tests/
│   ├── unit/
│   │   ├── engine/
│   │   │   ├── evaluator.test.ts       # Testes das regras de avaliação e letras repetidas
│   │   │   ├── normalizer.test.ts      # Testes de equivalência ACAO = AÇÃO
│   │   │   ├── vocabulary.test.ts      # Testes de vocabulário e nomes próprios
│   │   │   └── variableLength.test.ts  # Testes com tamanhos de palavra variados
│   │   └── services/
│   │       ├── storageService.test.ts  # Testes de persistência e tolerância a corrupção
│   │       ├── timeService.test.ts     # Testes da virada de ciclo à meia-noite
│   │       └── streakService.test.ts   # Testes determinísticos do caso crítico Dia 10/11/12
│   ├── integration/
│   │   ├── GameFlow.test.tsx           # Fluxo completo da partida (vitória/derrota)
│   │   └── PostGame.test.tsx           # Exibição pós-jogo e compartilhamento
│   └── a11y/
│       └── accessibility.test.tsx      # Auditoria automatizada de acessibilidade (axe-core)
├── scripts/
│   ├── validate-challenges.ts          # Script de validação de integridade editorial em CI
│   └── generate-challenge-registry.ts  # Script de geração do módulo server-side do acervo
├── index.html
├── package.json
├── package-lock.json                   # Trava de reprodutibilidade estrita de dependências
├── tsconfig.json
├── vite.config.ts                      # Configuração Vite com @cloudflare/vite-plugin
└── wrangler.jsonc                      # Configuração Cloudflare Workers Static Assets + D1
```

---

## Complexity Tracking

> **Status de Violação Constitucional**: Nenhuma violação conhecida identificada; aguardando deliberação formal do PO Gate.

| Item Avaliado | Complexidade Proposta | Justificativa | Alternativa Mais Simples Rejeitada |
| :--- | :--- | :--- | :--- |
| **Hospedagem & Infraestrutura** | Cloudflare Workers Static Assets + Worker API | R$ 0,00 de custo fixo inicial, zero gestão de SO de servidor, padrão recomendado para novos projetos. | Servidor persistente (Node/FastAPI): Rejeitado por gerar custo fixo e complexidade indevida. |
| **Banco de Dados de Jogabilidade** | Nenhum (Estado em `localStorage`) | Dados de jogo e hábitos pertencem ao dispositivo do jogador; sem contas no MVP. | Banco em nuvem (PostgreSQL/Redis): Rejeitado por violar Simplicidade e Princípio XII. |
| **Telemetry Sink** | Cloudflare D1 com contadores agregados | Permite consolidar métricas de validação do experimento sob apetite Small dentro do free tier sem retenção de logs de eventos brutos. | Armazenar logs de eventos brutos ou serviço externo invasivo (GA4): Rejeitados por desperdício de quota do D1 ou invasão de privacidade. |
| **Motor de Jogo** | TypeScript puro desacoplado | Permite testar invariantes determinísticas em milissegundos sem mock de DOM. | Regras acopladas a componentes React: Rejeitado por dificultar testes de regressão. |
| **Telemetria e Retenção** | Coortes locais anônimas com denominador | Permite estimar retenção D1, D7 e D14 sem cookies e sem contas sob LGPD/ECA. | Fingerprinting / GA4: Rejeitado por violar privacidade e minimização de dados. |
