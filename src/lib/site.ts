/** The configured site origin (`site` in astro.config.mjs). */
export function requireSite(site: URL | undefined): URL {
  if (!site) throw new Error('`site` must be set in astro.config.mjs');
  return site;
}

/** Absolute URL for a path on this site. */
export const absoluteUrl = (path: string, site: URL | undefined): string =>
  new URL(path, requireSite(site)).href;

const atNoon = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`);

/** "November 2026" */
export const formatMonthYear = (isoDate: string): string =>
  atNoon(isoDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** 2026 */
export const yearOf = (isoDate: string): number => atNoon(isoDate).getUTCFullYear();
