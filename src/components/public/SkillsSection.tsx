import { FiPenTool, FiUsers, FiCode, FiCompass } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../../styles/skills-section.css';

/* ── Types ────────────────────────────────────────────────────── */

type SkillGroup = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  skills: string[];
  accent: string;
};

type Tool = {
  name: string;
  category: string;
  description: string;
};

/* ── Data ─────────────────────────────────────────────────────── */

const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'design',
    title: 'UI Design',
    description: 'Creating clean, conversion-focused visual interfaces users love to interact with.',
    icon: FiPenTool,
    accent: '#1E4ED8',
    skills: [
      'UI Design',
      'Visual Design',
      'Wireframing',
      'Prototyping',
      'Responsive Design',
      'Design Systems',
      'Interaction Design',
      'Typography & Layout',
    ],
  },
  {
    id: 'research',
    title: 'UX Research',
    description: 'Deep user understanding to design experiences that solve real problems.',
    icon: FiUsers,
    accent: '#0D215A',
    skills: [
      'User Research',
      'Usability Testing',
      'Information Architecture',
      'Competitive Analysis',
      'User Journey Mapping',
      'Persona Development',
      'Heuristic Evaluation',
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Turning precise designs into clean, performant, and accessible code.',
    icon: FiCode,
    accent: '#1E4ED8',
    skills: [
      'HTML5 & CSS3',
      'JavaScript (ES6+)',
      'TypeScript',
      'React',
      'Bootstrap',
      'Vite & Build Tools',
      'Accessibility (a11y)',
      'Performance Optimization',
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Process',
    description: 'Structured thinking from initial brief to polished final product.',
    icon: FiCompass,
    accent: '#0D215A',
    skills: [
      'Design Thinking',
      'Conversion Optimization',
      'Design Sprints',
      'Cross-functional Collaboration',
      'Product Strategy',
      'Brand Design',
      'Content Strategy',
    ],
  },
];

const TOOLS: Tool[] = [
  { name: 'Figma',        category: 'Design',         description: 'Primary UI design tool for components, auto-layout, variants, and design systems.' },
  { name: 'Adobe XD',     category: 'Design',         description: 'Legacy project work and cross-team handoffs when client workflows require it.' },
  { name: 'Photoshop',    category: 'Design',         description: 'Photo editing, image compositing, and pixel-level asset preparation for web.' },
  { name: 'Illustrator',  category: 'Design',         description: 'Vector graphics, icon creation, and scalable brand asset production.' },
  { name: 'FigJam',       category: 'Collaboration',  description: 'Collaborative whiteboarding for brainstorming, user flows, and workshop facilitation.' },
  { name: 'Notion',       category: 'Productivity',   description: 'Project wikis, design briefs, and client onboarding docs to keep stakeholders aligned.' },
  { name: 'React',        category: 'Development',    description: 'Primary framework for UI builds — hooks, context, and performance optimisation.' },
  { name: 'TypeScript',   category: 'Development',    description: 'Strict typing for safer refactoring and self-documenting codebases.' },
  { name: 'Vite',         category: 'Development',    description: 'Lightning-fast dev server and optimised production builds for every project.' },
  { name: 'Bootstrap',    category: 'Development',    description: 'Rapid responsive layouts extended with custom SCSS and design-system tokens.' },
  { name: 'Git / GitHub', category: 'Development',    description: 'Feature branching, pull-request reviews, and conventional commits for clean history.' },
  { name: 'Cloudflare',   category: 'Infrastructure', description: 'Edge deployments, global CDN, custom domains, and serverless API routes via Workers.' },
];

/* ── Skill group card ─────────────────────────────────────────── */

function SkillCard({ group }: { group: SkillGroup }) {
  const Icon = group.icon;
  return (
    <div className="sks-card">
      <div className="sks-card__accent" style={{ background: group.accent }} />
      <div className="sks-card__header">
        <div className="sks-card__icon-wrap" style={{ background: `${group.accent}14` }}>
          <Icon size={20} aria-hidden />
        </div>
        <div>
          <h3 className="sks-card__title">{group.title}</h3>
          <p className="sks-card__description">{group.description}</p>
        </div>
      </div>
      <ul className="sks-card__list" role="list">
        {group.skills.map(skill => (
          <li key={skill} className="sks-card__item">
            <span className="sks-card__dot" style={{ background: group.accent }} />
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────── */

export default function SkillsSection() {
  return (
    <section className="sks" id="skills-list" aria-labelledby="sks-heading">
      <div className="container sks__container">

        {/* Section header */}
        <div className="sks__header">
          <h2 id="sks-heading" className="sks__heading">
            What I Bring to Every Project
          </h2>
          <p className="sks__subheading">
            From research and wireframing to polished UI and production-ready code —
            a complete skill set to take your product from concept to launch.
          </p>
        </div>

        {/* Skill group cards */}
        <div className="sks__grid">
          {SKILL_GROUPS.map(group => (
            <SkillCard key={group.id} group={group} />
          ))}
        </div>

        {/* Tools & Software */}
        <div className="sks__tools-section">
          <div className="sks__tools-header">
            <h3 className="sks__tools-title">Tools &amp; Software</h3>
            <p className="sks__tools-sub">
              The go-to tools in my daily design and development workflow.
            </p>
          </div>
          <div className="sks__tools-grid">
            {TOOLS.map(tool => (
              <div key={tool.name} className="sks-tool">
                <span className="sks-tool__name">{tool.name}</span>
                <span className="sks-tool__cat">{tool.category}</span>
                <p className="sks-tool__desc">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="sks__cta">
          <div className="sks__cta-inner">
            <div className="sks__cta-text">
              <h3 className="sks__cta-title">Ready to Work Together?</h3>
              <p className="sks__cta-desc">
                Let's build something clean, strategic, and conversion-focused.
              </p>
            </div>
            <div className="sks__cta-actions">
              <Link to="/contact" className="sks__cta-primary">
                Start a Project →
              </Link>
              <Link to="/case-studies" className="sks__cta-secondary">
                View Case Studies
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
