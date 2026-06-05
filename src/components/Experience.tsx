import { experiences, type ExperienceItem } from '../data/experience';

function ExperienceCard({ item, index }: { item: ExperienceItem; index: number }) {
  const isCurrent = item.period.toLowerCase().includes('present');
  return (
    <div className="experience__item" data-reveal data-reveal-delay={index * 100}>
      <div className="experience__timeline" aria-hidden="true">
        <div className={`experience__dot${isCurrent ? ' experience__dot--current' : ''}`} />
        <div className="experience__line" />
      </div>

      <article className="experience__card card" aria-label={`${item.role} at ${item.company}`}>
        <div className="experience__card-top">
          <div className="experience__role-row">
            <h3 className="experience__role">{item.role}</h3>
            {isCurrent && <span className="experience__current-badge">Current</span>}
          </div>
          <span className="experience__period">{item.period}</span>
        </div>

        <div className="experience__company-row">
          <span className="experience__company">{item.company}</span>
          <span className="experience__location">· {item.location}</span>
        </div>

        <ul className="experience__highlights" aria-label="Key highlights">
          {item.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      </article>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="section experience-section" aria-label="Work experience">
      <div className="container-site">

        <p className="section__eyebrow" data-reveal>Career</p>
        <h2 className="section__title" data-reveal>Work Experience</h2>

        <div className="experience__list">
          {experiences.map((item, i) => (
            <ExperienceCard key={item.id} item={item} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
