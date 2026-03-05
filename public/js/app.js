// === Particle Background ===
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const colors = [
    [255, 73, 57],   // red accent
    [74, 158, 255],  // blue accent
    [107, 184, 255], // light blue
    [74, 222, 128],  // green
  ];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const count = Math.min(40, Math.floor(window.innerWidth / 30));
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.3,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.15,
      baseAlpha: Math.random() * 0.3 + 0.05,
      color,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() * 0.001;
    for (const p of particles) {
      const flicker = 0.5 + 0.5 * Math.sin(t * 0.6 + p.phase);
      const a = p.baseAlpha * (0.3 + 0.7 * flicker);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${a})`;
      ctx.shadowBlur = p.r * 4;
      ctx.shadowColor = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${a * 0.5})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  draw();
})();

// === Live Clock ===
function updateClock() {
  const el = document.getElementById('hero-clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  }) + ' · ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}
updateClock();
setInterval(updateClock, 1000);

// === Helpers ===
function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { days: d, hours: h, minutes: m, seconds: s };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function countdownHTML(dateStr) {
  const t = timeUntil(dateStr);
  if (!t) return '<span class="sale-status">Happening now or already passed!</span>';
  return `<div class="countdown">
    <div class="countdown-unit"><div class="countdown-value">${t.days}</div><div class="countdown-label">Days</div></div>
    <div class="countdown-unit"><div class="countdown-value">${pad(t.hours)}</div><div class="countdown-label">Hours</div></div>
    <div class="countdown-unit"><div class="countdown-value">${pad(t.minutes)}</div><div class="countdown-label">Min</div></div>
    <div class="countdown-unit"><div class="countdown-value">${pad(t.seconds)}</div><div class="countdown-label">Sec</div></div>
  </div>`;
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'TBA') return 'TBA';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

function relativeTime(dateStr) {
  if (!dateStr || dateStr === 'TBA') return '';
  const release = new Date(dateStr);
  if (isNaN(release.getTime())) return '';
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const releaseMid = new Date(release.getFullYear(), release.getMonth(), release.getDate());
  const days = Math.round((releaseMid - todayMid) / 86400000);
  if (days < 0) return 'Released';
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow!';
  if (days < 7) return `${days} days away`;
  if (days < 30) return `${Math.ceil(days / 7)} weeks away`;
  const months = Math.floor(days / 30);
  return `~${months} month${months > 1 ? 's' : ''} away`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr);
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

function getSourceClass(source) {
  const s = source.toLowerCase();
  if (s.includes('pc gamer')) return 'news-source-pcgamer';
  if (s.includes('kotaku')) return 'news-source-kotaku';
  if (s.includes('rock paper')) return 'news-source-rps';
  return 'news-source-default';
}

function stringToColor(str) {
  const colors = [
    ['rgba(167, 139, 250, 0.15)', 'rgba(124, 58, 237, 0.08)'],
    ['rgba(255, 179, 71, 0.15)', 'rgba(200, 135, 58, 0.08)'],
    ['rgba(103, 232, 249, 0.15)', 'rgba(6, 182, 212, 0.08)'],
    ['rgba(52, 211, 153, 0.15)', 'rgba(5, 150, 105, 0.08)'],
    ['rgba(248, 113, 113, 0.12)', 'rgba(220, 38, 38, 0.06)'],
    ['rgba(251, 191, 36, 0.12)', 'rgba(217, 119, 6, 0.06)'],
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getPlatformIcons(platforms) {
  if (!platforms || platforms.length === 0) return '';
  const icons = [];
  const joined = platforms.join(' ').toLowerCase();
  if (joined.includes('pc') || joined.includes('windows')) icons.push('PC');
  if (joined.includes('playstation')) icons.push('PS');
  if (joined.includes('xbox')) icons.push('XB');
  if (joined.includes('switch') || joined.includes('nintendo')) icons.push('NS');
  if (icons.length === 0) return '';
  return `<div class="release-platform-tag">${icons.map(i => `<span class="platform-icon">${i}</span>`).join('')}</div>`;
}

// === Sale Visual (animated SVG) ===
function saleVisualHTML() {
  return `<div class="sale-visual">
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="saleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff4939"/>
          <stop offset="100%" style="stop-color:#d93a2d"/>
        </linearGradient>
        <filter id="saleGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="40" cy="40" r="30" fill="none" stroke="url(#saleGrad1)" stroke-width="2" stroke-dasharray="6 4" class="sale-ring" filter="url(#saleGlow)"/>
      <text x="40" y="46" text-anchor="middle" font-size="24" filter="url(#saleGlow)">🏷️</text>
    </svg>
  </div>`;
}

// === Fetch & Render: Steam Sales ===
let saleCountdownInterval;

async function loadSteamSales() {
  const el = document.getElementById('sale-content');
  const statEl = document.getElementById('stat-sale-text');
  try {
    const res = await fetch('/api/steam-sales');
    const data = await res.json();

    if (!data.next) {
      el.innerHTML = '<div class="error-msg"><span class="error-icon">🔮</span>No upcoming sales found.</div>';
      statEl.textContent = 'No upcoming sales';
      return;
    }

    function render() {
      const sale = data.next;
      const isActive = data.active;
      let html = saleVisualHTML();
      html += `<div class="sale-name">${sale.name}</div>`;

      if (isActive) {
        html += `<div class="sale-active-badge"><span class="sale-active-dot"></span> LIVE NOW</div>`;
        html += `<div class="sale-status">Ends ${formatDate(sale.end)}</div>`;
        html += countdownHTML(sale.end);
        statEl.textContent = `${sale.name} — LIVE!`;
      } else {
        html += `<div class="sale-status">Starts ${formatDate(sale.start)}</div>`;
        html += countdownHTML(sale.start);
        const t = timeUntil(sale.start);
        statEl.textContent = t ? `${sale.name} in ${t.days}d` : sale.name;
      }
      el.innerHTML = html;
    }

    render();
    clearInterval(saleCountdownInterval);
    saleCountdownInterval = setInterval(render, 1000);
  } catch (err) {
    el.innerHTML = '<div class="error-msg"><span class="error-icon">⚡</span>Failed to load sale data.</div>';
    statEl.textContent = 'Error loading';
  }
}

// === Fetch & Render: Steam Hardware ===
async function loadHardware() {
  const el = document.getElementById('hardware-content');
  try {
    const res = await fetch('/api/steam-hardware');
    const data = await res.json();

    const deviceIcons = {
      'Steam Deck': '🎮',
      'Steam Controller (2026)': '🕹️',
      'Steam Machine': '🖥️',
      'Steam Frame (VR)': '🥽',
    };

    function badgeClass(d) {
      if (d.available) return 'badge-available';
      if (d.isNew) return 'badge-new';
      return 'badge-unavailable';
    }

    function badgeText(d) {
      if (d.available) return '✓ Available';
      if (d.isNew) return '⬡ ' + d.status;
      return '✗ Discontinued';
    }

    el.innerHTML = `<div class="hardware-list">
      ${data.devices.map(d => `
        <div class="hardware-item ${d.isNew ? 'hardware-item-new' : ''}">
          <div class="hardware-icon ${d.available ? 'hardware-icon-available' : d.isNew ? 'hardware-icon-new' : 'hardware-icon-unavailable'}">
            ${deviceIcons[d.name] || '📦'}
          </div>
          <div class="hardware-info">
            <h3>${d.name}${d.isNew ? ' <span class="new-tag">NEW</span>' : ''}</h3>
            ${d.url ? `<a href="${d.url}" target="_blank" rel="noopener">View on Steam Store</a>` : ''}
          </div>
          <span class="hardware-badge ${badgeClass(d)}">
            ${badgeText(d)}
          </span>
        </div>
      `).join('')}
    </div>
    <div class="hardware-updated">Last updated: ${formatDate(data.lastUpdated)}</div>`;
  } catch (err) {
    el.innerHTML = '<div class="error-msg"><span class="error-icon">🔧</span>Failed to load hardware data.</div>';
  }
}

// === Fetch & Render: Releases ===
async function loadReleases() {
  const el = document.getElementById('releases-content');
  const countEl = document.getElementById('release-count');
  const statEl = document.getElementById('stat-releases-text');
  try {
    const res = await fetch('/api/releases');
    const data = await res.json();

    if (!data.games || data.games.length === 0) {
      el.innerHTML = '<div class="error-msg"><span class="error-icon">🎮</span>No upcoming releases found.</div>';
      statEl.textContent = 'No releases';
      return;
    }

    countEl.textContent = `${data.games.length} titles`;
    statEl.textContent = `${data.games.length} upcoming releases`;

    el.innerHTML = `<div class="releases-grid">
      ${data.games.map(g => {
        const [c1, c2] = stringToColor(g.name);
        return `
        <div class="release-card">
          <div class="release-img-wrap">
            ${g.image
              ? `<img class="release-img" src="${g.image}" alt="${g.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'release-img-placeholder\\' style=\\'background:linear-gradient(135deg,${c1},${c2})\\'><span>${g.name.charAt(0)}</span></div>';">`
              : `<div class="release-img-placeholder" style="background:linear-gradient(135deg,${c1},${c2})"><span>${g.name.charAt(0)}</span></div>`
            }
            ${getPlatformIcons(g.platforms)}
          </div>
          <div class="release-info">
            <h3>${g.name}</h3>
            <div class="release-date">${g.released || 'Coming Soon'}</div>
            <div class="release-countdown">${relativeTime(g.released)}</div>
            ${g.genres && g.genres.length ? `<div class="release-genres">${g.genres.join(' · ')}</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  } catch (err) {
    el.innerHTML = '<div class="error-msg"><span class="error-icon">🚀</span>Failed to load releases.</div>';
    statEl.textContent = 'Error loading';
  }
}

// === Fetch & Render: News (paginated) ===
const NEWS_PER_PAGE = 5;
let newsArticles = [];
let newsCurrentPage = 1;

function renderNewsPage() {
  const el = document.getElementById('news-content');
  const totalPages = Math.ceil(newsArticles.length / NEWS_PER_PAGE);
  const start = (newsCurrentPage - 1) * NEWS_PER_PAGE;
  const pageArticles = newsArticles.slice(start, start + NEWS_PER_PAGE);

  let html = `<div class="news-list">
    ${pageArticles.map(a => `
      <div class="news-item">
        <div class="news-content">
          <a href="${a.link}" target="_blank" rel="noopener">${a.title}</a>
        </div>
        <div class="news-meta">
          <span class="news-source ${getSourceClass(a.source)}">${a.source}</span>
          <span class="news-time">${timeAgo(a.date)}</span>
        </div>
      </div>
    `).join('')}
  </div>`;

  if (totalPages > 1) {
    html += `<div class="news-pagination">`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="news-page-btn${i === newsCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `</div>`;
  }

  el.innerHTML = html;

  // Attach click handlers to page buttons
  el.querySelectorAll('.news-page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      newsCurrentPage = parseInt(btn.dataset.page);
      renderNewsPage();
    });
  });
}

async function loadNews() {
  const el = document.getElementById('news-content');
  const countEl = document.getElementById('news-count');
  const statEl = document.getElementById('stat-news-text');
  try {
    const res = await fetch('/api/news');
    const data = await res.json();

    if (!data.articles || data.articles.length === 0) {
      el.innerHTML = '<div class="error-msg"><span class="error-icon">📜</span>No news available right now.</div>';
      statEl.textContent = 'No news';
      return;
    }

    newsArticles = data.articles;
    newsCurrentPage = 1;

    countEl.textContent = `${newsArticles.length} articles`;
    statEl.textContent = `${newsArticles.length} latest articles`;

    renderNewsPage();
  } catch (err) {
    el.innerHTML = '<div class="error-msg"><span class="error-icon">📰</span>Failed to load news.</div>';
    statEl.textContent = 'Error loading';
  }
}

// === Init ===
loadSteamSales();
loadHardware();
loadReleases();
loadNews();
