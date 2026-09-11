# Feature Specification: Desafio Diário Web-First (Shape 1)

**Feature Branch**: `001-daily-challenge`

**Created**: 2026-09-10 (revisado pós-PO Gate)

**Status**: Draft

**Input**: User description: "Shape 1 — Desafio Diário Web-First: Experimento de validação com gameplay aberto sem conta obrigatória, enigma periódico de palavras/letras com temática cultural/católica, contextualização pós-jogo com fontes adequadas à natureza da afirmação, persistência de estado local, compartilhamento sem spoilers e telemetria comportamental mínima para validação de hipóteses de produto sob apetite Small e estratégia Build to Learn."

## Clarifications

### Session 2026-09-10
- Q: Qual modelo canônico de mecânica de jogo deve reger a resolução do enigma diário de palavras no Cruzadas.online? (FR-007) → A: Option A — Adivinhação em 6 tentativas com pista temática inicial e feedback de letras (posição correta, posição incorreta, ausente); normalização de acentos e cedilha na digitação; vitória ao acertar o termo e encerramento por esgotamento das 6 tentativas.
- Q: Como deve ser definida a fronteira temporal do ciclo diário, o horário de virada oficial e a política de sessão e replay no Cruzadas.online? (FR-013) → A: Option A — Fuso de Brasília (00:00 UTC-3) como referência nacional unificada; conclusão graciosa de partidas ativas durante a virada; bloqueio de rejogabilidade no mesmo ciclo para preservar integridade dos dados, mantendo acessível a tela pós-jogo para consulta e compartilhamento.
- Q: Quais regras funcionais devem reger o cômputo, a manutenção e a quebra da sequência de dias consecutivos jogados (streak) no Cruzadas.online? (FR-015) → A: Option A — Conclusão efetiva da partida no ciclo diário (vitória ou derrota válida) contabiliza o dia para a sequência; ausência de conclusão em um dia civil oficial (00:00 UTC-3) zera a sequência atual (current streak) preservando a maior sequência histórica (max streak); indicador pessoal leve operando localmente no dispositivo sem punições artificiais ou dark patterns.
- Q: Como o sistema deve avaliar o cômputo de letras repetidas, a equivalência ortográfica na digitação e o escopo de vocabulário aceito no enigma diário? (FR-006, FR-007, FR-008) → A: Option A — Cômputo posicional estrito com prioridade para posições exatas e marcação de excedentes como ausentes (ex.: palavra secreta MARIA e tentativa ARARA: o 'A' na 5ª posição é correto por posição exata, o 'A' na 1ª posição é presente em outra posição, e o 'A' excedente na 3ª posição é ausente, demonstrando que cada ocorrência na palavra secreta satisfaz no máximo uma ocorrência na tentativa); normalização funcional transparente de acentos/cedilha na digitação (ACAO = AÇÃO) preservando a grafia editorial canônica na revelação; vocabulário de termos únicos sem espaço/hífen aceitando léxico comum em português e nomes próprios católicos/bíblicos relevantes (MARIA, PEDRO, JESUS, BENTO).
- Q: A qual ciclo deve ser atribuída a conclusão de uma partida iniciada antes da meia-noite e finalizada após a virada, e como tratar sessões mantidas abertas por múltiplos dias? (FR-013, FR-014, FR-015) → A: Option A para todos os usuários do MVP — A conclusão pertence sempre ao ciclo do desafio que foi iniciado (ex.: partida iniciada às 23:58 do Dia A e concluída às 00:03 do Dia B pontua para o Dia A), liberando em seguida o novo desafio do Dia B para jogo e cômputo sem contagem dupla. Para sessões mantidas abertas por múltiplos dias (ex.: iniciada no Dia 10 e concluída no Dia 12), a conclusão pontua exclusivamente para o Dia 10 (não recupera o Dia 11 e não pontua para o Dia 12; streak atual zera conforme FR-015). Sem timeouts arbitrários ou descarte punitivo no cliente.
  - *Nota de Governança*: `[FUTURE PRODUCT POLICY / STAKEHOLDER DECISION]` Decisão deliberada do Product Owner: a regra da Opção A regerá o free tier permanente e futuros planos pagos da plataforma; a aplicação de descarte de sessão (Opção C) fica reservada para eventual governança de outras modalidades ou planos futuros não contemplados nessas condições, sem impacto ou ramificações condicionais de planos no MVP.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogar o Desafio Periódico Aberto e Visualizar o Conteúdo Cultural/Litúrgico Pós-Jogo (Priority: P1)

Como adulto interessado em passatempos de palavras e cultura católica, quero acessar a plataforma diretamente no meu navegador sem necessidade de criar conta ou preencher cadastros, interagir com o enigma de palavras/letras ativo e, ao término, visualizar a contextualização e a fonte adequada que respalda a resposta, para exercitar a mente e aprender sobre fé e história com comodidade e sem atritos.

**Why this priority**: Constitui o núcleo vital (*core loop*) do experimento de produto. Sem a capacidade de jogar e receber a recompensa cultural/formativa com rigor editorial, não há experiência funcional a ser entregue nem hipótese comportamental a validar.

**Independent Test**: Pode ser testado de ponta a ponta carregando um desafio isolado, simulando entradas válidas do jogador conforme as regras da mecânica, finalizando a partida e verificando a exibição da tela de resultado com o texto contextual e a respectiva citação de fonte documental.

