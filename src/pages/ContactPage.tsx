import ContactHero from '../components/public/ContactHero';
import ContactSection from '../components/public/ContactSection';
import { usePageMeta } from '../lib/usePageMeta';

export default function ContactPage() {
  usePageMeta(
    'Contact | Carvel Russ',
    'Get in touch with Carvel Russ for UI/UX design and development projects, collaborations, or inquiries.',
    '/contact'
  );

  return (
    <>
      <ContactHero />
      <ContactSection />
    </>
  );
}
