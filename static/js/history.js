let modalHTML = '';

document.addEventListener('DOMContentLoaded', renderHistory);

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('docmind_history') || '[]');
  const list    = document.getElementById('history-list');
  const empty   = document.getElementById('empty-state');

  if (history.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const styleIcons = { explainer:'📖', summary:'📋', study:'🎓', presentation:'🎯', technical:'⚙' };
  const cards = history.map(item => {
    const date = new Date(item.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    const icon = styleIcons[item.style] || '📄';
    return `
      <div class="history-card">
        <span class="history-card-icon">${icon}</span>
        <div class="history-card-meta">
          <div class="history-card-title">${escHtml(item.title)}</div>
          <div class="history-card-info">${item.model} · ${item.style} · ${date}</div>
        </div>
        <div class="history-card-actions">
          <button class="btn-sm" onclick="previewItem(${item.id})">Preview</button>
          <button class="btn-sm accent" onclick="downloadItem(${item.id})">↓ Download</button>
          <button class="btn-sm" onclick="deleteItem(${item.id})">✕</button>
        </div>
      </div>`;
  }).join('');

  list.innerHTML = cards;
}

function getItem(id) {
  const history = JSON.parse(localStorage.getItem('docmind_history') || '[]');
  return history.find(h => h.id === id);
}

function previewItem(id) {
  const item = getItem(id);
  if (!item) return;
  modalHTML = item.html;
  document.getElementById('modal-title').textContent = item.title;
  const frame = document.getElementById('modal-frame');
  frame.src   = URL.createObjectURL(new Blob([item.html], { type: 'text/html' }));
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('preview-modal').classList.add('open');
}

function downloadItem(id) {
  const item = getItem(id);
  if (!item) return;
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([item.html], { type: 'text/html' }));
  a.download = item.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.html';
  a.click();
}

function deleteItem(id) {
  let history = JSON.parse(localStorage.getItem('docmind_history') || '[]');
  history     = history.filter(h => h.id !== id);
  localStorage.setItem('docmind_history', JSON.stringify(history));
  renderHistory();
}

function clearHistory() {
  if (!confirm('Clear all history? This cannot be undone.')) return;
  localStorage.removeItem('docmind_history');
  renderHistory();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('preview-modal').classList.remove('open');
  modalHTML = '';
}

function downloadFromModal() {
  if (!modalHTML) return;
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([modalHTML], { type: 'text/html' }));
  a.download = 'docmind-output.html';
  a.click();
}

function openFromModal() {
  if (!modalHTML) return;
  window.open(URL.createObjectURL(new Blob([modalHTML], { type: 'text/html' })), '_blank');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
