# Concept: Plataforma Digital de Jogos Educativos Cruzadas.online

- **Slug**: cruzadas-online-platform
- **Created**: 2026-09-10
- **Recommended option**: Shape 1 — Desafio Diário Web-First, com Shape 2 como candidato de expansão condicionado aos resultados da validação

---

## Executive Summary & Solution Context

Este documento de **Assess Shape** traduz o Problem Space formalizado e aprovado no `problem.md` em alternativas conceituais de solução comparáveis, antes da decisão executiva do portão `GO / NEEDS CLARIFICATION / KILL` (`Assess Decide`).

O foco central é responder:
> *"Qual é a intervenção mínima, mais rápida e de menor risco que nos permite aprender diretamente com o segmento primário se o problema existe, se o público engaja e se a proposta tem tração comercial?"*

Em estrita conformidade com as diretrizes de governança do Spec-Driven Development (SDD):
- **O Shape opera no nível de conceito de produto, escopo, apetite e trade-offs.**
- **Nenhuma decisão de arquitetura técnica definitiva, linguagem, framework, banco de dados ou provedor de nuvem é tomada nesta etapa.**
- As decisões prévias `[DECISION-DEF-01]` a `[DECISION-DEF-05]` são integralmente preservadas como premissas de contorno.

---

## Premissas de Contorno e Decisões Herdados do Define

1. `[DECISION-DEF-01]` **Centralidade do Rigor Editorial e Ortodoxia**: Rastreabilidade de fontes para todo conteúdo factual; fontes de autoridade apropriadas para conteúdos católicos e eclesiais.
2. `[DECISION-DEF-02]` **Rejeição a Mecânicas Manipulativas e Perfilamento Comercial Indevido**: Proibição de *dark patterns*, publicidade invasiva a menores e exploração coercitiva da atenção.
3. `[DECISION-DEF-03]` **Foco Temático na Interseção entre Fé Católica, Cultura Geral, História e Passatempo Inteligente**: Escolha estratégica deliberada de posicionamento para a primeira validação.
4. `[DECISION-DEF-04]` **Não Presunção de Isenção Regulatória**: Salvaguardas do ECA Digital (Lei nº 15.211/2025 e Decreto nº 12.880/2026) aplicáveis se houver probabilidade de acesso por menores. Não há presunção de imunidade legal por classificar o produto como "familiar" ou "geral".
5. `[DECISION-DEF-05]` **Segmento Primário de Validação**: *Adultos católicos interessados em passatempos, cultura, história e fé, incluindo adultos mais velhos/idosos*. (Secundário: Pais e famílias; Exploratório: Catequistas e B2B/B2B2C).
6. `[FACT]` O domínio `cruzadas.online` continua **não adquirido** (risco/restrição de solução).
7. `[FACT]` A conta Google Play Console histórica do mantenedor (2012) não tem exigência de 12 testadores/14 dias, mas possui pendências cadastrais de verificação de identidade e telefone que exigem regularização caso o canal Android seja acionado.

---

## Validação Prévia de Problema vs. Validação de Solução (Problem vs. Solution Validation)

Um risco metodológico central identificado no assessment é o risco de **falso negativo**: caso um MVP baseado em um Shape específico (como o Desafio Diário) não atinja tração imediata, isso não significará necessariamente que o problema não existe. O insucesso poderia decorrer de fatores distintos:
- mecânica de jogo inadequada para o público;
- palavras cruzadas tradicionais poderiam ser mais atrativas que o formato diário;
- proposta de valor ou comunicação desalinhada;
- tom ou nível de dificuldade do conteúdo inadequado;
- canais de aquisição ineficazes para alcançar o segmento primário.

Por essa razão, o processo de descoberta distingue conceitualmente duas camadas:
- **Problem Validation (Validação de Problema)**: Ocorre antes e ao redor da construção, buscando confirmar se adultos católicos do segmento primário realmente percebem uma necessidade relevante e recorrente de passatempos de padrão elevado, quais dores sentem e quais alternativas utilizam hoje;
- **Solution Validation (Validação de Solução)**: Ocorre ao testar um Shape concreto em uso real, medindo usabilidade, engajamento e retenção de uma mecânica específica.

