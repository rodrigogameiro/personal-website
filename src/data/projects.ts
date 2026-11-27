/**
 * Current work, grouped by research theme: a title and a short description per
 * project.
 */

export interface Project {
  id: string;
  title: string;
  body: string;
}

export interface WorkTheme {
  id: string;
  title: string;
  /** Glyph in src/components/Icon.astro. */
  icon: 'pulse' | 'scale' | 'human-ai';
  /** Tint of the icon tile, one of the three colors of the ambient light. */
  tone: 'blue' | 'violet' | 'teal';
  projects: readonly Project[];
}

export const workThemes: readonly WorkTheme[] = [
  {
    id: 'clinical-decision-support',
    title: 'Clinical decision support',
    icon: 'pulse',
    tone: 'blue',
    projects: [
      {
        id: 'abbie',
        title: 'ABBIE',
        body: 'A system I am building that brings specialist diagnostic AI tools together to support clinicians. I also test how such tools perform across the full range of patients seen in practice.',
      },
    ],
  },
  {
    id: 'ai-regulation',
    title: 'AI regulation',
    icon: 'scale',
    tone: 'violet',
    projects: [
      {
        id: 'ai-devices-fda',
        title: 'AI medical devices and the FDA',
        body: 'I trace how AI-enabled medical devices are cleared for the US market, and what those clearances rest on.',
      },
      {
        id: 'ai-drivers-license',
        title: "A driver's license for AI",
        body: 'I explore whether licensing AI, much as we license drivers, is a workable way to regulate it.',
      },
    ],
  },
  {
    id: 'human-ai-interaction',
    title: 'Human-AI interaction',
    icon: 'human-ai',
    tone: 'teal',
    projects: [
      {
        id: 'ai-recommendation-timing',
        title: 'When should an AI recommendation appear?',
        body: "I study how the timing of an AI recommendation changes people's reliance on it.",
      },
    ],
  },
];
