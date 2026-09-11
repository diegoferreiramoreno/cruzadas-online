# ADR-002: Seleção da Stack Frontend, Toolchain 2026 e Integração com Vite

## Status
Proposed / Pending PO Gate

## Data
2026-09-11

## Contexto e Problema
O frontend do Cruzadas.online (Shape 1) precisa entregar:
- Experiência Web responsiva em smartphones, tablets e computadores (Princípio XV da Constituição);
- Acessibilidade normatizada pela WCAG 2.2 AA como baseline mínimo, combinada com alvos ergonômicos deliberados (>= 44/48px) para adultos e idosos;
- Motor determinístico de jogo testável com alta velocidade e rigor de invariantes (Princípio XVII);
- Complexidade controlada para mantenedor solo (Princípio II);
- Toolchain moderno, ativamente mantido e rigorosamente compatível entre si no estado de 2026;
- Integração limpa entre o build do SPA e os Workers Static Assets da Cloudflare.

## Avaliação de Compatibilidade do Toolchain 2026
Para evitar incompatibilidades de peer-dependencies e quebras de ecossistema, fixam-se as versões principais:
1. **Node.js**: Versão **24 LTS** (Active LTS em 2026; Node 20 encontra-se EOL);
2. **React / React DOM**: Versão **19.3.x** (`~19.3.0`), moderna e estável;
3. **Vite**: Versão **8.1.x** (`~8.1.0`), com `@vitejs/plugin-react` e `@cloudflare/vite-plugin` para integração fluida entre o SPA estático e o Worker API;
4. **TypeScript**: Versão **6.0.x** (`~6.0.2`).  
   *Racional de Compatibilidade*: Não se adota TypeScript 7 prematuramente porque o suporte oficial de `typescript-eslint` e da suíte de ferramentas de análise estática consolida-se em TypeScript 6.0 (com restrições acima de 6.1). A escolha de TypeScript 6.0.x representa uma decisão deliberada de estabilidade e compatibilidade;
5. **Tailwind CSS**: Versão **4.3.x** (`~4.3.0`) integrada via `@tailwindcss/vite`, com compilação direta sem PostCSS legado;
6. **Vitest**: Versão **5.x** (`~5.0.0`), alinhada nativamente ao Vite 8;
7. **ESLint**: Versão **10.x** (`~10.0.0`) com Flat Config e versão estável de `typescript-eslint` compatível com ESLint 10 e TypeScript 6.0;
8. **Reprodutibilidade de Build**: A reprodutibilidade das compilações e pipelines de CI será garantida por arquivo de trava estrito (`package-lock.json` via `npm ci`).

## Segurança e Higiene de Renderização
A segurança da interface é tratada com precisão técnica:
- O React realiza o escape de strings interpoladas por padrão em JSX, reduzindo significativamente os riscos mais comuns de injeção de DOM-XSS;
- Contudo, **o React não elimina o XSS por si só**: injeções permanecem possíveis via atributos perigosos (como `href` com esquemas `javascript:`), manipulação insegura de APIs do navegador, dependências de terceiros vulneráveis ou métodos de bypass;
- Portanto, mantém-se a higiene obrigatória de entrada e saída, auditoria contínua de dependências (`npm audit`) e cabeçalhos estritos de Content Security Policy (CSP) na distribuição via Cloudflare Workers Static Assets.

## Metas de Performance
A performance da aplicação adota as recomendações oficiais do framework **Core Web Vitals do Google** para boa experiência de usuário (medidas no percentil 75 em dispositivos móveis reais):
- **LCP (Largest Contentful Paint)**: <= 2.5 segundos;
- **INP (Interaction to Next Paint)**: <= 200 milissegundos;
- **CLS (Cumulative Layout Shift)**: <= 0.1;
- O tamanho do bundle JS será medido e monitorado como *baseline* contínuo no build.

## Decisão
Proposta a adoção do toolchain: **Node.js 24 LTS + React 19.3.x + Vite 8.1.x + TypeScript 6.0.x + Tailwind CSS 4.3.x + Vitest 5.x + ESLint 10.x + @cloudflare/vite-plugin**, com reprodutibilidade via `package-lock.json`.

## Consequências
- Código fortemente tipado em TypeScript 6.0 sem conflitos de eslint;
- Motor determinístico desacoplado em `src/engine/` testável em milissegundos;
- Integração de build nativa gerando os assets do SPA para static assets e o Worker para as rotas de API.