### Camada Conceitual de Pre-Build Problem Validation
Antes ou no início do investimento de desenvolvimento do Shape que vier a ser aprovado no Decide, recomenda-se executar sondagens leves, reversíveis e coerentes com a escala atual do projeto:
1. *Conversas Estruturadas / Problem Interviews*: Diálogos qualitativos com indivíduos do segmento primário (adultos e idosos católicos praticantes) para investigar sua rotina de passatempos, incômodos com alternativas existentes e interesse por temas de fé e cultura;
2. *Teste Conceitual de Preferência de Mecânicas*: Apresentação de cartões conceituais ou mockups visuais simples para sondar a preferência relativa entre: (a) desafio curto diário; (b) palavras cruzadas clássicas; (c) quizzes formativos;
3. *Página Demonstrativa / Teste de Sinal de Interesse*: Página web simples apresentando a proposta de valor para mensurar o interesse espontâneo antes do encerramento da implementação;
4. *Observação de Alternativas Reais*: Análise de como o público-alvo interage atualmente com revistas impressas de bancas, publicações de livrarias paroquiais e conteúdos em grupos familiares de mensagens.

**Sinais Qualitativos a Buscar**:
- A dor de escassez de passatempos de palavras inteligentes e respeitosos é espontaneamente percebida?
- Com que frequência esse público busca esse tipo de passatempo (diária, semanal ou esporádica)?
- O rigor documental de fontes e a ortodoxia eclesial são valorizados como diferenciais decisivos?
- Qual conceito de jogo desperta maior atração imediata?

---

## Shapes Comparáveis (Alternativas de Solução)

Abaixo são apresentados 4 conceitos de solução estruturados no *trade-off space*, variando em canal, mecânica, modelo de monetização, complexidade e apetite.

---

### Shape 1 — Desafio Diário Web-First (Micro-MVP de Hábito)

- **Sketch (Conceito)**:
  Uma aplicação Web pública, limpa e responsiva, acessível por navegadores modernos em desktop ou mobile. O produto oferece **gameplay anônimo e sem conta obrigatória**: jogar não exige identificação, cadastro ou download de aplicativo. Oferece **1 enigma diário de palavras/letras** por ciclo de 24 horas, inspirado na brevidade de produtos de hábito, mas com identidade litúrgica e cultural própria (ex: enigma atrelado ao Santo do Dia, passagens bíblicas ou fatos da história cristã). O usuário resolve o enigma em poucos minutos, visualiza uma breve contextualização formativa com referência documental de autoridade, acompanha sua sequência de dias jogados (*streaks*) registrada conceitualmente no próprio dispositivo e pode compartilhar seu resultado em grupos de mensagens (como WhatsApp) via cartão visual sem spoilers. Não há publicidade invasiva de terceiros. Eventual formulário de lista de interesse para novos jogos, pesquisa de intenção de pagamento ou botão de apoio financeiro voluntário é estritamente **opcional**; qualquer coleta opcional de dados de contato ou fluxo financeiro constitui tratamento separado de dados, respeitando *Privacy by Design*, a LGPD e as normas aplicáveis de proteção a menores.
- **Segmento Atendido**: Segmento Primário (`DECISION-DEF-05`: Adultos católicos e idosos).
- **Canal**: Web-first exclusiva (navegador mobile e desktop).
- **Mecânica Principal**: 1 Desafio Diário curto de adivinhação de palavras/letras com dicas progressivas e contextualização de autoridade pós-jogo.
- **Conteúdo Inicial**: `[CANDIDATE SCOPE / SCOPE ASSUMPTION]` Lote pré-produzido de 30 a 60 desafios diários cobrindo o calendário litúrgico e datas históricas de um período inicial, com fontes de autoridade e domínio público devidamente rastreadas.
- **Nível de Autenticação**: Gameplay anônimo sem conta obrigatória (estado e sequências de jogo salvos localmente no dispositivo do usuário).
- **Monetização Inicial**: Gratuito com sinalização de apoio comunitário voluntário opcional e coleta de interesse para futuro clube de membros (medição de intenção de compra sem cobrança obrigatória).
- **Fluxo Editorial**: Carga de produção relativamente enxuta. Cada desafio requer 1 termo principal, 2 a 3 pistas contextuais e 1 nota explicativa com fonte citada.
- **Appetite**: `Small` `[CANDIDATE APPETITE CAP / PLANNING ASSUMPTION: orçamento conceitual de investimento na ordem de dias a poucas semanas de esforço para o mantenedor solo, a ser calibrado após Specify/Plan]`.
- **Elementos IN**:
  - Aplicação Web responsiva rápida, com menor fricção relativa de acesso;
  - Motor do enigma diário com ciclo de renovação periódica a cada 24 horas;
  - Armazenamento de estado de jogo e sequências locais no dispositivo do usuário;
  - Ficha explicativa pós-partida com fonte de autoridade referenciada;
  - Gerador de texto/card de compartilhamento limpo para grupos de mensagens;
  - Modal informativo opcional com link para apoio voluntário e pesquisa de interesse.
