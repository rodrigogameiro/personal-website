// @ts-check
import { readFileSync } from 'node:fs';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Paths listed in .git/info/exclude, which ESLint does not read by itself. */
const gitInfoExcludes = (() => {
  try {
    return readFileSync(new URL('.git/info/exclude', import.meta.url), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'))
      .map((line) => line.replace(/^\//, ''));
  } catch {
    return [];
  }
})();

export default defineConfig([
  // Build output, generated types, Wrangler's local state, and paths in .git/info/exclude.
  globalIgnores(['dist/', '.astro/', '.wrangler/', ...gitInfoExcludes]),
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  astro.configs['jsx-a11y-strict'],
  // Build-time code (configs, scripts, Astro frontmatter and endpoints) runs in Node.
  { files: ['*.{js,mjs}', 'scripts/**', 'src/**'], languageOptions: { globals: globals.node } },
  // Client scripts (inside .astro files, and the inlined ones in src/scripts) run in the browser.
  {
    files: ['src/**/*.astro/*.ts', 'src/**/*.astro/*.js', 'src/scripts/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
]);
