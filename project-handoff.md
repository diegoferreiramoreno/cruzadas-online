# Cruzadas.online — Project Handoff & Technical Report

**Document Version:** 1.0.0  
**Project:** Cruzadas.online  
**Target Milestone:** MVP v0.1 — Quiz Católico (Fundamentos da Fé)  
**Date:** Outubro de 2026  
**Engineering Role:** Staff / Principal Software Engineer  

---

## 1. Sumário Executivo

O objetivo desta etapa foi entregar o **primeiro vertical slice de ponta a ponta** da plataforma web **Cruzadas.online**, permitindo que qualquer usuário anônimo navegue pelo catálogo inicial de jogos, inicie uma partida do **Quiz Católico — Fundamentos da Fé**, responda a questões teologicamente fundamentadas, conclua a partida, obtenha seu resultado detalhado (com pontuação, percentual, respostas fornecidas vs. corretas, explicações e fontes) e jogue novamente com novas perguntas sorteadas.

A implementação foi realizada com rigor técnico seguindo as diretrizes de **DDD pragmático**, **Clean Architecture**, **SOLID**, **KISS** e **YAGNI**, operando estritamente em um ambiente isolado com respeito total a outros serviços já em execução no host.

---

## 2. Decisões Arquiteturais (Architectural Decision Records)

### ADR-01: DDD Pragmático sem Over-Engineering
- **Contexto:** Plataformas de jogos tendem a cair na armadilha de criar abstrações genéricas prematuras (ex.: "GenericGameEngine", "RuleEngine", "BaseCardItem") que aumentam a complexidade sem valor imediato.
- **Decisão:** Modelar diretamente as entidades essenciais do Quiz: `Quiz`, `Question`, `AnswerOption`, `QuizAttempt`, `AttemptQuestion` e `AttemptAnswer`. O `QuizAttempt` atua como agregado de execução, controlando as questões sorteadas e o registro das respostas submetidas.
- **Resultado:** Código enxuto, legível, com alta testabilidade e sem acoplamento acidental com hipóteses de jogos futuros (como palavras cruzadas ou forca).

### ADR-02: Isolamento da Regra de Negócio e Anti-Cheat no Backend
- **Contexto:** Em jogos de perguntas e respostas na web, um erro comum é enviar a indicação de qual alternativa é correta junto com o payload da pergunta, permitindo trapaças via DevTools.
- **Decisão:** A API devolve estritamente `QuestionId`, `Text`, `Order` e `Options` (com `Id` e `Text`), ocultando completamente `IsCorrect`, `Explanation` e `Reference` durante a partida.
- **Validação:** A submissão ocorre no endpoint `POST /api/v1/quizzes/{slug}/attempts/{attemptId}/complete`. O backend compara as alternativas selecionadas com o banco de dados, calcula os acertos, persiste o resultado e só então retorna o objeto de revisão completa (`QuizResultDto`).

### ADR-03: Dual Database Provider no Entity Framework Core 10
- **Contexto:** A aplicação utiliza PostgreSQL 18 via Npgsql em produção e Docker. No entanto, testes de integração automatizados (`CustomWebApplicationFactory`) devem ser rápidos, idempotentes e independentes de serviços externos no host ou instâncias de Docker já ativas.
- **Decisão:** Configurar o `CruzadasDbContext` para suportar tanto `Npgsql` quanto `Sqlite` in-memory. O método de injeção de dependência inspeciona a configuração `Database:Provider`.
  - Em execução padrão / Docker: `Database:Provider = Npgsql` conecta ao PostgreSQL com suporte a JSONB, UUIDs nativos e migrations.
  - Em testes de integração (`Cruzadas.Api.IntegrationTests`): `Database:Provider = Sqlite` provisiona um banco SQLite em memória com conexão persistente compartilhada.
- **Resultado:** 24 testes executam em menos de 10 segundos sem depender de banco de dados externo ou containers.

### ADR-04: Identificadores e Mapeamento de Entidades
- **Contexto:** O EF Core gera IDs sequenciais por padrão quando chaves primárias são inseridas, o que gerava concorrência e inconsistências em instâncias instanciadas pelo domínio com `Guid.NewGuid()`.
- **Decisão:** Todas as entidades com chaves do tipo `Guid` foram mapeadas explicitamente com `.ValueGeneratedNever()`, garantindo que os identificadores gerados pelas entidades de domínio e pelo seeder sejam preservados de maneira determinística.