- **Elementos OUT**:
  - Conta obrigatória para jogar;
  - Aplicativos nativos para Google Play ou Apple App Store;
  - Catálogo amplo de desafios anteriores acessíveis no mesmo dia;
  - Grades de palavras cruzadas matriciais complexas;
  - Redes de anúncios programáticos invasivos;
  - Ferramentas de chat ou interação social interna entre usuários.
- **Trade-offs**:
  - *Ganha*: Maior velocidade relativa para aprender com usuários reais; menor fricção de acesso para quem recebe links compartilhados; menor necessidade de dados pessoais para a jogabilidade; menor complexidade operacional inicial frente a soluções multiplataforma.
  - *Sacrifica*: Não valida a mecânica clássica de grade matricial de palavras cruzadas; não valida a monetização por cobrança financeira obrigatória; não oferece acervo para sessões longas de jogo no mesmo dia.
- **Rabbit Holes (Riscos de Escopo a Evitar)**:
  - Tentar construir ranking global ou placar competitivo aberto (exigiria autenticação, moderação ativa e gestão de trapaças);
  - Tentar suportar múltiplos tipos de enigmas na primeira entrega;
  - Tentar implementar sincronização entre múltiplos dispositivos sem conta.
- **Hipóteses Testadas**:
  - `[HYPOTHESIS-03]` (Retenção orgânica e hábito via periodicidade diária/litúrgica);
  - `[HYPOTHESIS-04]` (Distribuição Web e compartilhamento voluntário em grupos de mensagens);
  - Dimensão de `[NEEDS CLARIFICATION: Problem Validation]` referente ao engajamento com passatempos culturais de fé.
- **Hipóteses NÃO Testadas**:
  - `[HYPOTHESIS-01]` (Disposição a pagar efetiva em modelo de cobrança transacional obrigatória);
  - Aderência do público à grade matricial de palavras cruzadas diretas;
  - Viabilidade de canais móveis em lojas de aplicativos (Android/iOS).
- **Como Ajuda a Validar o Problem Risk**:
  - Mede com métricas reais de uso se adultos do segmento primário retornam periodicamente para resolver um passatempo cultural de fé e se recomendam a experiência a terceiros.

---

### Shape 2 — Palavras Cruzadas Web-First com Acervo & Clube de Membros (MVP Editorial Clássico)

- **Sketch (Conceito)**:
  Uma plataforma Web dedicada especificamente à experiência autêntica de **Palavras Cruzadas Diretas** tradicionais. Oferece ao jogador uma grade periódica aberta sem necessidade de conta + um acervo temático navegável (ex: *Grandes Santos*, *História da Igreja*, *História do Brasil Colonial*, *Cultura Geral*). O usuário pode jogar partidas gratuitas de demonstração; tem a opção de criar uma conta para registrar progresso entre dispositivos ou aderir a um Clube de Membros / Assinatura Web (via provedor de pagamento web a ser definido posteriormente) para desbloquear o acervo completo e o recurso utilitário de exportação/impressão em PDF para resolução em papel.
- **Segmento Atendido**: Segmento Primário (`DECISION-DEF-05`: Adultos católicos, idosos e apreciadores de passatempos tradicionais) com potencial alcance secundário de educadores via folhas impressas.
- **Canal**: Web-first exclusiva (desktop, tablets e mobile web).
- **Mecânica Principal**: Palavras Cruzadas Diretas matriciais (grades com células bloqueadas e definições interligadas).
- **Conteúdo Inicial**: `[CANDIDATE SCOPE / SCOPE ASSUMPTION]` Catálogo preliminar de 15 a 20 grades completas pré-construídas, cobrindo temáticas bíblicas, históricas e de cultura geral, com nova grade periódica.
- **Nível de Autenticação**: Híbrido / Opcional (partidas gratuitas imediatas sem conta; conta opcional com mecanismo de autenticação simples a definir posteriormente, voltada a sincronização ou membros assinantes).
- **Monetização Inicial**: Freemium / Clube de Membros Web (grades gratuitas de demonstração + acesso ao acervo completo e PDFs para apoiadores pagantes).
- **Fluxo Editorial**: Carga de produção substancial. Exige a montagem de matrizes válidas e balanceadas com palavras cruzadas interligadas, checagem ortográfica rigorosa e conferência documental de fontes canônicas e históricas. Geração automática complexa de grades matriciais fica fora do escopo do MVP; eventual ferramental de apoio à autoria será avaliado e decidido posteriormente.
- **Appetite**: `Medium` `[CANDIDATE APPETITE CAP / PLANNING ASSUMPTION: semanas de esforço para o mantenedor solo, a ser detalhado após Specify/Plan]`.
- **Elementos IN**:
  - Motor interativo de grade de palavras cruzadas diretas no navegador;
  - Acervo temático catalogado com grades iniciais;
  - Mecanismo de exportação/impressão de grade em formato PDF para resolução física;
  - Conta de usuário opcional para membros assinantes e sincronização de progresso;
  - Integração com provedor de pagamento web para gestão de assinaturas ou apoio;
  - Catálogo editorial de fontes consultadas por desafio.
