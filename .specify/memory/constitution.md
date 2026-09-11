<!--
Sync Impact Report:
- Version change: Template Scaffold (0.0.0) → 1.0.0 (Ratified with PO Gate adjustments)
- List of modified principles:
  * V (Cost Consciousness): Remoção de menção a arquiteturas específicas (monólito); foco estrito em baixo custo fixo, simplicidade operacional e cobrança proporcional ao uso.
  * IX (Editorial Rigor): Rationale ajustado para diferencial pretendido sujeito a validação empírica; fontes reorganizadas como classificação e adequação temática por natureza da afirmação, sem ranking linear universal.
  * XII (Privacy by Design): Terminologia alinhada à LGPD, distinguindo dados pessoais de dados pessoais sensíveis e proibindo dados desnecessários em logs e traces.
  * XV (Responsive Behavior): Remoção de overclaim sobre alcance universal; ampliação de alcance potencial e redução de barreiras de distribuição.
  * XIX (Observability): Generalização de sinais de produto atrelados à spec ativa e Build-to-Learn, removendo eventos concretos do Shape 1; terminologia de privacidade alinhada à LGPD.
  * XX (Definition of Done): Critérios obrigatórios quando tecnicamente aplicáveis com formalização de N/A e exigência de justificativa explícita para exceções.
- Follow-up TODOs: Nenhum; 20 princípios permanentes de governança estabelecidos sem escolha de stack ou arquitetura.
-->

# Cruzadas.online Constitution

Esta Constituição estabelece os princípios permanentes, vinculantes e não negociáveis de produto, engenharia, qualidade e governança para a iniciativa **Cruzadas.online**. Ela orienta todas as especificações de requisitos, planos de implementação, revisões de código e deliberações de arquitetura do projeto.

Suas diretrizes sobrepõem-se a preferências individuais de desenvolvimento e devem ser estritamente observadas por qualquer agente humano ou de inteligência artificial em todas as fases do ciclo Spec-Driven Development (SDD).

---

## Core Principles

### I. Spec as Source of Truth (A Especificação é a Fonte da Verdade)
- **Regra Não Negociável**: A especificação aprovada no fluxo SDD (`spec.md`) é a autoridade máxima e definitiva sobre o comportamento esperado do produto. O código implementado não pode, sob nenhuma hipótese, redefinir, omitir ou alterar silenciosamente requisitos, regras de negócio ou critérios de aceitação especificados.
- **Protocolo de Divergência**: Qualquer alteração relevante de comportamento, regra ou escopo funcional identificada durante a engenharia exige a atualização e aprovação prévia ou concomitante da especificação correspondente antes da entrega do código.
- **Rationale**: Impede desvios silenciosos entre requisitos e código, garante rastreabilidade para manutenções futuras e assegura que a entrega reflita fielmente o valor aprovado pelo Product Owner.

### II. Simplicity and Complexity Control (Simplicidade e Controle de Complexidade)
- **Regra Não Negociável**: Toda decisão técnica deve responder satisfatoriamente à pergunta permanente de governança: *"Esta complexidade é estritamente necessária para o problema que existe hoje?"*. Na ausência de evidência objetiva e imediata de necessidade, deve-se adotar compulsoriamente a alternativa mais simples, direta e de menor custo de manutenção.
- **Vedações Prematuras**: Fica expressamente vedada a introdução antecipada de microsserviços, orquestradores complexos (como Kubernetes), barramentos assíncronos distribuídos (como Kafka/RabbitMQ), bancos em memória para cache distribuído (como Redis), clusters de busca (como Elasticsearch), arquiteturas multi-banco ou abstrações genéricas não demandadas por requisitos concretos atuais.
- **Rationale**: O projeto inicia sob operação de um mantenedor solo. Complexidade acidental consome tempo, dilui o foco no aprendizado de produto e eleva o risco de falhas operacionais sem gerar valor proporcional para os usuários.

