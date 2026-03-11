'use client';

import { useState, useEffect } from 'react';

interface Article {
  title: string;
  link: string;
  date: string | null;
  source: string;
}

const NEWS_PER_PAGE = 4;

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getSourceClass(source: string) {
  const s = source.toLowerCase();
  if (s.includes('pc gamer')) return 'news-source-pcgamer';
  if (s.includes('kotaku')) return 'news-source-kotaku';
  if (s.includes('rock paper')) return 'news-source-rps';
  return 'news-source-default';
}

function dispatchStat(key: string, value: string) {
  window.dispatchEvent(new CustomEvent('stat-update', { detail: { key, value } }));
}

export default function NewsCard() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        if (!data.articles || data.articles.length === 0) {
          setArticles([]);
          dispatchStat('news', 'No news');
        } else {
          setArticles(data.articles);
          dispatchStat('news', `${data.articles.length} latest articles`);
        }
      } catch {
        setError(true);
        dispatchStat('news', 'Error loading');
      }
    }
    load();
  }, []);

  const totalPages = articles ? Math.ceil(articles.length / NEWS_PER_PAGE) : 0;
  const start = (currentPage - 1) * NEWS_PER_PAGE;
  const pageArticles = articles ? articles.slice(start, start + NEWS_PER_PAGE) : [];

  return (
    <section className="card card-news" id="news-section">
      <div className="card-header">
        <div className="card-icon-wrap news-icon-wrap">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6z" />
          </svg>
        </div>
        <h2>Gaming News</h2>
        {articles && articles.length > 0 && (
          <span className="card-badge" id="news-count">
            {articles.length} articles
          </span>
        )}
      </div>
      <div className="card-body" id="news-content">
        {error ? (
          <div className="error-msg">
            <span className="error-icon">📰</span>Failed to load news.
          </div>
        ) : articles === null ? (
          <div className="skeleton-loader">
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="error-msg">
            <span className="error-icon">📜</span>No news available right now.
          </div>
        ) : (
          <>
            <div className="news-list">
              {pageArticles.map((a, i) => (
                <div key={`${a.link}-${i}`} className="news-item">
                  <div className="news-content">
                    <a href={a.link} target="_blank" rel="noopener noreferrer">
                      {a.title}
                    </a>
                  </div>
                  <div className="news-meta">
                    <span className={`news-source ${getSourceClass(a.source)}`}>
                      {a.source}
                    </span>
                    <span className="news-time">{timeAgo(a.date)}</span>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="news-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`news-page-btn${page === currentPage ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