### ADR-05: Design System e Identidade Visual Solene
- **Contexto:** O produto possui temática de fé católica e cultura cristã, com risco de cair em estética kitsch (excesso de dourado, páginas pesadas) ou em aparência corporativa / acadêmica genérica.
- **Decisão:** Criação de um Design System moderno com design tokens em CSS:
  - **Azul Catedral Profundo** (`#111d2e`): Transmite sobriedade, serenidade e tradição.
  - **Vinho Cardinalício** (`#7b1113`): Destaques litúrgicos e botões secundários.
  - **Ouro Envelhecido** (`#c59b27` / `#dfb746`): Acentos solenes e emblemas.
  - **Pergaminho Suave** (`#f8f6f0` / `#f0ece1`): Fundos limpos e legíveis.
  - **Tipografia**: Serif clássica para títulos (`Cinzel`, `Georgia`, `Playfair Display`) e Sans-Serif moderna para corpo de texto (`Inter`, `system-ui`).
  - **Acessibilidade**: Contraste WCAG 2.1 AA rigoroso, foco visível para navegação por teclado e atalhos rápidos (`1-4`, `A-D`, `Enter`).

---

## 3. Conteúdo Inicial e Rigor Teológico

O seeder inicial (`CruzadasDataSeeder`) cadastra **15 questões com rigor histórico e doutrinário**, cobrindo:
1. **Sacramentos**: Instituição e número dos sacramentos (CIC 1113).
2. **Cânon Bíblico**: Quantidade de livros da Bíblia católica (CIC 120).
3. **Liturgia e Eucaristia**: Dogma da Transubstanciação (Concílio de Trento / CIC 1376).
4. **Cristologia e Trindade**: Credo Niceno-Constantinopolitano e Consubstancialidade (Concílio de Nicéia I, 325 d.C.).
5. **História da Igreja**: Pentecostes, Doutores da Igreja (São Tomás de Aquino, Santo Agostinho, Santa Teresa de Ávila).
6. **Vida Cristã e Moral**: Virtudes Teologais (1 Cor 13, 13 / CIC 1812) e Mandamento Maior (Mt 22, 37-39).

Todas as perguntas contêm referências explícitas:
- Catecismo da Igreja Católica (CIC);
- Textos bíblicos canônicos;
- Documentos de concílios ecumênicos reconhecidos.

---

## 4. Handoff Operacional e Configuração de Portas

### Portas Alocadas para o Projeto
Para evitar qualquer conflito com serviços já ativos no computador do desenvolvedor ou de outros containers, as portas do Cruzadas.online foram isoladas:

| Componente | Porta Padrão | Variável `.env` |
| :--- | :--- | :--- |
| **Frontend Web (Nginx / Vite)** | `5175` | `CRUZADAS_WEB_PORT` |
| **Backend API (.NET 10)** | `5185` | `CRUZADAS_API_PORT` |
| **PostgreSQL Database** | `55432` | `CRUZADAS_DB_PORT` |

### Comandos de Operação Docker
O Compose possui nome de projeto fixo (`cruzadas-online`), garantindo que comandos direcionados operem unicamente nesta stack:

```bash
# 1. Subir a stack completa isolada
docker compose up --build -d

# 2. Verificar status dos containers do projeto
docker compose ps

# 3. Visualizar logs em tempo real
docker compose logs -f cruzadas-api
docker compose logs -f cruzadas-web

# 4. Parar a stack sem afetar nenhum outro container do host
docker compose down
```

### URLs de Acesso
- **Frontend SPA**: `http://localhost:5175`
- **Health Check da API**: `http://localhost:5185/health`
- **OpenAPI Documentation (Scalar)**: `http://localhost:5185/scalar/v1`

---

## 5. Resumo da Suíte de Testes e Métricas de Qualidade

### Backend (.NET 10)
- **Cruzadas.Domain.Tests**: 8 testes unitários cobrindo invariantes de `Quiz`, `Question`, criação de `QuizAttempt`, validação de alternativas vazias e cálculo de pontuação.
- **Cruzadas.Application.Tests**: 8 testes de serviço cobrindo início de tentativa, retorno sem gabarito, submissão de respostas corretas e incorretas, proteção contra tentativas inexistentes ou já finalizadas.
- **Cruzadas.Api.IntegrationTests**: 8 testes de integração HTTP end-to-end cobrindo endpoints `/health`, `/api/v1/games`, `/api/v1/quizzes/{slug}`, início de tentativa, fluxo completo de submissão e tratamento de erros com Problem Details (RFC 7807).
- **Resultado Geral do Backend**: **24 testes executados, 24 aprovados, 0 falhas**.

