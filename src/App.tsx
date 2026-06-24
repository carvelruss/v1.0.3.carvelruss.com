import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { trackPageView, trackEvent } from './lib/track';

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.pathname.startsWith('/admin')) return;
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

function ScrollTracker() {
  const location  = useLocation();
  const firedRef  = useRef(new Set<number>());
  useEffect(() => {
    firedRef.current = new Set();
    const depths = [25, 50, 75, 100];
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total    = document.documentElement.scrollHeight;
      const pct      = Math.floor((scrolled / total) * 100);
      for (const d of depths) {
        if (pct >= d && !firedRef.current.has(d)) {
          firedRef.current.add(d);
          trackEvent('scroll_depth', null, d);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);
  return null;
}

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
import './styles/public.css';
import './styles/webStudio.css';
import './styles/main.scss';

import Header   from './components/layout/Header';
import Footer from './components/layout/Footer';

import ProjectsPage    from './pages/ProjectsPage';
import CaseStudyDetail from './pages/CaseStudyDetail';
import BlogList        from './pages/BlogList';
import BlogSingle      from './pages/BlogSingle';
import ThankYou        from './pages/ThankYou';
import ContactPage     from './pages/ContactPage';
import SkillsPage      from './pages/SkillsPage';
import AdminApp        from './admin/AdminApp';
import WebStudioLanding from './pages/WebStudioLanding';
import ScrollToTopButton from './components/ScrollToTopButton';

function ProjectsLayout() {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <ProjectsPage />
      </main>
      <Footer />
    </div>
  );
}

function BlogListLayout() {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <BlogList />
      </main>
      <Footer />
    </div>
  );
}

function BlogPostLayout() {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <BlogSingle />
      </main>
      <Footer />
    </div>
  );
}

function SkillsLayout() {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <SkillsPage />
      </main>
      <Footer />
    </div>
  );
}

function ContactLayout() {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <ContactPage />
      </main>
      <Footer />
    </div>
  );
}

function ThankYouLayout() {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <ThankYou />
      </main>
      <Footer />
    </div>
  );
}

function CaseStudyLayout() {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <CaseStudyDetail />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RevealObserver />
      <PageTracker />
      <ScrollTracker />
      <ScrollToTopButton />
      <Routes>
        <Route path="/"                      element={<WebStudioLanding />} />
        <Route path="/case-studies"          element={<ProjectsLayout />} />
        <Route path="/case-studies/:slug"    element={<CaseStudyLayout />} />
        <Route path="/blog"                  element={<BlogListLayout />} />
        <Route path="/blog/:slug"            element={<BlogPostLayout />} />
        <Route path="/blogs"                 element={<BlogListLayout />} />
        <Route path="/blogs/:slug"           element={<BlogPostLayout />} />
        <Route path="/skills"                element={<SkillsLayout />} />
        <Route path="/contact"               element={<ContactLayout />} />
        <Route path="/thank-you"             element={<ThankYouLayout />} />
        <Route path="/admin/*"               element={<AdminApp />} />
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
