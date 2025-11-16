(() => {
  const PANEL_ID = 'chess-local-panel';
  console.log('[ChessLocal] content script cargado', window.location.href);

  if (document.getElementById(PANEL_ID)) {
    return;
  }

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '320px',
    height: '100vh',
    backgroundColor: '#0f172a',
    color: '#e5e7eb',
    zIndex: '999999',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.5)',
    padding: '16px',
    boxSizing: 'border-box',
    overflowY: 'auto'
  });

  panel.innerHTML = `
    <div style="margin-bottom: 12px;">
      <h2 style="margin: 0; font-size: 20px;">Chess Local Trainer</h2>
      <small style="color: #94a3b8;">Conectado al backend local</small>
    </div>
    <div id="chess-local-body" style="flex: 1; white-space: pre-line; font-size: 14px; line-height: 1.4;"></div>
    <button id="chess-local-analysis" style="margin: 12px 0; padding: 8px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Mostrar análisis de ejemplo</button>
    <textarea id="chess-local-question" rows="4" placeholder="Pregunta al coach..." style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #1e293b; background: #1e293b; color: #e5e7eb; margin-bottom: 8px;"></textarea>
    <button id="chess-local-ask" style="padding: 8px; background: #22c55e; color: #0f172a; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Preguntar al coach</button>
    <div id="chess-local-response" style="margin-top: 12px; font-size: 14px; line-height: 1.4;"></div>
  `;

  document.body.appendChild(panel);

  const bodyDiv = panel.querySelector('#chess-local-body');
  const analysisBtn = panel.querySelector('#chess-local-analysis');
  const askBtn = panel.querySelector('#chess-local-ask');
  const questionArea = panel.querySelector('#chess-local-question');
  const responseDiv = panel.querySelector('#chess-local-response');

  const showMessage = (element, message) => {
    if (element) {
      element.textContent = message;
    }
  };

  const appendJSON = (element, data) => {
    if (element) {
      element.textContent = JSON.stringify(data, null, 2);
    }
  };

  const fetchJSON = async (url, options) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  showMessage(bodyDiv, 'Haciendo ping al backend...');
  fetchJSON('http://localhost:3000/ping').then((data) => appendJSON(bodyDiv, data));

  analysisBtn.addEventListener('click', () => {
    showMessage(bodyDiv, 'Cargando análisis...');
    fetchJSON('http://localhost:3000/analysis').then((data) => appendJSON(bodyDiv, data));
  });

  askBtn.addEventListener('click', async () => {
    const question = (questionArea.value || '').trim();
    if (!question) {
      showMessage(responseDiv, 'Escribe una pregunta antes de enviar.');
      return;
    }
    showMessage(responseDiv, 'Enviando pregunta al coach...');
    const data = await fetchJSON('http://localhost:3000/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });
    appendJSON(responseDiv, data);
  });
})();