### III. Build to Learn (Construir para Aprender)
- **Regra Não Negociável**: Durante a fase experimental do produto, o objetivo primário da engenharia é construir a menor experiência funcional e segura capaz de produzir evidências comportamentais reais sobre as hipóteses centrais de problema e uso.
- **Anti-Padrão Proibido**: É proibido desenhar ou implementar soluções voltadas à otimização prematura para escala massiva, infraestrutura multi-região ou suporte a milhões de acessos simultâneos sem dados empíricos de tração que justifiquem tal investimento. A instrumentação necessária para verificar as hipóteses do experimento faz parte do valor central de entrega.
- **Rationale**: O Product Discovery ratificou que a incerteza central do projeto é o *Problem Risk*. Investir em robustez extrema para escala hipotética antes de validar se os usuários retornam ao produto constitui desperdício de recursos.

### IV. Reversibility (Reversibilidade nas Decisões)
- **Regra Não Negociável**: Em cenários de incerteza de mercado ou técnica, deve-se optar sistematicamente por caminhos de solução altamente reversíveis, com baixo custo de substituição ou descarte.
- **Governança de Decisões Irreversíveis**: Decisões técnicas ou de produto que sejam de difícil reversão (decisões "porta de sentido único", como vínculos contratuais rígidos de fornecedores, esquemas de dados de migração onerosa ou acoplamentos de plataforma) exigem nível substancialmente superior de justificativa formal, análise de alternativas e aprovação explícita do PO.
- **Rationale**: Decisões reversíveis preservam o apetite e a agilidade do mantenedor, permitindo pivotar ou descartar experimentos que não atinjam os critérios de sucesso sem deixar passivos técnicos impagáveis.

### V. Cost Consciousness (Consciência e Austeridade de Custos)
- **Regra Não Negociável**: Todo custo fixo ou variável recorrente de serviços de nuvem, banco de dados, APIs de terceiros, ferramentas de observabilidade ou provedores de inteligência artificial deve ser explicitamente justificado pelo valor direto gerado para o produto.
- **Diretriz de Infraestrutura e Custos**: Durante a fase experimental, devem ser preferidas soluções de baixo ou zero custo fixo, menor complexidade operacional, cobrança proporcional ao uso quando vantajosa e baixo custo de manutenção, desde que atendam adequadamente aos requisitos aprovados. A escolha específica de arquitetura técnica (monolítica, modular, distribuída ou outra forma) pertence às etapas posteriores de Architecture Discovery e ADRs, não sendo predefinida pela Constituição.
- **Rationale**: Custos fixos elevados geram pressão financeira prematura sobre um produto cujos modelos de monetização ainda se encontram em estágio de hipótese em aberto.

### VI. Architecture Decision Governance (Governança de Decisões Arquiteturais)
- **Regra Não Negociável**: A arquitetura técnica do produto não deve nascer de preferências pessoais ou modismos tecnológicos, mas emergir da satisfação rigorosa dos requisitos funcionais, não funcionais e restrições das especificações aprovadas.
- **Uso de ADRs (Architecture Decision Records)**: Decisões arquiteturais relevantes, duradouras ou de impacto transversal devem ser formalmente documentadas em ADRs, detalhando: (a) contexto e problema; (b) requisitos norteadores; (c) alternativas avaliadas; (d) trade-offs considerados; (e) justificativa da escolha e consequências operacionais. Decisões rotineiras e triviais de implementação dispensam ADRs.
- **Rationale**: Assegura a rastreabilidade e a fundamentação técnica das escolhas de engenharia, permitindo que a arquitetura evolua com clareza conceitual e governança auditável.

### VII. Documentation and Decision Traceability (Rastreabilidade Contínua de Decisões)
- **Regra Não Negociável**: Deve-se manter estrita coerência e integridade na cadeia de artefatos do SDD: Discovery (`intake`, `research`, `problem`, `concept`, `decision`) → `constitution` → `spec` → `plan` → `tasks` → `code`.
- **Resolução de Divergências**: Quando for identificada qualquer discrepância entre documentação aprovada e código em produção, a divergência deve ser formalmente resolvida mediante atualização da documentação ou correção do código, sendo proibido tolerar divergências tácitas ou não documentadas.
- **Rationale**: Documentação desatualizada é passivo técnico que confunde agentes humanos e de IA, degrada a velocidade de entrega e compromete a integridade do produto.

