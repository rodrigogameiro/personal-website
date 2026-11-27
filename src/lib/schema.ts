/**
 * schema.org structured data (JSON-LD).
 *
 * The home page carries the full graph: WebSite + ProfilePage + Person and the
 * organizations they reference, joined by @id. Other pages describe themselves
 * and point back to the same Person by @id; the publications page also lists
 * each published work, with the Person among its authors. Every fact marked up
 * is shown on the page that carries it. The graph has no contact details.
 */
import { person, profiles, bio } from '../data/profile';
import { doiUrl, isSelfAuthor, primaryUrl, pubmedUrl, type Publication } from './publications';
import { siteConfig } from '../site.config';

export interface ImageRef {
  url: string;
  width: number;
  height: number;
}

const ids = (base: string) => ({
  website: `${base}#website`,
  person: `${base}#person`,
  profilePage: `${base}#profilepage`,
  headshot: `${base}#headshot`,
  hms: `${base}#org-hms`,
  dbmi: `${base}#org-dbmi`,
  hsph: `${base}#org-hsph`,
});

const harvardMedicalSchool = {
  '@type': 'CollegeOrUniversity',
  name: 'Harvard Medical School',
  url: 'https://hms.harvard.edu/',
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: 'Harvard University',
    url: 'https://www.harvard.edu/',
  },
};

const harvardSchoolOfPublicHealth = {
  '@type': 'CollegeOrUniversity',
  name: 'Harvard School of Public Health',
  url: 'https://hsph.harvard.edu/',
};

const organizations = (base: string) => {
  const id = ids(base);
  return [
    { ...harvardMedicalSchool, '@id': id.hms },
    {
      '@type': 'Organization',
      '@id': id.dbmi,
      name: 'Department of Biomedical Informatics, Harvard Medical School',
      url: 'https://dbmi.hms.harvard.edu/',
      parentOrganization: { '@id': id.hms },
    },
    { ...harvardSchoolOfPublicHealth, '@id': id.hsph },
  ];
};

/**
 * A YYYY-MM-DD date as an ISO 8601 date-time: midnight in Boston, with the
 * UTC offset in force that day. Google reads a ProfilePage's dateCreated and
 * dateModified as date-times and flags a bare date as invalid.
 */
function bostonMidnight(date: string): string {
  const offset =
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'longOffset' })
      .formatToParts(new Date(`${date}T12:00:00Z`))
      .find((part) => part.type === 'timeZoneName')
      ?.value.replace('GMT', '') || 'Z';
  return `${date}T00:00:00${offset}`;
}

/** Full graph for the home page. */
export function homeGraph(opts: { base: string; pageTitle: string; images: ImageRef[] }) {
  const { base, pageTitle, images } = opts;
  const id = ids(base);
  const [primary, ...others] = images;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': id.website,
        url: base,
        name: siteConfig.name,
        alternateName: person.alternateNames,
        inLanguage: siteConfig.lang,
        publisher: { '@id': id.person },
      },
      {
        '@type': 'ProfilePage',
        '@id': id.profilePage,
        url: base,
        name: pageTitle,
        isPartOf: { '@id': id.website },
        inLanguage: siteConfig.lang,
        dateCreated: bostonMidnight(siteConfig.dateCreated),
        dateModified: bostonMidnight(siteConfig.dateModified),
        mainEntity: { '@id': id.person },
        primaryImageOfPage: { '@id': id.headshot },
      },
      {
        '@type': 'Person',
        '@id': id.person,
        name: person.name,
        givenName: person.givenName,
        familyName: person.familyName,
        alternateName: person.alternateNames,
        honorificSuffix: person.credentials,
        jobTitle: person.jobTitle,
        description: bio.description,
        url: base,
        mainEntityOfPage: { '@id': id.profilePage },
        image: [
          ...(primary
            ? [
                {
                  '@type': 'ImageObject',
                  '@id': id.headshot,
                  url: primary.url,
                  width: primary.width,
                  height: primary.height,
                  caption: person.name,
                },
              ]
            : []),
          ...others.map((img) => img.url),
        ],
        worksFor: { '@id': id.hms },
        affiliation: { '@id': id.dbmi },
        alumniOf: { '@id': id.hsph },
        knowsAbout: person.knowsAbout,
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'ORCID',
          value: person.orcid,
          url: `https://orcid.org/${person.orcid}`,
        },
        sameAs: profiles.map((p) => p.url),
      },
      ...organizations(base),
    ],
  };
}

