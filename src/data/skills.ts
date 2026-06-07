export interface Skill {
  name: string;
  description: string;
}

export interface SkillCategory {
  label: string;
  icon: string;
  accent: string;
  bg: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: 'Design',
    icon: '🎨',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    skills: [
      {
        name: 'Figma',
        description:
          'Primary tool for all UI work — components, auto-layout, variants, and design systems built to scale and handed off cleanly to development.',
      },
      {
        name: 'Wireframing',
        description:
          'Low-fidelity sketches and mid-fi wireframes that map structure and validate concepts before any pixel is committed to a final design.',
      },
      {
        name: 'Prototyping',
        description:
          'Interactive Figma prototypes that simulate real user flows — used in stakeholder demos, feedback rounds, and usability sessions.',
      },
      {
        name: 'User Flows',
        description:
          'End-to-end flow diagrams that map every path a user can take, from entry point through decisions to task completion.',
      },
      {
        name: 'Design Systems',
        description:
          'Scalable component libraries with tokens, variants, and written documentation — built once in Figma, synced to production code.',
      },
      {
        name: 'Adobe XD',
        description:
          'Legacy project work and cross-tool handoffs; comfortable switching to XD when a client or team workflow requires it.',
      },
      {
        name: 'User Research',
        description:
          'Qualitative interviews, competitive audits, and contextual inquiry to ground every design decision in real user behaviour and data.',
      },
      {
        name: 'Usability Testing',
        description:
          'Moderated and unmoderated sessions to surface friction points, validate iterations, and confirm a design works before it ships.',
      },
    ],
  },
  {
    label: 'Frontend',
    icon: '💻',
    accent: '#1877f2',
    bg: '#eff6ff',
    skills: [
      {
        name: 'React',
        description:
          'Primary framework for all UI builds — hooks, context, custom hooks, code splitting, and performance optimisation in production apps.',
      },
      {
        name: 'TypeScript',
        description:
          'Strict typing catches errors at compile time and makes refactoring large codebases safe, fast, and self-documenting.',
      },
      {
        name: 'JavaScript',
        description:
          'Deep knowledge of ES2022+ — async/await, modules, closures, and the browser APIs powering every interactive experience.',
      },
      {
        name: 'HTML5',
        description:
          'Semantic, accessible markup with ARIA roles and structured data — the solid foundation that good UIs and high SEO scores are built on.',
      },
      {
        name: 'SCSS / CSS3',
        description:
          'Design tokens, BEM architecture, keyframe animations, and fluid grid/flex layouts — before ever reaching for a utility framework.',
      },
      {
        name: 'Bootstrap',
        description:
          'Rapid responsive layouts using the Bootstrap 5 grid and utility classes, extended with custom SCSS overrides and design-system tokens.',
      },
      {
        name: 'Responsive Design',
        description:
          'Mobile-first breakpoints, fluid typography with clamp(), and component layouts that hold up beautifully on every screen size.',
      },
      {
        name: 'Accessibility (WCAG)',
        description:
          'WCAG 2.1 AA compliance — keyboard navigation, colour contrast ratios, focus management, and screen-reader testing on every project.',
      },
    ],
  },
  {
    label: 'Tools & Workflow',
    icon: '🛠️',
    accent: '#059669',
    bg: '#f0fdf4',
    skills: [
      {
        name: 'Git & GitHub',
        description:
          'Feature branching, pull-request reviews, and conventional commits — version history that reads like clear project documentation.',
      },
      {
        name: 'Vite',
        description:
          'Lightning-fast dev server and optimised production builds — the go-to bundler for every React and TypeScript project in this stack.',
      },
      {
        name: 'Cloudflare Pages',
        description:
          'Zero-config edge deployments with global CDN, custom domains, cache rules, and Workers for serverless API routes.',
      },
      {
        name: 'Storybook',
        description:
          'Isolated component development and living style guides — every reusable UI component documented, previewed, and visually tested.',
      },
      {
        name: 'VS Code',
        description:
          'Customised with ESLint, Prettier, and TypeScript extensions — a tuned development environment optimised for speed and flow.',
      },
      {
        name: 'Notion',
        description:
          'Project wikis, design briefs, and client onboarding docs — keeping every stakeholder aligned and informed from kick-off to launch.',
      },
      {
        name: 'Linear',
        description:
          'Sprint planning and issue tracking for solo and team projects — tight two-week cycles, clear priorities, and zero project noise.',
      },
      {
        name: 'Slack',
        description:
          'Async-first communication for remote work — structured channels, thread discipline, and status updates that respect everyone\'s focus time.',
      },
    ],
  },
];
