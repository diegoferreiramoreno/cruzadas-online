# Problem Definition: Plataforma Digital de Jogos Educativos Cruzadas.online

- **Slug**: cruzadas-online-platform
- **Created**: 2026-09-10
- **Inputs used**: `intake.md` e `research.md`

---

## 1. Problem Statement (Hipótese de Problema)

- `[HYPOTHESIS — Problem Hypothesis]` Pessoas interessadas em cultura, história e tradição católica — assim como educadores, catequistas e famílias que buscam formação lúdica para crianças — enfrentam uma escassez aparente de opções digitais de entretenimento inteligente e passatempos de raciocínio (como palavras cruzadas e quizzes) que combinem rigor documental de fontes, fidelidade histórica/doutrinária, experiência de uso respeitosa e ambiente digital seguro. Esta formulação apoia-se em evidências de mercado e inferências analíticas levantadas no Research, permanecendo como uma hipótese de problema a ser confirmada diretamente em validação empírica com usuários.
- `[INFERENCE]` O cenário atual de passatempos digitais em língua portuguesa é caracterizado predominantemente por portais e aplicativos genéricos monetizados com alta densidade de publicidade programática invasiva ou por aplicativos confessionais fragmentados de baixa sofisticação técnica e editorial, enquanto as alternativas tradicionais impressas (revistas de bancas) enfrentam barreiras de distribuição física e não exploram a interatividade digital.

---

## 2. Affected Users & Stakeholders (Usuários Afetados e Partes Interessadas)

### Segmentação de Usuários e Decisão de Foco Inicial

- `[DECISION-DEF-05]` **SEGMENTO PRIMÁRIO DE VALIDAÇÃO: Adultos católicos interessados em passatempos, cultura, história e fé, incluindo adultos mais velhos/idosos**:
  - *Papel no problema*: Pessoas que buscam momentos de lazer e passatempo intelectual alinhados ao seu repertório cultural e espiritual.
  - *Justificativa da decisão*: Esta decisão estratégica de PO é adotada para orientar a primeira validação e o *Assess Shape*. Adultos possuem plena autonomia de uso e capacidade de decisão, demandando menor complexidade regulatória inicial para um teste de valor. Esta decisão **NÃO** afirma que esse segmento já foi comprovado empiricamente como o mais volumoso ou mais rentável, nem presume maior demanda prévia.
- **SEGMENTO SECUNDÁRIO: Pais, Mães e Famílias**:
  - *Papel no problema*: Buscam experiências educativas, seguras e formativas para crianças e adolescentes, com preocupação sobre tempo de tela saudável e proteção contra estímulos consumistas. Crianças e adolescentes são preservados como possíveis usuários finais no contexto familiar tutelado, mas **NÃO** como segmento primário de validação neste momento.
- **SEGMENTO EXPLORATÓRIO: Catequistas, Paróquias, Dioceses, Escolas Confessionais e B2B/B2B2C**:
  - *Papel no problema*: Necessitam de recursos complementares e materiais de fixação para encontros formativos e turmas paroquiais. Mantidos como segmento exploratório não eliminado, dependente de validação empírica de interesse institucional e ciclo de adoção.
- **Entusiastas Gerais de Passatempos e História (Público Amplo)**:
  - *Papel no problema*: Jogadores de palavras cruzadas e desafios de lógica que valorizam desafios inteligentes e rigor ortográfico/histórico geral.

### Stakeholders (Partes Interessadas)

