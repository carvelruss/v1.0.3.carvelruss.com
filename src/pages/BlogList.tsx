import { useEffect } from 'react';
import BlogsHero from '../components/public/BlogsHero';
import BlogsSection from '../components/public/BlogsSection';

export default function BlogList() {
  useEffect(() => {
    document.title = 'Blog | Carvel Russ';
  }, []);

  return (
    <>
      <BlogsHero />
      <BlogsSection />
    </>
  );
}
