import { useEffect } from 'react';

const DEFAULT_TITLE = 'Carvel Russ | Developer & Designer';
const DEFAULT_DESC  = 'Carvel Russ — UI/UX Developer crafting clean, user-focused digital experiences.';
const BASE_URL      = 'https://carvelruss.com';

export function usePageMeta(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;

    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.name = 'description';
      document.head.appendChild(desc);
    }
    desc.content = description;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${path}`;

    return () => {
      document.title = DEFAULT_TITLE;
      if (desc) desc.content = DEFAULT_DESC;
      canonical?.remove();
    };
  }, [title, description, path]);
}
