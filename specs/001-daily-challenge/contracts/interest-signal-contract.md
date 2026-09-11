# Interest Signal Contract: Manifestação Voluntária de Interesse (P3)

**Finalidade**: Formalizar a sinalização voluntária de interesse ou apoio comunitário (`FR-003`), totalmente desacoplada da jogabilidade básica, sem coleta de dados pessoais (PII) e utilizando a rota canônica de telemetria.

---

## 1. Interface de Usuário
- **Localização**: Tela pós-jogo (abaixo dos botões de compartilhamento e indicadores de estatísticas);
- **Formato**: Card de acolhimento não coercitivo:
  - Título: *"Gostou da proposta do Cruzadas.online?"*
  - Descrição: *"Estamos construindo passatempos inteligentes com a riqueza da cultura e tradição católica. Toque abaixo se você deseja ver novos jogos e apoiar esta iniciativa."*
  - Ação: Botão `[ Tenho interesse no projeto ]`

---

## 2. Mecânica de Registro Canônica
- O acionamento emite o evento `interest_expressed` através do endpoint unificado de telemetria `POST /api/telemetry`:
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
- **Resposta**: `204 No Content`;
- **Feedback na Interface**: O botão é sutilmente desabilitado e apresenta a mensagem de gratidão:
  > *"Que alegria saber disso! Obrigado pelo seu incentivo. Que Deus abençoe sua jornada."*
- **Estado Local**: O registro do clique no ciclo ativo é salvo em `localStorage` para evitar submissões repetidas para o **mesmo ciclo ativo**;
- **Privacidade**: Zero campos de preenchimento obrigatório; zero coleta de nome, e-mail ou telefone nesta fase experimental.