### Frontend (React 19 + Vitest + Testing Library)
- **QuizFlow.test.tsx**: Teste de ponta a ponta simulando o usuário na home, carregando o catálogo, selecionando o jogo, respondendo questão a questão via interface acessível, concluindo o quiz, validando a tela de resultado com gabarito e explicações teológicas, e clicando em "Jogar Novamente".
- **Linter (ESLint 9 + typescript-eslint)**: **0 erros, 0 avisos**.
- **Build de Produção (Vite + TypeScript compiler)**: **Sucesso total**, bundle otimizado com compressão gzip.

---

## 6. Diretrizes para Próximos Passos (Roadmap Técnico)

1. **Adição de Novos Tipos de Jogos**:
   - Manter a separação de domínio. Criar novos agregados específicos para jogos como *Palavras Cruzadas* (`CrosswordGame`) ou *Caça-Palavras* sem forçar herança com o Quiz.
   - O catálogo de jogos (`/api/v1/games`) já suporta extensão com novos itens e metadados.
2. **Autenticação e Perfis (Futuro)**:
   - Quando necessário, introduzir autenticação OpenID Connect / JWT sem quebrar o fluxo anônimo: o `QuizAttempt` pode receber uma coluna opcional `UserId (Guid?)`, permitindo tanto jogos anônimos quanto vinculados a contas.
3. **Placar de Líderes e Estatísticas**:
   - Adicionar tabela de ranking baseada em tempo de conclusão e percentual de acertos.
4. **Modo Escuro / Claro**:
   - As variáveis em `index.css` estão preparadas para suporte a tema adaptativo (`prefers-color-scheme`) ou alternador de tema manual.

---

## 7. Diretrizes Obrigatórias de Fluxo Git e Pull Requests

A partir de 08/10/2026, **é estritamente proibido realizar commits ou merges diretos na branch `main`**. O fluxo de trabalho padrão deve seguir as etapas abaixo:

### Regras do Fluxo:
1. **Nova Branch a partir da `main`:**
   Toda nova tarefa, correção ou feature deve iniciar a partir de uma nova branch criada da `main` atualizada:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<nome-da-feature>   # ou fix/<nome-da-correcao>
   ```
2. **Desenvolvimento e Validação:**
   - Implementação do código.
   - Execução e aprovação de todos os testes unitários e de integração (`dotnet test`, `npm test`, `npm run build`).
3. **Commit e Push:**
   - Commits semânticos e objetivos na feature branch:
   ```bash
   git add .
   git commit -m "feat/fix(escopo): descrição da alteração"
   git push -u origin feature/<nome-da-feature>
   ```
4. **Abertura de Pull Request para `main`:**
   - Ao finalizar a implementação e validação, criar o Pull Request formal direcionado para a `main` via GitHub CLI (`gh`):
   ```bash
   gh pr create --base main --head feature/<nome-da-feature> --title "..." --body "..."
   ```
5. **Revisão e Merge:**
   - O merge na `main` deve ocorrer preferencialmente via Pull Request após validação do usuário.

---

## 8. Funcionalidades Recentes Entregues

1. **Múltiplos Grupos de Quizzes e Partida Rápida:**
   - Agrupamento em 4 categorias ricas: Doutrina e Sacramentos, Sagradas Escrituras, História e Tradição, Liturgia e Oração.
   - Filtro por chips na tela inicial e botão de sorteio aleatório ("Jogar Partida Rápida").
2. **Acesso Externo LAN / WAN:**
   - Roteamento relativo no frontend (`/api/v1`) via reverse proxy Nginx (`cruzadas-web`).
   - Política de CORS dinâmica para ambiente de desenvolvimento no backend.
   - Permite acesso direto por celulares e dispositivos na rede local (ex.: `http://<IP_LAN>:5175`).
