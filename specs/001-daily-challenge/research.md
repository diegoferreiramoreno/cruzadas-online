# Research & Architecture Discovery: Desafio Diário Web-First (Shape 1)

**Feature Branch**: `001-daily-challenge`  
**Date**: 2026-09-11  
**Status**: Proposed / Pending PO Gate  
**Contexto**: Apetite *Small*, Estratégia *Build to Learn*, Desenvolvedor Solo.

---

## 1. Architecture Discovery & Topologia Canônica

### 1.1 Avaliação de Necessidade de Backend Persistente
A pergunta permanente de governança (Princípio II da Constituição) estabelece:  
> *"Esta complexidade é estritamente necessária para o problema que existe hoje?"*

Analisou-se exaustivamente cada um dos requisitos da especificação (`spec.md`):
- **Entrega da aplicação Web**: Não requer servidor dinâmico 24/7; artefatos estáticos (HTML/CSS/JS) distribuídos diretamente via Static Assets da Cloudflare;
- **Disponibilização do desafio diário**: O enigma muda uma vez a cada 24 horas (às 00:00 UTC-3). É resolvido por um endpoint Worker API (`GET /api/challenge/today`) que consulta o registro server-side empacotado no build e entrega exclusivamente o desafio do dia ativo, mantendo desafios futuros inacessíveis ao cliente;
- **Cálculo e validação da mecânica de jogo**: Ocorre no dispositivo do jogador com latência zero e sem round-trip de rede por letra digitada;
- **Ciclo temporal e fuso horário**: O cálculo do ciclo baseia-se no Horário de Brasília (UTC-3), com validação da data oficial garantida na borda (Worker);
- **Persistência de estado e progresso da jogabilidade**: Ocorre integralmente no cliente via `localStorage` (`FR-014`). Não há contas, perfis remotos ou banco de dados para gameplay;
- **Compartilhamento**: Gera texto na área de transferência do dispositivo (`FR-017`, `FR-018`);
- **Telemetria e Sinal de Interesse**: Ingestão unificada e stateless via Worker API (`POST /api/telemetry`) com persistência agregada no Cloudflare D1;
- **Administração editorial**: Curadoria em tempo de build em arquivos versionados no Git, sem CMS em runtime.

### 1.2 Seleção de Provedor e Topologia: Cloudflare Workers Static Assets + Worker API + D1
Conforme a orientação oficial da Cloudflare para novos projetos, adota-se a plataforma unificada de **Workers com Static Assets**:
1. **Frontend SPA via Workers Static Assets**: Os arquivos estáticos do React SPA são servidos diretamente pela infraestrutura de assets estáticos da Cloudflare, **sem invocar o Worker desnecessariamente** para arquivos como HTML, CSS, JS, favicon ou imagens;
2. **Worker API Dedicada (`worker/index.ts`)**: O Worker é acionado exclusivamente para as rotas de API sob `/api/*`:
   - `GET /api/challenge/today`: Entrega autoritativa do desafio ativo com validação temporal UTC-3 e isolamento de segredos futuros;
   - `POST /api/telemetry`: Ingestão unificada e stateless de métricas agregadas e coortes;
