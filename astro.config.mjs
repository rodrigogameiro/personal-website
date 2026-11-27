// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * The one canonical origin of the site: canonical URLs, the sitemap, structured
 * data and link previews all use it. SITE_URL overrides it for test builds only.
 */
const site = process.env.SITE_URL ?? 'https://rodrigogameiro.com';

/** Path to a font file shipped in a Fontsource package (self-hosted, no CDN). */
const fontsource = (/** @type {string} */ pkg, /** @type {string} */ file) =>
  `./node_modules/${pkg}/files/${file}`;

export default defineConfig({
  site,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  // Content Security Policy in a <meta> tag: Astro hashes its inline scripts and
  // styles; everything else is limited to this origin. frame-ancestors cannot be
  // set in a <meta> tag, so it is sent as a header (public/_headers).
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  // No code blocks on this site; Shiki's inline styles would also conflict with the CSP.
  markdown: { syntaxHighlight: false },
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: [fontsource('@fontsource-variable/inter', 'inter-latin-wght-normal.woff2')],
            weight: '100 900',
            style: 'normal',
          },
          {
            src: [fontsource('@fontsource-variable/inter', 'inter-latin-wght-italic.woff2')],
            weight: '100 900',
            style: 'italic',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      fallbacks: ['ui-serif', 'Georgia', 'serif'],
      options: {
        variants: [
          {
            // Variable weight and optical size: finer details at display sizes.
            src: [
              fontsource('@fontsource-variable/newsreader', 'newsreader-latin-opsz-normal.woff2'),
            ],
            weight: '200 800',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