- **Mantenedor do Projeto (Desenvolvedor e Product Owner Solo)**: Investidor de tempo e concepção; define prioridades, viabilidade econômica, editorial e operacional sustentável.
- **Autoridades Regulatórias (ANPD, Conselhos Tutelares e Judiciário)**: Fiscais da conformidade com a LGPD (Lei nº 13.709/2018), ECA Digital (Lei nº 15.211/2025) e Decreto nº 12.880/2026.
- **Canais e Ecossistemas de Distribuição**:
  - *Web Aberta*: Canal público e aberto de distribuição direta, sem intermediação proprietária ou comissões de lojas, viabilizando indexação orgânica via navegadores e compartilhamento sem atrito.
  - *Operadores de Plataforma e Lojas de Aplicativos (Google Play e Apple App Store)*: Definem e aplicam requisitos técnicos, políticas de conformidade, processos de verificação cadastral de desenvolvedores e condições comerciais/comissões.
- **Detentores de Direitos Autorais e Editoras Religiosas**: Titulares dos direitos patrimoniais de traduções bíblicas modernas brasileiras (Edições CNBB, Paulus, Paulinas, Vozes, Ave-Maria) e a Libreria Editrice Vaticana (LEV) para a Nova Vulgata e edições típicas magisteriais.

---

## 3. Dores, Necessidades e Jobs To Be Done (JTBD)

### Dores e Necessidades Identificadas (Hipóteses Derivadas do Research)

- `[HYPOTHESIS — A validar]` **Sobrecarga e Fricção Publicitária**: Hipótese de que usuários de passatempos de raciocínio sentem-se incomodados com interrupções frequentes de banners, vídeos obrigatórios e popups nos jogos casuais disponíveis.
- `[HYPOTHESIS — A validar]` **Desconfiança Editorial e Ortodoxia**: Hipótese de que o público confessional detecta e rejeita imprecisões históricas, erros teológicos e confusões entre tradição popular e doutrina formal em aplicativos religiosos amadores.
- `[HYPOTHESIS — A validar]` **Apreensão Parental com Segurança Digital**: Hipótese de que mães e pais buscam alternativas digitais livres de táticas de engajamento compulsivo (telas infinitas, notificações coercitivas) e de perfilamento comercial de menores.
- `[HYPOTHESIS — A validar]` **Desconexão com a Rotina Cultural/Litúrgica**: Hipótese de que pessoas engajadas na cultura cristã sentem falta de passatempos que acompanhem o ritmo do calendário histórico, datas de santos e temas litúrgicos.

### Synthesized / Hypothesized Jobs To Be Done (JTBD)

*(Nota metodológica: Os enunciados abaixo são hipóteses de trabalho sintetizadas analiticamente a partir do Intake e das evidências de mercado do Research. Não constituem verbatims ou declarações de usuários entrevistados, servindo para guiar a validação funcional do problema.)*

- **JTBD 1 (Passatempo Cultural & Intelectual / Segmento Primário: Adultos)**:
  - *Situação*: Durante momentos de pausa, descanso ou lazer diário.
  - *Motivação*: Resolver passatempos intelectuais e desafios de raciocínio verbal focados em temas bíblicos, históricos e culturais.
  - *Resultado Esperado (Hipotético)*: Exercitar a mente e enriquecer o repertório cultural e espiritual em um ambiente digital calmo, elegante e sem ruído publicitário excessivo.
- **JTBD 2 (Formação e Atividade Lúdica / Segmento Secundário: Famílias)**:
  - *Situação*: Ao buscar passatempos e atividades interativas digitais para os filhos no ambiente doméstico.
  - *Motivação*: Disponibilizar jogos com conteúdo confiável e fundamentado na tradição cristã e na história.
  - *Resultado Esperado (Hipotético)*: Estimular o aprendizado e a fixação de conceitos formativos em um ambiente digital protegido, seguro e livre de apelos consumistas.
- **JTBD 3 (Apoio Dinâmico e Prático / Segmento Exploratório: Catequese e Educadores)**:
  - *Situação*: No planejamento ou condução de encontros catequéticos, turmas paroquiais ou aulas confessionais.
  - *Motivação*: Contar com desafios lúdicos, perguntas e palavras cruzadas temáticas com respostas conferidas contra fontes de autoridade.
  - *Resultado Esperado (Hipotético)*: Promover a fixação de conceitos e o engajamento dos alunos de maneira dinâmica, prática e doutrinariamente segura.

