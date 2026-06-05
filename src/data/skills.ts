export interface SkillCategory {
  label: string;
  icon: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: 'Design',
    icon: '🎨',
    skills: [
      'Figma',
      'Wireframing',
      'Prototyping',
      'User Flows',
      'Design Systems',
      'Adobe XD',
      'User Research',
      'Usability Testing',
    ],
  },
  {
    label: 'Frontend',
    icon: '💻',
    skills: [
      'React',
      'TypeScript',
      'JavaScript',
      'HTML5',
      'SCSS / CSS3',
      'Bootstrap',
      'Responsive Design',
      'Accessibility (WCAG)',
    ],
  },
  {
    label: 'Tools & Workflow',
    icon: '🛠️',
    skills: [
      'Git & GitHub',
      'Vite',
      'Cloudflare Pages',
      'Storybook',
      'VS Code',
      'Notion',
      'Linear',
      'Slack',
    ],
  },
];