**Acceptance Scenarios**:

1. **Acesso Direto sem Barreiras**:
   - **Given** que o usuário navega para o endereço Web da aplicação em smartphone ou computador,
   - **When** a página termina de carregar,
   - **Then** a interface do enigma ativo é apresentada imediatamente, sem exibição de telas de bloqueio, modais de cadastro obrigatório, solicitações de credenciais ou pedidos de permissões invasivas (como localização ou lista de contatos).

2. **Compreensão e Interação com o Enigma**:
   - **Given** que o usuário está na tela inicial do desafio,
   - **When** o usuário observa a interface,
   - **Then** as instruções fundamentais do jogo, a área de inserção de tentativas e os controles de entrada suportados pelo dispositivo estão visíveis e operáveis com clareza e contraste adequado.

3. **Submissão de Tentativa, Normalização e Feedback de Posição**:
   - **Given** que o usuário observa a pista temática inicial e submete uma tentativa de termo conforme a quantidade esperada de letras,
   - **When** o sistema avalia a tentativa submetida contra o vocabulário aceito (que inclui palavras comuns e nomes próprios bíblicos/católicos sem espaço ou hífen),
   - **Then** a digitação é aceita com equivalência ortográfica transparente (á, à, â, ã → a; é, ê → e; í → i; ó, ô, õ → o; ú → u; ç → c, de modo que 'ACAO' é aceito e avaliado como 'AÇÃO'), e o sistema fornece feedback imediato por letra aplicando prioridade posicional estrita para letras repetidas (correspondências na posição correta consomem primeiro as ocorrências da palavra secreta, e letras excedentes recebem status de ausente, ex.: se a palavra secreta for MARIA e a tentativa for ARARA, o 'A' na 5ª posição é marcado como correto, o 'A' na 1ª posição é marcado como presente em outra posição, e o 'A' excedente na 3ª posição é marcado como ausente, garantindo que nenhuma ocorrência da palavra secreta seja reutilizada mais de uma vez), utilizando distinções visuais e semânticas que não dependem exclusivamente de cores.

4. **Conclusão com Vitória e Exibição Editorial**:
   - **Given** que o jogador acertou a palavra secreta em qualquer uma das até 6 tentativas permitidas,
   - **When** a tentativa correta é processada,
   - **Then** o estado do jogo é atualizado para vitória e o sistema apresenta a tela de encerramento contendo: (a) mensagem de congratulações com o número de tentativas utilizadas; (b) o termo correto confirmado; (c) a contextualização formativa sobre o santo, passagem bíblica, festa litúrgica ou fato histórico associado; e (d) a citação da fonte documental adequada à natureza da afirmação (e fonte de autoridade eclesial se de natureza doutrinária ou bíblica).

5. **Conclusão por Esgotamento das Tentativas**:
   - **Given** que o jogador utilizou todas as 6 tentativas permitidas sem acertar o termo secreto,
   - **When** a sexta tentativa incorreta é processada,
   - **Then** a partida é finalizada com tom respeitoso e acolhedor, o termo correto é revelado, e a mesma contextualização formativa e citação de fonte documental são disponibilizadas para leitura.

---

### User Story 2 - Preservação de Estado Local e Acompanhamento de Ciclos Periódicos (Priority: P2)

Como jogador habitual, quero que o meu dispositivo memorize o resultado do desafio que já joguei no ciclo corrente para que eu possa rever o conteúdo sem perder meu progresso, e quero que novos enigmas sejam disponibilizados conforme o ciclo periódico, mantendo a contagem da minha sequência pessoal de dias jogados (*streak*), para que eu possa cultivar um hábito recorrente.

**Why this priority**: É essencial para testar a hipótese de retenção de longo prazo e hábito diário (`[HYPOTHESIS-03]`), sem introduzir a sobrecarga arquitetural e os riscos de privacidade de um banco de dados centralizado com contas de usuário.

**Independent Test**: Pode ser testado concluindo o enigma ativo, recarregando a página (ou fechando e reabrindo o navegador) para confirmar que o estado de conclusão e o texto continuam acessíveis no mesmo dispositivo, e posteriormente verificando o comportamento após a transição do ciclo periódico para comprovar a atualização do desafio e a contagem da sequência conforme as regras do ciclo.

**Acceptance Scenarios**:

1. **Persistência Local do Estado da Partida**:
   - **Given** que o usuário concluiu (ou iniciou) uma partida no ciclo corrente,
   - **When** o usuário recarrega a página ou fecha e reabre o navegador no mesmo navegador/dispositivo,
   - **Then** o sistema recupera o estado correspondente daquele ciclo, sem reiniciar inadvertidamente o desafio do zero.

2. **Reconhecimento do Desafio do Ciclo e Bloqueio de Replay**:
   - **Given** que o jogador concluiu o desafio do ciclo ativo,
   - **When** o jogador retorna à aplicação dentro do mesmo ciclo periódico (antes da meia-noite UTC-3),
   - **Then** a interface apresenta a tela pós-jogo com o resultado obtido, a nota de contextualização formativa e a citação documental, bloqueando novo jogo no mesmo dia para manter a fidelidade das estatísticas e dos sinais analíticos.

