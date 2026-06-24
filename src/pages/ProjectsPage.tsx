import CaseStudiesHero from '../components/public/CaseStudiesHero';
import CaseStudiesSection from '../components/public/CaseStudiesSection';
import { usePageMeta } from '../lib/usePageMeta';

export default function ProjectsPage() {
  usePageMeta(
    'Case Studies | Carvel Russ',
    'Explore UI/UX design and development case studies by Carvel Russ — real projects with real results.',
    '/case-studies'
  );

  return (
    <>
      <CaseStudiesHero />
      <CaseStudiesSection />
    </>
  );
}
