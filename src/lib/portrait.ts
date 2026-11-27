/**
 * Build-time portrait images, made from src/assets/headshot.jpg with sharp.
 *
 * - Plain crops in the aspect ratios Google recommends for structured-data
 *   images (1:1, 4:3, 16:9), served from /images/rodrigo-gameiro-<ratio>.jpg.
 * - A link-preview card (/og.jpg): the portrait centered on the site's soft
 *   background. No text is drawn: social cards show the page title anyway.
 *
 * Crops are never upscaled, so a higher-resolution source photo improves every
 * output automatically. sharp writes no metadata (EXIF, GPS) to the outputs.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const SOURCE = resolve(process.cwd(), 'src/assets/headshot.jpg');

/**
 * Height of the eyes in the source photo, as a fraction of its height. Crops
 * place the eyes 40% of the way down, the usual portrait framing. Adjust this
 * when the photo changes.
 */
const EYE_LINE = 0.36;

export const portraitRatios = {
  '1x1': [1, 1],
  '4x3': [4, 3],
  '16x9': [16, 9],
} as const;

export type PortraitRatio = keyof typeof portraitRatios;

export const portraitPath = (ratio: PortraitRatio) => `/images/rodrigo-gameiro-${ratio}.jpg`;

async function loadSource() {
  const data = await readFile(SOURCE);
  const { width = 0, height = 0 } = await sharp(data).metadata();
  return { data, width, height };
}

/** Largest crop of the given ratio that fits the source, framed on the eyes. */
function cropBox(sourceWidth: number, sourceHeight: number, ratio: PortraitRatio) {
  const [rw, rh] = portraitRatios[ratio];
  let width = sourceWidth;
  let height = Math.round((sourceWidth * rh) / rw);
  if (height > sourceHeight) {
    height = sourceHeight;
    width = Math.round((sourceHeight * rw) / rh);
  }
  const top = Math.round(EYE_LINE * sourceHeight - 0.4 * height);
  return {
    left: Math.round((sourceWidth - width) / 2),
    top: Math.max(0, Math.min(sourceHeight - height, top)),
    width,
    height,
  };
}

/** Pixel size of a crop, for width/height in structured data. */
export async function portraitSize(ratio: PortraitRatio) {
  const { width, height } = await loadSource();
  const box = cropBox(width, height, ratio);
  return { width: box.width, height: box.height };
}

/** Plain crop of the portrait (JPEG). */
export async function croppedPortrait(ratio: PortraitRatio): Promise<Buffer> {
  const { data, width, height } = await loadSource();
  return sharp(data)
    .extract(cropBox(width, height, ratio))
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

/** Soft background matching the site's light theme. */
function background(width: number, height: number): Buffer {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <radialGradient id="a" cx="8%" cy="-12%" r="75%">
      <stop offset="0" stop-color="#b9cff4" stop-opacity=".95"/>
      <stop offset="1" stop-color="#b9cff4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="92%" cy="-6%" r="65%">
      <stop offset="0" stop-color="#dccdf3" stop-opacity=".85"/>
      <stop offset="1" stop-color="#dccdf3" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="c" cx="48%" cy="112%" r="70%">
      <stop offset="0" stop-color="#c3eadf" stop-opacity=".8"/>
      <stop offset="1" stop-color="#c3eadf" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#f7f8fb"/>
  <rect width="100%" height="100%" fill="url(#a)"/>
  <rect width="100%" height="100%" fill="url(#b)"/>
  <rect width="100%" height="100%" fill="url(#c)"/>
</svg>`);
}

const circle = (size: number, fill: string, opacity = 1) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${fill}" fill-opacity="${opacity}"/></svg>`,
  );

/** The portrait in a light ring, centered on the soft background (JPEG). */
export async function portraitCard(width: number, height: number): Promise<Buffer> {
  const source = await loadSource();
  const square = cropBox(source.width, source.height, '1x1');
  // Never upscale beyond the source.
  const d = Math.min(square.width, Math.round(height * 0.66));
  const ring = d + 20;
  const shadowSize = ring + 120;

  const face = await sharp(source.data)
    .extract(square)
    .resize(d, d)
    .composite([{ input: circle(d, '#fff'), blend: 'dest-in' }])
    .png()
    .toBuffer();
  const shadow = await sharp(circle(ring, '#1c2340', 0.22))
    .extend({
      top: 60,
      bottom: 60,
      left: 60,
      right: 60,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .blur(26)
    .png()
    .toBuffer();

  const at = (size: number, dy = 0) => ({
    left: Math.round((width - size) / 2),
    top: Math.round((height - size) / 2 + dy),
  });

  return sharp(background(width, height))
    .composite([
      { input: shadow, ...at(shadowSize, 14) },
      { input: circle(ring, '#ffffff', 0.85), ...at(ring) },
      { input: face, ...at(d) },
    ])
    .flatten({ background: '#f7f8fb' })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}