3. **Transição de Ciclo Periódico (00:00 UTC-3) e Atribuição Temporal**:
   - **Given** que a virada de ciclo ocorre à meia-noite (00:00:00) pelo Horário de Brasília (UTC-3),
   - **When** uma partida iniciada antes da meia-noite (ex.: Dia A às 23:58) é concluída após a virada (ex.: Dia B às 00:03),
   - **Then** a conclusão é atribuída exclusivamente ao ciclo do desafio que foi iniciado (Dia A), pontuando a constância daquele dia no streak; em seguida, o novo desafio do ciclo corrente (Dia B) é disponibilizado para jogo e cômputo sem duplicidade de pontuação; caso uma sessão tenha sido iniciada em data anterior e permaneça aberta por múltiplos dias (ex.: iniciada no Dia 10 e finalizada no Dia 12), a partida pode ser concluída normalmente para fins formativos e recreativos, pontuando unicamente para o Dia 10, sem recuperar os dias intermediários não jogados (Dia 11) e sem computar para o Dia 12 (com o streak atual zerado pela ausência de conclusão no Dia 11).

4. **Retenção de Indicadores Pessoais Básicos**:
   - **Given** que o jogador já realizou partidas em ciclos anteriores no mesmo dispositivo,
   - **When** o jogador visualiza a tela pós-jogo ou o painel de estatísticas locais,
   - **Then** são exibidos indicadores pessoais agregados simples (total de partidas jogadas, percentual de acerto, distribuição de vitórias, sequência atual e sequência recorde), de forma leve e acolhedora sem técnicas de coerção (*dark patterns*).

---

### User Story 3 - Compartilhamento Voluntário sem Revelação da Resposta (Priority: P2)

Como usuário que concluiu o enigma, quero gerar uma mensagem de compartilhamento com um resumo do meu desempenho sem revelar a resposta ou pistas do desafio, para poder compartilhar com amigos ou familiares em aplicativos de mensagens de forma ética, incentivando outros a jogarem.

**Why this priority**: Testa a hipótese de distribuição orgânica e aquisição comunitária em redes familiares e paroquiais (`[HYPOTHESIS-04]`), com custo marginal zero.

**Independent Test**: Pode ser testado acionando a opção de compartilhamento na tela pós-jogo, inspecionando o texto gerado na área de transferência ou diálogo do sistema operacional, e certificando-se da ausência da resposta e de spoilers diretos.

**Acceptance Scenarios**:

1. **Ação Disparada Exclusivamente pelo Usuário**:
   - **Given** que o jogador concluiu o desafio e visualiza o resultado,
   - **When** o jogador localiza a opção de compartilhamento,
   - **Then** o compartilhamento é disponibilizado por meio de um botão explícito de ação, sem disparos automáticos ou modais intrusivos não solicitados.

2. **Geração de Mensagem sem Spoiler**:
   - **Given** que o usuário aciona a ação de compartilhar,
   - **When** o sistema gera o conteúdo para a área de transferência ou diálogo do dispositivo,
   - **Then** o texto gerado contém apenas: (a) a identificação do desafio/ciclo; (b) um resumo simbólico ou quantitativo do desempenho sem revelar letras da solução; e (c) o link de acesso à plataforma, sem conter o termo secreto ou a resposta do enigma.

3. **Preservação de Privacidade e Permissões**:
   - **Given** que a rotina de compartilhamento é executada,
   - **When** o usuário interage com o recurso,
   - **Then** o sistema não solicita acesso à agenda de contatos, histórico de navegação ou perfis sociais do usuário, operando unicamente através dos mecanismos padrão de transferência de texto do sistema operacional/navegador.

---

### User Story 4 - Manifestação Opcional de Interesse e Apoio Comunitário (Priority: P3)

Como usuário interessado na proposta do Cruzadas.online, quero ter a oportunidade de sinalizar voluntariamente meu interesse na continuidade do projeto ou em futuras opções de apoio comunitário, de forma desacoplada da jogabilidade básica e sem qualquer bloqueio ao acesso gratuito do jogo.

**Why this priority**: Permite capturar sinais preliminares de *Willingness-to-Support/Pay* (`[HYPOTHESIS-01]`) sem implementar sistemas complexos de cobrança ou exigir dados pessoais desnecessários.

**Independent Test**: Pode ser testado interagindo com a seção de interesse opcional, emitindo um sinal voluntário de apoio e confirmando que o fechamento ou a recusa não afeta nenhuma funcionalidade do desafio diário.

**Acceptance Scenarios**:

1. **Desacoplamento Total da Jogabilidade**:
   - **Given** que o usuário está jogando ou visualizando o resultado,
   - **When** o usuário navega pela tela,
   - **Then** a chamada para manifestar interesse ou apoio é apresentada de forma discreta, não obstrutiva e claramente diferenciada da mecânica do jogo, sem barreiras coercitivas (*dark patterns*).

2. **Coleta Voluntária com Minimização Estrita**:
   - **Given** que o usuário decide manifestar seu interesse,
   - **When** o usuário interage com o mecanismo de manifestação,
   - **Then** o sistema prioriza o registro de um sinal de interesse sem identificação pessoal obrigatória; caso uma solução posterior envolva canal de contato, este deve possuir finalidade explícita, consentimento informado e estrita conformidade com a LGPD.