- **Elementos OUT**:
  - Aplicativos nativos para Google Play ou Apple App Store;
  - Outros formatos de jogos (sem forca, caça-palavras ou quizzes isolados no MVP);
  - Redes de publicidade programática;
  - Geração dinâmica de cruzadas em tempo real por IA no cliente.
- **Trade-offs**:
  - *Ganha*: Alinhamento nominal direto com a marca ("Cruzadas"); testa diretamente a hipótese de disposição a pagar (WTP) em dinheiro real; `[HYPOTHESIS]` apelo potencial para adultos mais velhos e educadores interessados em atividades impressas; `[HYPOTHESIS]` potencial de atração orgânica via termos específicos de busca (SEO de cauda longa).
  - *Sacrifica*: Esforço de engenharia de interface e lógica de grade superior ao Shape 1; esforço de curadoria editorial muito mais custoso por unidade de jogo; ciclo de desenvolvimento mais longo antes do primeiro teste com usuários.
- **Rabbit Holes (Riscos de Escopo a Evitar)**:
  - Tentar construir geradores algorítmicos complexos de palavras cruzadas dentro do produto em vez de manter a montagem editorial focada no conteúdo;
  - Suportar múltiplos formatos e tamanhos variados de grade na primeira versão;
  - Criar estruturas complexas de cobrança corporativa ou múltiplos níveis de permissão.
- **Hipóteses Testadas**:
  - `[HYPOTHESIS-01]` (Disposição a pagar por passatempos de conteúdo cultural/católico);
  - Aderência real da mecânica de palavras cruzadas matriciais ao segmento primário;
  - Potencial de atração orgânica por temas específicos via Web.
- **Hipóteses NÃO Testadas**:
  - Viabilidade de canais móveis em lojas de aplicativos;
  - Retenção baseada em sessões ultracurtas diárias.
- **Como Ajuda a Validar o Problem Risk**:
  - Valida se existe demanda real pela mecânica de palavras cruzadas temáticas e se o público está disposto a pagar para acessar acervos digitais e materiais impressos.

---

### Shape 3 — Web + Android Híbrido com Catálogo Mínimo (MVP Multiplataforma Inicial)

- **Sketch (Conceito)**:
  Lançamento sincronizado de uma aplicação Web pública e de um aplicativo Android distribuído na Google Play Store, utilizando a conta histórica de desenvolvedor de 2012 do mantenedor após a regularização cadastral de identidade e telefone. O produto oferece um catálogo inicial enxuto com **duas mecânicas complementares**: Palavras Cruzadas Diretas e Quizzes Temáticos Formatados em Rodadas. O jogador pode acessar sem conta obrigatória no celular ou no computador, com opção de criar conta para sincronizar o progresso entre dispositivos. A monetização baseia-se em modelo freemium, com compra de pacotes ou assinatura.
- **Segmento Atendido**: Segmento Primário (Adultos católicos que utilizam predominantemente o smartphone para jogos móveis).
- **Canal**: Web + Android (Google Play Store).
- **Mecânica Principal**: Palavras Cruzadas Diretas + Quizzes Temáticos em Rodadas com Explicações.
- **Conteúdo Inicial**: `[CANDIDATE SCOPE / SCOPE ASSUMPTION]` Catálogo preliminar de 10 grades de palavras cruzadas e rodadas de quizzes temáticos (perguntas com explicações doutrinárias/históricas rastreadas).
- **Nível de Autenticação**: Opcional (jogabilidade local no app; conta opcional para sincronização de progresso entre dispositivos).
- **Monetização Inicial**: Freemium com compras in-app ou assinatura (conforme diretrizes de faturamento aplicáveis).
- **Fluxo Editorial**: Carga de produção pesada, exigindo elaboração e revisão de dois formatos editoriais distintos (matrizes cruzadas e baterias de perguntas e respostas com justificativas).
- **Appetite**: `Large` `[CANDIDATE APPETITE CAP / PLANNING ASSUMPTION: ciclo de investimento mais extenso e complexo, a ser detalhado após Specify/Plan]`.
- **Elementos IN**:
  - Aplicação Web responsiva + aplicativo Android adaptado para smartphones e tablets;
  - Regularização cadastral prévia da conta histórica do Google Play Console e cumprimento dos requisitos de *Android Developer Verification*;
  - Motor de Palavras Cruzadas + Motor de Quizzes com tela de fontes;
  - Sincronização de progresso entre dispositivos para usuários com conta opcional;
  - Integração de compras/assinaturas no app e na Web.
