import { Link } from 'react-router-dom';

interface Props {
  author: string;
  avatar?: string | null;
  bio?: string | null;
}

export default function BlogAuthorBox({ author, avatar, bio }: Props) {
  const initials = author
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bs-author-card">
      {/* Avatar top */}
      {avatar ? (
        <img src={avatar} alt={author} className="bs-author-card__avatar" />
      ) : (
        <div className="bs-author-card__initials" aria-hidden="true">
          {initials}
        </div>
      )}

      <p className="bs-author-card__label">Written by</p>
      <p className="bs-author-card__name">{author}</p>

      {bio && <p className="bs-author-card__bio">{bio}</p>}

      <Link to="/blog" className="bs-author-card__btn">
        Browse all articles ↗
      </Link>
    </div>
  );
}
