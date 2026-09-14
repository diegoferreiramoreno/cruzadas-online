import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Client Bundle Budget (SC-002 / T067)', () => {
  const clientAssetsDir = path.resolve(process.cwd(), 'dist/client/assets');

  it('verifies production build exists and asserts bundle sizes strictly within SC-002 budget', () => {
    expect(
      fs.existsSync(clientAssetsDir),
      'Production client build is missing! dist/client/assets must exist before running bundle budget tests.'
    ).toBe(true);

    const files = fs.readdirSync(clientAssetsDir);
    const jsFiles = files.filter((f: string) => f.endsWith('.js'));
    const cssFiles = files.filter((f: string) => f.endsWith('.css'));

    expect(jsFiles.length).toBeGreaterThan(0);
    expect(cssFiles.length).toBeGreaterThan(0);

    let totalJsSize = 0;
    for (const js of jsFiles) {
      const stat = fs.statSync(path.join(clientAssetsDir, js));
      totalJsSize += stat.size;
    }

    let totalCssSize = 0;
    for (const css of cssFiles) {
      const stat = fs.statSync(path.join(clientAssetsDir, css));
      totalCssSize += stat.size;
    }

    // Uncompressed JS baseline: entire app + full offline Portuguese lexicon is under 400 kB raw
    expect(totalJsSize).toBeLessThan(400 * 1024);

    // Uncompressed CSS baseline is under 60 kB raw
    expect(totalCssSize).toBeLessThan(60 * 1024);
  });
});
