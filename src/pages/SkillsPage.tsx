import { useEffect } from 'react';

const DESIGN_SKILLS = [
  { name: 'UI Design', icon: '🖥' },
  { name: 'UX Design', icon: '✏️' },
  { name: 'Wireframing', icon: '📐' },
  { name: 'Prototyping', icon: '▶️' },
  { name: 'Design Systems', icon: '🔲' },
  { name: 'Interaction Design', icon: '⚡' },
  { name: 'User Research', icon: '🔍' },
  { name: 'Responsive Design', icon: '📱' },
];

const RESEARCH_SKILLS = [
  { name: 'User Research', icon: '👥' },
  { name: 'Competitive Analysis', icon: '📊' },
  { name: 'Information Architecture', icon: '🗂' },
  { name: 'Usability Testing', icon: '🧪' },
  { name: 'Conversion Optimization', icon: '📈' },
];

const FRONTEND_SKILLS = [
  { name: 'HTML', icon: '🌐' },
  { name: 'CSS', icon: '🎨' },
  { name: 'Bootstrap', icon: '🅱' },
  { name: 'React/JS', icon: '⚛️' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Responsive Design', icon: '📱' },
];

const TOOLS = [
  { name: 'Figma', icon: '🎯' },
  { name: 'Adobe XD', icon: '🔷' },
  { name: 'Photoshop', icon: '🖼' },
  { name: 'Illustrator', icon: '✏️' },
  { name: 'Notion', icon: '📝' },
  { name: 'FigJam', icon: '🟡' },
];

export default function SkillsPage() {
  useEffect(() => {
    document.title = 'My Skills | Carvel Russ';
  }, []);

  return (
    <>
      <div className="pf-page-hero">
        <div className="container">
          <h1 className="pf-page-hero__title">My Skills</h1>
          <p className="pf-page-hero__sub">
            A combination of design thinking, technical skills and creative expertise.
          </p>
        </div>
      </div>

      <section className="pf-section">
        <div className="container">

          <div className="pf-skills-section">
            <h3 className="pf-skills-section__title">Design Skills</h3>
            <div className="pf-skill-grid">
              {DESIGN_SKILLS.map(skill => (
                <div key={skill.name} className="pf-skill-card">
                  <span className="pf-skill-card__icon">{skill.icon}</span>
                  <span className="pf-skill-card__name">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pf-skills-section">
            <h3 className="pf-skills-section__title">Research &amp; Strategy</h3>
            <div className="pf-skill-grid">
              {RESEARCH_SKILLS.map(skill => (
                <div key={skill.name} className="pf-skill-card">
                  <span className="pf-skill-card__icon">{skill.icon}</span>
                  <span className="pf-skill-card__name">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pf-skills-section">
            <h3 className="pf-skills-section__title">Frontend Skills</h3>
            <div className="pf-skill-grid">
              {FRONTEND_SKILLS.map(skill => (
                <div key={skill.name} className="pf-skill-card">
                  <span className="pf-skill-card__icon">{skill.icon}</span>
                  <span className="pf-skill-card__name">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pf-skills-section">
            <h3 className="pf-skills-section__title">Tools I Use</h3>
            <div className="pf-skill-grid">
              {TOOLS.map(tool => (
                <div key={tool.name} className="pf-tool-card">
                  <span className="pf-tool-card__icon">{tool.icon}</span>
                  <span className="pf-tool-card__name">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
