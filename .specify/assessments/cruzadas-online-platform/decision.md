# Decision: Plataforma Digital de Jogos Educativos Cruzadas.online

- **Slug**: cruzadas-online-platform
- **Decided**: 2026-09-10
- **Verdict**: go
- **Artifacts reviewed**: `intake.md` | `research.md` | `problem.md` | `concept.md`

---

## Executive Summary & Decision Context

Este documento formaliza o portão executivo final do ciclo de Product Discovery para a iniciativa **Cruzadas.online**, pesando o conjunto de evidências, inferências, hipóteses e restrições acumuladas ao longo de *Intake*, *Research*, *Define* e *Shape*.

O investimento de esforço já realizado no Discovery **não constitui justificativa para continuar o produto**. O avanço fundamenta-se estritamente na deliberação soberana de governança do Product Owner sobre a postura de risco do projeto, selecionando a rota experimental mais enxuta e reversível para gerar evidências comportamentais com usuários reais.

---

## Scorecard de Avaliação do Discovery

| Critério | Avaliação | Justificativa Sintética |
| :--- | :---: | :--- |
| **Problem Validity** | **Unknown** | O Problem Statement permanece formalmente como `[HYPOTHESIS — Problem Hypothesis]`. Não foram realizadas entrevistas estruturadas de problema ou validações qualitativas diretas com o segmento primário. A existência e intensidade da dor permanecem como hipóteses a serem testadas pelo próprio experimento. |
| **Evidence Strength** | **Mixed** | A evidência contextual e de oportunidade (demografia oficial, concorrência, marco regulatório do ECA Digital) possui suporte factual adequado (`adequate`). Por outro lado, a evidência específica do problema (intensidade da dor, frequência de uso, preferência por mecânica e disposição a pagar) permanece `unknown`, não tendo sido validada empiricamente antes do build. |
| **Value vs. Inaction** | **Adequate** | A criação de uma alternativa de entretenimento inteligente, limpa e com fidelidade documental supera o custo de inação (perda de oportunidade de posicionamento e dispersão de esforço em múltiplos formatos desconexos), caso a hipótese de problema se confirme no teste. |
| **Feasibility / Appetite** | **Conceptually Favorable / Not Yet Validated** | A análise do *Assess Shape* demonstrou a existência de um conceito (Shape 1) com apetite deliberadamente `Small` e plausível para um mantenedor individual. A viabilidade técnica e operacional definitiva, contudo, ainda não foi validada por implementação ou decomposição formal de engenharia. |
| **Strategic Fit** | **Strong** | Alinhamento direto com as competências do desenvolvedor e estrito cumprimento das decisões inegociáveis: rigor editorial (`DEC-01`), rejeição a dark patterns (`DEC-02`), foco cultural e católico (`DEC-03`) e foco no segmento primário adulto (`DEC-05`). |
| **Risk Posture** | **Adequate** | Os riscos regulatórios (ECA Digital, ANPD), cadastrais de loja (Google Play) e de direitos autorais foram mapeados com salvaguardas claras. O risco remanescente central é o risco de mercado/problema (*Problem Risk*), expressamente aceito pelo PO. |

---

## Veredito & Racional Executivo

### Veredito: `GO` (Autorizado o Avanço para Especificação do Experimento)

O veredito oficial do portão de discovery é **`GO`**.

> [!IMPORTANT]
> ### [DECISION-PO-RISK-ACCEPTANCE]
> **O Product Owner aceita conscientemente a incerteza remanescente sobre Problem Validation e autoriza o avanço para especificação, desde que o primeiro produto seja tratado como um experimento pequeno, reversível e orientado a aprendizado.**

### Racional da Decisão
O veredito de **`GO` NÃO significa que o problema foi comprovado**, que existe *Product-Market Fit* ou que a disposição a pagar foi validada. O veredito significa estritamente que:
> *"Diante da ausência de evidência negativa suficiente para KILL, da existência de um Shape pequeno, reversível e capaz de produzir aprendizado comportamental real, o Product Owner aceita explicitamente o Problem Risk remanescente e decide usar a própria primeira versão do produto como instrumento de validação."*

A deliberação estrutura-se sobre a seguinte lógica de governança:
1. O *Problem Risk* continua real e explicitamente reconhecido no assessment;
2. Não existe evidência empírica primária suficiente para afirmar categoricamente que o problema está validado;
3. Não existe evidência negativa ou fatal que fundamente o encerramento da iniciativa (*KILL*);
4. O Product Owner rejeita explicitamente a obrigatoriedade de uma etapa prévia de intervenção humana (como entrevistas de problema ou grupos focais) como condição bloqueadora para iniciar a especificação;
5. O **Shape 1** viabiliza um experimento pequeno, reversível e de investimento limitado, constituindo o melhor veículo experimental disponível para aprender com o comportamento real dos usuários;
6. O custo de oportunidade de aprender através desta primeira experiência funcional é considerado plenamente aceitável pelo PO;
7. O objetivo primordial da primeira entrega é a geração de evidência comportamental concreta, e não a escala, a monetização imediata ou a implementação da visão completa da plataforma;
8. Portanto, dentro da tolerância de risco formalmente estabelecida pelo PO: **`GO`**.

