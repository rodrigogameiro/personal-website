#!/usr/bin/env node
/**
 * Generates the site icons in public/ from an "RG" monogram set in Newsreader:
 *   favicon.svg           scalable icon for modern browsers
 *   favicon.ico           16/32/48 px, for Google Search and older browsers
 *   apple-touch-icon.png  180 px, full-bleed (iOS rounds the corners itself)
 *
 * The letters are converted to outlines, so the output does not depend on any
 * installed font. Run with `npm run icons` and commit the results.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const fontFile = resolve(
  root,
  'node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff',
);
const out = (name) => resolve(root, 'public', name);

const font = opentype.parse((await readFile(fontFile)).buffer);

/** Outline of the monogram, centered in a box of `size` with `fontSize`. */
function monogramPath(size, fontSize, letterSpacing = 0) {
  const text = 'RG';
  // Lay out glyph by glyph so letter spacing can be applied.
  let x = 0;
  const glyphs = font.stringToGlyphs(text);
  const paths = [];
  glyphs.forEach((glyph, i) => {
    paths.push(glyph.getPath(x, 0, fontSize));
    const advance = (glyph.advanceWidth ?? 0) * (fontSize / font.unitsPerEm);
    const kern =
      i < glyphs.length - 1
        ? font.getKerningValue(glyph, glyphs[i + 1]) * (fontSize / font.unitsPerEm)
        : 0;
    x += advance + kern + letterSpacing;
  });
  const box = paths.reduce(
    (acc, p) => {
      const b = p.getBoundingBox();
      return {
        x1: Math.min(acc.x1, b.x1),
        y1: Math.min(acc.y1, b.y1),
        x2: Math.max(acc.x2, b.x2),
        y2: Math.max(acc.y2, b.y2),
      };
    },
    { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity },
  );
  const dx = (size - (box.x2 - box.x1)) / 2 - box.x1;
  // Optical centering: cap height sits slightly above the geometric middle.
  const dy = (size - (box.y2 - box.y1)) / 2 - box.y1 - size * 0.01;
  return paths
    .map((p) => {
      p.commands.forEach((c) => {
        for (const k of ['x', 'x1', 'x2']) if (k in c) c[k] += dx;
        for (const k of ['y', 'y1', 'y2']) if (k in c) c[k] += dy;
      });
      return p.toPathData(2);
    })
    .join(' ');
}

const ink = `<linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c3d63"/>
      <stop offset="1" stop-color="#111a2e"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/>
      <stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>`;

/** Round icon (favicon). */
function roundIcon(size) {
  const r = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    ${ink}
  </defs>
  <circle cx="${r}" cy="${r}" r="${r}" fill="url(#ink)"/>
  <circle cx="${r}" cy="${r}" r="${r - size * 0.02}" fill="url(#sheen)"/>
  <circle cx="${r}" cy="${r}" r="${r - size * 0.012}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="${size * 0.024}"/>
  <path fill="#fff" d="${monogramPath(size, size * 0.5, size * 0.004)}"/>
</svg>
`;
}

/** Square, full-bleed icon (Apple touch icon). */
function squareIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    ${ink}
  </defs>
  <rect width="${size}" height="${size}" fill="url(#ink)"/>
  <rect width="${size}" height="${size}" fill="url(#sheen)"/>
  <path fill="#fff" d="${monogramPath(size, size * 0.42, size * 0.004)}"/>
</svg>
`;
}

/** Minimal ICO container holding PNG images (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const svg = roundIcon(64);
await writeFile(out('favicon.svg'), svg);

const icoPngs = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    data: await sharp(Buffer.from(roundIcon(size * 4)))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer(),
  })),
);
await writeFile(out('favicon.ico'), ico(icoPngs));

await sharp(Buffer.from(squareIcon(180 * 2)))
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(out('apple-touch-icon.png'));

console.log('✔ Wrote public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png');
