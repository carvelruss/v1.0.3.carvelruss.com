export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string | null;
  content?: string;
  tech: string[];
  role: string;
  project_type?: string | null;
  client_name?: string | null;
  timeline?: string | null;
  tools?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  live_url?: string | null;
  case_study_url?: string | null;
  github_url?: string | null;
  sort_order: number;
  status?: 'draft' | 'published';
  featured?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
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
  subject?: string | null;
  message: string;
  project_type?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  ip_address?: string | null;
  is_read: number;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at?: string | null;
}

export interface MediaAsset {
  id: number;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string | null;
  content?: string;
  icon_url?: string | null;
  cover_url?: string | null;
  features: string[];
  tags: string[];
  cta_label?: string | null;
  cta_url?: string | null;
  sort_order: number;
  status?: 'draft' | 'published';
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value?: string | null;
  updated_at: string;
}
