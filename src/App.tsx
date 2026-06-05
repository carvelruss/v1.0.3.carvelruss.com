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
import Hero from './components/Hero';
import FeatureBar from './components/FeatureBar';
import FeaturedProjects from './components/FeaturedProjects';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CTABanner from './components/CTABanner';

import ProjectsPage from './pages/ProjectsPage';
import CaseStudyDetail from './pages/CaseStudyDetail';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import ThankYou from './pages/ThankYou';
import AdminApp from './admin/AdminApp';

function Portfolio() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <FeatureBar />
        <FeaturedProjects />
        <About />
        <Skills />
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
        <Contact />
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
        <Route path="/thank-you"     element={<ThankYouLayout />} />
        <Route path="/admin/*"       element={<AdminApp />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