---

## 4. Product Goals (Objetivos do Produto)

1. **Validação de Demanda Real no Segmento Primário**: Validar empiricamente se existe demanda recorrente e público engajado entre adultos católicos e interessados em passatempos de raciocínio de temática cultural em língua portuguesa.
2. **Padrão de Qualidade Editorial e Rastreabilidade**: Estabelecer um processo editorial em que 100% dos conteúdos publicados possuam fonte documental e rastreabilidade adequada ao seu domínio temático.
3. **Validação de Retorno Periódico Voluntário**: Validar se o produto é capaz de gerar recorrência e retorno voluntário dos usuários sem depender de mecanismos manipulativos de retenção.
4. **Viabilidade Econômica com Rigor Ético e Legal**: Comprovar a viabilidade de sustentação financeira para a operação individual mantendo estrita conformidade com as leis de proteção de dados, privacidade infantil e propriedade intelectual.

---

## 5. Non-Goals (O que está explicitamente FORA de escopo no Define)

- **NÃO é objetivo criar rede social, fórum aberto ou ambiente de chat/mensagens diretas entre usuários**: A ausência de canais de comunicação direta interpessoal **reduz significativamente a superfície de risco** regulatório de moderação, assédio e proteção à infância.
- **NÃO é objetivo lançar simultaneamente um catálogo disperso de jogos (8+ formatos)**: A etapa de validação não deve dispersar esforços antes que a mecânica central de validação seja confirmada.
- **NÃO é objetivo utilizar mecânicas de apostas, caixas misteriosas (*loot boxes*) ou design manipulativo**: Proibição expressa de padrões obscuros (*dark patterns*), rolagens infinitas ou táticas coercitivas de consumo.
- **NÃO é objetivo construir uma biblioteca digital ou aplicativo de leitura integral da Bíblia**: O foco é exclusivamente em passatempos educativos, desafios de raciocínio e quizzes.
- **NÃO é objetivo definir arquitetura técnica definitiva, stack, banco de dados ou decisões detalhadas de implementação**:
  - O **Assess Define** delimita o problema, público, objetivos, não objetivos, métricas, riscos e hipóteses;
  - O **Assess Shape** compara conceitos de solução, apetite, escopo e trade-offs em nível de produto/solução;
  - A arquitetura técnica definitiva, stack tecnológica, banco de dados, ADRs e decisões detalhadas de implementação permanecem para as etapas posteriores ao portão de decisão (GO), dentro do fluxo de *Constitution / Specify / Architecture Discovery / Plan*, conforme aplicável. O Shape não fecha a arquitetura técnica definitiva.

---

## 6. Success Metrics (Métricas e Critérios de Sucesso)

*(Nota: Nesta fase preliminar de Problem Space, as métricas separam o indicador mensurável do critério numérico de sucesso, evitando metas arbitrárias não fundamentadas no Research.)*

| Dimensão | Indicador (KPI) | Baseline Atual | Target / Critério de Sucesso |
| :--- | :--- | :--- | :--- |
| **Engajamento** | Proporção de partidas iniciadas que são concluídas pelo usuário | `[UNKNOWN — not measured yet]` | `[UNKNOWN — target to be defined before validation experiment]` |
| **Retenção / Retorno** | Proporção de usuários do segmento primário que retornam ao produto em janelas temporais relevantes *(se a mecânica de Desafio Diário for selecionada no Shape, janelas como D1, D7 e D30 poderão ser aplicadas)* | `[UNKNOWN — not measured yet]` | `[UNKNOWN — target to be defined before validation experiment]` |
| **Aquisição / Compartilhamento** | Coeficiente de compartilhamento/referral voluntário de resultados *(a ser mensurado SOMENTE se mecânica de compartilhamento for selecionada no Shape)* | `[UNKNOWN — not measured yet]` | `[UNKNOWN — target to be defined before validation experiment]` |
| **Rigor e Qualidade Editorial** | Processo editorial com fontes rastreáveis em 100% dos conteúdos publicados; monitoramento de taxa de correções, retratações e incidentes de qualidade *(sem presunção de que ausência de queixas signifique infalibilidade)* | `[UNKNOWN — not measured yet]` | 100% dos conteúdos com fontes catalogadas e revisão documentada prévia |
| **Disposição a Pagar (WTP)** | Nível de interesse/conversão para a proposta paga *(a ser medido quando o modelo econômico for selecionado no Shape, sem pressupor previamente assinatura, clube ou premium)* | `[UNKNOWN — not measured yet]` | `[UNKNOWN — target to be defined before validation experiment]` |

