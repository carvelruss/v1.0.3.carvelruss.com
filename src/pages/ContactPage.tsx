import { useEffect } from 'react';
import ContactHero from '../components/public/ContactHero';
import ContactSection from '../components/public/ContactSection';

export default function ContactPage() {
  useEffect(() => { document.title = 'Contact | Carvel Russ'; }, []);

  return (
    <>
      <ContactHero />
      <ContactSection />
    </>
  );
}
