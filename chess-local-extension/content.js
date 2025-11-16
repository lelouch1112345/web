(function () {
  const API_BASE = 'http://localhost:4000/api'
  const RETRY_LIMIT = 3
  const RETRY_DELAY = 1200

  const state = {
    activeTab: 'ping',
    ping: { status: 'idle', data: null, error: null },
    analysis: { status: 'idle', data: null, error: null },
    coach: { status: 'idle', data: null, error: null },
    retries: { ping: 0, analysis: 0 }
  }

  const storage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
    ? chrome.storage.local
    : null

  function persistActiveTab (tab) {
    if (!storage) return
    storage.set({ chessActiveTab: tab })
  }

  function loadActiveTab () {
    if (!storage) return Promise.resolve('ping')
    return new Promise(resolve => {
      storage.get(['chessActiveTab'], ({ chessActiveTab }) => {
        resolve(chessActiveTab || 'ping')
      })
    })
  }

  function fetchWithRetry (endpoint, options = {}, attempt = 1) {
    return fetch(`${API_BASE}${endpoint}`, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        return response.json()
      })
      .catch(error => {
        if (attempt >= RETRY_LIMIT) {
          throw error
        }
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(fetchWithRetry(endpoint, options, attempt + 1))
          }, RETRY_DELAY * attempt)
        })
      })
  }

  function setState (key, updater) {
    state[key] = { ...state[key], ...updater }
    render()
  }

  function setActiveTab (tab) {
    state.activeTab = tab
    persistActiveTab(tab)
    render()
  }

  function handlePing () {
    setState('ping', { status: 'loading', error: null })
    fetchWithRetry('/ping')
      .then(data => setState('ping', { status: 'success', data, error: null }))
      .catch(error => {
        setState('ping', { status: 'error', error: error.message })
        if (state.retries.ping < RETRY_LIMIT) {
          state.retries.ping += 1
          setTimeout(handlePing, RETRY_DELAY)
        }
      })
  }

  function handleAnalysis () {
    setState('analysis', { status: 'loading', error: null })
    fetchWithRetry('/analysis')
      .then(data => setState('analysis', { status: 'success', data, error: null }))
      .catch(error => {
        setState('analysis', { status: 'error', error: error.message })
        if (state.retries.analysis < RETRY_LIMIT) {
          state.retries.analysis += 1
          setTimeout(handleAnalysis, RETRY_DELAY)
        }
      })
  }

  function handleCoachSubmit (event) {
    event.preventDefault()
    const form = event.target
    const payload = {
      question: form.querySelector('[name="question"]').value,
      fen: form.querySelector('[name="fen"]').value,
      pgn: form.querySelector('[name="pgn"]').value
    }

    setState('coach', { status: 'loading', error: null })
    fetchWithRetry('/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(data => setState('coach', { status: 'success', data, error: null }))
      .catch(error => setState('coach', { status: 'error', error: error.message }))
  }

  function render () {
    const root = document.getElementById('chess-dashboard-root')
    if (!root) return

    root.querySelectorAll('[data-tab-panel]').forEach(panel => {
      const tab = panel.getAttribute('data-tab-panel')
      panel.style.display = tab === state.activeTab ? 'block' : 'none'
    })

    root.querySelectorAll('[data-tab-button]').forEach(button => {
      const tab = button.getAttribute('data-tab-button')
      button.classList.toggle('active', tab === state.activeTab)
    })

    renderPing(root)
    renderAnalysis(root)
    renderCoach(root)
  }

  function renderPing (root) {
    const container = root.querySelector('#ping-content')
    if (!container) return
    container.innerHTML = buildStatusBlock(state.ping, data => `
      <div class="stat-grid">
        <div><span class="label">Estado:</span> ${data.status}</div>
        <div><span class="label">Uptime:</span> ${data.uptimeHuman}</div>
        <div><span class="label">Timestamp:</span> ${data.timestamp}</div>
      </div>
    `)
  }

  function renderAnalysis (root) {
    const container = root.querySelector('#analysis-content')
    if (!container) return

    container.innerHTML = buildStatusBlock(state.analysis, data => {
      return `
        <div class="analysis-list">
          ${data.items.map(item => `
            <article class="analysis-card">
              <header>
                <h4>${item.opening}</h4>
                <span class="tag">Eval: ${item.evaluation}</span>
              </header>
              <p class="pgn">${item.pgn}</p>
              <p><strong>Mejor línea:</strong> ${item.bestLine}</p>
              <ul>
                ${item.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </article>
          `).join('')}
        </div>
      `
    })
  }

  function renderCoach (root) {
    const container = root.querySelector('#coach-results')
    if (!container) return

    container.innerHTML = buildStatusBlock(state.coach, data => `
      <div class="coach-answer">
        <pre>${data.insights.answer}</pre>
        <div class="tips">
          ${(data.insights.tips || []).map(tip => `<span>${tip}</span>`).join('')}
        </div>
        <small>${data.insights.followUp}</small>
      </div>
    `)
  }

  function buildStatusBlock (currentState, successRenderer) {
    if (currentState.status === 'loading') {
      return '<p class="status loading">Cargando…</p>'
    }
    if (currentState.status === 'error') {
      return `<p class="status error">${currentState.error}</p>`
    }
    if (currentState.status === 'success' && currentState.data) {
      return successRenderer(currentState.data)
    }
    return '<p class="status muted">Aún no hay datos. Usa el botón de recarga.</p>'
  }

  function mountPanel () {
    if (document.getElementById('chess-dashboard-root')) return

    const wrapper = document.createElement('section')
    wrapper.id = 'chess-dashboard-root'
    wrapper.innerHTML = `
      <div class="chess-dashboard">
        <header class="dashboard-header">
          <h3>Chess Local Dashboard</h3>
          <div class="tab-list">
            <button data-tab-button="ping">Ping</button>
            <button data-tab-button="analysis">Análisis</button>
            <button data-tab-button="coach">Coach</button>
          </div>
          <div class="actions">
            <button id="ping-refresh">Actualizar Ping</button>
            <button id="analysis-refresh">Cargar análisis</button>
          </div>
        </header>
        <section data-tab-panel="ping">
          <div id="ping-content" class="panel"></div>
        </section>
        <section data-tab-panel="analysis">
          <div id="analysis-content" class="panel"></div>
        </section>
        <section data-tab-panel="coach">
          <form id="coach-form" class="panel">
            <label>
              Pregunta
              <textarea name="question" rows="2" required placeholder="¿Qué plan debo seguir?"></textarea>
            </label>
            <label>
              FEN
              <input name="fen" required placeholder="FEN" />
            </label>
            <label>
              PGN
              <textarea name="pgn" rows="2" required placeholder="1. e4 e5"></textarea>
            </label>
            <button type="submit">Enviar al coach</button>
          </form>
          <div id="coach-results" class="panel"></div>
        </section>
      </div>
    `

    document.body.appendChild(wrapper)

    wrapper.querySelectorAll('[data-tab-button]').forEach(button => {
      button.addEventListener('click', () => setActiveTab(button.getAttribute('data-tab-button')))
    })

    wrapper.querySelector('#ping-refresh').addEventListener('click', handlePing)
    wrapper.querySelector('#analysis-refresh').addEventListener('click', handleAnalysis)
    wrapper.querySelector('#coach-form').addEventListener('submit', handleCoachSubmit)

    render()
  }

  loadActiveTab().then(active => {
    state.activeTab = active
    mountPanel()
  })
})()
