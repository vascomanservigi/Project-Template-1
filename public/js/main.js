let siteSettings = {}

async function fetchAPI(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadSettings() {
  try {
    siteSettings = await fetchAPI('/api/settings')
    updateLogo()
    updateMeta()
  } catch (err) {
    console.error('Errore caricamento settings:', err)
  }
}

function updateLogo() {
  const titleEl = document.querySelector('.logo-title')
  const subtitleEl = document.querySelector('.logo-subtitle')
  if (titleEl && siteSettings.site_title) titleEl.textContent = siteSettings.site_title
  if (subtitleEl && siteSettings.site_subtitle) subtitleEl.textContent = siteSettings.site_subtitle
}

function updateMeta() {
  if (siteSettings.site_title) {
    document.title = document.title.replace('CyberGuard', siteSettings.site_title)
  }
}

function createNewsCard(item) {
  return `
    <a href="/news/${item.id}" class="news-item">
      <div class="news-date">${formatDate(item.created_at)}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.excerpt || '')}</p>
      <span class="news-read">Leggi di più →</span>
    </a>
  `
}

function createTeamCard(item) {
  return `
    <div class="team-card">
      <div class="team-avatar">${escapeHtml(item.initials || '??')}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <p class="team-role">${escapeHtml(item.role)}</p>
      <p>${escapeHtml(item.bio || '')}</p>
    </div>
  `
}

function createFeatureCard(item) {
  return `
    <div class="card">
      <div class="card-icon"><i data-lucide="${item.icon || 'check-circle'}"></i></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </div>
  `
}

function createResourceCard(item) {
  const icon = item.category === 'link' ? 'external-link' : item.category === 'video' ? 'play-circle' : 'file-text'
  return `
    <div class="resource-card">
      <div class="resource-icon"><i data-lucide="${icon}"></i></div>
      <div class="resource-content">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description || '')}</p>
        ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank">${item.category === 'link' ? 'Visita il link' : 'Scarica'}</a>` : ''}
      </div>
    </div>
  `
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle')
  const nav = document.getElementById('main-nav')
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'))
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'))
    })
  }
}

function initContactForm() {
  const form = document.getElementById('contact-form')
  if (!form) return

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const btn = form.querySelector('button[type="submit"]')
    const data = {
      name: form.querySelector('#contact-name').value,
      email: form.querySelector('#contact-email').value,
      message: form.querySelector('#contact-message').value
    }

    btn.textContent = 'Invio in corso...'
    btn.disabled = true

    try {
      await fetchAPI('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      btn.textContent = 'Messaggio inviato ✓'
      form.reset()
      setTimeout(() => { btn.textContent = 'Invia messaggio'; btn.disabled = false }, 3000)
    } catch (err) {
      btn.textContent = 'Errore, riprova'
      btn.disabled = false
    }
  })
}

function setActiveNav() {
  const path = window.location.pathname
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href')
    if (href === path || (path === '/' && href === '/') || (path.startsWith(href) && href !== '/')) {
      a.classList.add('active')
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings()
  initMobileNav()
  initContactForm()
  setActiveNav()
  if (typeof lucide !== 'undefined') lucide.createIcons()
})
