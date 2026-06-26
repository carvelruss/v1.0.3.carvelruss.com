import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, lazy, Suspense } from 'react';
import { trackPageView, trackEvent } from './lib/track';
import { initVitals } from './lib/vitals';

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

    // Cache scrollHeight — reading it on every scroll forces layout recalculation.
    // ResizeObserver updates the cache only when the document actually resizes.
    let totalHeight = document.documentElement.scrollHeight;
    const ro = new ResizeObserver(() => {
      totalHeight = document.documentElement.scrollHeight;
    });
    ro.observe(document.documentElement);

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const pct      = Math.floor((scrolled / totalHeight) * 100);
      for (const d of depths) {
        if (pct >= d && !firedRef.current.has(d)) {
          firedRef.current.add(d);
          trackEvent('scroll_depth', null, d);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); ro.disconnect(); };
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

import Header            from './components/layout/Header';
import Footer            from './components/layout/Footer';
import WebStudioLanding  from './pages/WebStudioLanding';
import ScrollToTopButton  from './components/ScrollToTopButton';
import WriteReviewButton  from './components/WriteReviewButton';

// All non-homepage routes are lazy — they're never needed for the initial LCP paint.
// AdminApp especially: it imports TipTap + react-datepicker that no public visitor needs.
const ProjectsPage    = lazy(() => import('./pages/ProjectsPage'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
const ServiceDetail   = lazy(() => import('./pages/ServiceDetail'));
const BlogList        = lazy(() => import('./pages/BlogList'));
const BlogSingle      = lazy(() => import('./pages/BlogSingle'));
const ThankYou        = lazy(() => import('./pages/ThankYou'));
const ContactPage     = lazy(() => import('./pages/ContactPage'));
const SkillsPage      = lazy(() => import('./pages/SkillsPage'));
const AdminApp        = lazy(() => import('./admin/AdminApp'));

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ws-page">
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  useEffect(() => { initVitals(); }, []);

  return (
    <BrowserRouter>
      <RevealObserver />
      <PageTracker />
      <ScrollTracker />
      <ScrollToTopButton />
      <WriteReviewButton />
      <Routes>
        <Route path="/"                      element={<WebStudioLanding />} />
        <Route path="/case-studies"          element={<PageShell><ProjectsPage /></PageShell>} />
        <Route path="/case-studies/:slug"    element={<PageShell><CaseStudyDetail /></PageShell>} />
        <Route path="/services/:slug"        element={<Suspense fallback={null}><ServiceDetail /></Suspense>} />
        <Route path="/blog"                  element={<PageShell><BlogList /></PageShell>} />
        <Route path="/blog/:slug"            element={<PageShell><BlogSingle /></PageShell>} />
        <Route path="/blogs"                 element={<PageShell><BlogList /></PageShell>} />
        <Route path="/blogs/:slug"           element={<PageShell><BlogSingle /></PageShell>} />
        <Route path="/skills"                element={<PageShell><SkillsPage /></PageShell>} />
        <Route path="/contact"               element={<PageShell><ContactPage /></PageShell>} />
        <Route path="/thank-you"             element={<PageShell><ThankYou /></PageShell>} />
        <Route path="/admin/*"               element={<Suspense fallback={null}><AdminApp /></Suspense>} />
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
