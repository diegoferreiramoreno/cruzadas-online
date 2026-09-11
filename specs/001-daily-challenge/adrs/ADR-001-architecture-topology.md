# ADR-001: Arquitetura e Topologia: Cloudflare Workers Static Assets + Worker API + D1 (Shape 1)

## Status
Proposed / Pending PO Gate

## Data
2026-09-11

## Contexto e Problema
O Cruzadas.online encontra-se na fase de validação experimental (*Build to Learn*, apetite *Small*), operado por um mantenedor individual. O objetivo desta entrega (Shape 1) é validar empiricamente hipóteses de atração, hábito diário (`[HYPOTHESIS-03]`), compartilhamento orgânico (`[HYPOTHESIS-04]`) e manifestação voluntária de interesse (`[HYPOTHESIS-01]`) através de um passatempo cultural e católico, sem contas de usuário obrigatórias.

A Constituição (Princípios II, III, IV, V e VI) impõe controle estrito de complexidade, reversibilidade, baixo custo operacional e governança técnica.
A questão central de governança permanece:
> *"Existe requisito funcional atual que realmente exige um servidor/backend persistente rodando 24/7?"*

Ao analisar os requisitos da especificação (`spec.md`):
- Acesso aberto sem login ou cadastro (`FR-001`);
- Resolução e validação determinística da mecânica no dispositivo do jogador (`FR-005` a `FR-009`);
- Persistência da jogabilidade e estatísticas no navegador (`localStorage`, `FR-014`, `FR-016`);
- Ciclo unificado baseado no Horário de Brasília UTC-3 (`FR-013`);
- Compartilhamento voluntário em texto sem spoilers (`FR-017`, `FR-018`);
- Telemetria de validação do experimento (`FR-023`, `FR-024`);
- Manifestação voluntária de interesse (`FR-003`).

A jogabilidade básica **não requer banco de dados remoto nem servidor persistente**. Contudo, para que a estratégia *Build to Learn* responda às hipóteses sem dispersão de dados, é necessário um coletor analítico durável que agregue sinais comportamentais minimizados.

## Provedor e Topologia Canônica Atualizada: Cloudflare Workers Static Assets + Worker API + D1
Conforme a orientação oficial da Cloudflare para novos projetos, adota-se a plataforma unificada de **Workers com Static Assets**:
1. **Frontend SPA via Workers Static Assets**: Os arquivos estáticos gerados na compilação do React SPA são servidos diretamente pela infraestrutura de ativos estáticos da Cloudflare, **sem invocar a CPU do Worker desnecessariamente** para assets de frontend (HTML, CSS, JS, favicon, imagens);
2. **Worker API Dedicada (`worker/index.ts`)**: O Worker executa exclusivamente as rotas de API sob `/api/*`:
   - `GET /api/challenge/today`: Entrega autoritativa do desafio ativo com validação temporal UTC-3;
   - `POST /api/telemetry`: Ingestão unificada e stateless de métricas agregadas e coortes;
3. **Telemetry Sink Agregado**: **Cloudflare D1** (banco relacional serverless SQLite na borda) vinculado via binding nativo (`env.DB`) para persistência durável exclusiva de contadores analíticos consolidados (`daily_metrics` e `cohort_metrics`), sem logs brutos de eventos individuais;
4. **Desacoplamento de Gameplay**: A jogabilidade no cliente não consulta o D1 e não depende de conectividade após o carregamento do desafio.

## Semântica Operacional de Quotas e Tratamento de Falhas
1. **Métricas de Limite do Free Tier**:
   - Cloudflare D1 Free limita **linhas gravadas por dia** (atualmente 100.000 gravações de linhas/dia) e **linhas lidas** (5.000.000 linhas/dia), e **NÃO** "eventos de telemetria";
   - Cloudflare Workers Free limita a **100.000 requisições/dia** para a execução do Worker (rotas `/api/*`). Requisições de assets estáticos servidas diretamente por Static Assets não consomem desnecessariamente a cota de execução do Worker;
2. **Comportamento em Falha de Quota no Sink (D1)**:
   - Se a quota de gravação do D1 for excedida enquanto o Worker ainda puder executar, o endpoint captura a exceção de escrita no D1 e responde HTTP 204 ao cliente sem persistir a métrica;
3. **Comportamento em Falha de Quota no Worker (Workers Free)**:
   - Se a quota diária de 100.000 requisições do Workers Free for totalmente exaurida, a infraestrutura da Cloudflare bloqueia as requisições das rotas de API com erro de borda (HTTP 429 / 1015) **antes** da execução do código do Worker, sendo tecnicamente impossível garantir um HTTP 204 customizado nesse cenário;
   - O transporte de telemetria no cliente opera sob o princípio *fire-and-forget* via `navigator.sendBeacon` ou `fetch` com `.catch()`, garantindo que **qualquer falha de rede ou HTTP 429 seja completamente transparente e não bloqueante para o jogador**;
4. **Impacto em `GET /api/challenge/today`**:
   - Como a entrega do desafio diário depende da execução do Worker API para validação de data UTC-3 na borda, a exaustão total da quota do Workers Free pode temporariamente impedir o carregamento do novo desafio diário. Isso é formalmente catalogado como um **risco operacional aceito para a fase experimental de baixo tráfego**, com avaliação de migração de plano caso a tração se aproxime dos limites gratuitos.

## Alternativas Avaliadas
- **Alternativa A: Cloudflare Workers Static Assets + Worker API + D1 (Proposta)**: Custo fixo inicial de R$ 0,00 dentro dos limites do free tier, padrão oficial moderno da Cloudflare para novos projetos, integração nativa via `@cloudflare/vite-plugin`;
- **Alternativa B: Cloudflare Pages + Pages Functions (Legada)**: Funcional, mas preterida em conformidade com o direcionamento oficial da Cloudflare, que concentra melhorias e novos recursos na plataforma unificada de Workers;
- **Alternativa C: Web App com Backend Persistente (Node.js/FastAPI + PostgreSQL 24/7)**: Rejeitado por violar Simplicidade (Princípio II) e Austeridade de Custos (Princípio V);
- **Alternativa D: Full-Stack SSR (Next.js)**: Rejeitado por complexidade acidental de runtime e hidratação.

## Decisão
Proposta a adoção da **Alternativa A: Cloudflare Workers Static Assets + Worker API + Cloudflare D1** como topologia canônica única do Shape 1.

## Consequências
- Custo fixo inicial de R$ 0,00/mês dentro dos limites atuais do free tier da Cloudflare;
- Alta disponibilidade global em regime de melhor esforço (*best-effort*, sem SLA contratual em plano gratuito);
- Gameplay 100% desacoplado de bancos de dados remotos;
- Riscos operacionais de quota de Workers explicitamente mapeados e aceitos para o MVP.
