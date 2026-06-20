import Header from '../components/layout/Header';
import HeroSection from '../components/public/HeroSection';
import WSCaseStudies from '../components/webstudio/WSCaseStudies';
import WSFooter from '../components/webstudio/WSFooter';

const VALUES = [
  { icon: '👤', title: 'User-Centered',  desc: 'Designs based on real user needs and goals.' },
  { icon: '✨', title: 'Clean & Modern', desc: 'Simple, beautiful and meaningful interfaces.' },
  { icon: '📈', title: 'Results Driven', desc: 'Designs that improve engagement and growth.' },
  { icon: '🎯', title: 'Pixel Perfect',  desc: 'Attention to detail in every single element.' },
]

export default function WebStudioLanding() {
  return (
    <div className="ws-page">
      <Header />
      <main id="ws-main" tabIndex={-1}>
        <HeroSection />
        <WSCaseStudies />
        <section className="pf-section pf-section--sm" style={{ borderTop: '1px solid var(--pf-border-light)' }}>
          <div className="container">
            <div className="pf-value-grid">
              {VALUES.map(v => (
                <div key={v.title} className="pf-value-item">
                  <span className="pf-value-item__icon">{v.icon}</span>
                  <strong className="pf-value-item__title">{v.title}</strong>
                  <p className="pf-value-item__desc">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <WSFooter />
    </div>
  )
}