/** Lightweight graph for inner pages: the page, its site, and who it is about. */
export function pageGraph(opts: {
  base: string;
  url: string;
  pageTitle: string;
  description: string;
  type?: 'WebPage' | 'CollectionPage';
  /** What the page mainly presents, such as the list of publications. */
  mainEntity?: object;
}) {
  const { base, url, pageTitle, description, type = 'WebPage', mainEntity } = opts;
  const id = ids(base);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': type,
        '@id': `${url}#webpage`,
        url,
        name: pageTitle,
        description,
        inLanguage: siteConfig.lang,
        isPartOf: { '@id': id.website },
        about: { '@id': id.person },
        ...(mainEntity ? { mainEntity } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': id.website,
        url: base,
        name: siteConfig.name,
      },
      {
        '@type': 'Person',
        '@id': id.person,
        name: person.name,
        url: base,
      },
    ],
  };
}

/** Where a work appeared, in schema.org terms. */
function venueOf(pub: Publication) {
  switch (pub.kind) {
    case 'Preprint':
      return { publisher: { '@type': 'Organization', name: pub.venue.replace(/ preprint$/, '') } };
    case 'Book chapter':
      return { isPartOf: { '@type': 'Book', name: pub.venue } };
    case 'Workshop poster':
      return { isPartOf: { '@type': 'CreativeWork', name: pub.venue } };
    default:
      return { isPartOf: { '@type': 'Periodical', name: pub.venue } };
  }
}

/** Links that identify the same work elsewhere (not related resources). */
const IDENTIFYING_LINKS = new Set(['arXiv', 'medRxiv', 'bioRxiv', 'PubMed Central']);

/**
 * The published works shown on the publications page, in page order, as an
 * ItemList. Every author is listed as printed; entries that match isSelfAuthor
 * point to the Person node, so search engines can tie each paper (by DOI and
 * PubMed ID) to this site. Manuscripts under review are left out.
 */
export function publicationList(pubs: Publication[], opts: { base: string; pageUrl: string }) {
  const id = ids(opts.base);
  const works = pubs.filter((pub) => pub.kind !== 'Manuscript');
  return {
    '@type': 'ItemList',
    numberOfItems: works.length,
    itemListElement: works.map((pub, index) => {
      const url = primaryUrl(pub);
      const sameAs = [
        ...(pub.pmid ? [pubmedUrl(pub.pmid)] : []),
        ...(pub.links ?? [])
          .filter((link) => IDENTIFYING_LINKS.has(link.label))
          .map((link) => link.url),
      ].filter((link) => link !== url);
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': pub.kind === 'Book chapter' ? 'Chapter' : 'ScholarlyArticle',
          '@id': `${opts.pageUrl}#${pub.id}`,
          name: pub.title,
          ...(pub.titleTranslation ? { alternativeHeadline: pub.titleTranslation } : {}),
          author: pub.authors
            .split(', ')
            .filter((name) => !/^et al\.?$/.test(name))
            .map((name) =>
              isSelfAuthor(name) ? { '@id': id.person } : { '@type': 'Person', name },
            ),
          datePublished: pub.date,
          inLanguage: pub.language ?? siteConfig.lang,
          ...venueOf(pub),
          ...(url ? { url } : {}),
          ...(sameAs.length > 0 ? { sameAs } : {}),
          ...(pub.doi
            ? {
                identifier: {
                  '@type': 'PropertyValue',
                  propertyID: 'DOI',
                  value: pub.doi,
                  url: doiUrl(pub.doi),
                },
              }
            : {}),
          ...(pub.summary ? { description: pub.summary } : {}),
        },
      };
    }),
  };
}
