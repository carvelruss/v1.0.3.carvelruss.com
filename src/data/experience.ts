export interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
}

export const experiences: ExperienceItem[] = [
  {
    id: 1,
    role: 'Senior UI/UX Developer',
    company: 'Acme Digital Studio',
    period: 'Jan 2022 — Present',
    location: 'Remote',
    highlights: [
      'Led end-to-end design and frontend implementation for 6 client products across healthcare, fintech, and e-commerce verticals.',
      'Established and maintained a shared design system used by a team of 8 developers.',
      'Reduced design-to-dev handoff time by 35% by integrating Figma tokens with the codebase.',
    ],
  },
  {
    id: 2,
    role: 'UI Developer & UX Designer',
    company: 'Brightline Agency',
    period: 'Mar 2020 — Dec 2021',
    location: 'New York, NY',
    highlights: [
      'Designed and built responsive interfaces for 10+ client websites using React and SCSS.',
      'Conducted user research, usability testing, and A/B tests to inform design decisions.',
      'Collaborated with product managers and engineers in an agile environment.',
    ],
  },
  {
    id: 3,
    role: 'Junior Frontend Developer',
    company: 'Startup Ventures Co.',
    period: 'Jun 2018 — Feb 2020',
    location: 'Austin, TX',
    highlights: [
      'Built reusable React components and maintained a shared component library.',
      'Contributed to UX improvements that improved onboarding completion by 22%.',
      'Worked closely with senior designers to translate mockups into pixel-perfect interfaces.',
    ],
  },
];
