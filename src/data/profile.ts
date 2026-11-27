/**
 * Identity, contact details, profiles and bios.
 *
 * Everything in this file is rendered on the site and in its structured data.
 */

export interface Email {
  label: string;
  address: string;
}

export type ProfileId =
  | 'scholar'
  | 'orcid'
  | 'github'
  | 'linkedin'
  | 'hms'
  | 'researchgate'
  | 'huggingface'
  | 'x'
  | 'bluesky'
  | 'threads';

export interface Profile {
  id: ProfileId;
  label: string;
  url: string;
  /** Shown in the hero as a chip; the rest are listed under "Elsewhere". */
  primary?: boolean;
}

export const person = {
  name: 'Rodrigo Gameiro',
  givenName: 'Rodrigo',
  familyName: 'Gameiro',
  credentials: 'MD, MPH',
  /** Other forms of the name shown on the site (the home page heading). */
  alternateNames: ['Rodrigo Gameiro, MD, MPH'],
  jobTitle: 'Graduate Researcher',
  department: 'Department of Biomedical Informatics',
  institution: 'Harvard Medical School',
  orcid: '0000-0001-9600-6228',
  /** Research topics, each described on the home page. */
  knowsAbout: [
    'Clinical decision support',
    'Clinical artificial intelligence',
    'Evaluation of clinical AI',
    'Regulation of AI-enabled medical devices',
    'Human-AI interaction',
    'Biomedical informatics',
    'Public health',
  ],
} as const;

/**
 * Joins an email address from its two halves. Pages show addresses as HTML
 * entities (see EmailLink), and keeping them out of the source as whole strings
 * spares them from the harvesters that scan public code the same way.
 */
const at = (user: string, domain: string): string => `${user}@${domain}`;

/** The address used for the hero "Email" link. */
export const primaryEmail: Email = {
  label: 'Harvard',
  address: at('rodrigo_gameiro', 'hms.harvard.edu'),
};

export const emails: readonly Email[] = [
  primaryEmail,
  { label: 'MIT', address: at('rrgmd', 'mit.edu') },
  { label: 'Personal', address: at('rrogameiro', 'gmail.com') },
];

export const profiles: readonly Profile[] = [
  {
    id: 'scholar',
    label: 'Google Scholar',
    url: 'https://scholar.google.com/citations?user=q-ghoWAAAAAJ',
    primary: true,
  },
  { id: 'github', label: 'GitHub', url: 'https://github.com/rodrigogameiro', primary: true },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/rrgameiro/',
    primary: true,
  },
  { id: 'orcid', label: 'ORCID', url: 'https://orcid.org/0000-0001-9600-6228', primary: true },
  {
    id: 'hms',
    label: 'Harvard DBMI',
    url: 'https://dbmi.hms.harvard.edu/people/rodrigo-gameiro',
  },
  {
    id: 'researchgate',
    label: 'ResearchGate',
    url: 'https://www.researchgate.net/profile/Rodrigo-Gameiro-4',
  },
  { id: 'huggingface', label: 'Hugging Face', url: 'https://huggingface.co/rrgameiro' },
  { id: 'x', label: 'X', url: 'https://x.com/rrgameiro' },
  {
    id: 'bluesky',
    label: 'Bluesky',
    url: 'https://bsky.app/profile/rrgameiro.bsky.social',
  },
  {
    id: 'threads',
    label: 'Threads',
    url: 'https://www.threads.com/@rrgameiro',
  },
];

export const bio = {
  /** One sentence, used for meta descriptions and link previews. */
  description:
    'Rodrigo Gameiro, MD, MPH, is a physician and researcher at Harvard Medical School who builds and evaluates AI for clinical decision support.',

  /** First person, for the home page. */
  home: [
    "I am a physician and a researcher at Harvard Medical School's Department of Biomedical Informatics, where I work with Isaac Kohane. I build and evaluate AI systems for clinical decision support.",
    'Clinical AI is often tested under conditions unlike the ones it is used in: on patients already suspected of the disease, with the model working alone, and often cleared by comparison with earlier devices. I study what it takes to trust these systems in ordinary practice, and I treat that as one engineering problem: how the tools are tested, how they are combined, how they are cleared, and how clinicians work with them.',
    "Before Harvard Medical School, I was an associate researcher at MIT's Laboratory for Computational Physiology with Leo Anthony Celi, where I was first author of the Data Artifacts Glossary, an open repository of known biases in health datasets. Earlier, I trained in emergency medicine and worked as an attending physician.",
    'I hold an MD, an MPH from the Harvard School of Public Health, and a law degree with a concentration in international law, human rights and comparative constitutional law.',
  ],
} as const;
