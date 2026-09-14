# Cruzadas.online ✝️

> Passatempo diário de palavras no navegador, focado na cultura, liturgia e tradição católica, sem fricção, sem cadastro e com acessibilidade universal.

---

## 1. Visão Geral do Produto

O **Cruzadas.online** é um jogo de desafio diário de adivinhação de palavras (inspirado na dinâmica consagrada do *Wordle* / *Termo*), ambientado com temas formativos e litúrgicos da tradição e cultura católica.

### Princípios Norteadores
- **Acesso Aberto Imediato**: Jogabilidade no navegador sem cadastro, login ou download de aplicativo.
- **Privacidade por Design**: Estado de jogo salvo exclusivamente no dispositivo do jogador (`localStorage`). Telemetria anônima agregada sem retenção de IPs nem coleta de dados pessoais (PII), em conformidade intencional com a LGPD e o ECA Digital.
- **Rigor Documental e Formativo**: Cada desafio finalizado apresenta o termo canônico acentuado, nota contextualizadora e citação documental verificável (Catecismo, Sagrada Escritura, Patrística ou Magistério).
- **Acessibilidade Universal (WCAG 2.2 AA)**: Feedback posicional de letras transmitido simultaneamente por cor (verde/amarelo/cinza) e símbolos geométricos distintivos (✓ check, △ triângulo, − traço), áreas de toque ergonômicas (≥ 44/48px) e leitor de tela com anúncios semânticos claros.

---

## 2. Arquitetura e Topologia

A aplicação adota a topologia canônica recomendada pela Cloudflare para novas aplicações:
- **Frontend SPA**: React 19.3.x, TypeScript 6.0.x, Vite 8.1.x, Tailwind CSS 4.3.x;
- **Hospedagem & Distribuição**: **Cloudflare Workers Static Assets** (assets estáticos compilados em `dist/client/` servidos diretamente na borda);
- **API Serverless na Borda**: **Cloudflare Worker API** (`worker/index.ts`) respondendo às rotas `/api/*`:
  - `GET /api/challenge/today`: Entrega o desafio oficial do dia corrente em Horário de Brasília (UTC-3), blindando desafios futuros;
  - `POST /api/telemetry`: Ingestão atômica de contadores agregados consolidados;
- **Telemetry Sink**: **Cloudflare D1** (banco SQLite serverless na borda) persistindo exclusivamente contadores nas tabelas `daily_metrics` e `cohort_metrics`.

---

## 3. Toolchain & Comandos de Desenvolvimento

- **Node.js**: 24 LTS
- **React**: 19.3.x
- **Vite**: 8.1.x
- **TypeScript**: 6.0.x
- **Tailwind CSS**: 4.3.x
- **Vitest**: 5.x
- **ESLint**: 10.x

### Scripts Disponíveis

```bash
# Instalação de dependências
npm install

# Desenvolvimento local (Vite + Cloudflare Vite Plugin)
npm run dev

# Validação estrita de tipos
npm run typecheck

# Execução de linter
npm run lint

# Execução de toda a suíte de testes unitários, contratos, integração e acessibilidade
npm run test

# Validação do acervo editorial de desafios
npm run validate:content

# Geração do registro estático server-side de desafios
npm run generate:registry

# Build de produção (assets estáticos e Worker API)
npm run build
```

---

## 4. Pipeline Editorial & Diretrizes de Conteúdo

- **Acervo de Produção**: `content/challenges/` (arquivos JSON com `id`, `cycleDate`, `word`, `initialClue`, `postGameContext`, `sourceCitation`, `sourceCategory` e `editorialStatus`).
- **Fixtures de Teste**: `tests/fixtures/challenges/` (usadas exclusivamente em testes automatizados locais).
- **Portão Editorial de Release**: O script `validate-challenges.ts` impede a publicação se o acervo não possuir ao menos um desafio verificado (`Verified` ou `Published`) para a data de liberação com fontes factuais revisadas por humanos.

---

## 5. Status de Provisionamento do Cloudflare D1

- **Ambiente Local & Testes (100% Validado)**: Migrações D1 locais e testes de contrato de telemetria são executados e validados com êxito via SQLite local (`npx wrangler d1 migrations apply DB --local`) e suíte de testes Vitest em memória.
- **Ambiente Remoto na Nuvem (BLOQUEADO)**: A criação do banco de dados D1 remoto e a aplicação remota de migrações em produção encontram-se **BLOQUEADAS** aguardando fornecimento de credenciais autenticadas da Cloudflare (`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`). Não há bindings remotos simulados nem UUIDs fictícios no repositório; o deploy remoto depende exclusivamente da atribuição das chaves do operador da infraestrutura.

---

## 6. Ambiente Docker Local & Regras de Engenharia

Para desenvolvimento local e homologação reproduzível no Docker Desktop (Windows/Linux/macOS):

```bash
# Iniciar o ambiente completo em segundo plano com build
docker compose up -d --build

# Ou via script npm de conveniência
npm run docker:up

# Acompanhar logs do contêiner
npm run docker:logs

# Encerrar contêineres
npm run docker:down
```

- **Aplicação Web & Worker API**: Acessível em `http://localhost:5180`
- **Endpoint da API**: `http://localhost:5180/api/challenge/today`
- **Mapeamento de Portas**: `5180` (host Windows) &rarr; `5173` (Vite no contêiner)

### Reserved Local Ports

The maintainer runs multiple projects simultaneously.

Current reserved ports:

* `5173` → BiblioFlux Web
* `5174` → BiblioFlux API
* `5180` → Cruzadas.online Web + Worker API through Docker

Cruzadas.online MUST NOT bind host ports 5173 or 5174.

Before introducing any new externally exposed local port, verify that it is not already reserved or in use.

The internal container port may differ from the host port.

For the current Docker environment:

`host 5180 → container 5173`

### Docker Local Parity Rule

Any change that affects deployable or executable application behavior MUST keep the local Docker environment synchronized.

This includes changes to:

* frontend runtime code;
* Worker/API code;
* dependencies and lockfiles;
* package scripts;
* Vite configuration;
* Wrangler configuration;
* D1 schema or migrations;
* runtime/environment configuration;
* content/registry generation;
* ports;
* build commands;
* startup commands;
* Docker infrastructure.

A task affecting deployable behavior is NOT considered complete until Docker-local compatibility has been evaluated and, when necessary, the Docker environment has been updated and successfully verified.

Do NOT modify Docker files artificially when no Docker change is needed.

The rule is behavioral parity, not “change Docker files on every task”.

For ordinary application source changes already reflected through bind mounts/HMR, simply verify that the Docker environment still works.

For dependency, runtime, migration, port, build or infrastructure changes, rebuild/recreate the containers when required.

NEVER consider the task complete when:

* host execution works but Docker execution fails;
* Docker uses stale dependencies;
* required D1 migrations were not applied;
* Docker routes/ports no longer match the application;
* Docker runs materially different behavior from host development;
* a deploy-affecting change was made without Docker verification.

---

## 7. Licença

Este projeto é desenvolvido para fins educacionais e comunitários. Todos os direitos reservados.


