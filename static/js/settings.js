document.addEventListener('DOMContentLoaded', () => {
  loadSavedPrefs();
  testConnection();
});

function loadSavedPrefs() {
  const url   = localStorage.getItem('ollama_url')     || 'http://localhost:11434';
  const model = localStorage.getItem('default_model')  || '';
  const style = localStorage.getItem('default_style')  || 'explainer';

  const urlInput = document.getElementById('ollama-url-input');
  const styleSel = document.getElementById('default-style');
  if (urlInput) urlInput.value = url;
  if (styleSel) styleSel.value = style;
}

async function testConnection() {
  const dot    = document.getElementById('settings-dot');
  const status = document.getElementById('settings-status');
  const mList  = document.getElementById('models-list');
  const defSel = document.getElementById('default-model');

  if (!dot) return;

  dot.className   = 'status-dot';
  status.textContent = 'Checking...';
  if (mList) mList.innerHTML = '<p class="muted">Loading...</p>';

  try {
    const r    = await fetch('/api/models', { signal: AbortSignal.timeout(6000) });
    const data = await r.json();

    if (data.ok) {
      dot.className      = 'status-dot online';
      status.textContent = `Connected · ${data.models.length} model${data.models.length !== 1 ? 's' : ''}`;

      if (mList) {
        if (data.models.length === 0) {
          mList.innerHTML = '<p class="muted">No models installed. Run: <code>ollama pull llama3.2</code></p>';
        } else {
          mList.innerHTML = data.models.map(m =>
            `<div class="model-item"><div class="model-item-dot"></div>${m}</div>`
          ).join('');
        }
      }

      if (defSel) {
        const saved = localStorage.getItem('default_model') || '';
        defSel.innerHTML = '<option value="">Auto (first available)</option>'
          + data.models.map(m => `<option value="${m}" ${m===saved?'selected':''}>${m}</option>`).join('');
      }
    } else {
      dot.className      = 'status-dot offline';
      status.textContent = 'Offline — ' + data.error;
      if (mList) mList.innerHTML = '<p class="muted" style="color:var(--danger)">Cannot reach Ollama.</p>';
    }
  } catch (e) {
    dot.className      = 'status-dot offline';
    status.textContent = 'Connection failed';
    if (mList) mList.innerHTML = '<p class="muted" style="color:var(--danger)">Make sure Ollama is running.</p>';
  }
}

function savePrefs() {
  const model = document.getElementById('default-model').value;
  const style = document.getElementById('default-style').value;
  const url   = document.getElementById('ollama-url-input').value.trim();

  if (model) localStorage.setItem('default_model', model);
  else       localStorage.removeItem('default_model');

  localStorage.setItem('default_style', style);
  localStorage.setItem('ollama_url', url);

  const msg = document.getElementById('save-msg');
  msg.textContent = '✓ Preferences saved!';
  setTimeout(() => msg.textContent = '', 3000);
}
