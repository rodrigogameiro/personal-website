import { getCollection, type CollectionEntry } from 'astro:content';

export type Publication = CollectionEntry<'publications'>['data'] & { id: string };
export type PublicationSection = Publication['section'];

/** All publications, newest first. */
export async function getPublications(): Promise<Publication[]> {
  const entries = await getCollection('publications');
  return entries
    .map((entry) => ({ id: entry.id, ...entry.data }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** The selected publications shown on the home page, in their chosen order. */
export async function getFeaturedPublications(): Promise<Publication[]> {
  const all = await getPublications();
  return all
    .filter((p) => p.featured !== undefined)
    .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));
}

/**
 * Whether an author-list entry is the site owner ("Gameiro RR" or "Gameiro R").
 * Used only to link those entries to the Person node in the structured data.
 * "Gameiro Filho AR" is a different author and must not match.
 */
export const isSelfAuthor = (name: string) => /^Gameiro RR?$/.test(name);

export const doiUrl = (doi: string) => `https://doi.org/${doi}`;
export const pubmedUrl = (pmid: string) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

/** Best canonical link for a publication. */
export const primaryUrl = (p: Publication): string | undefined =>
  p.doi ? doiUrl(p.doi) : p.links?.[0]?.url;
