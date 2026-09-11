# Quickstart: Guia de Validação e Execução Técnica (Shape 1)

**Feature Branch**: `001-daily-challenge`  
**Date**: 2026-09-11  
**Status**: Proposed / Pending PO Gate  

Este guia orienta a configuração do ambiente de desenvolvimento no toolchain 2026 integrado à Cloudflare (Workers Static Assets + Worker API), execução da suíte de testes determinísticos e validação ponta a ponta dos cenários aprovados do Desafio Diário Web-First.

---

## 1. Pré-requisitos (Toolchain 2026)
- **Node.js**: Versão **24 LTS** (`node -v >= 24.0.0`);
- **npm**: Versão 10+ (`npm -v >= 10.0.0`) com reprodutibilidade via `package-lock.json` (`npm ci`);
- **Navegador Moderno**: Chrome, Safari (iOS/macOS), Firefox ou Edge;
- **Wrangler**: CLI da Cloudflare incluída como devDependency (`wrangler.jsonc`);
- **Git**: Configurado na feature branch `001-daily-challenge`.

---

## 2. Instalação e Execução Local Integrada

O fluxo de desenvolvimento local exercita simultaneamente o **React SPA** e as **rotas do Worker API** (`/api/*`), com simulação local do Cloudflare D1 através do `@cloudflare/vite-plugin` (ou `wrangler dev`).

```bash
# 1. Instalar dependências com reprodutibilidade estrita via lockfile
npm ci

# 2. Iniciar o ambiente de desenvolvimento integrado (SPA + Worker API + D1 local)
npm run dev

# A aplicação estará acessível em: http://localhost:5173
# As rotas /api/challenge/today e /api/telemetry são atendidas diretamente pelo Worker local
```

---

## 3. Comandos de Verificação & Build de Produção

Todos os invariantes de domínio determinísticos identificados e casos de borda aprovados possuem testes automatizados obrigatórios.

```bash
# 1. Checagem estática de tipos (TypeScript 6.0.x)
npm run typecheck

# 2. Validação de formatação e linting (ESLint 10 Flat Config)
npm run lint

# 3. Executar toda a suíte de testes de regras determinísticas e componentes (Vitest 5)
npm run test

# 4. Validar a integridade editorial e igualdade wordLength === normalizedWord.length
npm run validate:content

# 5. Gerar o registro server-side de desafios (worker/generated/challenge-registry.ts)
npm run generate:registry

# 6. Gerar o build de produção integrado (SPA em dist/client/ e Worker em dist/worker/)
npm run build
```

O comando de build compila os assets estáticos do cliente para a pasta configurada de Static Assets e empacota o Worker API com o registro server-side de desafios embutido, garantindo que **nenhum desafio futuro seja emitido para a pasta pública do cliente**.

---

## 4. Cenários de Validação Manual & Homologação

### Cenário A: Resolução com Letras Repetidas (Caso Canônico `MARIA` vs `ARARA`)
1. Iniciar a aplicação local com o desafio mock configurado para a palavra secreta `MARIA` (pista: "Mãe de Jesus", `wordLength: 5`);
2. Digitar a tentativa `ARARA` no teclado e submeter (`Enter`);
3. **Verificar os feedbacks obtidos na linha**:
   - 1ª letra `A`: Status **Presente** (cor âmbar + ícone triângulo + `aria-label` de presente);
   - 2ª letra `R`: Status **Presente**;
   - 3ª letra `A`: Status **Ausente** (cor cinza + ícone traço + `aria-label` de ausente);
   - 4ª letra `R`: Status **Ausente**;
   - 5ª letra `A`: Status **Correto** (cor verde + ícone check + `aria-label` de correta);
4. Confirmar que a 3ª letra `A` foi devidamente marcada como ausente por ser excedente (a palavra secreta contém apenas duas ocorrências da letra 'A', satisfeitas pela 5ª posição correta e 1ª presente).

### Cenário B: Normalização Ortográfica (`ACAO` = `AÇÃO`)
1. Submeter a tentativa `ACAO` para um desafio com palavra secreta `AÇÃO`;
2. Confirmar que a tentativa é aceita sem erro e avaliada com equivalência funcional exata;
3. Confirmar que a tela pós-jogo exibe a palavra com a grafia canônica acentuada (`AÇÃO`).

### Cenário C: Conclusão, Pós-Jogo e Bloqueio de Replay
1. Concluir a partida acertando o termo em qualquer tentativa (ou esgotando as 6 tentativas);
2. Verificar a exibição da tela pós-jogo contendo:
   - Mensagem acolhedora com o número de tentativas;
   - Nota de contextualização formativa;
   - Citação de fonte adequada, verificável e rastreável conforme as 8 categorias do Princípio IX;
   - Botão voluntário de compartilhamento sem spoilers;
   - Card voluntário de manifestação de interesse/apoio (P3);
3. Recarregar a página (F5): confirmar que a partida permanece no estado `COMPLETED` e não permite rejogabilidade no mesmo ciclo.

### Cenário D: Acessibilidade (WCAG 2.2 AA e Alvos Ergonômicos)
1. Navegar por toda a tela utilizando exclusivamente teclado (`Tab`, `Shift+Tab`, `Enter`, `Backspace`);
2. Verificar o contorno de foco de alto contraste (`focus-visible`) em todos os botões e teclas;
3. Verificar conformidade com WCAG 2.2 AA (SC 2.5.8 Target Size Minimum) e conferir se os botões e teclas do teclado virtual atingem o alvo ergonômico ampliado de produto (>= 44/48px) voltado a adultos e idosos;
4. Testar a ampliação para 200% de zoom no navegador: certificar que nenhuma célula ou texto sofre sobreposição destrutiva.

### Cenário E: Sessão Prolongada por Múltiplos Dias e Cálculo de Sequência (*Streak*)
1. Simular no estado local uma partida iniciada no Dia 10 (`originCycleId = "2026-09-10"`);
2. Avançar o relógio do mock para o Dia 12 (`todayCycleId = "2026-09-12"`), sem registro de jogo no Dia 11;
3. Retomar e concluir a partida do Dia 10 no Dia 12;
4. **Verificar os invariantes determinísticos de estado**:
   - O resultado é atribuído exclusivamente ao Dia 10 (`lastCompletedCycleId = "2026-09-10"`);
   - O Dia 11 permanece ausente em `completedCycleIds`;
   - O Dia 12 **NÃO** é considerado jogado por esta conclusão;
   - O `currentStreak` permanece **0** (a conclusão tardia do Dia 10 não ressuscita a sequência quebrada pela falta do Dia 11);
   - O `maxStreak` reconhece sequências consecutivas históricas (ex.: se o Dia 9 havia sido jogado, Dia 9 + 10 = 2 dias);
   - O novo desafio do Dia 12 fica disponível; ao concluí-lo, o `currentStreak` torna-se **1**.
