# Telemetry & Analytics Contract: Coletor Agregado e Sinais de Validação

**Finalidade**: Especificar os sinais analíticos e o modelo de coletor durável para a validação das hipóteses de produto (`Build to Learn`), concebidos sob privacidade por design e minimização estrita de dados (sem cookies de terceiros, sem identificadores de hardware, sem dados pessoais).

---

## 1. Endpoint Receptor (Cloudflare Worker API)
- **Rota Canônica Única**: `POST /api/telemetry` (executada pelo Worker API em `worker/index.ts`)
- **Content-Type**: `application/json`
- **Transporte no Cliente**: `navigator.sendBeacon` com fallback para `fetch(..., { keepalive: true })` encapsulado em bloco de tratamento de erro (*fire-and-forget*). Falhas de rede ou de entrega são completamente não bloqueantes para o jogador.
- **Armazenamento Durável (Telemetry Sink)**:
  - **Provedor**: Cloudflare D1 (banco relacional serverless SQLite na borda, vinculado ao Worker via binding nativo `env.DB`);
  - **Modelo Exclusivamente Agregado**: Não há armazenamento de linhas de eventos individuais brutos nem logs com IP. O D1 armazena exclusivamente contadores consolidados atualizados via operações atômicas de UPSERT/incremento:
    1. Tabela `daily_metrics`:
       - Schema: `(cycle_date TEXT, metric_name TEXT, dimension TEXT, count INTEGER, PRIMARY KEY (cycle_date, metric_name, dimension))`
       - Exemplo de UPSERT: `INSERT INTO daily_metrics VALUES ('2026-09-11', 'game_completed', 'won_attempt_4', 1) ON CONFLICT(cycle_date, metric_name, dimension) DO UPDATE SET count = count + 1;`
    2. Tabela `cohort_metrics`:
       - Schema: `(cohort_cycle_id TEXT, milestone TEXT, count INTEGER, PRIMARY KEY (cohort_cycle_id, milestone))`
       - Armazena contadores de início de coorte (`milestone = 'started'`) e marcos de retorno (`milestone = 'D1'`, `'D7'`, `'D14'`).
  - **Quotas e Métricas do Free Tier**:
    - O plano Cloudflare D1 Free limita **linhas gravadas por dia** (atualmente 100.000 gravações de linhas/dia) e **linhas lidas** (5.000.000 linhas/dia). **Não se trata de 100.000 eventos/dia**, pois cada requisição pode gerar uma ou mais gravações de linhas dependendo do número de métricas incrementadas e dos índices afetados;
    - Cloudflare Workers Free limita a **100.000 requisições/dia** para a execução do Worker API (rotas `/api/*`). Requisições de assets estáticos do SPA servidas diretamente por Static Assets não consomem a cota de execução do Worker;
  - **Semântica de Falha de Quota**:
    - Se a quota de gravação do D1 for excedida enquanto o Worker ainda puder executar, o endpoint captura a exceção e responde HTTP 204 sem registrar a métrica;
    - Se a quota global diária de 100.000 requisições do Workers Free for totalmente esgotada, a infraestrutura da Cloudflare bloqueia as requisições com erro de borda (HTTP 429 / 1015), impossibilitando a execução do Worker e a geração de respostas HTTP 204 customizadas;
    - Como o cliente dispara telemetria de forma desacoplada com captura de exceções, **a jogabilidade nunca é interrompida ou degradada por erros de quota de telemetria**;
    - Risco Operacional Aceito: Sob tráfego experimental inicial, as quotas gratuitas são consideradas adequadas. Caso o volume real se aproxime dos limites, o plano será reavaliado pelo mantenedor.

---

## 2. Dicionário de Eventos

### 2.1 `page_view`
Disparado no carregamento da aplicação web.
```json
{
  "eventType": "page_view",
  "cycleId": "2026-09-11",
  "timestamp": "2026-09-11T13:45:00.000Z"
}
```

### 2.2 `game_started`
Disparado na primeira submissão de tentativa válida pelo usuário.
```json
{
  "eventType": "game_started",
  "cycleId": "2026-09-11",
  "timestamp": "2026-09-11T13:46:10.000Z"
}
```

### 2.3 `game_completed`
Disparado quando a partida é finalizada com vitória ou esgotamento de tentativas.
```json
{
  "eventType": "game_completed",
  "cycleId": "2026-09-11",
  "timestamp": "2026-09-11T13:48:30.000Z",
  "properties": {
    "outcome": "won",
    "attemptsUsed": 4,
    "originCycleId": "2026-09-11",
    "currentStreak": 1
  }
}
```

### 2.4 `cohort_started`
Disparado uma única vez na primeira conclusão de partida no dispositivo.
- `cohortCycleId` é estritamente o `originCycleId` do primeiro desafio concluído;
- Exemplo: Partida do Dia 10 concluída com atraso no Dia 12 transmite `cohort_started` no Dia 12, mas com `cohortCycleId = "2026-09-10"`.
```json
{
  "eventType": "cohort_started",
  "cycleId": "2026-09-12",
  "timestamp": "2026-09-12T13:48:30.000Z",
  "properties": {
    "cohortCycleId": "2026-09-10"
  }
}
```

### 2.5 `cohort_milestone`
Disparado quando um jogador conclui um desafio correspondente a 1, 7 ou 14 dias civis após o seu `cohortCycleId`.
- No exemplo de coorte do Dia 10: D1 corresponde ao Dia 11. Se o Dia 11 não foi jogado, D1 **não é obtido retroativamente**;
- No máximo um evento por marco por dispositivo.
```json
{
  "eventType": "cohort_milestone",
  "cycleId": "2026-09-17",
  "timestamp": "2026-09-17T10:15:00.000Z",
  "properties": {
    "cohortCycleId": "2026-09-10",
    "milestone": "D7"
  }
}
```

### 2.6 `share_clicked`
Disparado quando o jogador aciona o botão de compartilhamento voluntário sem spoilers.
```json
{
  "eventType": "share_clicked",
  "cycleId": "2026-09-11",
  "timestamp": "2026-09-11T13:49:00.000Z",
  "properties": {
    "shareChannel": "clipboard"
  }
}
```

### 2.7 `interest_expressed` (Manifestação Voluntária de Interesse P3)
Disparado quando o usuário aciona o card voluntário pós-jogo de interesse ou apoio.
```json
{
  "eventType": "interest_expressed",
  "cycleId": "2026-09-11",
  "timestamp": "2026-09-11T13:50:00.000Z",
  "properties": {
    "interestTopic": "general_support"
  }
}
```

---

## 3. Limitações Analíticas Declaradas
1. **Ausência de Abandono Permanente Mensurável**: A exclusão de `game_abandoned` reflete o fato de que, no modelo de estado local e jogo anônimo sem timeouts artificiais, o abandono permanente não é confiavelmente distinguível de sessões temporariamente pausadas. Trata-se de uma limitação analítica deliberadamente aceita do Shape 1;
2. **Entrega de Telemetria de Melhor Esforço**: Bloqueadores de rede, instabilidade do cliente ou limites de quota podem ocasionar perda de eventos. As taxas de retenção constituem **estimativas comportamentais direcionais**, e não métricas de precisão censitária;
3. **Limpeza de Armazenamento Local**: A exclusão de dados locais pelo jogador reinicia o dispositivo em uma nova coorte no próximo desafio concluído.
