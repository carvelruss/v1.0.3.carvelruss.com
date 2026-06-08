import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Global scroll-reveal — watches [data-reveal] elements and adds .is-revealed on entry
function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          setTimeout(() => el.classList.add('is-revealed'), delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    const scan = () =>
      document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(el => observer.observe(el));

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mo.disconnect(); };
  }, []);
  return null;
}
import './styles/main.scss';

import Header from './components/Header';
import HeaderHero from './components/HeaderHero';
import FeatureBar from './components/FeatureBar';
import FeaturedProjects from './components/FeaturedProjects';
import Competencies from './components/Competencies';
import TrustedClients from './components/TrustedClients';
import About from './components/About';
import Experience from './components/Experience';
import Footer from './components/Footer';
import CTABanner from './components/CTABanner';

import ProjectsPage from './pages/ProjectsPage';
import CaseStudyDetail from './pages/CaseStudyDetail';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import ThankYou from './pages/ThankYou';
import ContactPage from './pages/ContactPage';
import SkillsPage from './pages/SkillsPage';
import AdminApp from './admin/AdminApp';
import WebStudioLanding from './pages/WebStudioLanding';

function Portfolio() {
  return (
    <>
      <HeaderHero />
      <main id="main-content" tabIndex={-1}>
        {/* Hero is rendered inside HeaderHero — do not add a standalone <Hero /> here */}
        <FeatureBar />
        <FeaturedProjects />
        <Competencies />
        <TrustedClients />
        <About />
        <div className="container-site">
          <CTABanner
            heading="Ready to see my work?"
            subtext="Browse my portfolio of UI/UX and frontend projects."
            primaryLabel="View Case Studies →"
            primaryHref="/case-studies"
            secondaryLabel="Read the Blog"
            secondaryHref="/blog"
          />
        </div>
        <Experience />
      </main>
      <Footer />
    </>
  );
}

function ProjectsLayout() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <ProjectsPage />
      </main>
      <Footer />
    </>
  );
}

function BlogListLayout() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <BlogList />
      </main>
      <Footer />
    </>
  );
}

function BlogPostLayout() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <BlogPost />
      </main>
      <Footer />
    </>
  );
}

function SkillsLayout() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <SkillsPage />
      </main>
      <Footer />
    </>
  );
}

function ContactLayout() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <ContactPage />
      </main>
      <Footer />
    </>
  );
}

function ThankYouLayout() {
  return (
    <>
      <Header />
      <ThankYou />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RevealObserver />
      <Routes>
        <Route path="/"              element={<Portfolio />} />
        <Route path="/case-studies"          element={<ProjectsLayout />} />
        <Route path="/case-studies/:slug"    element={<><Header /><main id="main-content" tabIndex={-1}><CaseStudyDetail /></main><Footer /></>} />
        <Route path="/blog"          element={<BlogListLayout />} />
        <Route path="/blog/:slug"    element={<BlogPostLayout />} />
        <Route path="/skills"        element={<SkillsLayout />} />
        <Route path="/contact"       element={<ContactLayout />} />
        <Route path="/thank-you"     element={<ThankYouLayout />} />
        <Route path="/web-studio"    element={<WebStudioLanding />} />
        <Route path="/admin/*"       element={<AdminApp />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
