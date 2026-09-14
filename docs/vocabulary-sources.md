# Fontes de Vocabulário e Licenciamento Léxico

Este documento descreve a proveniência, licenciamento, cadeia de custódia e pipeline de geração do vocabulário aceito para palpites no **Cruzadas.online**.

---

## 1. Fonte Lexical Principal (Geral pt-BR)

* **Projeto Upstream**: Projeto VERO (Verificador Ortográfico do LibreOffice para Português do Brasil) / The Document Foundation
* **Repositório Oficial**: [`LibreOffice/dictionaries`](https://github.com/LibreOffice/dictionaries/tree/master/pt_BR)
* **Snapshot / Commit Utilizado**: `1e848fbddd7fd8e03fb696ecc03ee1068fab141c` (13 de junho de 2026)
* **Arquivos Locais em Custódia**:
  * `vendor/vocabulary/libreoffice-vero/README_pt_BR.txt`
  * `vendor/vocabulary/libreoffice-vero/pt_BR.dic`
  * `vendor/vocabulary/libreoffice-vero/pt_BR.aff`
* **Licenciamento**: Dupla licença sob:
  * **GNU Lesser General Public License versão 3 (LGPLv3)**
  * **Mozilla Public License (MPL)**
* **Autoria e Atribuição**:
  * Raimundo Santos Moura `<raimundo.smoura@gmail.com>` e equipe do Projeto VERO.
  * Colaboradores da comunidade brasileira do LibreOffice e The Document Foundation.
  * O aviso integral de copyright e créditos encontra-se preservado verbatim em `vendor/vocabulary/libreoffice-vero/README_pt_BR.txt`.

---

## 2. Vocabulário Suplementar Católico e Bíblico

* **Arquivo de Origem**: [`content/vocabulary/catholic-pt-br.txt`](../content/vocabulary/catholic-pt-br.txt)
* **Responsabilidade**: Curadoria editorial interna do projeto Cruzadas.online.
* **Propósito**: Suprir nomes próprios bíblicos e hagiográficos (ex.: `PEDRO`, `PAULO`, `JESUS`, `MARIA`, `BENTO`), títulos litúrgicos e termos teológicos legítimos da tradição católica que não constam como palavras comuns no léxico ortográfico genérico.
* **Critério de Inclusão**: Termos historicamente documentados na Sagrada Escritura, Tradição e Magistério da Igreja Católica. Não são aceitos termos arbitrários ou grafias estrangeiras não aportuguesadas sem justificativa de domínio.

---

## 3. Pipeline de Transformação e Geração Determinística

A geração dos artefatos de tempo de execução é executada pelo script determinístico [`scripts/generate-vocabulary.ts`](../scripts/generate-vocabulary.ts):

1. **Leitura e Extração**:
   * O arquivo `vendor/vocabulary/libreoffice-vero/pt_BR.dic` é lido linha a linha.
   * O radical da palavra antes da barra `/` de afixos é extraído.
   * Regras de pluralização produtivas da regra `B` do arquivo `pt_BR.aff` são aplicadas determinísticamente (ex.: `-s`, `-es`, `-ões`, `-is`, `-ns`).
   * Palavras compostas com hífen são decompostas em seus constituintes simples (ex.: `casa-forte` gera `casa` e `forte`), resolvendo a ausência de substantivos isolados presentes apenas em formas compostas.
2. **Integração do Suplemento Católico**:
   * O arquivo `content/vocabulary/catholic-pt-br.txt` é integrado ao mesmo fluxo.
3. **Normalização Ortográfica**:
   * Decomposição canônica Unicode NFD.
   * Remoção de sinais diacríticos (`[\u0300-\u036f]`) preservando equivalência estrita (ex.: `GRAÇA` → `GRACA`, `AÇÃO` → `ACAO`, `JOÃO` → `JOAO`, `SÃO` → `SAO`).
   * Conversão para maiúsculas (ASCII A-Z).
4. **Filtragem Estrita**:
   * Descarte de entradas contendo espaços, dígitos, pontuação ou caracteres não alfabéticos.
   * Manutenção exclusiva de palavras únicas formadas por `[A-Z]+`.
5. **Deduplicação e Particionamento por Tamanho**:
   * As palavras são agrupadas em *buckets* de acordo com seu comprimento (`wordLength`).
   * As entradas de cada tamanho são deduplicadas e ordenadas alfabeticamente.
   * Cada partição é gravada em `public/data/vocabulary/{length}.txt` (um termo por linha, terminador LF `\n`).

---

## 4. Invariante de Segurança das Respostas dos Desafios (Secret Invariant)

1. **Nunca Bloquear Desafio Ativo**: O termo diário normalizado (`normalizedWord`) do desafio atualmente carregado é sempre aceito em memória pelo `VocabularyService` no cliente, garantindo que o enigma seja sempre solucionável mesmo que a palavra não conste no dicionário genérico.
2. **Zero Exposição de Desafios Futuros**: Os arquivos públicos `public/data/vocabulary/*.txt` são gerados **exclusivamente** a partir das fontes léxicas (`vendor/` e `content/vocabulary/`). O script de vocabulário **não lê** os arquivos `content/challenges/*.json` e não inclui segredos de ciclos futuros no pacote estático público.

---

## 5. Procedimento de Atualização do Vocabulário

Para atualizar o vocabulário a partir de novas versões do LibreOffice VERO ou adicionar termos católicos:

1. **Para novos termos católicos**:
   * Edite `content/vocabulary/catholic-pt-br.txt` adicionando a palavra (uma por linha).
   * Execute:
     ```bash
     npm run generate:vocabulary
     ```
2. **Para atualização do LibreOffice VERO**:
   * Atualize os arquivos em `vendor/vocabulary/libreoffice-vero/` a partir do repositório upstream oficial.
   * Atualize a referência de commit e data neste documento.
   * Execute `npm run generate:vocabulary`.
   * Execute a suíte completa de testes:
     ```bash
     npm test
     ```
