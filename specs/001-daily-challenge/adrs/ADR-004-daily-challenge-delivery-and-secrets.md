# ADR-004: Entrega do Desafio Ativo via Worker API e Empacotamento Server-Side sem Exposição de Desafios Futuros

## Status
Proposed / Pending PO Gate

## Data
2026-09-11

## Contexto e Problema
A especificação (`spec.md`) e os requisitos funcionais (`FR-004`, `FR-010` a `FR-012`) exigem que cada ciclo diário apresente exatamente um único desafio ativo, com revelação do termo, nota de contextualização e citação de fonte adequada após o término.

A engenharia deve garantir:
*Como entregar o desafio do ciclo ativo com velocidade e robustez, garantindo que as respostas dos desafios futuros (próximos 14 a 30 dias) não fiquem expostas publicamente para raspagem em lote em URLs estáticas previsíveis e sem assumir acesso a sistema de arquivos em runtime?*

## Mecanismo Canônico: Endpoint Worker API `GET /api/challenge/today` e Registro Server-Side
Eliminam-se caminhos alternativos de entrega em produção. O mecanismo único oficial opera através do Worker API integrado a um gerador de registro em tempo de build:
1. **Fonte Editorial**: Arquivos individuais versionados em `content/challenges/YYYY-MM-DD.json`;
2. **Esteira de Build e Empacotamento Server-Side**:
   - `npm run validate:content`: Valida todos os arquivos de desafios contra o schema e assegura compulsoriamente que `wordLength === normalizedWord.length`, rejeitando desafios com status `Draft` para builds de produção;
   - `npm run generate:registry`: Script (`scripts/generate-challenge-registry.ts`) que lê `content/challenges/` e compila um módulo TypeScript interno do servidor (`worker/generated/challenge-registry.ts`);
   - O Worker API (`worker/index.ts`) importa esse registro estaticamente para dentro do seu bundle de execução server-side;
   - **Nenhum arquivo de desafio futuro é copiado para os assets públicos do SPA (`dist/client/`)**;
3. **Comportamento do Endpoint `GET /api/challenge/today`**:
   - A função calcula a data civil oficial de Brasília (`America/Sao_Paulo`, UTC-3) utilizando o relógio confiável do servidor, e **NÃO** o relógio do dispositivo do usuário;
   - Consulta o registro em memória e responde exclusivamente com os dados do desafio do ciclo ativo;
4. **Sessões Atrasadas Legítimas**:
   - O endpoint aceita o parâmetro opcional `GET /api/challenge/today?date=YYYY-MM-DD` para permitir a recuperação de um desafio de data passada que o usuário esteja concluindo;
   - Se a data solicitada for posterior à data civil oficial de Brasília, a função retorna HTTP 404 (`Challenge Not Available`), impedindo a antecipação de conteúdo futuro;
5. **Risco Operacional de Quota Aceito**:
   - Como a entrega do desafio depende da execução do Worker API, a exaustão da quota diária de Workers Free (100.000 requisições/dia) pode temporariamente impedir o carregamento do novo desafio diário. Este risco é aceito para a fase inicial de experimentação sob baixo volume de tráfego.

## Estrutura do Desafio e Tamanho Dinâmico de Palavra
- A palavra secreta e sua contextualização são servidas com a propriedade `wordLength` derivada obrigatoriamente de `normalizedWord.length`, adaptando a interface dinamicamente sem fixações arbitrárias em 5 letras;
- A validação pré-build em CI rejeita compilações se houver divergência entre `wordLength` e `normalizedWord.length`.

## Decisão
Proposta a adoção do **Endpoint Worker API `GET /api/challenge/today`** alimentado por registro compilado server-side, garantindo isolamento estrito de desafios futuros fora dos assets públicos do cliente.

## Consequências
- Proteção robusta contra spoilers e vazamentos antecipados em redes sociais;
- Integridade temporal unificada no Horário Oficial de Brasília (UTC-3);
- Dependência de infraestrutura serverless mapeada de forma transparente;
- Zero necessidade de banco de dados remoto para o acervo de desafios no Shape 1.