3. **Recusa sem Penalidade**:
   - **Given** que o usuário opta por não manifestar interesse nem apoiar,
   - **When** o usuário fecha a área de apoio ou a ignora,
   - **Then** o jogo e a leitura de todo o conteúdo editorial continuam integralmente disponíveis sem qualquer degradação funcional.

---

### Edge Cases

- **Perda ou Intermitência de Conectividade**: Se houver falha de rede durante o uso, a aplicação deve apresentar feedback seguro e compreensível ao usuário, sem falhas silenciosas ou comportamentos destrutivos de estado; suporte a funcionamento offline integral NÃO é requisito deste experimento.
- **Mudança de Fuso Horário ou Relógio do Dispositivo**: A determinação do desafio do dia apoia-se na data de referência oficial (Horário de Brasília UTC-3), assegurando a integridade do ciclo mesmo se o relógio local do dispositivo do usuário for alterado, impedindo desbloqueio de desafios futuros.
- **Sessão Aberta Durante a Virada do Ciclo ou Prolongada por Múltiplos Dias**: Se o usuário mantiver a aba do navegador aberta durante a virada da meia-noite (00:00:00 UTC-3), a partida em andamento pode ser concluída normalmente e é atribuída ao ciclo do dia em que foi iniciada (ex.: iniciada às 23:58 do Dia A e finalizada às 00:03 do Dia B pontua para o Dia A), liberando em seguida o novo desafio do Dia B para jogo e cômputo sem duplicidade. Se a sessão permanecer aberta ou pausada por múltiplos dias (ex.: iniciada no Dia 10 e retomada no Dia 12), o usuário pode concluí-la com atribuição exclusiva ao Dia 10; os dias intermediários não jogados (Dia 11) não são recuperados, o Dia 12 não é pontuado por esta partida e o streak atual é zerado de acordo com FR-015, sem aplicação de timeouts arbitrários ou descarte punitivo no cliente.
- **Limpeza de Dados Locais / Navegação Privada**: Se o usuário jogar em janela anônima ou limpar os dados locais do navegador, o sistema deve iniciar um novo estado local limpo sem quebrar a aplicação.
- **Entradas Incompletas, Hifenizadas ou Inválidas**: Tentativas que contenham espaços, hífens, caracteres numéricos, tamanho incorreto ou que não pertençam ao vocabulário aceito de termos em português / nomes católicos devem ser sinalizadas com feedback claro e sutil, sem debitar nenhuma tentativa do jogador.
- **Tentativas com Letras Repetidas em Excesso**: Se o jogador submeter uma tentativa com múltiplas ocorrências de uma mesma letra que só aparece uma vez na palavra secreta, as posições não coincidentes são marcadas estritamente como 'ausentes' após consumir a ocorrência devida, evitando que o jogador interprete erroneamente que a letra existe em duplicidade.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Acesso, Identidade e Privacidade
- **FR-001**: O sistema DEVE permitir acesso imediato à experiência de jogo sem exigir criação de conta, login social, e-mail, senha ou cadastro prévio.
- **FR-002**: O sistema DEVE operar em conformidade com o princípio de minimização de dados da LGPD, não coletando dados de geolocalização precisa, contatos de agenda, documentos de identificação ou identificadores de publicidade.
- **FR-003**: O sistema DEVE permitir que o usuário manifeste voluntariamente interesse na continuidade ou apoio ao projeto de forma desacoplada da jogabilidade básica; no experimento inicial, prioriza-se sinal de interesse sem identificação pessoal obrigatória, e caso venha a coletar dados de contato futuramente, estes devem possuir finalidade explícita e consentimento informado.

#### Mecânica de Jogo e Interface
- **FR-004**: O sistema DEVE apresentar exatamente um único desafio ativo por ciclo periódico.
- **FR-005**: O sistema DEVE fornecer área estruturada para inserção de tentativas de termos com o número de letras determinado para o desafio do ciclo, suportando teclado físico e teclado em tela.
- **FR-006**: O sistema DEVE validar se a tentativa submetida possui a quantidade esperada de letras para o desafio ativo e pertence a um vocabulário aceito de palavras em português (composto por termos do léxico comum e nomes próprios de relevância católica, bíblica e histórica, como MARIA, PEDRO, JESUS ou BENTO), sem aceitar termos com espaços, hífens, siglas ou palavras estrangeiras não aportuguesadas.
- **FR-007**: A mecânica canônica opera sob adivinhação de termo único em até 6 tentativas, exibindo uma pista temática contextual inicial (cultural/litúrgica) para orientar o jogador sem revelar letras; a digitação no teclado opera com equivalência funcional normalizada A-Z, aceitando caracteres básicos sem acentos ou cedilha como correspondentes válidos às letras canônicas acentuadas (ex.: submeter 'ACAO' é funcionalmente equivalente e validado como 'AÇÃO'), preservando-se a grafia correta e acentuada na exibição editorial pós-jogo.
- **FR-008**: O sistema DEVE fornecer feedback imediato para cada letra da tentativa submetida (posição correta, presente em outra posição, ou ausente), garantindo que distinções funcionais utilizem formas/símbolos além de cores e aplicando a regra canônica de cômputo posicional para letras repetidas: (a) correspondências na posição exata são computadas e consumidas primeiro; (b) ocorrências adicionais na tentativa recebem o status de 'presente' apenas até o limite de repetições ainda disponíveis na palavra secreta; (c) ocorrências excedentes da mesma letra recebem o status de 'ausente' (ex.: se a palavra secreta for MARIA e a tentativa for ARARA, o 'A' na 5ª posição é correto por posição exata, o 'A' na 1ª posição é presente em outra posição, e o 'A' excedente na 3ª posição é ausente, demonstrando que cada ocorrência da letra na palavra secreta satisfaz no máximo uma ocorrência na tentativa).
- **FR-009**: O sistema DEVE detectar automaticamente o encerramento da partida por vitória (acerto do termo em qualquer uma das 6 tentativas) ou por encerramento sem vitória (esgotamento das 6 tentativas permitidas).