3. **Telemetry Sink Agregado**: **Cloudflare D1** (banco relacional serverless SQLite na borda) vinculado via binding nativo (`env.DB`) para persistência durável exclusiva de contadores consolidados (`daily_metrics` e `cohort_metrics`), sem logs de eventos brutos;
4. **Semântica Operacional de Quotas e Falhas**:
   - O plano Cloudflare D1 Free limita **linhas gravadas por dia** (atualmente 100.000 gravações de linhas/dia) e **linhas lidas** (5.000.000 linhas/dia), e **NÃO** "eventos de telemetria";
   - Cloudflare Workers Free limita a **100.000 requisições/dia** para a execução do Worker (rotas `/api/*`). Requisições de assets estáticos servidas diretamente por Static Assets não consomem a cota de execução do Worker;
   - Se a quota de gravação do D1 for excedida enquanto o Worker ainda puder executar, o endpoint captura a exceção de escrita no D1 e responde HTTP 204 ao cliente sem persistir a métrica;
   - Se a quota diária de 100.000 requisições do Workers Free for totalmente exaurida, a infraestrutura da Cloudflare bloqueia as requisições das rotas de API com erro de borda (HTTP 429 / 1015) **antes** da execução do código do Worker, sendo impossível garantir um HTTP 204 customizado nesse cenário;
   - O transporte de telemetria no cliente opera sob o princípio *fire-and-forget* via `navigator.sendBeacon` ou `fetch` com `.catch()`, garantindo que **qualquer falha de rede ou HTTP 429 seja completamente não bloqueante para o jogador**;
   - Como a entrega do desafio diário depende da execução do Worker API para validação de data UTC-3 na borda, a exaustão total da quota do Workers Free pode temporariamente impedir o carregamento do novo desafio diário. Este risco operacional é aceito para a fase experimental de baixo tráfego;
5. **Custos**: R$ 0,00 / mês dentro dos limites atuais do free tier da Cloudflare (sujeito às políticas do provedor).

---

## 2. Stack Tecnológica & Toolchain 2026

### 2.1 Avaliação de Compatibilidade e Seleção do Toolchain
- **Node.js**: Versão **24 LTS** (Active LTS em 2026; Node 20 encontra-se EOL);
- **React / React DOM**: Versão **19.3.x** (`~19.3.0`), moderna e estável;
- **Vite**: Versão **8.1.x** (`~8.1.0`), padrão moderno de empacotamento web em 2026 com plugin oficial `@cloudflare/vite-plugin`;
- **TypeScript**: Versão **6.0.x** (`~6.0.2`).  
  *Racional de Compatibilidade*: Não se adota TypeScript 7 prematuramente porque o suporte oficial de `typescript-eslint` e do ecossistema de linters consolida-se em TypeScript 6.0 (com restrições formais acima de 6.1). A escolha de TypeScript 6.0.x é uma decisão deliberada de estabilidade e compatibilidade;
- **Tailwind CSS**: Versão **4.3.x** (`~4.3.0`) com `@tailwindcss/vite`, simplificando a configuração e acelerando a compilação sem PostCSS legado;
- **Vitest**: Versão **5.x** (`~5.0.0`), alinhada nativamente ao Vite 8;
- **ESLint**: Versão **10.x** (`~10.0.0`) com Flat Config e versão de `typescript-eslint` compatível com ESLint 10 e TypeScript 6.0;
- **Reprodutibilidade**: Garantida estritamente por `package-lock.json` (`npm ci`);
- **Manipulação de Datas**: Funções puras nativas (`Intl.DateTimeFormat` com fuso `America/Sao_Paulo`, UTC-3), sem bibliotecas externas.

---

## 3. Arquitetura de Frontend & Acessibilidade

### 3.1 Acessibilidade Normativa e Metas Ergonômicas
- **Norma Base**: WCAG 2.2 AA (incluindo SC 2.5.8 Target Size Minimum de 24x24 CSS pixels com espaçamento);
- **Alvo Ergonômico de Produto**: Botões e teclas virtuais são desenhados com alvos de toque ampliados (**>= 44/48px**) como **meta ergonômica deliberada para o público primário adulto e idoso**, claramente distinguida da conformidade normativa mínima da WCAG 2.2 AA;
- **Independência de Cores**: Cada estado de letra exibe cor de alto contraste, símbolo/ícone estrutural (círculo/check para correto, triângulo para presente, traço para ausente) e rótulo explícito para leitores de tela (`aria-label`);
- **Navegação e Foco**: Contorno de foco de alto contraste (`focus-visible`) em todos os elementos interativos; navegação completa por teclado físico;
- **Leitores de Tela & Reflow**: Alertas transitórios com `aria-live="polite"`; suporte a ampliação de texto de até 200% sem perda de funcionalidade.