- **Elementos OUT**:
  - Versão para Apple iOS (descartada para a primeira validação);
  - Outros formatos de jogos (memória, forca, etc.);
  - Mecânicas de rede social interna ou ranking aberto;
  - Notificações push intrusivas.
- **Trade-offs**:
  - *Ganha*: `[INFERENCE]` Valida a presença no ecossistema Android, canal de alta penetração no mercado móvel brasileiro; permite funcionamento offline no celular; testa compras diretamente no fluxo de loja de aplicativos.
  - *Sacrifica*: Maior esforço de engenharia e operação por envolver Web e app móvel empacotado; dependência adicional de processos e diretrizes de revisão da loja (Google Play Console); maior investimento prévio antes do primeiro aprendizado com usuários; maior número de superfícies a manter e testar.
- **Rabbit Holes (Riscos de Escopo a Evitar)**:
  - Ficar bloqueado em exigências burocráticas da loja de apps antes de saber se os usuários têm interesse pelo conteúdo;
  - Complexidades de sincronização de estado offline entre dispositivos;
  - Tentar incluir a versão para iOS simultaneamente, elevando ainda mais custos e exigências de revisão.
- **Hipóteses Testadas**:
  - Viabilidade de distribuição e retenção na Google Play Store;
  - Preferência relativa do usuário entre palavras cruzadas e quizzes;
  - WTP via pagamentos em loja móvel.
- **Hipóteses NÃO Testadas**:
  - Viabilidade no canal Apple iOS;
  - Eficácia de uma estratégia exclusivamente Web.
- **Como Ajuda a Validar o Problem Risk**:
  - Permite testar o comportamento de uso no ambiente móvel de aplicativos instalados, porém com ciclo de aprendizado comparativamente mais lento e de maior custo de investimento.

---

### Shape 4 — Hub Formativo / Quiz & Atividades para Famílias e Catequese (MVP Educativo Formativo)

- **Sketch (Conceito)**:
  Uma plataforma Web formativa orientada a atender às dores de mães, pais educadores e catequistas (Segmentos Secundário e Exploratório do Define). Em vez de passatempos avulsos de lazer, o produto estrutura o conteúdo em **Trilhas Formativas** (ex: *Histórias dos Grandes Santos*, *Parábolas e Ensinamentos*, *O Ano Litúrgico em Família*). Cada trilha combina quizzes ilustrados, perguntas de fixação e uma ferramenta para gerar e exportar **fichas de atividades e cruzadinhas em PDF** para aplicação em encontros de catequese ou em casa. A monetização baseia-se em assinatura de planos familiares ou institucionais (paróquias/escolas).
- **Segmento Atendido**: Segmento Secundário (Pais e famílias) e Segmento Exploratório (Catequistas, paróquias e colégios confessionais). Crianças participam como usuárias finais tuteladas pelos responsáveis.
- **Canal**: Web responsiva para educadores e famílias.
- **Mecânica Principal**: Quizzes formativos em trilhas pedagógicas + exportador de fichas de atividades em PDF para impressão.
- **Conteúdo Inicial**: `[CANDIDATE SCOPE / SCOPE ASSUMPTION]` Conjunto inicial de módulos formativos ancorados nas Escrituras e na tradição eclesial, com ilustrações de domínio público.
- **Nível de Autenticação**: Obrigatório para o responsável/educador (gestão de turmas e downloads de materiais; sem criação de contas individuais para crianças).
- **Monetização Inicial**: Assinatura recorrente mensal/anual familiar e institucional para acesso ao acervo de trilhas e PDFs imprimíveis.
- **Fluxo Editorial**: Carga editorial complexa e sensível, demandando precisão teológica e adequação pedagógica de linguagem para diferentes faixas etárias.
- **Appetite**: `Medium-Large` `[CANDIDATE APPETITE CAP / PLANNING ASSUMPTION: esforço editorial e funcional intermediário a extenso, a ser calibrado após Specify/Plan]`.
- **Elementos IN**:
  - Sistema de trilhas formativas de quizzes com explicações aprofundadas;
  - Módulo exportador de folhas de passatempos e atividades em PDF;
  - Painel do educador/pais para acompanhamento de módulos completados;
  - Gateway de assinatura web para planos família e paróquia;
  - Declaração explícita de conformidade de privacidade infantil.
