async function get(url) {
  const res = await fetch(url)
  return res.json()
}

function esc(text) {
  const d = document.createElement('div')
  d.textContent = text
  return d.innerHTML
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function init() {
  const [features, news] = await Promise.all([
    get('/api/features'),
    get('/api/news')
  ])

  document.getElementById('features-grid').innerHTML = features.map(f => `
    <div class="feature-card">
      <div class="feature-icon">${f.icon || '⚡'}</div>
      <div class="feature-content">
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.description)}</p>
      </div>
    </div>
  `).join('')

  document.getElementById('news-grid').innerHTML = news.length === 0 
    ? '<p style="color:var(--fg-muted)">Nessuna news.</p>'
    : news.map(n => `
      <a href="/news/${n.id}" class="news-card">
        <div class="news-date">${formatDate(n.created_at)}</div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.excerpt || '')}</p>
        <span class="news-link">Leggi →</span>
      </a>
    `).join('')
}

document.addEventListener('DOMContentLoaded', init)
