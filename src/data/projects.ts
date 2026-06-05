export interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  role: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'HealthTrack Dashboard',
    description:
      'A responsive health monitoring dashboard designed for patients and clinicians. Focused on data clarity, accessibility, and an intuitive navigation structure that reduced task completion time by 40%.',
    tech: ['React', 'TypeScript', 'SCSS', 'Figma'],
    role: 'Lead UI/UX Designer & Frontend Developer',
    liveUrl: '#',
    caseStudyUrl: '#',
    githubUrl: '#',
  },
  {
    id: 2,
    title: 'ShopFlow E-Commerce Redesign',
    description:
      'End-to-end redesign of an e-commerce platform. Conducted user interviews, built prototypes in Figma, and implemented the design in React. Improved checkout conversion rate by 28%.',
    tech: ['React', 'Bootstrap', 'Figma', 'Adobe XD'],
    role: 'UX Researcher & Frontend Developer',
    liveUrl: '#',
    caseStudyUrl: '#',
    githubUrl: '#',
  },
  {
    id: 3,
    title: 'Onboard — SaaS Onboarding Kit',
    description:
      'A reusable onboarding component library for SaaS products. Designed a design-system-first approach with tokens, component documentation, and developer handoff guides.',
    tech: ['React', 'TypeScript', 'Storybook', 'Figma'],
    role: 'Design Systems Lead',
    liveUrl: '#',
    caseStudyUrl: '#',
    githubUrl: '#',
  },
  {
    id: 4,
    title: 'CityGuide Mobile App',
    description:
      'A cross-platform travel companion app featuring interactive maps, local event feeds, and personalised recommendations. Designed end-to-end from user flows to high-fidelity prototypes.',
    tech: ['Figma', 'Prototyping', 'React Native', 'TypeScript'],
    role: 'UI/UX Designer',
    liveUrl: '#',
    caseStudyUrl: '#',
    githubUrl: '#',
  },
];
