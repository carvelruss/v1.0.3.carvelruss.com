import type { Project, Post, Inquiry, MediaAsset, SiteSetting, Service } from '../types';
import { compressImage } from './compressImage';

const TOKEN_KEY = 'portfolio_admin_token';

class ApiClient {
  private readonly base = '/api';

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = this.getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(`${this.base}${path}`, { ...init, headers });

    if (res.status === 401) {
      this.clearToken();
      window.location.href = '/admin/login';
      throw new Error('Session expired');
    }

    let data: Record<string, unknown> = {};
    try {
      data = await res.json() as Record<string, unknown>;
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }

    if (!res.ok) {
      throw new Error((data.error as string) ?? `HTTP ${res.status}`);
    }

    return data as T;
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  async login(password: string): Promise<{ token: string }> {
    return this.request('/auth', { method: 'POST', body: JSON.stringify({ password }) });
  }

  // ── Uploads ──────────────────────────────────────────────────────────────
  async uploadImage(file: File): Promise<{ url: string }> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append('file', compressed);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json() as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return { url: data.url! };
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  getProjects(adminMode = false): Promise<Project[]> {
    return this.request(`/projects${adminMode ? '?admin=true' : ''}`);
  }
  getProjectBySlug(slug: string): Promise<Project> {
    return this.request(`/projects/slug/${slug}`);
  }
  createProject(data: Omit<Project, 'id'>): Promise<{ id: number }> {
    return this.request('/projects', { method: 'POST', body: JSON.stringify(data) });
  }
  updateProject(id: number, data: Partial<Project>): Promise<{ success: boolean }> {
    return this.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteProject(id: number): Promise<{ success: boolean }> {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }
  toggleProjectFeatured(id: number, featured: boolean): Promise<{ success: boolean }> {
    return this.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify({ featured: featured ? 1 : 0 }) });
  }
  toggleProjectStatus(id: number, status: 'draft' | 'published'): Promise<{ success: boolean }> {
    return this.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  // ── Posts ────────────────────────────────────────────────────────────────
  getPosts(adminMode = false): Promise<Post[]> {
    return this.request(`/posts${adminMode ? '?admin=true' : ''}`);
  }
  getPostBySlug(slug: string): Promise<Post> {
    return this.request(`/posts/${slug}`);
  }
  createPost(data: Omit<Post, 'id'>): Promise<{ slug: string }> {
    return this.request('/posts', { method: 'POST', body: JSON.stringify(data) });
  }
  updatePost(slug: string, data: Partial<Post>): Promise<{ slug: string }> {
    return this.request(`/posts/${slug}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deletePost(slug: string): Promise<{ success: boolean }> {
    return this.request(`/posts/${slug}`, { method: 'DELETE' });
  }

  // ── Services ─────────────────────────────────────────────────────────────
  getServices(adminMode = false): Promise<Service[]> {
    return this.request(`/services${adminMode ? '?admin=true' : ''}`);
  }
  getServiceBySlug(slug: string): Promise<Service> {
    return this.request(`/services/slug/${slug}`);
  }
  createService(data: Omit<Service, 'id'>): Promise<{ id: number }> {
    return this.request('/services', { method: 'POST', body: JSON.stringify(data) });
  }
  updateService(id: number, data: Partial<Service>): Promise<{ success: boolean }> {
    return this.request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  deleteService(id: number): Promise<{ success: boolean }> {
    return this.request(`/services/${id}`, { method: 'DELETE' });
  }
  toggleServiceStatus(id: number, status: 'draft' | 'published'): Promise<{ success: boolean }> {
    return this.request(`/services/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  // ── Inquiries ────────────────────────────────────────────────────────────
  getInquiries(status?: string): Promise<Inquiry[]> {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/inquiries${qs}`);
  }
  updateInquiryStatus(id: number, status: 'unread' | 'read' | 'replied' | 'archived'): Promise<{ success: boolean; status: string }> {
    return this.request(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
  markRead(id: number): Promise<{ success: boolean }> {
    return this.updateInquiryStatus(id, 'read');
  }
  deleteInquiry(id: number): Promise<{ success: boolean }> {
    return this.request(`/inquiries/${id}`, { method: 'DELETE' });
  }

  // ── Media ────────────────────────────────────────────────────────────────
  getMedia(): Promise<MediaAsset[]> {
    return this.request('/media');
  }
  deleteMedia(id: number): Promise<{ success: boolean }> {
    return this.request(`/media/${id}`, { method: 'DELETE' });
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings(): Promise<SiteSetting[]> {
    return this.request('/settings');
  }
  updateSettings(settings: Record<string, string>): Promise<{ success: boolean; updated: number }> {
    return this.request('/settings', { method: 'PUT', body: JSON.stringify(settings) });
  }

  // ── Contact (public) ─────────────────────────────────────────────────────
  submitContact(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    project_type?: string;
    budget_range?: string;
    timeline?: string;
    turnstileToken: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request('/contact', { method: 'POST', body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
