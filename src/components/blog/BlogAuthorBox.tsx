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
    <div className="bs-container">
      <div className="bs-reader">
        <div className="bs-author">
          {avatar ? (
            <img src={avatar} alt={author} className="bs-author__avatar" />
          ) : (
            <div className="bs-author__avatar-fallback" aria-hidden="true">
              {initials}
            </div>
          )}
          <div className="bs-author__meta">
            <p className="bs-author__label">Written by</p>
            <p className="bs-author__name">{author}</p>
            {bio && <p className="bs-author__bio">{bio}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