#### Rigor Editorial e Rastreabilidade de Fontes
- **FR-010**: Ao término da partida, o sistema DEVE apresentar o termo correto acompanhado de nota de contextualização formativa e citação explícita de fonte adequada, verificável e rastreável segundo a natureza da afirmação.
- **FR-011**: Para conteúdos de natureza católica, bíblica, doutrinária, litúrgica ou histórica da Igreja, o sistema DEVE referenciar fontes de autoridade apropriadas à natureza da afirmação (Sagrada Escritura, Magistério, Catecismo, Patrística, Liturgia, História Documentada ou Tradição), sendo vedado o uso de IA como fonte de autoridade ou a invenção de referências.
- **FR-012**: É terminantemente PROIBIDA a exibição de conteúdos com direitos autorais patrimoniais violados, devendo todo desafio apoiar-se em redação autoral própria, fatos históricos, obras em domínio público ou citações nos limites legais (Art. 46 da Lei nº 9.610/1998).

#### Ciclo Periódico e Persistência Local
- **FR-013**: O ciclo diário do desafio renova-se à meia-noite (00:00:00) pelo Horário Oficial de Brasília (UTC-3), garantindo que todos os usuários compartilhem simultaneamente o mesmo enigma do calendário e eliminando assimetrias de spoilers entre fusos horários.
- **FR-014**: O sistema DEVE preservar localmente o estado da partida e garantir a conclusão graciosa de sessões ativas que atravessem a virada da meia-noite ou permaneçam abertas por múltiplos dias, atribuindo a conclusão ao ciclo do desafio em que a partida foi iniciada (ex.: partida do Dia A iniciada às 23:58 e concluída às 00:03 do Dia B pontua para o Dia A); após a conclusão e exibição da tela pós-jogo, o novo desafio do ciclo corrente é disponibilizado para jogo e cômputo sem duplicidade. Sessões mantidas abertas por múltiplos dias (ex.: iniciada no Dia 10 e concluída no Dia 12) pontuam exclusivamente para a data de origem (Dia 10) e não recuperam dias intermediários (Dia 11) nem adiantam o dia atual (Dia 12), operando sem descartes punitivos ou timeouts arbitrários no cliente. Uma vez concluído o desafio de um determinado ciclo, a rejogabilidade daquele ciclo é bloqueada para proteger a integridade dos dados estatísticos, mantendo acessível a tela pós-jogo para consulta e compartilhamento.
  - *Nota de Política de Produto*: `[FUTURE PRODUCT POLICY / STAKEHOLDER DECISION]` Conforme decisão deliberada do Product Owner, esta regra de preservação e atribuição ao ciclo de origem (Opção A) regerá o free tier permanente e eventuais futuros planos pagos da plataforma; a aplicação de descarte de sessão (Opção C) fica reservada para eventual governança de outras modalidades ou planos futuros não contemplados nessas condições, sem impacto ou implementação condicional de planos no MVP.
- **FR-015**: O sistema DEVE computar a sequência de dias jogados (*streak*) com base na conclusão efetiva da partida no ciclo diário oficial (vitória ou derrota contam para a constância do hábito); se o usuário não concluir o desafio em um dia civil oficial (00:00:00 às 23:59:59 UTC-3), a sequência atual de dias (*current streak*) é zerada ao iniciar a próxima partida, mantendo-se sempre preservada a maior sequência histórica alcançada (*max streak*).
- **FR-016**: O sistema DEVE manter e exibir indicadores pessoais básicos acumulados no dispositivo (total de partidas concluídas, taxa de vitórias, distribuição de tentativas em vitórias, sequência atual de dias e sequência máxima histórica), sem notificações invasivas de urgência ou mecanismos coercitivos de retenção.

#### Compartilhamento e Interação Social
- **FR-017**: O sistema DEVE fornecer funcionalidade de compartilhamento voluntário na tela pós-jogo, ativada exclusivamente por iniciativa do usuário.
- **FR-018**: O resumo de compartilhamento gerado DEVE omitir a palavra secreta, pistas e spoilers do conteúdo editorial, contendo apenas a identificação do desafio/ciclo, indicador de desempenho e link de acesso à plataforma.