---

## 4. Game Engine: Regras Determinísticas & Empacotamento de Desafios

### 4.1 Separação Arquitetural
O motor de jogo (`src/engine/`) é código TypeScript funcional puro: zero dependências de React, DOM ou APIs de navegador, testável de forma determinística e isolada.

### 4.2 Algoritmo de Avaliação e Tamanho Dinâmico da Palavra
- A quantidade de letras (`wordLength`) é determinada estritamente pelo desafio ativo (`normalizedWord.length`), sem fixações arbitrárias em 5 letras;
- O vocabulário aceito contém palavras válidas do léxico comum em português e nomes próprios católicos/bíblicos relevantes, estruturado para validação em `O(1)` para o tamanho de palavra exigido pelo desafio;
- **Passo 1 (Normalização)**: Entrada e segredo normalizados em A-Z maiúsculo sem diacríticos (`ACAO` = `AÇÃO`);
- **Passo 2 (Posições Exatas)**: Letras em posições coincidentes são marcadas como `correct` e consomem ocorrências do segredo;
- **Passo 3 (Posições Deslocadas e Excedentes)**: Da esquerda para a direita, ocorrências restantes são marcadas como `present` enquanto houver estoque não consumido na palavra secreta; letras excedentes são marcadas como `absent`.

#### Caso Canônico: Segredo `MARIA` vs. Tentativa `ARARA` (`wordLength: 5`)
- Segredo `MARIA`: `M:1, A:2, R:1, I:1`
- Tentativa `ARARA` avaliada:
  - Posição 4: `A` vs `A` → `correct` (consome um `A`; resta um `A`);
  - Posição 0: `A` → `present` (consome o último `A`; restam zero `A`);
  - Posição 1: `R` → `present` (consome `R`; restam zero `R`);
  - Posição 2: `A` → `absent` (excedente, não há mais ocorrências de `A`);
  - Posição 3: `R` → `absent` (excedente);
- Resultado: `[present, present, absent, absent, correct]`.

### 4.3 Mecanismo de Empacotamento Server-Side de Desafios
1. **Fonte Editorial**: Arquivos individuais versionados em `content/challenges/YYYY-MM-DD.json`;
2. **Validação e Geração de Registro em Tempo de Build**:
   - `scripts/validate-challenges.ts`: Valida cada arquivo contra `challenge-schema.json`, garante que `wordLength === normalizedWord.length` e rejeita qualquer arquivo com status `Draft` para builds de produção;
   - `scripts/generate-challenge-registry.ts`: Compila o módulo interno server-side `worker/generated/challenge-registry.ts`;
3. **Isolamento no Bundle do Worker**:
   - O Worker API (`worker/index.ts`) importa o registro compilado;
   - **Nenhum arquivo de desafio futuro é copiado para os assets públicos estáticos do cliente (`dist/client/`)**;
   - `GET /api/challenge/today` consulta o registro em memória no Worker e responde apenas com o desafio da data ativa oficial de Brasília (ou data passada válida para sessões atrasadas);
   - Zero necessidade de banco de dados remoto para armazenar o acervo de desafios no Shape 1.

---

## 5. Abstração Temporal & Algoritmo de Sequências (*Streaks*)

### 5.1 Fuso Oficial e Entrega do Desafio
- Horário de Brasília (UTC-3), com autoridade validada na borda em `GET /api/challenge/today`;
- Clientes com relógios adiantados não conseguem obter desafios futuros.

