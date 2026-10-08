// Bundles the React prototype (and its CSS) into one self-contained page, the same shape the app saves: one file, no
// outside references, so it works at any address.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const result = await build({
  entryPoints: ['src/main.tsx', 'src/review.ts'],
  alias: { '@app': process.env.APP_SRC ?? '../app-src' },
  bundle: true,
  minify: true,
  write: false,
  outdir: 'out',
  outbase: 'src',
  format: 'iife',
  splitting: false,
  jsx: 'automatic',
  loader: { '.css': 'css' },
  define: { 'process.env.NODE_ENV': '"production"' },
  nodePaths: [process.env.NODE_PATH ?? ''],
});
const js = result.outputFiles.filter((f) => f.path.endsWith('.js')).map((f) => f.text).join('\n');
const css = readFileSync('src/style.css', 'utf8');
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Acme Console: Team usage (sandbox prototype)</title><style>${css}</style></head>
<body><div id="root"></div><script>${js.replace(/<\/script>/g, '<\\/script>')}</script></body></html>`;
mkdirSync('site/usage-i1', { recursive: true });
writeFileSync('site/usage-i1/index.html', page);
writeFileSync('site/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Prototype sandbox</title>
<style>body{font-family:system-ui;max-width:640px;margin:48px auto;padding:0 20px;color:#1c2430}a{color:#1f4f8f}</style></head>
<body><h1>Prototype sandbox</h1><p>A test of publishing built React prototypes to GitHub Pages. Everything here is invented.</p>
<ul><li><a href="usage-i1/">Team usage, iteration 1</a></li></ul></body></html>`);
console.log('built', Math.round(page.length / 1024), 'KB');