- **Elementos OUT**:
  - Palavras cruzadas matriciais complexas para adultos no aplicativo;
  - Aplicativos móveis para lojas de apps;
  - Contas ou perfis individuais diretos para crianças;
  - Módulos de chat ou comunicação aberta entre alunos.
- **Trade-offs**:
  - *Ganha*: `[HYPOTHESIS]` Hipótese de que mães, pais e catequistas possuem motivação formativa diferenciada e valorizam materiais pedagógicos confiáveis; monetização apoiada na utilidade prática de PDFs imprimíveis; menor dependência de palavras-chave genéricas de passatempos.
  - *Sacrifica*: Desvia-se do **Segmento Primário** estabelecido no Define (`DECISION-DEF-05`: adultos católicos em passatempos individuais); maior atenção regulatória sob o ECA Digital pela presença provável de crianças; `[INFERENCE]` ciclo de adoção por instituições e paróquias pode demandar maior tempo de maturação.
- **Rabbit Holes (Riscos de Escopo a Evitar)**:
  - Tentar construir um ambiente virtual de aprendizagem (LMS) completo com controle formal de notas e presenças;
  - Complexidade de licenciamento de ilustrações infantis protegidas;
  - Discussões regulatórias prematuras sobre contas infantis e verificação de idade.
- **Hipóteses Testadas**:
  - `[HYPOTHESIS-02]` (Comportamento de famílias vs. adultos individuais);
  - `[HYPOTHESIS-05]` (Viabilidade de canal B2B/B2B2C com paróquias e catequistas);
  - Disposição a pagar por recursos formativos e materiais impressos.
- **Hipóteses NÃO Testadas**:
  - Demanda do segmento primário de adultos católicos por passatempos de lazer;
  - Viabilidade de palavras cruzadas clássicas digitais.
- **Como Ajuda a Validar o Problem Risk**:
  - Valida se o apelo formativo institucional e familiar possui tração comercial mais rápida do que o entretenimento de passatempo para adultos.

---

## Matriz Comparativa entre os Shapes

> [!NOTE]
> **Nota Metodológica sobre a Matriz**:
> As classificações abaixo representam **avaliações qualitativas comparativas baseadas nas evidências, inferências e restrições disponíveis no assessment**, e não medições empíricas com exatidão quantitativa. Carregam incerteza inerente à fase de discovery e destinam-se exclusivamente a apoiar a comparação estruturada entre alternativas.