### VIII. No Premature Feature Expansion (Controle Estrito contra Inchaço de Escopo)
- **Regra Não Negociável**: É expressamente proibido adicionar silenciosamente funcionalidades, formatos de jogos, integrações ou recursos classificados como escopo `OUT` nas decisões de produto aprovadas.
- **Critério de Inclusão**: Itens classificados como `OUT` só poderão ingressar no fluxo de desenvolvimento mediante uma nova especificação formal, nova decisão de produto ou revisão explícita de escopo aprovada pelo PO no portão correspondente.
- **Rationale**: Garante o respeito ao apetite alocado para cada ciclo e impede a dispersão de energia do mantenedor em funcionalidades que não foram validadas como prioritárias.

---

## Product & Compliance Constraints

### IX. Editorial Rigor and Categorical Traceability (Rigor Editorial e Rastreabilidade de Fontes)
- **Regra Não Negociável (`DECISION-DEF-01`)**: Todo conteúdo factual publicado na plataforma deve possuir fontes idôneas, verificáveis e catalogadas na esteira editorial. É proibida a publicação de conteúdo factual relevante sem rastreabilidade documental prévia.
- **Classificação, Autoridade e Adequação das Fontes Religiosas**: Na curadoria e elaboração de conteúdos católicos, litúrgicos, bíblicos, teológicos ou da história da Igreja, é obrigatório utilizar fontes de autoridade apropriadas e distinguir com clareza terminológica as diferentes categorias de fontes, tais como:
  - *Sagrada Escritura* (livro, capítulo e versículo);
  - *Magistério e Documentos Conciliares/Pontifícios*;
  - *Catecismo da Igreja Católica (CIC)*;
  - *Patrística e Doutores da Igreja*;
  - *Liturgia Oficial e Calendário Geral da Igreja*;
  - *História Eclesiástica Documentada*;
  - *Tradição e Devoção Popular*;
  - *Opiniões ou Hipóteses Teológicas*.
  Essas categorias não devem ser tratadas como equivalentes entre si. A autoridade e adequação da fonte devem ser avaliadas segundo a natureza da afirmação que está sendo sustentada, evitando tanto tratar devoções populares como dogma quanto submeter questões puramente históricas ou litúrgicas a critérios inadequados de autoridade.
- **Rationale**: O rigor editorial constitui requisito permanente de confiança e um diferencial estratégico pretendido, coerente com o posicionamento aprovado, cuja relevância mercadológica continuará sujeita à validação empírica. Erros conceituais ou confusões entre tradição popular e magistério comprometem a reputação pretendida para o produto.

### X. AI is Assistive, Not Authoritative (IA Assistiva, Nunca Autoritativa)
- **Regra Não Negociável**: Ferramentas de inteligência artificial podem ser utilizadas exclusivamente como instrumentos assistivos para pesquisa preparatória, rascunho de perguntas, sugestão de pistas, organização temática, classificação e aceleração da esteira de produção.
- **Vedações e Verificação**: A IA **não é fonte de autoridade** e é terminantemente proibida de inventar citações bíblicas, dados biográficos de santos, ensinamentos magisteriais ou fatos históricos. Todo conteúdo gerado com auxílio de IA nasce com o status de `Draft` e não pode ser promovido a conteúdo publicado sem processo de validação humana ou automação verificável com rastreabilidade documental adequada ao risco.
- **Rationale**: Mitiga o risco documentado de alucinações factuais e doutrinárias característico de Large Language Models (LLMs), preservando a confiabilidade editorial do acervo.

### XI. Copyright, Licensing, and Public Domain (Direitos Autorais e Licenciamento)
- **Regra Não Negociável**: A plataforma respeita integralmente a Lei de Direitos Autorais (Lei nº 9.610/1998) e os direitos patrimoniais de autores e editoras. É proibido presumir que materiais publicamente acessíveis na internet estejam em domínio público.
- **Regime de Fontes**:
  - *Domínio Público*: Obras em domínio público (como a Vulgata Clementina de 1592 e a tradução do Pe. Antônio Pereira de Figueiredo do século XVIII) podem ser transcritas e consultadas livremente;
  - *Traduções e Textos Protegidos*: Traduções bíblicas modernas brasileiras (Edições CNBB, Paulus, Paulinas, Vozes, Ave-Maria), o Catecismo da Igreja Católica e a Nova Vulgata (1979, Libreria Editrice Vaticana) possuem direitos patrimoniais reservados aos seus respectivos titulares e editoras. É vedada a reprodução extensiva ou sistemática desses textos sem autorização ou licença formal expressa;
  - *Autoria Própria e Citação*: Questões, pistas e enunciados devem priorizar redação autoral própria, utilizando passagens protegidas exclusivamente dentro dos estritos limites do direito de citação e pequenos trechos (Art. 46, III e VIII da Lei nº 9.610/1998);
  - *Dúvidas Materiais*: Situações de licenciamento duvidoso devem ser catalogadas como `UNKNOWN` e submetidas a avaliação jurídica antes de qualquer exploração comercial.