---

## 7. Cost of Inaction (Custo de Inação)

- `[INFERENCE / HYPOTHESIS]` Caso a hipótese de lacuna identificada no Research venha a se confirmar empiricamente, o público interessado em cultura católica continuará sem uma alternativa especificamente desenhada para esse posicionamento, permanecendo restrito a passatempos convencionais saturados de anúncios programáticos ou ferramentas sem curadoria formal.
- `[FACT]` A oportunidade estratégica de registro do domínio `cruzadas.online` pode ser perdida caso o domínio venha a ser adquirido por terceiros antes da decisão do projeto.
- `[INFERENCE]` O tempo e a capacidade técnica do mantenedor correrão o risco de dispersão se o desenvolvimento de software for iniciado sem uma delimitação prévia e validada do problema e do público prioritário.

---

## 8. Riscos e Restrições de Produto

### Riscos Regulatórios e Proteção a Menores
- `[EVIDENCE]` A **Lei nº 15.211/2025 (ECA Digital)** e o **Decreto nº 12.880/2026** aplicam-se a serviços voltados a menores OU com probabilidade de acesso por eles (*likely to be accessed*), proibindo perfilamento comportamental para publicidade comercial.
- `[EVIDENCE]` O Art. 24 do Decreto nº 12.880/2026 impõe proporcionalidade estrita entre as salvaguardas técnicas adotadas e o nível de risco associado ao serviço.
- `[UNKNOWN — legal applicability to Cruzadas.online requires assessment]` A aplicabilidade formal ao Cruzadas.online do Art. 22 do Decreto nº 12.880/2026 (hipótese de dispensa de aferição de idade condicionada cumulativamente a perfis infantis e ferramentas de supervisão parental) permanece como questão jurídica aberta que não pode ser presumida previamente.
- `[EVIDENCE]` A ANPD mantém em consolidação a regulamentação complementar e diretrizes preliminares sobre mecanismos de aferição de idade na internet.

### Riscos de Propriedade Intelectual e Licenciamento
- `[EVIDENCE]` Traduções bíblicas contemporâneas brasileiras (como Ave-Maria, CNBB, Jerusalém) possuem direitos patrimoniais reservados aos seus respectivos titulares e editoras. O Catecismo da Igreja Católica e a Nova Vulgata (1979) possuem direitos mundiais geridos pela Libreria Editrice Vaticana (LEV).
- `[INFERENCE]` O princípio editorial orientador do produto estabelece:
  1. *Formulação autoral própria*: Questões, pistas e enunciados devem ser redigidos com vocabulário original autoral;
  2. *Fontes em domínio público*: Obras históricas em domínio público (como a Vulgata Clementina de 1592 e a tradução histórica do Pe. Pereira de Figueiredo) podem ser livremente transcritas e consultadas;
  3. *Fontes modernas protegidas*: Podem ser utilizadas legalmente como referência factual (com citação de livro, capítulo e versículo) ou mediante autorização/licenciamento prévio quando necessária a reprodução textual de trechos;
  4. *Rastreabilidade de fontes*: Todas as referências devem ser formalmente registradas na esteira editorial;
  5. *Revisão jurídica de citação*: Situações de citação nos termos da Lei de Direitos Autorais (Lei nº 9.610/1998, Art. 46) ou necessidade de licenciamento formal permanecem sujeitas a revisão jurídica no caso concreto (`[UNKNOWN — legal review required]`).

