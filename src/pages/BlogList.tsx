import { useState, useEffect } from 'react';
import BlogsHero from '../components/public/BlogsHero';
import BlogsSection from '../components/public/BlogsSection';

export default function BlogList() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Blog | Carvel Russ';
  }, []);

  return (
    <>
      <BlogsHero onSearch={setSearch} />
      <BlogsSection search={search} />
    </>
  );
}
