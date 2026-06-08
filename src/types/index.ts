export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content?: string;
  tech: string[];
  role: string;
  live_url?: string | null;
  case_study_url?: string | null;
  github_url?: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id?: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  keywords?: string | null;
  author: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // Extended fields (gracefully absent on older backend records)
  category?: string | null;
  author_avatar?: string | null;
  author_bio?: string | null;
  featured_image_caption?: string | null;
  reading_time?: string | null;
  views_count?: number | null;
  comments_count?: number | null;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  ip_address?: string | null;
  is_read: number;
  created_at: string;
}