| Critério de Comparação | Shape 1: Desafio Diário Web | Shape 2: Palavras Cruzadas Web | Shape 3: Web + Android Híbrido | Shape 4: Hub Famílias & Catequese |
| :--- | :---: | :---: | :---: | :---: |
| **Aderência ao Segmento Primário (`DEC-05`)** | **Alta** (Adultos/idosos com foco em pausa diária rápida) | **Alta** (Adultos/idosos que apreciam cruzadas clássicas) | **Média-Alta** (Foco no adulto que prefere apps instalados) | **Baixa** (Foca no segmento secundário e B2B2C) |
| **Aderência ao Problem Statement** | **Alta** (Entretenimento inteligente, seguro e sem anúncios) | **Alta** (Passatempos de padrão elevado e rigor documental) | **Média-Alta** (Catálogo de jogos casuais no smartphone) | **Média** (Orientação mais pedagógica do que passatempo) |
| **Apetite Comparativo** | **Small** `[CANDIDATE APPETITE CAP]` | **Medium** `[CANDIDATE APPETITE CAP]` | **Large** `[CANDIDATE APPETITE CAP]` | **Medium-Large** `[CANDIDATE APPETITE CAP]` |
| **Velocidade Relativa de Validação** | **Mais Rápida** (menor ciclo pré-lançamento) | **Intermediária** (demanda montagem de acervo) | **Mais Lenta** (depende de processos de loja) | **Mais Lenta** (ciclo de adoção institucional/familiar) |
| **Carga de Esforço Editorial Inicial** | **Relativamente Baixa** (1 enigma diário curado) | **Moderada a Alta** (matrizes cruzadas interligadas) | **Alta** (duas mecânicas com acervo) | **Muito Alta** (conteúdo teológico e didático) |
| **Fricção Relativa de Acesso** | **Muito Baixa** (acesso direto via link web, sem cadastro prévio para jogar) | **Baixa** (partidas demonstrativas abertas sem conta) | **Moderada** (download e instalação na loja de apps) | **Moderada** (cadastro de responsável para uso) |
| **Exposição a Riscos de Tratamento de Dados** | **Menor exposição relativa** (sem cadastro prévio obrigatório; preserva salvaguardas caso acessado por menores) | **Baixa a Moderada** (dados de conta apenas para clube/sincronização) | **Moderada** (regras Google Families e loja de apps) | **Mais Elevada** (ambiente formativo familiar com presença de menores) |
| **Risco de Dependência de Lojas** | **Nulo** (independente de lojas de aplicativos) | **Nulo** (independente de lojas de aplicativos) | **Elevado** (sujeito a verificação cadastral Google) | **Nulo** (independente de lojas de aplicativos) |
| **Capacidade de Testar WTP Real** | **Indireta** (intenção declarada de compra e apoio) | **Direta** (cobrança real para acervo completo/PDFs) | **Direta** (compras in-app e assinaturas) | **Direta** (assinaturas familiares/institucionais) |
| **Potencial de Recorrência Diária** | **Alto potencial relativo** (ancoragem conceitual em cadência de 24h) | **Moderado** (sessões esporádicas de catálogo) | **Moderado** (sessões dependentes de hábito de app) | **Moderado** (uso semanal catequético/doméstico) |
| **Reversibilidade do Investimento** | **Alta reversibilidade** (menor investimento afundado se hipótese falhar) | **Intermediária** (base web de cruzadas reaproveitável) | **Baixa** (maior esforço de desenvolvimento dedicado) | **Intermediária** (conteúdos e PDFs reaproveitáveis) |
| **Contribuição para `[Problem Validation]`** | Mede engajamento voluntário e hábito de retorno | Mede consumo e WTP pela mecânica matricial | Mede preferência de canal de loja vs web | Mede demanda institucional e pedagógica |

---

## Recomendação Consultiva do Agente para o Assess Decide

> [!IMPORTANT]
> **A recomendação a seguir é uma proposição consultiva fundamentada nas evidências, inferências e restrições do assessment, formulada para subsidiar a deliberação soberana do Product Owner no portão `Assess Decide`. Não constitui decisão final nem encerra as opções em avaliação.**

### Recomendação: Estratégia Bifásica Condicional — Pre-Build Problem Validation + Shape 1 com Gate de Decisão para Expansão

A análise comparativa sugere como inferência consultiva que o **maior risco atual do projeto é o RISCO DE PROBLEMA (Problem Risk)**: *precisamos constatar se adultos católicos realmente possuem interesse recorrente por passatempos culturais inteligentes no meio digital e se retornam voluntariamente*, e não um desafio primário de capacidade de engenharia. Essa percepção decorre essencialmente da ausência de validação empírica direta do Problem Statement nesta fase inicial de discovery.

Alocar imediatamente esforços no **Shape 3** (Web + Android) ou no **Shape 4** (Hub Famílias/Catequese) consumiria um apetite extenso para resolver pendências burocráticas de lojas de aplicativos (Google Play Console) ou exigências regulatórias infantis (ECA Digital) antes de obter qualquer confirmação empírica de valor junto aos usuários.

Entre as opções avaliadas, a combinação mais prudente consiste em:
1. **Pre-Build Problem Validation**: Realizar sondagens leves e estruturadas (problem interviews e teste conceitual de preferência) antes ou no início do desenvolvimento para validar se as dores descritas no Define ressoam no segmento primário;
2. **Execução do Shape 1 (Desafio Diário Web)**: Submeter o Shape 1 a um *appetite pequeno e limitado*, a ser concretizado após o planejamento técnico no SDD, aproveitando a baixa fricção de acesso e a simplicidade editorial para colher métricas de uso real e sinais de interesse comercial (intenção de compra / apoio);
3. **Portão de Decisão Pós-Validação (Decision Gate)**:
   Com base nos dados mensurados no Shape 1, o PO decidirá formalmente:
   - **Expandir para o Shape 2**: Adicionar o catálogo clássico de Palavras Cruzadas Diretas matriciais e o Clube de Membros com impressão em PDF;
   - **Iterar no Shape 1**: Calibrar mecânica, tom editorial ou estratégias de aquisição;
   - **Experimentar outro Shape**: Avaliar se a rota de aplicativo Android (Shape 3) ou o foco pedagógico (Shape 4) tornam-se mais promissores;
   - **Pivotar ou Encerrar (KILL)**: Caso a hipótese de problema ou de interesse seja formalmente refutada.

