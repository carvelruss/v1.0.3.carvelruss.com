import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Post } from '../../types';

export default function PostsAdmin() {
  const navigate = useNavigate();
  const [posts, setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    api.getPosts(true)
      .then(setPosts)
      .catch(() => setError('Failed to load posts'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await api.deletePost(post.slug);
      setSuccess(`"${post.title}" deleted.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <AdminLayout
      pageTitle="Blog Posts"
      headerAction={
        <button className="a-btn a-btn--primary" onClick={() => navigate('/admin/posts/new')}>
          + New Post
        </button>
      }
    >
      {error   && <div className="a-alert a-alert--error"   role="alert"   style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status"  style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      <div className="a-card">
        <div className="a-table-wrap">
          {loading ? (
            <p style={{ padding: 24, color: '#64748b' }}>Loading…</p>
          ) : (
            <table className="a-table" aria-label="Blog posts list">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="a-table__empty">
                      No posts yet.{' '}
                      <button
                        className="a-btn a-btn--primary a-btn--sm"
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate('/admin/posts/new')}
                      >
                        Write your first post →
                      </button>
                    </td>
                  </tr>
                )}
                {posts.map(post => (
                  <tr key={post.slug}>
                    <td style={{ maxWidth: 320 }}>
                      <div className="a-table__title">{post.title}</div>
                      {post.excerpt && (
                        <div className="a-table__sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.excerpt}
                        </div>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: 11.5, color: '#6366f1', background: '#eef2ff', padding: '2px 7px', borderRadius: 6 }}>
                        {post.slug}
                      </code>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>
                      {post.category || <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td>
                      <span className={`a-badge a-badge--${post.status}`}>
                        <span className="a-badge__dot" />
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {formatDate(post.published_at)}
                    </td>
                    <td>
                      <div className="a-table__actions">
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="a-btn a-btn--ghost a-btn--sm"
                            aria-label={`View ${post.title}`}
                          >
                            View
                          </a>
                        )}
                        <button
                          className="a-btn a-btn--ghost a-btn--sm"
                          onClick={() => navigate(`/admin/posts/${post.slug}/edit`)}
                          aria-label={`Edit ${post.title}`}
                        >
                          Edit
                        </button>
                        <button
                          className="a-btn a-btn--danger a-btn--sm"
                          onClick={() => handleDelete(post)}
                          aria-label={`Delete ${post.title}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