### 5.2 Caso Crítico de Sessão Prolongada por Múltiplos Dias
- **Dia 10**: Jogador inicia o desafio 10 (`originCycleId = "2026-09-10"`).
- **Dia 11**: Nenhuma partida é concluída neste ciclo diário.
- **Dia 12**: Jogador retorna e conclui o desafio 10.
- **Invariantes Determinísticos do Algoritmo**:
  1. A conclusão pertence exclusivamente ao ciclo de origem (Dia 10);
  2. O Dia 11 permanece ausente em `completedCycleIds`;
  3. A conclusão do Dia 10 **NÃO** pontua para o Dia 12;
  4. Como o ciclo oficial ativo é o Dia 12 e o Dia 11 não foi jogado, a sequência ativa de dias consecutivos está quebrada: **`currentStreak = 0`**;
  5. A conclusão tardia do Dia 10 **NÃO ressuscita a sequência quebrada**;
  6. O cálculo de `maxStreak` reconhece cadeias consecutivas históricas legítimas de ciclos de origem completados (ex.: se o Dia 9 havia sido completado, a cadeia Dia 9 + Dia 10 = 2 dias é reconhecida);
  7. Após isso, quando o jogador concluir o desafio real do Dia 12, inicia-se a nova sequência: **`currentStreak = 1`**.

---

## 6. Telemetria, Retenção & Privacidade

### 6.1 Coletor Agregado no Cloudflare D1
- O D1 armazena **exclusivamente contadores consolidados** via operações atômicas de UPSERT/incremento nas tabelas `daily_metrics` e `cohort_metrics`;
- Não há armazenamento de linhas de eventos individuais brutos nem logs com IP;
- A quota do Cloudflare D1 Free é medida em **linhas gravadas/lidas** (100.000 gravações/dia), e não em eventos.

### 6.2 Mecanismo de Coortes Locais Anônimas
Para estimar a retenção sem contas e sem rastreamento invasivo:
- **Definição de `cohortCycleId`**: É estritamente o `originCycleId` da primeira partida concluída no dispositivo. Se uma partida iniciada no Dia 10 for concluída no Dia 12, `cohortCycleId` permanece sendo o Dia 10. O marco D1 (Dia 11) não é ganho retroativamente;
- **Denominador da Coorte**: O total de eventos `cohort_started` registrados para uma determinada data de coorte;
- **Numerador de Retorno**: Ao concluir partidas subsequentes em datas correspondentes a `cohortCycleId + 1` (D1), `+ 7` (D7) ou `+ 14` (D14), o cliente emite `cohort_milestone` com o respectivo marco (no máximo uma vez por marco);
- **Taxa Estimada**:
  $$	ext{Estimativa de Retenção (D}_n) = rac{	ext{Contador cohort\_metrics}(D_n, 	ext{coorte } X)}{	ext{Contador cohort\_metrics}(	ext{'started'}, 	ext{coorte } X)}$$

### 6.3 Remoção de `game_abandoned` e Limitações Analíticas
- **Abandono Permanente Não Observável**: O abandono permanente não é confiavelmente observável no modelo anônimo/local-state sem introduzir timeouts artificiais ou rastreamento invasivo. O evento `game_abandoned` foi excluído do MVP e sua ausência permanece como limitação analítica aceita do Shape 1;
- **Entrega de Melhor Esforço**: Bloqueadores de rede, instabilidade do cliente ou limites de quota podem ocasionar perda de eventos. As taxas de retenção constituem **estimativas comportamentais direcionais**, e não métricas de precisão censitária;
- **Limpeza de Armazenamento Local**: A exclusão de dados locais reinicia o dispositivo em uma nova coorte no próximo jogo.

### 6.4 Pipeline Unificado de Manifestação de Interesse (P3)
- O clique no card voluntário pós-jogo emite o evento `interest_expressed` para o endpoint unificado `POST /api/telemetry`;
- Zero coleta de dados pessoais de contato (nome, telefone, e-mail) no experimento inicial.

---

## 7. Rastreabilidade Editorial & Escopo do Conteúdo