O **Shape 2** permanece como uma alternativa sólida e diretamente acionável caso o PO prefira validar a mecânica de palavras cruzadas matriciais desde a primeira entrega, assumindo um apetite de desenvolvimento proporcionalmente mais amplo.

---

## Out of Scope (Delimitação Explícita para a Opção Recomendada)

Para assegurar o cumprimento estrito do apetite e prevenir a expansão prematura de escopo (*scope creep*), ficam **explicitamente fora do escopo da primeira entrega do Shape 1**:

1. **Desenvolvimento de Aplicativos Nativos para Lojas**: Nenhum aplicativo Android ou iOS será compilado para a primeira validação. A regularização cadastral da conta Google Play e as diretrizes da Apple App Store permanecem para fases posteriores;
2. **Contas Obrigatórias e Backend de Autenticação**: Zero telas de login, recuperação de senha ou cadastros mandatórios para jogar; todo o estado inicial de jogo opera localmente no dispositivo;
3. **Múltiplos Formatos de Jogos Concomitantes**: Quizzes isolados, caça-palavras, jogo da memória e forca estão expressamente excluídos da entrega inicial;
4. **Módulos de Chat, Comunidade e Placas de Líderes Abertas**: Proibição de áreas abertas de interação interpessoal que exijam moderação humana ativa e representem superfície de risco de comunicação;
5. **Cobrança Financeira Obrigatória Imediata**: A verificação de WTP operará por meio de captação de interesse declarado e links para apoio voluntário, evitando a introdução de gateways complexos antes da validação de demanda;
6. **Mecanismos de IA Integrados em Tempo Real ao Cliente**: Nenhuma IA atuará diretamente na experiência de jogo do usuário em tempo de execução; eventuais ferramentas de IA permanecem restritas ao apoio offline de bancada editorial do mantenedor.

---

## Suposições Críticas a Validar (Assumptions to Validate)

A recomendação consultiva apoia-se nas seguintes suposições que deverão ser monitoradas na sequência do assessment:

1. `[ASSUMPTION]` O formato de 1 Desafio Diário curto desperta interesse sustentável no público adulto católico, a exemplo do fenômeno observado em jogos de vocabulário generalistas;
2. `[ASSUMPTION]` O compartilhamento de resultados sem spoilers em grupos de mensagens é percebido de forma positiva e natural pelo público em círculos confessionais e familiares;
3. `[ASSUMPTION]` Uma interface web responsiva oferece usabilidade adequada em smartphones sem a necessidade de um app instalado na primeira validação;
4. `[ASSUMPTION]` A percepção de valor e seriedade do projeto estimula respostas positivas em pesquisas de intenção de compra e gestos de apoio comunitário.

---

## Fronteira Explícita com Arquitetura e Engenharia Técnica

Em estrita consonância com a metodologia Spec-Driven Development, reforça-se a demarcação conceitual:

> [!NOTE]
> **Fronteira com Etapas Posteriores ao GO**:
> O Assess Shape compara e delimita conceitos de produto e trade-offs. As seguintes decisões técnicas de engenharia **NÃO FORAM TOMADAS** e permanecem estritamente reservadas para os fluxos posteriores ao portão `Assess Decide` (`Constitution`, `Specify`, `Architecture Discovery` e `Plan`):
> - Seleção de linguagem de programação (C#, TypeScript, Python, etc.);
> - Seleção de frameworks de frontend ou backend (React, Next.js, .NET, ASP.NET Core, FastAPI, etc.);
> - Escolha de tecnologia, motor ou infraestrutura de banco de dados (PostgreSQL, SQLite, SQL Server, Redis, etc.);
> - Escolha de provedor de hospedagem em nuvem ou infraestrutura de containers (Vercel, AWS, Azure, Docker, etc.);
> - Escolha de modelos específicos de LLM, provedores de IA ou arquiteturas de vetores/RAG;
> - Seleção de fornecedores comerciais de gateway de pagamento;
> - Modelagem formal de dados, esquemas de persistência ou APIs de rede;
> - Algoritmos concretos de geração matricial de palavras cruzadas (CSP).

---

## Próximos Passos na Esteira de Discovery

Após a revisão e homologação deste artefato pelo Product Owner:
- Submeter os 4 Shapes, a camada de Pre-Build Problem Validation e as análises de trade-offs à deliberação do portão formal:
  **`/speckit-assess-decide slug=cruzadas-online-platform`**