3. **Apoio e Contribuição via PIX:**
   - Modal de apoio com QR Code vetorial e botão "Copiar Código Pix (Copia e Cola)".
   - Configuração centralizada em `apps/web/src/config/donation.ts` para fácil substituição pelos dados oficiais do titular.
   - Gatilhos amigáveis no cabeçalho, no rodapé e na tela de resultado de cada partida.
4. **Logs Estruturados no Banco de Dados (`app_logs`):**
   - Entidade `AppLog` e tabela `app_logs` com índices em `Timestamp`, `Level` e `EventName`.
   - Escrita assíncrona não bloqueante de alta performance via `System.Threading.Channels.Channel<AppLog>` e background worker (`DbLogProcessorHostedService`).
   - Interface `IAppLogger` implementada por `DbAppLogger` com suporte a metadados (`PropertiesJson`), `TraceId` e stack trace de exceções.
   - Eventos instrumentados:
     - `RandomQuizStarted`: sorteio de quiz para partida rápida.
     - `QuizAttemptStarted`: início de partida com total de questões.
     - `QuizAttemptCompleted`: finalização com acertos, pontuação percentual e tempo decorrido em segundos.
     - `AttemptAlreadyCompleted`: aviso (warning) de tentativa duplicada.
     - `HttpRequestFailed` e `UnhandledException`: captura global de falhas e 4xx/500 via middleware.


5. **Quizzes Históricos da Herança das Cruzadas e da Ordem de Cristo:**
   - Adicionados 3 novos quizzes temáticos na categoria **História e Tradição**, cobrindo a linhagem histórica autêntica das Cruzadas até o Brasil (Terra de Santa Cruz), com fontes primárias e autores de referência (São Bernardo de Claraval, Régine Pernoud, René Grousset, Hilaire Belloc, Frei Luís de Sousa, Pero Vaz de Caminha, bulas pontifícias):
     - **Iniciante:** `As Cruzadas e a Defesa da Cristandade` (`cruzadas-e-cristandade`) — O Concílio de Clermont (1095), *Deus Vult*, Godofredo de Bouillon (*Advocatus Sancti Sepulchri*), Hugues de Payens, São Bernardo de Claraval, voto monástico e uniforme templário, Hospitalários (Ordem de Malta), defesa legítima dos peregrinos e a Batalha de Navas de Tolosa (1212).
     - **Intermediário:** `A Ordem de Cristo e as Grandes Navegações` (`ordem-de-cristo-e-navegacoes`) — Extinção administrativa pelo Papa Clemente V (Bula *Vox in Excelso*), proteção por D. Dinis, fundação canônica pelo Papa João XXII (Bula *Ad Ea Ex Quibus* de 1319), Convento de Cristo em Tomar, Infante D. Henrique, as caravelas com a Cruz de Cristo, Bula *Romanus Pontifex*, Terra de Santa Cruz (Cabral) e a Primeira Missa (Frei Henrique de Coimbra).
     - **Avançado:** `Tradição de Cavalaria e Batalhas Decisivas da Cristandade` (`cavalaria-e-batalhas-da-cristandade`) — Tratado *De Laude Novae Militiae* de São Bernardo, Mestre D. Gualdim Pais no cerco de Tomar (1190), fórmula canônica do Concílio de Vienne (*non per modum definitivae sententiae, sed per viam provisionis*), D. Frei Gil Martins (1º Grão-Mestre de Cristo), Grande Cerco de Malta (1565, Jean de La Valette), Batalha de Lepanto (1571, Papa São Pio V e D. João de Áustria), Batalha de Viena (1683, Rei João III Sobieski e os Hussardos Alados), Martim Moniz no Cerco de Lisboa (1147) e divisa do Infante (*Talant de bien faire*).
6. **Exibição do Nível de Dificuldade no Jogo e no Resumo:**
   - Adicionado campo `DifficultyLevel` nos DTOs de início e conclusão de partida (`StartAttemptResponseDto`, `QuizResultDto`, `QuizDetailDto`).
   - Tela de jogo (`QuizPlay.tsx`): adicionado badge estilizado com a dificuldade atual (`badge-difficulty`) ao lado do título do quiz na barra superior, garantindo que o jogador saiba imediatamente o nível, inclusive em partidas rápidas sorteadas aleatoriamente.
   - Tela de resultado (`QuizResultView.tsx`): exibição do nome do quiz e badge de nível de dificuldade correspondente ao lado do indicador de "Partida Concluída".