#### Acessibilidade e Responsividade
- **FR-019**: A interface DEVE ser responsiva e funcional em telas verticais de smartphones, tablets e computadores.
- **FR-020**: Todos os elementos interativos acionáveis por toque em telas móveis DEVEM apresentar dimensões e espaçamentos adequados e confortáveis para o público primário (adultos e idosos), permitindo acionamento confiável sem exigir precisão motora excessiva.
- **FR-021**: A interface DEVE oferecer suporte a navegação por teclado, com indicador de foco claramente perceptível em todos os controles operáveis.
- **FR-022**: Os textos e componentes da interface DEVEM suportar dimensionamento e ampliação pelo navegador sem quebra destrutiva de layout ou sobreposição ilegível de conteúdo.

#### Telemetria e Aprendizado do Experimento (Build-to-Learn)
- **FR-023**: O sistema DEVE registrar sinais de produto estritamente necessários para avaliar as hipóteses de validação do experimento: (a) acesso à página; (b) início de partida; (c) conclusão da partida; (d) abandono; (e) retorno em ciclos subsequentes; (f) acionamento de compartilhamento; e (g) sinal voluntário de interesse/apoio.
- **FR-024**: A telemetria NÃO DEVE coletar senhas, conteúdos privados de mensagens ou dados pessoais identificáveis diretos, operando sob pseudonimização estrita ou agregação analítica conforme a LGPD e o ECA Digital.
- **FR-025**: O sistema DEVE tratar falhas temporárias de conectividade de modo seguro e compreensível, sem comportamentos destrutivos de estado; suporte a funcionamento offline integral NÃO é requisito desta especificação.

---

### Key Entities *(include if feature involves data)*

- **Desafio Diário (Daily Challenge)**:
  Representa a unidade editorial de jogo vinculada a um ciclo periódico.
  *Atributos conceituais*: Identificador do ciclo/data, termo secreto da adivinhação, quantidade de letras do termo, pista temática inicial, texto de contextualização formativa pós-jogo, citação da fonte adequada e categoria temática documental.

- **Sessão de Partida Local (Game Session State)**:
  Representa o estado transitório e final de uma partida jogada em um dispositivo específico.
  *Atributos conceituais*: Identificador do desafio jogado, tentativas efetuadas, status da partida (`Em Andamento`, `Concluída`), data/hora de conclusão e registro do último estado salvo.

- **Indicadores Pessoais do Jogador (Player Local Profile)**:
  Representa as estatísticas de hábito acumuladas localmente no dispositivo sem vínculo com conta centralizada.
  *Atributos conceituais*: Total de partidas jogadas, total de vitórias, taxa de sucesso percentual, distribuição de vitórias por tentativa, sequência atual de dias consecutivos jogados (*current streak*), maior sequência histórica (*max streak*) e data do último ciclo concluído.

- **Registro de Manifestação de Interesse (Interest Signal)**:
  Representa a intenção voluntária expressa pelo usuário sobre continuidade, apoio ou novas funcionalidades.
  *Atributos conceituais*: Tipo de interesse manifestado, timestamp de registro e dado de contato opcional (somente se necessário, voluntário e com consentimento informado).

- **Evento de Telemetria do Experimento (Analytics Signal)**:
  Representa o sinal comportamental emitido para aferição das hipóteses do experimento de produto.
  *Atributos conceituais*: Nome do evento funcional, timestamp do evento, identificador do ciclo do desafio e atributos agregados de contexto, sem dados pessoais identificáveis diretos.

---

## Success Criteria *(mandatory)*

### Functional Acceptance (Critérios de Aceitação do Software)

- **SC-001**: 100% dos usuários que acessam a aplicação conseguem iniciar e concluir o desafio do ciclo sem deparar-se com telas de login, cadastros obrigatórios ou solicitações de pagamento.
- **SC-002**: [RECLASSIFICADO / DEFERIDO PARA O PLAN: A responsividade técnica e o desempenho de carregamento permanecem regidos pelo Princípio XV da Constituição e pelos requisitos funcionais de usabilidade; critérios quantitativos objetivos de performance técnica serão definidos no Planejamento Técnico com base na arquitetura e em baselines reais, sem antecipação de thresholds arbitrários nesta especificação].
- **SC-003**: 100% dos desafios exibem, após o término da partida, nota de contextualização formativa e citação explícita de fonte documental adequada e verificável.
- **SC-004**: O estado da partida e os indicadores locais são recuperados com precisão ao recarregar a página ou reabrir o navegador no mesmo dispositivo durante o ciclo ativo.
- **SC-005**: 100% dos compartilhamentos gerados omitem a palavra secreta e qualquer spoiler direto da resposta, exibindo apenas o resumo de desempenho e o link da plataforma.
- **SC-006**: A interface satisfaz integralmente os critérios de acessibilidade funcional: navegação por teclado em todos os fluxos, contraste visual adequado, touch targets confortáveis sem exigência de precisão motora excessiva e suporte a ampliação de texto sem quebra de tela.

### Experiment Success (Sinais de Validação de Produto — Build to Learn)

> [!NOTE]
> Conforme definido na governança do Assess Decide (`[DECISION-PO-RISK-ACCEPTANCE]`), as taxas basais e metas numéricas de mercado encontram-se como `UNKNOWN` até que a primeira versão em produção gere medições reais. Os critérios abaixo descrevem os sinais a medir:

