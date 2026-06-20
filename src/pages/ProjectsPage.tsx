import { useEffect } from 'react';
import CaseStudiesHero from '../components/public/CaseStudiesHero';
import CaseStudiesSection from '../components/public/CaseStudiesSection';

export default function ProjectsPage() {
  useEffect(() => {
    document.title = 'Case Studies | Carvel Russ';
  }, []);

  return (
    <>
      <CaseStudiesHero />
      <CaseStudiesSection />
    </>
  );
}
