# Baseline de Performance e Core Web Vitals (Laboratório)

> **AVISO METODOLÓGICO**: Os valores registrados abaixo correspondem a medições laboratoriais (*lab values*) obtidas sob perfil controlado de emulação em navegador Chromium real (Google Chrome Headless v152). Eles fornecem comprovação empírica de conformidade do artefato com os envelopes de desempenho do critério de sucesso **SC-002**, e **não devem** ser confundidos com dados agregados de campo do percentil 75 (*field p75 metrics*), os quais dependem de tráfego real em produção via CrUX / Cloudflare Web Analytics.

---

## 1. Metadados do Experimento

- **Data da Medição**: 2026-09-14T20:28:24.780Z
- **Ambiente de Execução**: Windows (Google Chrome `152.0.7977.77`)
- **Ferramenta de Coleta**: Chrome DevTools Protocol (CDP) + `PerformanceObserver` (W3C Event Timing API, Layout Instability API, LCP API)
- **Branch / Build**: `001-daily-challenge` / Vite 8.1.5 (`dist/client/`)
- **Perfil de Rede (Throttling)**: Mobile 3G/4G Controlado (Latência: 150 ms RTT, Download: 1.6 Mbps, Upload: 750 kbps)
- **Perfil de CPU (Throttling)**: 4x CPU Slowdown (Emulação de hardware mobile intermediário)
- **Viewport de Referência**: 360 x 640 CSS px (DPR 2.0, Mobile: true)

---

## 2. Medições Obtidas em Laboratório vs Metas do Critério SC-002

| Métrica Core Web Vital | Meta SC-002 (Plan) | Valor Medido em Lab | Status Lab | Observação |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (*Largest Contentful Paint*) | &le; 2.5 s (2500 ms) | **1956.0 ms** | ✅ **APROVADO** | Renderização do tabuleiro e enigma inicial dentro do orçamento |
| **CLS** (*Cumulative Layout Shift*) | &le; 0.100 | **0.000** | ✅ **APROVADO** | Grade e teclado estáticos sem deslocamentos inesperados de layout |
| **INP** (*Interaction to Next Paint*) | &le; 200 ms | **72.0 ms** | ✅ **APROVADO** | Medição empírica via Event Timing API acionando digitação no teclado virtual |

---

## 3. Tamanho dos Pacotes de Produção (`dist/client/assets`)

| Tipo de Ativo | Tamanho Não Comprimido (Raw) | Tamanho Comprimido (Gzip) | Orçamento SC-002 |
| :--- | :--- | :--- | :--- |
| **JavaScript (`index-*.js`)** | 283.01 kB | **88.24 kB** | < 400 kB raw (inclui léxico offline PT completo) |
| **CSS (`index-*.css`)** | 31.51 kB | **6.33 kB** | < 60 kB raw |

---

## 4. Verificação de Responsividade em Viewports Estreitos

Medição de `scrollWidth <= clientWidth` no elemento raiz (`<html>`):

| Viewport Testado | Largura de Rolagem (`scrollWidth`) | Largura do Cliente (`clientWidth`) | Transbordamento Horizontal (`hasOverflow`) |
| :--- | :--- | :--- | :--- |
| **320 x 568** (iPhone SE / Telas Mínimas) | 320 px | 320 px | **✅ ZERO TRANSBORDAMENTO** |
| **360 x 640** (Android Padrão) | 360 px | 360 px | **✅ ZERO TRANSBORDAMENTO** |
| **375 x 667** (iPhone 8 / SE2) | 375 px | 375 px | **✅ ZERO TRANSBORDAMENTO** |
