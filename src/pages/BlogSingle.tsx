import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import type { Post } from '../types';
import '../styles/blog-single.css';
import BlogHero from '../components/blog/BlogHero';
import BlogContent from '../components/blog/BlogContent';
import BlogShare from '../components/blog/BlogShare';
import RelatedArticles from '../components/blog/RelatedArticles';
import NewsletterBlock from '../components/blog/NewsletterBlock';
import CTABanner from '../components/CTABanner';

export default function BlogSingle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [html, setHtml] = useState('');
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const setMeta = (name: string, content: string, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(prop ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    api.getPostBySlug(slug)
      .then(async p => {
        setPost(p);
        setHtml(renderMarkdown(p.content ?? ''));
        document.title = `${p.title} | Carvel Russ`;

        if (p.meta_description) setMeta('description', p.meta_description);
        if (p.keywords)         setMeta('keywords', p.keywords);
        setMeta('author', p.author);
        setMeta('og:type',  'article', true);
        setMeta('og:title', p.title,   true);
        if (p.meta_description) setMeta('og:description', p.meta_description, true);
        if (p.og_image)         setMeta('og:image', p.og_image, true);
        setMeta('og:url', window.location.href, true);
        setMeta('twitter:card',  'summary_large_image');
        setMeta('twitter:title', p.title);
        if (p.meta_description) setMeta('twitter:description', p.meta_description);
        if (p.og_image)         setMeta('twitter:image', p.og_image);

        let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.setAttribute('rel', 'canonical');
          document.head.appendChild(canonical);
        }
        canonical.href = window.location.href;

        document.getElementById('blog-ld')?.remove();
        const ld = document.createElement('script');
        ld.id   = 'blog-ld';
        ld.type = 'application/ld+json';
        ld.text = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.meta_description,
          author: { '@type': 'Person', name: p.author },
          datePublished: p.published_at,
          dateModified: p.updated_at,
          image: p.og_image,
          url: window.location.href,
        });
        document.head.appendChild(ld);

        // Load related posts (silently ignore failures)
        try {
          const allPosts = await api.getPosts(false);
          setRelated(allPosts.filter(other => other.slug !== slug));
        } catch {
          // related posts are optional
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    return () => { document.getElementById('blog-ld')?.remove(); };
  }, [slug]);

  if (loading) {
    return (
      <div className="ws-loading-state" style={{ paddingTop: '8rem' }}>Loading…</div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="ws-pg-hero" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>404</p>
          <h1 className="section-title">Post not found</h1>
          <p style={{ color: 'var(--ws-body)', marginBottom: '1.5rem' }}>
            This post doesn't exist or has been removed.
          </p>
          <button className="ws-btn-primary" onClick={() => navigate('/blog')}>← Back to Blog</button>
        </div>
      </div>
    );
  }

  return (
    <article>
      <BlogHero post={post} />
      <BlogContent html={html} post={post} />
      <BlogShare title={post.title} url={window.location.href} />
      <RelatedArticles posts={related} />
      <NewsletterBlock />
      <div className="container" style={{ paddingBottom: '4rem', marginTop: '2.5rem' }}>
        <CTABanner
          heading="Enjoyed this post?"
          subtext="If you'd like to work together or just say hi, I'd love to hear from you."
          primaryLabel="Get in Touch"
          primaryHref="/contact"
          secondaryLabel="View Case Studies"
          secondaryHref="/case-studies"
        />
      </div>
    </article>
  );
}
