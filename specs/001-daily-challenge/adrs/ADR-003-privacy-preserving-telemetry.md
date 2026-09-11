# ADR-003: Telemetria com Sink Agregado no Cloudflare D1 e Coortes Locais Anônimas

## Status
Proposed / Pending PO Gate

## Data
2026-09-11

## Contexto e Problema
A estratégia experimental *Build to Learn* (Princípio III da Constituição) requer observar sinais comportamentais para validar hipóteses de produto:
- Acesso à página e início de partida;
- Conclusão e desfecho do desafio;
- Retorno voluntário entre ciclos (D1, D7, D14);
- Compartilhamento voluntário e manifestação de interesse/apoio.

Simultaneamente, os princípios de privacidade por design e minimização de dados (Princípio XII da Constituição, LGPD e ECA Digital) exigem:
- Gameplay sem criação de contas;
- Proibição de cookies de rastreamento entre sites e identificadores persistentes de hardware (*fingerprinting*);
- Não correlação de perfis comportamentais individuais.

O desafio técnico consiste em capturar métricas úteis para o experimento sem reter dados individuais desnecessários e sem comprometer a simplicidade de operação do desenvolvedor solo.

## Simplificação do Telemetry Sink: Apenas Contadores Agregados no D1
Reavaliou-se a real necessidade de persistir linhas de eventos individuais (`telemetry_events`):
- Nenhuma hipótese do experimento atual exige rastrear o histórico sequencial ou temporal minuto a minuto de um usuário anônimo;
- A persistência de eventos brutos consumiria desnecessariamente a quota diária de escrita do D1 (medida em linhas gravadas);
- **Decisão de Simplificação**: Elimina-se a tabela de eventos individuais (`telemetry_events`) e qualquer política arbitrária de retenção de 90 dias de logs brutos;
- O coletor Cloudflare D1 conterá **exclusivamente tabelas de métricas agregadas** atualizadas via operações atômicas de UPSERT/incremento:
  1. `daily_metrics (cycle_date TEXT, metric_name TEXT, dimension TEXT, count INTEGER, PRIMARY KEY (cycle_date, metric_name, dimension))`:
     - Exemplo: `INSERT INTO daily_metrics VALUES ('2026-09-11', 'game_completed', 'won_attempt_4', 1) ON CONFLICT(cycle_date, metric_name, dimension) DO UPDATE SET count = count + 1;`
  2. `cohort_metrics (cohort_cycle_id TEXT, milestone TEXT, count INTEGER, PRIMARY KEY (cohort_cycle_id, milestone))`:
     - Armazena contadores de início de coorte (`milestone = 'started'`) e de retorno (`milestone = 'D1'`, `'D7'`, `'D14'`).
- **Atenção a Quotas**: A quota do Cloudflare D1 Free é de **100.000 linhas gravadas por dia**, e **NÃO** 100.000 eventos de telemetria. Cada chamada de telemetria que atualiza métricas consome linhas de gravação conforme a instrução SQL executada.

## Definição Inequívoca de Coortes Locais Anônimas
Para permitir o cômputo de estimativas indicativas de retenção com numerador e denominador definidos:
1. **Definição de `cohortCycleId`**: O ciclo de coorte é **estritamente o `originCycleId` do primeiro desafio concluído com sucesso ou término de tentativas pelo jogador**;
   - *Exemplo*: Jogador inicia o desafio do Dia 10 no Dia 10, mas só o conclui no Dia 12. A sua coorte é e permanece sendo o **Dia 10** (`cohortCycleId = "2026-09-10"`). O sinal `cohort_started` é transmitido no Dia 12, mas referencia a coorte de origem do Dia 10;
   - O marco D1 corresponde estritamente ao Dia 11 (`originCycleId + 1`). Como o Dia 11 não foi jogado, o marco D1 **não é obtido retroativamente**;
2. **Denominador**: O total de eventos `cohort_started` registrados para uma determinada data de coorte;
3. **Numerador**: O total de eventos `cohort_milestone` registrados para aquela coorte nos marcos `D1`, `D7` e `D14`;
4. **Estimativa Agregada**:
   $$	ext{Estimativa de Retenção (D}_n) = rac{	ext{Contador cohort\_metrics}(D_n, 	ext{coorte } X)}{	ext{Contador cohort\_metrics}(	ext{'started'}, 	ext{coorte } X)}$$

## Remoção de `game_abandoned`
O conceito de abandono inferido conflitava com a regra de que uma partida em andamento pode ser retomada e concluída dias depois. Como não é possível distinguir com confiabilidade abandono definitivo de interrupção temporária sem introduzir timeouts artificiais ou rastreamento invasivo, **o evento `game_abandoned` é formalmente excluído do MVP**. A impossibilidade de medir abandono permanente de forma estrita permanece como limitação analítica aceita do modelo sem contas do Shape 1.

## Limitações Analíticas Declaradas
- Telemetria sob regime de melhor esforço: bloqueadores de anúncios de rede, falhas de conectividade ou esgotamento de quota podem ocasionar perda de entrega de eventos;
- Limpeza de armazenamento local reinicia coortes;
- As métricas geram uma **estimativa comportamental direcional e comparável de retenção D1/D7/D14 para fins de aprendizado do experimento**, sem pretensão de precisão censitária absoluta.

## Decisão
Proposta a adoção do **Sink Agregado em Cloudflare D1 com Coortes Locais Anônimas**, eliminando logs brutos individuais e o evento `game_abandoned`.

## Consequências
- Custo zero de armazenamento dentro das cotas de gravação de linhas do D1;
- Máxima preservação da privacidade e conformidade intencional com a LGPD e ECA Digital;
- Estimativa comportamental direcional e comparável de retenção D1/D7/D14 para fins de aprendizado do experimento.