---

## Seleção Formal do Shape: Shape 1 (Desafio Diário Web-First)

Fica formalmente selecionado como base para a primeira especificação funcional:
> **Shape 1 — Desafio Diário Web-First com gameplay anônimo e sem conta obrigatória**

### Justificativa da Seleção
O Shape 1 é aprovado não como a solução definitiva ou completa do projeto, mas como o **melhor veículo experimental atualmente disponível para aprendizado com investimento limitado**, pelos seguintes fatores:
- **Menor apetite relativo** entre todas as alternativas conceituais avaliadas no Shape;
- **Máxima reversibilidade**: baixo custo de implementação e quase nenhum custo afundado em caso de refutação da hipótese;
- **Independência de lojas de aplicativos**: elimina travas burocráticas de aprovação e verificação cadastral no Google Play Console;
- **Menor necessidade de dados pessoais para jogar**: gameplay anônimo no navegador reduz significativamente a superfície de risco sob a LGPD e o ECA Digital;
- **Menor complexidade operacional inicial**: foco editorial em exatamente 1 desafio por dia;
- **Capacidade de medir comportamento real**: avalia conclusão de partidas, retenção de hábito e compartilhamento voluntário em vez de apenas intenção declarada em pesquisas.

---

## GO Strategy — Build to Learn (Construir para Aprender)

O avanço para `/speckit-specify` sob a estratégia **Build to Learn** estabelece que o propósito da primeira especificação **NÃO é construir a plataforma Cruzadas.online completa nem seu catálogo final de 8 formatos de jogos**.

O objetivo restringe-se a especificar e construir a menor experiência funcional possível capaz de coletar dados comportamentais reais sobre:
1. **Atração e Descoberta**: Se o público-alvo acessa o link e inicia o desafio;
2. **Conclusão**: Proporção de jogadores que resolvem o desafio até o final;
3. **Retorno Periódico**: Se há retorno voluntário ao longo dos dias sem notificações invasivas;
4. **Compartilhamento Voluntário**: Se usuários compartilham seus resultados no WhatsApp em grupos familiares ou de amigos;
5. **Recepção Editorial**: Reação à contextualização histórica, litúrgica e bíblica pós-jogo;
6. **Sinais de Continuidade e WTP**: Interesse voluntário declarado em novos desafios, apoio comunitário ou futuro clube de membros.

---

## Parâmetros Aprovados para o Handoff de Especificação

### 1. Apetite Aprovado
- **Classificação**: `Small`
- **Interpretação Conceitual**: Investimento de esforço deliberadamente pequeno e limitado para um mantenedor individual.
- **Diretriz**: O apetite `Small` **não representa uma promessa rígida de prazo** (como 2 ou 3 semanas garantidas) nem um número fechado de horas. A decomposição técnica, os planos de tarefas e os cronogramas de execução serão definidos formalmente após o *Specify* e o *Plan*.

### 2. Escopo IN Aprovado (Conceitual de Produto)
- Experiência Web responsiva otimizada para navegadores em smartphones e computadores;
- Acesso aberto e gameplay anônimo sem exigência de login, senha ou cadastro prévio;
- Um único formato de jogo: enigma diário curto de adivinhação de palavras/letras;
- Ciclo de desafio periódico renovado a cada 24 horas;
- Conteúdo católico e cultural com rastreabilidade documental e fontes de autoridade;
- Tela pós-jogo com breve contextualização formativa e referência canônica/histórica;
- Registro de estado, estatísticas e sequências de dias (*streaks*) armazenado localmente no dispositivo em nível conceitual;
- Mecanismo de compartilhamento de resultado em texto/card formatado sem spoilers (se couber no apetite);
- Instrumentação analítica mínima necessária para medição de uso do experimento de aprendizado;
- Mecanismo simples e estritamente opcional de manifestação de interesse em continuidade e apoio voluntário.

### 3. Escopo OUT Aprovado (Expressamente Excluído da Primeira Entrega)
- Aplicativos móveis nativos (Android e iOS) e publicação em lojas (Google Play Store e Apple App Store);
- Múltiplos formatos de jogos (caça-palavras, forca, memória, quizzes isolados, etc.);
- Catálogo extenso de jogos anteriores disponíveis no mesmo dia;
- Grades de palavras cruzadas matriciais completas e complexas;
- Contas obrigatórias, telas de cadastro, login social ou perfis de usuário;
- Sincronização em nuvem entre múltiplos dispositivos;
- Ranking competitivo global aberto ou placares públicos;
- Módulos de chat, comunidade, comentários ou fóruns abertos;
- Mecânicas complexas de gamificação, moedas virtuais ou pontos comerciais;
- Gateway de pagamento transacional obrigatório ou gestão completa de assinaturas recorrentes no Dia 1;
- Funcionalidades institucionais B2B para escolas ou paróquias;
- Perfis infantis dedicados ou ambiente desenhado especificamente para crianças;
- Sistema de gerenciamento de conteúdo (CMS) complexo ou painel administrativo multiusuário;
- Geração dinâmica de enigmas por inteligência artificial em tempo de execução (*runtime*);
- Arquiteturas técnicas distribuídas ou microsserviços.