- **SC-007 (Engajamento e Conclusão)**: Capacidade de instrumentar e medir a taxa de conclusão de partidas iniciadas (sinal preliminar de adequação da mecânica ao público-alvo). Baseline: `[UNKNOWN — not measured yet]`; Target: `[UNKNOWN — to be calibrated with active experiment]`.
- **SC-008 (Retenção e Hábito Diário)**: Capacidade de medir a taxa de retorno de jogadores únicos locais em ciclos subsequentes (D1, D7 e D14), validando se a proposta periódica gera hábito (`[HYPOTHESIS-03]`). Baseline: `[UNKNOWN — not measured yet]`; Target: `[UNKNOWN — to be calibrated with active experiment]`.
- **SC-009 (Distribuição Comunitária)**: Capacidade de medir a taxa de acionamento do botão de compartilhamento entre usuários que concluem o desafio (`[HYPOTHESIS-04]`). Baseline: `[UNKNOWN — not measured yet]`; Target: `[UNKNOWN — to be calibrated with active experiment]`.
- **SC-010 (Sinal de Disposição a Apoiar)**: Capacidade de mensurar o volume de manifestações voluntárias de interesse na evolução da plataforma ou apoio financeiro futuro (`[HYPOTHESIS-01]`). Baseline: `[UNKNOWN — not measured yet]`; Target: `[UNKNOWN — to be calibrated with active experiment]`.

---

## Assumptions

### Premissas de Público e Escopo
- **Segmento Principal**: Adultos e idosos católicos que utilizam smartphones ou computadores convencionais para passatempos leves e valorizam conteúdo respeitoso de fé, história e cultura.
- **Canal Exclusivo Web**: A entrega inicial ocorre exclusivamente via Web responsiva acessível por navegadores modernos padrão; aplicativos nativos para lojas de apps estão fora do escopo inicial.
- **Volume Editorial Inicial [CANDIDATE SCOPE / SCOPE ASSUMPTION]**: Estima-se como hipótese de planejamento inicial um lote pré-produzido na faixa de 30 a 60 desafios para sustentar a fase de validação, cujo quantitativo exato será calibrado no Plan respeitando o apetite Small.

### Premissas Técnicas e Operacionais (Agnósticas)
- **Persistência no Cliente**: O dispositivo do usuário dispõe de capacidade padrão de armazenamento local para reter pequenos objetos de estado referentes ao jogo e estatísticas.
- **Conectividade Padrão de Navegação**: O produto é concebido para operação sob conectividade padrão de navegação Web; funcionamento offline integral, sincronização ou filas assíncronas de telemetria não constituem requisitos desta especificação.
- **Isenção de Pagamento Obrigatório no MVP**: O acesso aos desafios deste experimento inicial é integralmente gratuito, mantendo a monetização restrita a sinais voluntários de interesse.

---

## Boundaries & Constraints (Scope In & Scope Out)

### Escopo IN
- Aplicação Web responsiva acessível por navegadores em smartphones, tablets e desktop;
- Gameplay aberto sem conta, sem cadastro e sem senha obrigatória;
- Um único desafio periódico de palavras/letras ativo por ciclo;
- Feedback de tentativas compreensível e acessível sem dependência exclusiva de cor;
- Tela pós-jogo com revelação do termo, nota de contextualização e citação de fonte adequada;
- Armazenamento de estado da partida e indicadores de progresso no dispositivo do jogador;
- Geração de resumo de compartilhamento sem spoilers para aplicativos de mensagens;
- Seção opcional e não obstrutiva para manifestação voluntária de interesse ou apoio comunitário;
- Telemetria de sinais de produto e saúde operacional compatível com LGPD e ECA Digital;
- Acessibilidade e usabilidade voltada a adultos e idosos (controles confortáveis, navegação por teclado e texto redimensionável).

### Escopo OUT
- Suporte a funcionamento offline integral, sincronização de dados offline ou filas de telemetria offline;
- Aplicativos móveis nativos (Android / iOS) e publicação em lojas (Google Play / App Store);
- Palavras cruzadas matriciais clássicas de grade completa;
- Catálogo de jogos passados navegável ou múltiplos modos de jogo simultâneos;
- Sistema de login, cadastro obrigatório com e-mail/senha, OAuth social ou gerenciamento de perfis de usuário;
- Sincronização de progresso entre múltiplos dispositivos do mesmo usuário;
- Placares de líderes globais (*global leaderboards*), rankings competitivos ou competições em tempo real;
- Recursos de interação social interna (chat, comentários, fóruns ou perfis públicos);
- Economia virtual de jogos (moedas, vidas pagas, power-ups ou compras dentro do app);
- Gateways de pagamento transacional obrigatório ou assinaturas recorrentes formais;
- Plataforma B2B para escolas, catequese paroquial ou venda institucional;
- Painel administrativo complexo (CMS) ou geração de desafios por IA em tempo de execução (*runtime*);
- Arquitetura distribuída de microsserviços, orquestradores de containers ou barramentos de mensagens.

---

## Constitution Check

