import Header from '../components/layout/Header';
import HeroSection from '../components/public/HeroSection';
import FeaturedCaseStudies from '../components/public/FeaturedCaseStudies';
import RecentBlogs from '../components/public/RecentBlogs';
import Footer from '../components/layout/Footer';

export default function WebStudioLanding() {
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
