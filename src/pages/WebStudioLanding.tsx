import WSHeader        from '../components/webstudio/WSHeader';
import WSHero          from '../components/webstudio/WSHero';
import WSServices      from '../components/webstudio/WSServices';
import WSIndustries    from '../components/webstudio/WSIndustries';
import WSSkills        from '../components/webstudio/WSSkills';
import WSCaseStudies   from '../components/webstudio/WSCaseStudies';
import WSBenefitsContact from '../components/webstudio/WSBenefitsContact';
import WSFooter        from '../components/webstudio/WSFooter';

export default function WebStudioLanding() {
  return (
    <div className="ws-page">
      <WSHeader />
      <main id="ws-main" tabIndex={-1}>
        <WSHero />
        <WSServices />
        <WSIndustries />
        <WSSkills />
        <WSCaseStudies />
        <WSBenefitsContact />
      </main>
      <WSFooter />
    </div>
  );
}