### Riscos Operacionais do Mantenedor
- `[INFERENCE]` A elaboração contínua de conteúdos e a checagem rigorosa de ortodoxia doutrinária e precisão histórica impõem carga de trabalho substancial a um desenvolvedor individual, podendo demandar ferramentas de suporte editorial e/ou redução do escopo inicial, alternativas a serem avaliadas nas etapas posteriores.

### Restrições Cadastrais e de Canais
- `[FACT]` A conta pessoal do desenvolvedor no Google Play Console (existente desde pelo menos 2012) está isenta da regra dos 12 testadores/14 dias pós-novembro/2023, mas encontra-se temporariamente com apps removidos por pendências de verificação de identidade e telefone.
- `[EVIDENCE]` Exigências de *Android Developer Verification* vigoram a partir de 30/09/2026 para lojas participantes (incluindo Google Play) no Brasil, exigindo regularização cadastral prévia caso o canal venha a ser escolhido.
- `[FACT]` O domínio `cruzadas.online` continua **não adquirido**, mantendo incerteza de disponibilidade e custo até a sua efetiva formalização.

---

## 9. Hipóteses Centrais que Necessitam Validação

- `[HYPOTHESIS-01]` Existe disposição a pagar (WTP) sustentável por passatempos católicos e culturais no Brasil. *(O volume de 4 milhões de downloads do Hallow no Brasil com planos de R$ 200 a R$ 249,90/ano evidencia interesse por conteúdos devocionais e oracionais em áudio, mas sua conversão em disposição a pagar por jogos de palavras e raciocínio permanece como hipótese em aberto).*
- `[HYPOTHESIS-02]` O segmento de adultos católicos (incluindo adultos mais velhos/idosos) viabiliza uma validação mais ágil e com menor fricção regulatória do que iniciar prioritariamente com crianças.
- `[HYPOTHESIS-03]` Uma mecânica de Desafio Diário periódico produz retenção de hábito superior a um catálogo estático extenso de jogos.
- `[HYPOTHESIS-04]` A distribuição Web-first com partidas abertas e sem cadastro inicial obrigatório reduz o atrito de aquisição e a superfície de risco sob a LGPD e o ECA Digital.
- `[HYPOTHESIS-05]` Instituições confessionais (paróquias, escolas e catequistas) possuem apetite e orçamento para contratar soluções B2B ou materiais impressos licenciados.

---

## 10. Decisões de Produto Pertencentes à Etapa Define