- **Rationale**: Protege a iniciativa contra passivos indenizatórios civis e preserva relações éticas e institucionais saudáveis com editoras católicas e a autoridade eclesiástica.

### XII. Privacy by Design and Data Minimization (Privacidade e Minimização de Dados)
- **Regra Não Negociável**: Aplicação rigorosa dos princípios da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A minimização de dados é obrigatória: coletam-se estritamente os dados pessoais indispensáveis para entregar a funcionalidade solicitada pelo usuário ou cumprir obrigação legal legítima.
- **Vedações de Coleta e Proteção em Logs**: É proibida a coleta de localização precisa, contatos de agenda, data de nascimento, documentos civis ou identificadores persistentes de publicidade sem finalidade funcional explícita, transparente e amparada em base legal legítima. Logs de sistema, traces, ferramentas de analytics e mensagens de erro não devem registrar senhas, tokens, segredos ou dados pessoais desnecessários.
- **Dados Pessoais Sensíveis e Proteção de Menores**: Dados pessoais sensíveis exigem nível ainda superior de proteção e não devem ser registrados em telemetria ou logs operacionais salvo necessidade excepcional, explícita, proporcional e juridicamente fundamentada. Em cumprimento ao ECA Digital (Lei nº 15.211/2025) e orientações da ANPD, fica vedada a coleta desnecessária de dados de crianças e adolescentes.
- **Rationale**: Reduz a superfície de ataque, minimiza a carga de conformidade regulatória e estabelece uma relação de respeito e transparência com os usuários.

### XIII. Security by Default (Segurança por Padrão)
- **Regra Não Negociável**: Toda implementação de software deve adotar práticas de segurança defensiva proporcionais ao risco do serviço:
  - Princípio do menor privilégio em permissões de banco, APIs e infraestrutura;
  - Validação rigorosa de todos os dados de entrada (*input validation*) e higienização/codificação de saídas (*output encoding*);
  - Proteção nativa contra vulnerabilidades clássicas da web (XSS, CSRF, Injeção SQL);
  - Políticas restritivas de compartilhamento de recursos (CORS) e cabeçalhos de segurança HTTP;
  - Mecanismos de limitação de taxa (*rate limiting*) em rotas públicas ou sensíveis;
  - Gestão segura de credenciais: **é terminantemente proibido versionar chaves de API, senhas, tokens ou segredos de ambiente no repositório Git**.
- **Rationale**: A segurança não é um estágio posterior de polimento, mas um atributo intrínseco da qualidade de software, prevenindo incidentes que poderiam paralisar uma operação individual.

### XIV. Compliance as Product Requirement (Conformidade como Requisito de Produto)
- **Regra Não Negociável (`DECISION-DEF-04`)**: Obrigações legais e regulatórias — especialmente o Marco Civil da Internet (Lei nº 12.965/2014), LGPD (Lei nº 13.709/2018), ECA Digital (Lei nº 15.211/2025), Decreto nº 12.880/2026 e diretrizes da ANPD e lojas de aplicativos — devem ser tratadas como requisitos funcionais e não funcionais nativos de produto nas especificações, e não como tarefas apressadas de pré-lançamento.
- **Preservação de Incertezas Jurídicas**: O enquadramento em hipóteses específicas de dispensa (como o Art. 22 do Decreto nº 12.880/2026) e normas técnicas de aferição de idade em processo de consolidação pela ANPD devem ser preservados como `UNKNOWN` até deliberação jurídica formal no caso concreto.
- **Rationale**: Evita retrabalho severo ou bloqueios de distribuição por órgãos reguladores ou plataformas de publicação.

