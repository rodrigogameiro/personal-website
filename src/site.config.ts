/**
 * Site-wide settings. The production domain is set in astro.config.mjs (`site`).
 */
export const siteConfig = {
  /** Shown in titles after a separator, and used by Google as the site name. */
  name: 'Rodrigo Gameiro',
  locale: 'en_US',
  lang: 'en',
  /** First publication of the site (ISO 8601). */
  dateCreated: '2026-11-25',
  /**
   * Last meaningful content edit (ISO 8601). Update by hand when the content
   * changes; it feeds the footer and the ProfilePage `dateModified`.
   */
  dateModified: '2026-11-27',
  /** Public source repository, linked from the footer. */
  repository: 'https://github.com/rodrigogameiro/personal-website',
  twitterHandle: '@rrgameiro',
} as const;
