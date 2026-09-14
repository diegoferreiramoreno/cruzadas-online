import fs from 'node:fs';
import path from 'node:path';

function normalizeWord(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function expandPluralB(word: string): string[] {
  const forms: string[] = [word];
  if (/ão$/i.test(word)) {
    forms.push(word.slice(0, -2) + 'ões');
  } else if (/il$/i.test(word)) {
    forms.push(word.slice(0, -1) + 's');
  } else if (/[^i]l$/i.test(word)) {
    forms.push(word.slice(0, -1) + 'is');
  } else if (/m$/i.test(word)) {
    forms.push(word.slice(0, -1) + 'ns');
  } else if (/[rsz]$/i.test(word)) {
    forms.push(word + 'es');
  } else if (/[a-záàâãéêíóôõúüç]$/i.test(word)) {
    forms.push(word + 's');
  }
  return forms;
}

function generateVocabulary(): void {
  const rootDir = process.cwd();
  const dicPath = path.join(rootDir, 'vendor', 'vocabulary', 'libreoffice-vero', 'pt_BR.dic');
  const catholicPath = path.join(rootDir, 'content', 'vocabulary', 'catholic-pt-br.txt');
  const outDir = path.join(rootDir, 'public', 'data', 'vocabulary');

  if (!fs.existsSync(dicPath)) {
    console.error(`[ERROR] Upstream dictionary not found at ${dicPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const byLength = new Map<number, Set<string>>();

  function addWord(raw: string, flags = ''): void {
    if (!/^[a-zA-ZáàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ-]+$/.test(raw)) return;

    // Split compound forms on hyphens so constituent words are individually available
    const parts = raw.includes('-') ? raw.split('-') : [raw];
    for (const part of parts) {
      if (!/^[a-zA-ZáàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]+$/.test(part)) continue;
      const candidates = [part];
      if (flags.includes('B')) {
        candidates.push(...expandPluralB(part));
      }
      for (const cand of candidates) {
        const norm = normalizeWord(cand);
        if (!/^[A-Z]+$/.test(norm)) continue;
        const len = norm.length;
        if (!byLength.has(len)) byLength.set(len, new Set());
        byLength.get(len)!.add(norm);
      }
    }
  }

  console.log('[VOCABULARY] Processing LibreOffice VERO pt_BR.dic...');
  const dicContent = fs.readFileSync(dicPath, 'utf8');
  const dicLines = dicContent.split(/\r?\n/);
  for (let i = 1; i < dicLines.length; i++) {
    const line = dicLines[i].trim();
    if (!line) continue;
    const [entry, flags = ''] = line.split('/');
    addWord(entry.trim(), flags);
  }

  if (fs.existsSync(catholicPath)) {
    console.log('[VOCABULARY] Processing Catholic/Biblical supplemental vocabulary...');
    const catholicContent = fs.readFileSync(catholicPath, 'utf8');
    const catholicLines = catholicContent.split(/\r?\n/);
    for (const line of catholicLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      addWord(trimmed);
    }
  }

  // Verification of mandatory MVP words
  const mandatoryWords = ['MISSA', 'PEDRO', 'PAULO', 'MARIA', 'JESUS', 'BENTO', 'GRACA', 'CASA', 'CASAS', 'SAO', 'ACAO', 'JOAO'];
  for (const word of mandatoryWords) {
    const len = word.length;
    const exists = byLength.get(len)?.has(word) ?? false;
    if (!exists) {
      console.error(`[ERROR] Mandatory word "${word}" (len ${len}) was NOT accepted by the vocabulary generator!`);
      process.exit(1);
    }
  }

  // Verification of forbidden nonwords
  const forbiddenNonwords = ['AAAAA', 'BRASI', 'QWERT'];
  for (const nonword of forbiddenNonwords) {
    const len = nonword.length;
    const exists = byLength.get(len)?.has(nonword) ?? false;
    if (exists) {
      console.error(`[ERROR] Nonword "${nonword}" was erroneously accepted!`);
      process.exit(1);
    }
  }

  console.log('[VOCABULARY] Writing length-partitioned vocabulary files...');
  const sortedLengths = Array.from(byLength.keys()).sort((a, b) => a - b);
  let totalEntries = 0;

  for (const len of sortedLengths) {
    const wordsSet = byLength.get(len)!;
    const sortedWords = Array.from(wordsSet).sort();
    totalEntries += sortedWords.length;
    const outPath = path.join(outDir, `${len}.txt`);
    fs.writeFileSync(outPath, sortedWords.join('\n') + '\n', 'utf8');
  }

  console.log(`[VOCABULARY] Successfully generated vocabulary across ${sortedLengths.length} length buckets.`);
  console.log(`[VOCABULARY] Total unique normalized entries: ${totalEntries}`);
  for (const len of sortedLengths) {
    if (len >= 3 && len <= 12) {
      console.log(`  - Length ${len}: ${byLength.get(len)!.size} words`);
    }
  }
}

generateVocabulary();