### 7.1 Fontes Editoriais Conforme a Constituição (Princípio IX)
- Citação de fonte adequada, verificável e rastreável segundo a natureza da afirmação, classificada estritamente dentro das 8 categorias constitucionais:
  1. Sagrada Escritura;
  2. Magistério e Documentos Conciliares;
  3. Catecismo da Igreja Católica;
  4. Patrística e Doutores da Igreja;
  5. Liturgia Oficial e Calendário Geral;
  6. História Eclesiástica Documentada;
  7. Tradição e Devoção Popular;
  8. Opiniões ou Hipóteses Teológicas.

### 7.2 Volume de Desafios como Hipótese de Escopo `[CANDIDATE SCOPE / SCOPE ASSUMPTION]`
- **Fixtures de Desenvolvimento e Testes**: **5 a 10 desafios verificados** para a suíte automatizada;
- **Acervo Candidato para Primeiro Release Público**: **14 a 30 desafios curados** `[CANDIDATE SCOPE / SCOPE ASSUMPTION]`;
- **Racional Estatístico**: 14 dias civis contínuos permitem observar a ocorrência de marcos D14 para as primeiras coortes, mas **não garantem por si sós significância estatística**, pois o volume total de novos usuários é desconhecido (`[UNKNOWN]`).

---

## 8. Metas de Performance Recomendadas (SC-002)

Com base nas recomendações de boa experiência de usuário do framework **Core Web Vitals do Google**:
- **LCP (Largest Contentful Paint)**: <= 2.5 segundos (medido no percentil 75 em dispositivos móveis reais);
- **INP (Interaction to Next Paint)**: <= 200 milissegundos (medido no percentil 75);
- **CLS (Cumulative Layout Shift)**: <= 0.1 (medido no percentil 75);
- **Tamanho de Bundle**: Monitorado como baseline durante o build e em CI;
- **Disponibilidade / Uptime**: Alta disponibilidade fornecida pela infraestrutura de borda da CDN em regime de melhor esforço (*best-effort*), sem garantia contratual de SLA no plano gratuito.

---

## 9. Segurança por Padrão

- **Higiene de Renderização**: O React realiza o escape de strings interpoladas por padrão em JSX, reduzindo significativamente riscos comuns de DOM-XSS. Contudo, **o React não elimina o XSS por si só**: injeções permanecem possíveis via atributos perigosos (como `href` inseguros), injeções de HTML bruto ou dependências de terceiros vulneráveis;
- Portanto, mantêm-se a validação rigorosa de entradas, proibição de injeção insegura de HTML, auditoria de dependências (`npm audit`) e cabeçalhos estritos de Content Security Policy (CSP) na borda.

---

## 10. Estratégia de Testes Automatizados

Substitui-se metas genéricas de cobertura percentual por exigência explícita:  
> *"Todos os invariantes de domínio determinísticos identificados e casos de borda aprovados devem possuir testes automatizados."*

- **Suíte de Testes Unitários do Motor (`tests/unit/engine/`)**:
  - 6 tentativas de adivinhação;
  - Detecção de vitória e término de tentativas;
  - Algoritmo de consumo de letras repetidas (caso `MARIA` vs `ARARA`);
  - Normalização ortográfica (`ACAO` = `AÇÃO`);
  - Variação dinâmica de tamanho de palavra (`wordLength === normalizedWord.length`);
  - Rejeição de palavras fora do vocabulário aceito;
  - Transição da meia-noite (23:58 → 00:03);
  - Sessão prolongada por múltiplos dias (Dia 10 concluído no Dia 12) e quebra de streak;
  - Bloqueio de replay no mesmo ciclo.
- **Suíte de Testes de Componentes e Acessibilidade (`tests/integration/`, `tests/a11y/`)**:
  - Interação com teclado físico e virtual;
  - Alertas acessíveis (`aria-live`);
  - Modais com captura de foco;
  - Auditoria automatizada com `axe-core`.
