/**
 * Content collections. The JSON files in src/data/ are validated against these
 * schemas at build time: a typo or a missing field fails the build.
 */
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const publications = defineCollection({
  loader: file('src/data/publications.json'),
  schema: z.object({
    title: z.string(),
    titleTranslation: z.string().optional(),
    language: z.string().optional(),
    /** Authors exactly as cited, in order. */
    authors: z.string(),
    kind: z.enum([
      'Journal article',
      'Review',
      'Systematic review',
      'Preprint',
      'Book chapter',
      'Workshop poster',
      'Case report',
      'Manuscript',
    ]),
    section: z.enum(['clinical-ai', 'under-review', 'clinical']),
    featured: z.number().int().positive().optional(),
    venue: z.string(),
    citation: z.string().optional(),
    year: z.number().int().min(2000).max(2100),
    date: isoDate,
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/)
      .optional(),
    pmid: z.string().regex(/^\d+$/).optional(),
    links: z.array(z.object({ label: z.string(), url: z.url() })).optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { publications };