---

## Premissas, Fatos e Não Bloqueios

1. **WTP não é bloqueio para o primeiro GO**: A disposição a pagar (`[UNKNOWN]`) continua não comprovada. O PO deliberou que a comprovação prévia de faturamento transacional não é pré-requisito para autorizar este experimento inicial, cujo foco é atestar uso e retenção.
2. **Domínio `cruzadas.online` não é bloqueio**: Permanece como `[FACT]` que o domínio não foi adquirido. Sua aquisição imediata não é exigida para a especificação técnica do produto; a compra poderá ocorrer antes da publicação pública oficial.
3. **Conta Google Play não é bloqueio**: Permanece como `[FACT]` que a conta de 2012 possui pendências cadastrais de verificação. Como o Shape 1 é 100% Web, a regularização da conta móvel não fará parte do MVP nem atrasará a especificação.
4. **Guardrails Ativos de Regulação e Propriedade Intelectual**: O GO não flexibiliza as decisões `[DECISION-DEF-01]` a `[DECISION-DEF-05]`. A conformidade com o ECA Digital, a LGPD, o respeito a direitos autorais (fontes de domínio público e referências factuais com autoria própria) e o rigor doutrinário permanecem como balizadores mandatórios de produto.
5. **Técnicas Opcionais de Validação Humana**: Diálogos informais, observação de concorrentes ou testes conceituais manuais deixam de ser um portão pré-build obrigatório, mantendo-se disponíveis como ferramentas complementares opcionais que o mantenedor pode acionar paralelamente se julgar oportuno.

---

## Critérios de Reavaliação e Portão Pós-Experimento

Após a publicação e coleta de dados de uso do experimento do Shape 1, o Product Owner reavaliará os resultados com base nos seguintes sinais comportamentais:
- Os usuários compreendem a dinâmica e concluem as partidas iniciadas?
- Há evidência de retorno voluntário recorrente ao longo dos dias?
- Há compartilhamento espontâneo de resultados em grupos de mensagens?
- O retorno qualitativo valida o interesse no eixo entre passatempo, fé e cultura?
- Há manifestação espontânea de interesse em apoiar o projeto ou acessar novos jogos?
- A mecânica do desafio diário revela-se atrativa ou o público demanda predominantemente palavras cruzadas tradicionais?

### Decisões Possíveis no Portão Pós-Experimento
Com base nos dados comportamentais coletados, o PO decidirá formalmente entre:
- **Iterar no Shape 1**: Refinar conteúdo, usabilidade ou canais caso haja tração positiva evidente;
- **Migrar para o Shape 2**: Expandir para o catálogo de Palavras Cruzadas Diretas matriciais e introduzir o Clube de Membros com impressão em PDF (o Shape 2 **não está pré-aprovado**, dependendo dessa deliberação);
- **Experimentar outro Shape**: Avaliar canal Android (Shape 3) ou foco pedagógico (Shape 4) caso surjam sinais nessa direção;
- **Pivotar Posicionamento**: Reenquadrar o produto diante de novos aprendizados de público;
- **Encerrar o Projeto (KILL)**: Caso o experimento demonstre ausência crônica de engajamento e refutação cabal da hipótese de problema.

---

## Próximos Passos na Governança do Projeto

O fluxo de governança formal estabelecido para o Spec-Driven Development (SDD) neste projeto segue a sequência:
**Assess** → **GO** → **Constitution** → **Specify** → **Clarify** → **Plan** → **Tasks** → **Analyze** → **Implement** → **Converge**.

### Próximos Passos Permitidos
- Submeter este artefato `decision.md` à validação e versionamento pelo PO Gate;
- Após o PO Gate aprovado e o `decision.md` devidamente versionado, o próximo passo permitido na esteira SDD será:
  **`/speckit-constitution`**
- Somente após a Constituição do projeto ser formalmente criada, revisada, aprovada pelo PO e versionada, será permitido avançar para a especificação funcional do experimento via **`/speckit-specify`** (utilizando os parâmetros do Shape 1).

### Próximos Passos Proibidos
- **PROIBIDO** executar `/speckit-constitution` automaticamente durante esta execução;
- **PROIBIDO** executar `/speckit-specify` até que o PO Gate da Constituição seja formalmente concluído e aprovado;
- **PROIBIDO** escolher linguagens, frameworks, bancos de dados, provedores de nuvem ou arquiteturas técnicas definitivas;
- **PROIBIDO** iniciar qualquer implementação de código, scaffolding ou configuração de repositório;
- **PROIBIDO** realizar `git add`, `git commit` ou `git push` automáticos.
