'use client';

import { useState, useEffect } from 'react';

interface CriticGame {
  id: number;
  name: string;
  score: number;
  tier: string;
  releaseDate: string | null;
  platforms: string[];
  image: string | null;
  url: string;
}

function scoreClass(score: number) {
  if (score >= 90) return 'mc-universal';
  if (score >= 75) return 'mc-generally';
  if (score >= 50) return 'mc-mixed';
  return 'mc-unfavorable';
}

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    Mighty: 'Mighty',
    Strong: 'Strong',
    Fair: 'Fair',
    Weak: 'Weak',
  };
  return labels[tier] || tier || '';
}

const GAMES_PER_PAGE = 3;

export default function CriticScoresCard() {
  const [games, setGames] = useState<CriticGame[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/metacritic');
        const data = await res.json();
        setGames(data.games || []);
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  return (
    <section className="card card-reviews" id="reviews-section">
      <div className="card-header">
        <div className="card-icon-wrap reviews-icon-wrap">
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
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <h2>Critic Scores</h2>
        {games && games.length > 0 && (
          <span className="card-badge" id="reviews-count">
            {games.length} games
          </span>
        )}
      </div>
      <div className="card-body" id="reviews-content">
        {error ? (
          <div className="error-msg">
            <span className="error-icon">⭐</span>Failed to load critic scores.
          </div>
        ) : games === null ? (
          <div className="skeleton-loader">
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
            <div className="skeleton skeleton-row"></div>
          </div>
        ) : (
          <>
            <div className="reviews-list">
              {games
                .slice((currentPage - 1) * GAMES_PER_PAGE, currentPage * GAMES_PER_PAGE)
                .map((g) => {
                  const cls = scoreClass(g.score);
                  const platforms = (g.platforms || []).join(' · ');
                  return (
                    <a
                      key={g.id}
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`review-item ${cls}`}
                    >
                      <div className="review-thumb">
                        {g.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={g.image} alt={g.name} loading="lazy" />
                        ) : (
                          <div className="review-thumb-placeholder">?</div>
                        )}
                      </div>
                      <div className="review-info">
                        <h3>{g.name}</h3>
                        <div className="review-meta">
                          <span className="review-genres">{platforms}</span>
                        </div>
                      </div>
                      <div className="review-score-wrap">
                        <span className={`mc-score ${cls}`}>{g.score}</span>
                        <span className="review-stats">{tierLabel(g.tier)}</span>
                      </div>
                    </a>
                  );
                })}
            </div>
            {games.length > GAMES_PER_PAGE && (
              <div className="news-pagination">
                {Array.from(
                  { length: Math.ceil(games.length / GAMES_PER_PAGE) },
                  (_, i) => i + 1,
                ).map((page) => (
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
