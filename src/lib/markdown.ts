import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(content: string): string {
  const trimmed = content.trim();
  // Tiptap (rich editor) outputs HTML — detect by leading tag and sanitize directly
  const html = trimmed.startsWith('<')
    ? trimmed
    : marked.parse(trimmed) as string;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','u','del','a','ul','ol','li','blockquote','pre','code','img','hr','table','thead','tbody','tr','th','td'],
    ALLOWED_ATTR: ['href','src','alt','title','class','target','rel'],
  });
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function excerpt(content: string, maxLength = 160): string {
  const text = content.replace(/[#*`[\]()!>_~]/g, '').replace(/\n+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength).replace(/\s\S*$/, '') + '…' : text;
}
