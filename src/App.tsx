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

import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './styles/webStudio.css';
import './styles/main.scss';

import WSHeader from './components/webstudio/WSHeader';
import WSFooter from './components/webstudio/WSFooter';

import ProjectsPage    from './pages/ProjectsPage';
import CaseStudyDetail from './pages/CaseStudyDetail';
import BlogList        from './pages/BlogList';
import BlogSingle      from './pages/BlogSingle';
import ThankYou        from './pages/ThankYou';
import ContactPage     from './pages/ContactPage';
import SkillsPage      from './pages/SkillsPage';
import AdminApp        from './admin/AdminApp';
import WebStudioLanding from './pages/WebStudioLanding';

// Pages that use WSHeader share this offset so content clears the fixed navbar
const NAV_OFFSET: React.CSSProperties = { paddingTop: '72px' };

function ProjectsLayout() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="main-content" tabIndex={-1} style={NAV_OFFSET}>
        <ProjectsPage />
      </main>
      <WSFooter />
    </div>
  );
}

function BlogListLayout() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="main-content" tabIndex={-1} style={NAV_OFFSET}>
        <BlogList />
      </main>
      <WSFooter />
    </div>
  );
}

function BlogPostLayout() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="main-content" tabIndex={-1} style={NAV_OFFSET}>
        <BlogSingle />
      </main>
      <WSFooter />
    </div>
  );
}

function SkillsLayout() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="main-content" tabIndex={-1} style={NAV_OFFSET}>
        <SkillsPage />
      </main>
      <WSFooter />
    </div>
  );
}

function ContactLayout() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="main-content" tabIndex={-1} style={NAV_OFFSET}>
        <ContactPage />
      </main>
      <WSFooter />
    </div>
  );
}

function ThankYouLayout() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="main-content" tabIndex={-1} style={NAV_OFFSET}>
        <ThankYou />
      </main>
      <WSFooter />
    </div>
  );
}

function CaseStudyLayout() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="main-content" tabIndex={-1} style={NAV_OFFSET}>
        <CaseStudyDetail />
      </main>
      <WSFooter />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RevealObserver />
      <Routes>
        <Route path="/"                      element={<WebStudioLanding />} />
        <Route path="/case-studies"          element={<ProjectsLayout />} />
        <Route path="/case-studies/:slug"    element={<CaseStudyLayout />} />
        <Route path="/blog"                  element={<BlogListLayout />} />
        <Route path="/blog/:slug"            element={<BlogPostLayout />} />
        <Route path="/skills"                element={<SkillsLayout />} />
        <Route path="/contact"               element={<ContactLayout />} />
        <Route path="/thank-you"             element={<ThankYouLayout />} />
        <Route path="/admin/*"               element={<AdminApp />} />
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