### XV. Responsive and Device-Agnostic Product Behavior (Comportamento Responsivo e Agnóstico a Dispositivo)
- **Regra Não Negociável**: Toda funcionalidade entregue na plataforma Web deve ser concebida, desenhada e testada para funcionar com fluidez tanto em telas pequenas de smartphones quanto em tablets e telas amplas de computadores.
- **Uso Racional de Canais**: Não se deve exigir a instalação de aplicativo nativo para funcionalidades que possam ser plenamente entregues via Web padrão sem degradação de experiência. A expansão para canais nativos (Android/iOS) deve obedecer a decisões fundamentadas de produto pós-validação.
- **Rationale**: Amplia o alcance potencial entre dispositivos compatíveis e reduz barreiras de instalação e distribuição, viabilizando acesso direto sem fricção prévia de download.

### XVI. Internationalization-Ready without Premature Localization (Preparado para Internacionalização sem Localização Prematura)
- **Regra Não Negociável**: A arquitetura de software e a modelagem de dados devem evitar decisões que inviabilizem estruturalmente a adição futura de outros idiomas ou calendários regionais (ex: evitar textos fixos dispersos em lógica de backend sem separação conceitual de conteúdo).
- **Escopo Inicial**: Não se deve construir subsistemas complexos de localização ou múltiplos catálogos de tradução na fase inicial; o Português Brasileiro (pt-BR) é o contexto único e prioritário do experimento de validação.
- **Rationale**: Mantém o código desacoplado e extensível no longo prazo sem desperdiçar esforço de engenharia no presente.

---

## Development & Quality Gates

### XVII. Testing as an Engineering Requirement (Testes como Requisito de Engenharia)
- **Regra Não Negociável**: Toda funcionalidade relevante deve possuir estratégia de teste proporcional ao seu nível de risco de regressão e complexidade lógica. O ciclo de desenvolvimento deve contemplar testes automatizados adequados (unitários, integração ou ponta a ponta).
- **Regras Determinísticas e Regressões**: Motores de validação de regras de jogos, contagem de pontos, lógica temporal e geração matricial determinística exigem testes rigorosos de invariantes. Todo bug crítico corrigido deve ser acompanhado de um teste automatizado de regressão correspondente para evitar reincidência.
- **Rationale**: Testes automatizados garantem estabilidade, viabilizam refatorações contínuas e mantêm a produtividade alta em uma esteira mantida por desenvolvedor solo.

### XVIII. Accessibility as Part of Definition of Done (Acessibilidade como Requisito de Conclusão)
- **Regra Não Negociável**: Acessibilidade é requisito de produto e deve integrar os critérios de aceitação e a *Definition of Done* das especificações, e não ser tratada como polimento tardio ou opcional.
- **Requisitos Mínimos de Interface**:
  - Navegação completa por teclado e indicador de foco claramente visível;
  - Contraste cromático adequado entre texto e fundo;
  - Semântica HTML correta e suporte básico a tecnologias assistivas / leitores de tela;
  - Textos dimensionáveis e legíveis para adultos mais velhos e idosos (`DECISION-DEF-05`);
  - Áreas de toque (*touch targets*) com dimensões confortáveis em dispositivos móveis;
  - Informações de status ou validação que não dependam exclusivamente de percepção de cor.
- **Rationale**: O segmento primário de validação inclui idosos e adultos com diferentes níveis de acuidade visual e motora. O design inclusivo é mandatório para viabilizar a adoção do produto.

### XIX. Observability without Privacy Intrusion (Observabilidade Sem Invasão de Privacidade)
- **Regra Não Negociável**: Os sistemas em produção devem possuir instrumentação proporcional necessária para diagnosticar falhas operacionais, monitorar a saúde operacional e medir os sinais de produto necessários para avaliar as hipóteses e critérios de sucesso definidos na especificação ativa, em consonância com o princípio *Build-to-Learn*.
- **Proibição de Rastreamento Abusivo**: A observabilidade técnica e a telemetria analítica nunca devem coletar, correlacionar ou registrar senhas, segredos, dados pessoais desnecessários ou dados pessoais sensíveis (salvo necessidade excepcional, proporcional e juridicamente fundamentada), nem dados comportamentais proibidos para perfilamento publicitário sob o ECA Digital e a LGPD.
- **Rationale**: Viabiliza o aprendizado analítico do produto e a detecção de erros em produção mantendo conformidade ética e regulatória irrepreensível.

