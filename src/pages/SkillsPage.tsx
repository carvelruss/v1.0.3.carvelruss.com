import SkillsHero from '../components/public/SkillsHero';
import SkillsSection from '../components/public/SkillsSection';
import { usePageMeta } from '../lib/usePageMeta';

export default function SkillsPage() {
  usePageMeta(
    'Skills | Carvel Russ',
    'Explore the tools, technologies, and expertise of Carvel Russ — from React and TypeScript to Figma and CSS.',
    '/skills'
  );

  return (
    <>
      <SkillsHero />
      <SkillsSection />
    </>
  );
}
