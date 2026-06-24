import { useState } from 'react';
import BlogsHero from '../components/public/BlogsHero';
import BlogsSection from '../components/public/BlogsSection';
import { usePageMeta } from '../lib/usePageMeta';

export default function BlogList() {
  const [search, setSearch] = useState('');

  usePageMeta(
    'Blog | Carvel Russ',
    'Articles on UI/UX design, frontend development, and web technology by Carvel Russ.',
    '/blog'
  );

  return (
    <>
      <BlogsHero onSearch={setSearch} />
      <BlogsSection search={search} />
    </>
  );
}