### XX. Comprehensive Quality Gates and Definition of Done (Critérios Rigorosos de Conclusão)
- **Regra Não Negociável**: Nenhuma implementação, tarefa técnica ou funcionalidade deve ser considerada concluída (*Done*) pelo simples fato de que "funciona na máquina do desenvolvedor". Os critérios abaixo são obrigatórios quando tecnicamente aplicáveis ao tipo de artefato ou feature entregue. Critérios inaplicáveis devem ser identificados como N/A; exceções a critérios aplicáveis exigem justificativa explícita.
- **Definition of Done (Critérios de Homologação de Features)**:
  1. *Requisitos da Especificação*: Todos os requisitos funcionais e cenários da especificação (`spec.md`) atendidos;
  2. *Critérios de Aceitação*: Critérios de aceitação verificados e satisfeitos;
  3. *Compilação e Build*: Compilação e *build* de produção executados com sucesso (sem avisos impeditivos), quando existir etapa de build;
  4. *Testes Automatizados*: Suíte de testes automatizados apropriados executada e 100% verde;
  5. *Qualidade Estática*: Regras de formatação, checagem estática de tipos e *lint* satisfeitas sem violações, quando configurados/aplicáveis;
  6. *Acessibilidade e Segurança*: Requisitos de acessibilidade e salvaguardas de segurança aplicáveis verificados;
  7. *Rastreabilidade de Fontes*: Rastreabilidade documental de todo conteúdo factual incorporado;
  8. *Código Limpo*: Ausência de marcadores de tarefas críticas pendentes (`TODO` ou `FIXME` impeditivos) no código de produção;
  9. *Documentação e Sincronização*: Documentação técnica e registros de especificação devidamente atualizados.
- **Rationale**: Estabelece uma barra de qualidade objetiva, auditável e contextualmente aplicável, garantindo que o software avance com solidez em cada etapa do ciclo SDD sem concessões desregradas.

---

## Governance

### I. Supremacia da Constituição
Esta Constituição sobrepõe-se a quaisquer convenções locais, preferências pessoais de codificação ou atalhos práticos adotados durante a execução do projeto. Qualquer proposta de especificação técnica, plano de arquitetura ou PR de implementação que viole um princípio aqui firmado deve ser rejeitada ou adaptada até alcançar plena conformidade.

### II. Processo de Emenda Constitucional (Amendment Procedure)
Os princípios constitucionais aqui estabelecidos podem ser alterados ou expandidos ao longo da evolução do projeto, desde que respeitado o seguinte rito formal:
1. **Proposição e Justificativa**: Apresentação de justificativa formal documentada detalhando a motivação da mudança, as evidências de produto ou técnicas que sustentam a revisão e os impactos esperados sobre as especificações vigentes;
2. **Avaliação de Impacto (Sync Impact Analysis)**: Mapeamento de todas as especificações (`specs`), planos (`plans`), decisões de arquitetura (`ADRs`) e códigos existentes impactados pela alteração;
3. **Aprovação do Product Owner**: Nenhuma alteração constitucional entra em vigor sem a ratificação expressa e formal do PO;
4. **Atualização Versionada**: Registro da emenda no arquivo `.specify/memory/constitution.md`, incluindo o *Sync Impact Report* correspondente e o incremento da versão semântica.

### III. Política de Versionamento Semântico da Constituição
As versões da Constituição adotam a convenção de Versionamento Semântico (SemVer `MAJOR.MINOR.PATCH`), interpretada nos seguintes termos de governança:
- **MAJOR (X.0.0)**: Alterações substanciais de governança, remoção, relaxamento ou redefinição incompatível de princípios nucleares existentes (ex: mudança profunda na postura de privacidade, aceitação de modelos publicitários antes vedados ou reestruturação da governança);
- **MINOR (1.X.0)**: Adição de novos princípios, expansão material de diretrizes existentes ou inclusão de novas seções de governança sem revogação de princípios vigentes;
- **PATCH (1.0.X)**: Ajustes redacionais, correções tipográficas, refinamentos de redação explicativa ou alinhamentos de consistência que não alterem o escopo semântico das regras.

### IV. Revisão Periódica de Conformidade
A cada novo ciclo de planejamento de feature (`/speckit-plan`) e antes de cada convergência de entrega (`/speckit-converge`), o plano e as implementações devem passar por um crivo explícito de conformidade com os princípios desta Constituição.

---

**Version**: 1.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