Auditoria de conformidade desta especificação contra a [Constituição do Cruzadas.online v1.0.0](file:///c:/dev/cruzadas-online/.specify/memory/constitution.md):

| Princípio Constitucional | Avaliação de Conformidade | Justificativa / Mecanismo na Spec |
| :--- | :---: | :--- |
| **I. Spec as Source of Truth** | **CONFORME** | A spec documenta o comportamento funcional esperado, sem delegar regras de negócio ao código não documentado. |
| **II. Simplicity & Complexity Control** | **CONFORME** | Escopo contido em um único formato de desafio sem cadastro, sem microsserviços e sem dependências distribuídas desnecessárias. |
| **III. Build to Learn** | **CONFORME** | Foco estrito em testar o *Problem Risk* e a hipótese de hábito diário (`[HYPOTHESIS-03]`) com instrumentação mínima necessária. |
| **IV. Reversibility** | **CONFORME** | Adoção de formato Web aberto com armazenamento local, decisão altamente reversível e de baixo custo de descarte se a hipótese falhar. |
| **V. Cost Consciousness** | **CONFORME NO NÍVEL DE SPECIFICATION** | Nenhuma tecnologia onerosa ou dependência de custo fixo imposta; viabilidade e arquitetura de custo mínimo serão verificadas no Plan. |
| **IX. Editorial Rigor** | **CONFORME** | Exigência de fonte adequada e verificável segundo a natureza da afirmação (e fonte de autoridade eclesial para temas de fé), com contextualização pós-jogo (`FR-010`, `FR-011`). |
| **X. AI is Assistive, Not Authoritative** | **CONFORME** | Proibição explícita de geração autônoma de conteúdos sem checagem humana prévia; IA restrita a suporte rascunhal editorial. |
| **XI. Copyright & Licensing** | **CONFORME** | Conteúdos delimitados a termos factuais, redação autoral própria e domínio público, com dúvidas classificadas como UNKNOWN (`FR-012`). |
| **XII. Privacy by Design** | **CONFORME** | Gameplay sem conta ou identificação obrigatória. Qualquer eventual tratamento de dados permanece separado, minimizado, com finalidade explícita e sujeito aos guardrails de privacidade (`FR-001` a `FR-003`, `FR-024`). |
| **XIII. Security by Default** | **CONFORME NO NÍVEL DE SPECIFICATION** | Requisitos funcionais concebidos sem exposição de credenciais ou dados pessoais desnecessários; salvaguardas técnicas detalhadas no Plan. |
| **XIV. Compliance as Product Req.** | **CONFORME** | Salvaguardas do ECA Digital e LGPD integradas desde o desenho funcional da especificação. |
| **XV. Responsive Behavior** | **CONFORME** | Requisitos mandatórios de usabilidade em smartphones, tablets e desktop (`FR-019`). |
| **XVI. I18n-Ready without Premature Loc.** | **CONFORME** | Experimento restrito ao português brasileiro (pt-BR), preservando estrutura limpa para eventual extensão futura. |
| **XVII. Testing Requirement** | **CONFORME NO NÍVEL DE SPECIFICATION** | Requisitos e cenários Given/When/Then são testáveis de modo independente; a estratégia concreta de testes automatizados será definida e verificada no Plan. |
| **XVIII. Accessibility as Part of DoD** | **CONFORME** | Navegação por teclado, foco perceptível, controles confortáveis e independência de cores especificados formalmente (`FR-008`, `FR-020` a `FR-022`). |
| **XIX. Observability without Privacy Intr.** | **CONFORME** | Sinais funcionais para hipóteses sem telemetria invasiva ou dados pessoais diretos/sensíveis (`FR-023`, `FR-024`). |
| **XX. Comprehensive Quality Gates** | **CONFORME NO NÍVEL DE SPECIFICATION** | Critérios funcionais objetivos e verificáveis definidos para compor a Definition of Done no planejamento e na implementação. |

---

## Unresolved Items & Future Clarifications

Todas as ambiguidades funcionais principais e residuais foram formalmente resolvidas com o Product Owner nas sessões de clarificação:
- **Mecânica Canônica e Vocabulário (`FR-006`, `FR-007`, `FR-008`)**: Adivinhação em 6 tentativas com pista temática inicial; cômputo posicional estrito para letras repetidas (prioridade exata, consumindo repetições e marcando excedentes como ausentes); equivalência ortográfica transparente na digitação (A-Z básico normalizado, com grafia editorial correta na revelação); vocabulário de termos únicos sem espaços/hífens aceitando palavras comuns e nomes próprios bíblicos/católicos relevantes (Option A).
- **Fronteira Temporal e Virada de Ciclo (`FR-013`, `FR-014`)**: Horário de Brasília (00:00 UTC-3) como fuso oficial unificado; aplicação incondicional da Opção A para todo o MVP (conclusão de partida que atravessa a meia-noite ou sessão prolongada por múltiplos dias pertence ao ciclo do desafio que foi iniciado e libera o desafio do ciclo corrente sem timeouts arbitrários); registro da decisão diretiva do PO `[FUTURE PRODUCT POLICY / STAKEHOLDER DECISION]` para a coexistência futura da Opção A (free tier permanente e planos pagos) e Opção C (outras modalidades futuras); bloqueio de rejogabilidade no mesmo ciclo.
- **Regras de Sequência de Dias (`FR-015`, `FR-016`)**: Conclusão de partida (vitória ou derrota) pontua para a constância do hábito; quebra de sequência em caso de dia civil ausente preservando recorde histórico; sem dark patterns ou punições coercitivas (Option A).

Nenhum marcador `[NEEDS CLARIFICATION]` pendente permanece na especificação funcional.
