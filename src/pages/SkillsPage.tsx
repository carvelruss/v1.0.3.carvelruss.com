import { useEffect } from 'react';
import SkillsHero from '../components/public/SkillsHero';
import SkillsSection from '../components/public/SkillsSection';

export default function SkillsPage() {
  useEffect(() => {
    document.title = 'Skills | Carvel Russ';
  }, []);

  return (
    <>
      <SkillsHero />
      <SkillsSection />
    </>
  );
}
