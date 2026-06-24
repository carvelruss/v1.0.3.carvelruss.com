import Header from '../components/layout/Header';
import HeroSection from '../components/public/HeroSection';
import FeaturedCaseStudies from '../components/public/FeaturedCaseStudies';
import RecentBlogs from '../components/public/RecentBlogs';
import Footer from '../components/layout/Footer';
import { usePageMeta } from '../lib/usePageMeta';

export default function WebStudioLanding() {
  usePageMeta(
    'Carvel Russ | UI/UX Developer & Designer',
    'Carvel Russ is a UI/UX developer building clean, user-centered digital experiences. View case studies, blog posts, and more.',
    '/'
  );

  return (
    <div className="ws-page">
      <Header />
      <main id="ws-main" tabIndex={-1}>
        <HeroSection />
        <FeaturedCaseStudies />
        <RecentBlogs />
      </main>
      <Footer />
    </div>
  )
}