- `[DECISION-DEF-01]` **Centralidade do Rigor Editorial e Ortodoxia**: Todo conteúdo factual publicado deve possuir fontes adequadas, verificáveis e rastreáveis ao respectivo domínio temático. Para conteúdo católico, doutrinário, bíblico, litúrgico ou histórico da Igreja, devem ser utilizadas fontes de autoridade apropriadas ao tipo de afirmação, com rigor especial de ortodoxia e rastreabilidade documental. Nenhum conteúdo factual relevante será publicado sem rastreabilidade editorial prévia.
- `[DECISION-DEF-02]` **Rejeição a Mecânicas Manipulativas e Perfilamento Comercial Indevido**: Proibição expressa de padrões obscuros (*dark patterns*), mecânicas de retenção manipulativas, exploração comercial ou coercitiva da atenção, publicidade invasiva voltada a menores e perfilamento comportamental vedado pela legislação e diretrizes de lojas aplicáveis. Qualquer recurso futuro de medição (*analytics*) ou personalização da experiência permanecerá estritamente sujeito a *Privacy by Design*, minimização de dados, base legal aplicável e decisões posteriores de produto.
- `[DECISION-DEF-03]` **Foco Temático na Interseção entre Fé Católica, Cultura Geral, História e Passatempo Inteligente**: Escolha estratégica de foco deliberada para orientar o Problem Space, derivada dos sinais do Research, cuja atratividade mercadológica e diferenciação comercial ainda precisarão de validação empírica.
- `[DECISION-DEF-04]` **Não Presunção de Isenção Regulatória**: O produto não presumirá dispensa automática de salvaguardas sob o ECA Digital (Lei nº 15.211/2025 e Decreto nº 12.880/2026) baseando-se em autodeclaração genérica caso haja probabilidade de acesso por menores.
- `[DECISION-DEF-05]` **Segmento Primário de Validação — Adultos Católicos Interessados em Passatempos, Cultura, História e Fé (incluindo Adultos mais Velhos/Idosos)**: Decisão estratégica de PO adotada para orientar a primeira validação e o *Assess Shape*, ancorada na autonomia de uso e menor complexidade regulatória inicial, sem afirmar validação empírica prévia de tamanho ou rentabilidade.

---

## 11. Questões e Decisões Abertas Reservadas para Assess Shape

1. **Sequenciamento e Comparação de Canais (Web vs. Android vs. iOS)**:
   - Comparação formal de apetite, esforço e canais: avaliar se o escopo inicial deve ser Web exclusiva inicial, Web + Android simultâneo ou Mobile-first, considerando a regularização cadastral prévia da conta Google Play e as taxas da Apple App Store pós-CADE.
2. **Delimitação da Mecânica Central do MVP (Solution Framing)**:
   - Decidir se o conceito inicial de solução deve priorizar Palavras Cruzadas Diretas, um Desafio Diário estilo *Wordle/Termo*, Quizzes formativos ou uma combinação híbrida.
3. **Desenho do Modelo Econômico e de Monetização**:
   - Modelar a proposta de valor e pacotes comerciais (Freemium, Clube de Membros / Apoio, Assinatura Pura, Venda Avulsa de Puzzles ou Licenciamento Educacional B2B).
4. **Arquitetura Conceitual da Esteira Editorial**:
   - Desenhar o fluxo de produção de conteúdo: assistência de IA para rascunho de perguntas sob validação humana combinada com algoritmos determinísticos de restrição matricial (CSP).
5. **Desenho de Conformidade e Aferição de Idade**:
   - Estruturar salvaguardas técnicas proporcionais de idade conforme o nível de risco e o estágio de regulamentação complementar da ANPD.
6. **Decisão sobre o Domínio**:
   - Avaliar a oportunidade financeira e o momento do registro de `cruzadas.online` vs. plano de contingência de marca.

---

## 12. Open Questions (Lacunas para Esclarecimento em Validação Posterior)

- `[NEEDS CLARIFICATION: Problem Validation]` Adultos católicos do segmento primário realmente percebem uma necessidade relevante e recorrente de passatempos digitais que integrem fé, cultura, história e rigor editorial? Quais dores descritas no Define são efetivamente percebidas, com que intensidade/frequência e quais alternativas esses usuários utilizam hoje?
- `[NEEDS CLARIFICATION: Modelo de Monetização e Nível de Preço]` Qual modelo de monetização e qual nível de preço apresentam aceitação suficiente entre os usuários do segmento primário?
- `[NEEDS CLARIFICATION: Potencial e Ciclo de Parcerias B2B]` Existe viabilidade e apetite de paróquias e escolas confessionais para contratação direta de assinaturas institucionais de jogos formativos?
- `[NEEDS CLARIFICATION: Percepção de Marca de Cruzadas.online]` O nome `cruzadas.online` gera algum ruído ou rejeição entre educadores e famílias não confessionais ao expandir para temas de história e conhecimentos gerais?
