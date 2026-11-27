# Rodrigo Gameiro — personal website

Source code of [rodrigogameiro.com](https://rodrigogameiro.com), the personal academic website of **Rodrigo Gameiro, MD, MPH**, a physician and researcher at Harvard Medical School who builds and evaluates AI for clinical decision support.

## Highlights

- **Static and fast.** [Astro](https://astro.build) 7, with no client-side framework. The only JavaScript is a small inline script for the light/dark switch. Lighthouse scores 100 for performance, accessibility, best practices and SEO on desktop and on throttled mobile.
- **Liquid Glass, quietly.** A translucent floating navigation bar with real backdrop blur, and glass-like cards and chips, in plain CSS. Light and dark themes follow the system setting through `light-dark()`, and a switch in the navigation bar overrides it (the choice is remembered, and applied before the first paint, so it never flashes). Visitors who ask for reduced transparency, more contrast or forced colors get solid, high-contrast surfaces.
- **Search-engine identity.** One JSON-LD graph (`WebSite` + `ProfilePage` + `Person`) ties the site to every public profile through `sameAs`, alongside `rel="me"` links, canonical URLs, a sitemap, and portrait images for link previews generated at build time. The publications page marks up each published work (`ScholarlyArticle`, with its DOI and PubMed identifiers) with the same `Person` among its authors.
- **Typed content.** Publications are a JSON file validated against a Zod schema at build time; profile and project data are typed TypeScript modules.
- **Security.** A hashed Content Security Policy, strict response headers, GitHub Actions pinned to commit SHAs, and Dependabot. Email addresses are written as HTML entities to deter simple harvesters. The site sets no cookies and has no analytics.

## Getting started

Requires Node.js 26 LTS (see [`.nvmrc`](.nvmrc); Astro 7 needs ≥ 22.23.4).

```bash
nvm use
npm ci
npm run dev
```

The site runs at <http://localhost:4321>.

## Scripts

| Command                      | What it does                                                                |
| ---------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`                | Development server with hot reload                                          |
| `npm run build`              | Static build to `dist/`                                                     |
| `npm run preview`            | Serve the built site locally                                                |
| `npm run preview:cloudflare` | Serve the built site through Cloudflare's runtime (headers, redirects, 404) |
| `npm run check`              | Type-check Astro and TypeScript files                                       |
| `npm run lint`               | ESLint (TypeScript, Astro and accessibility rules)                          |
| `npm run format`             | Format with Prettier (`format:check` verifies only)                         |
| `npm run validate:html`      | Validate the built HTML                                                     |
| `npm run validate:links`     | Check internal links and `#anchors` in the built site                       |
| `npm run lighthouse`         | Lighthouse CI with score assertions                                         |
| `npm run verify`             | Everything above except Lighthouse, in order                                |
| `npm run icons`              | Regenerate the favicons from the "RG" monogram                              |

## Editing content

| Content                               | File                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| Name, bio, emails and profile links   | [`src/data/profile.ts`](src/data/profile.ts)               |
| Current work, grouped by theme        | [`src/data/projects.ts`](src/data/projects.ts)             |
| Publications                          | [`src/data/publications.json`](src/data/publications.json) |
| Portrait                              | [`src/assets/headshot.jpg`](src/assets/headshot.jpg)       |
| Site settings (dates, repository URL) | [`src/site.config.ts`](src/site.config.ts)                 |

The publications schema lives in [`src/content.config.ts`](src/content.config.ts); a malformed entry fails the build. After a content change, update `dateModified` in `src/site.config.ts`.

## Project structure

```text
.
├── .github/              CI, weekly external-link check, Dependabot
├── public/               favicons, response headers and redirects
├── scripts/              favicon generator
└── src/
    ├── assets/           portrait (optimized at build time)
    ├── components/       Header, Footer, PublicationItem, WorkTheme, …
    ├── data/             all site content
    ├── layouts/          BaseLayout: <head>, SEO and structured data
    ├── lib/              data access, JSON-LD builders, image generation
    ├── pages/            /, /publications/, 404, robots.txt, images
    ├── scripts/          theme switch, inlined in the page head
    └── styles/           design tokens, base styles and the glass material
```

## Deployment

The site is served by **Cloudflare Workers static assets** ([`wrangler.jsonc`](wrangler.jsonc)) at its one canonical origin, `https://rodrigogameiro.com`. [`public/_headers`](public/_headers) sets the response headers, and [`public/_redirects`](public/_redirects) the permanent redirects within the site.

## License

The **source code** is released under the [MIT License](LICENSE).
The **content** (text, publication data and the "RG" monogram) is © Rodrigo Gameiro, all rights reserved. Photographs are © their respective owners. None of the content is covered by the MIT License.
