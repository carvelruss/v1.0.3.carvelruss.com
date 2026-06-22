import { useState } from 'react';
import { FiFacebook, FiTwitter, FiLinkedin, FiLink, FiCheck } from 'react-icons/fi';

interface Props {
  title: string;
  url: string;
}

export default function BlogShare({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const enc = encodeURIComponent;

  return (
    <div className="bs-container">
      <div className="bs-reader">
        <div className="bs-share">
          <span className="bs-share__label">Share this post:</span>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-share__btn"
            aria-label="Share on Facebook"
          >
            <FiFacebook size={16} />
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-share__btn"
            aria-label="Share on X / Twitter"
          >
            <FiTwitter size={16} />
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-share__btn"
            aria-label="Share on LinkedIn"
          >
            <FiLinkedin size={16} />
          </a>

          <button
            type="button"
            className={`bs-share__btn${copied ? ' bs-share__btn--copied' : ''}`}
            onClick={copyLink}
            aria-label={copied ? 'Link copied!' : 'Copy link'}
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? <FiCheck size={16} /> : <FiLink size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
