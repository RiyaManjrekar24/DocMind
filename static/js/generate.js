// ─── State ───────────────────────────────────────────
let currentTab    = 'text';
let selectedFile  = null;
let extractedText = '';
let generatedHTML = '';
let generating    = false;

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadModels();
  applyPrefs();
  setupDrop();
  document.getElementById('file-input').addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });
});

// ─── Load Models ─────────────────────────────────────
async function loadModels() {
  const sel = document.getElementById('model-select');
  try {
    const r    = await fetch('/api/models');
    const data = await r.json();
    if (data.ok && data.models.length > 0) {
      sel.innerHTML = data.models.map(m => `<option value="${m}">${m}</option>`).join('');
      const def = localStorage.getItem('default_model');
      if (def && data.models.includes(def)) sel.value = def;
    } else {
      sel.innerHTML = '<option value="">No models found — run: ollama pull llama3.2</option>';
    }
  } catch {
    sel.innerHTML = '<option value="">Cannot reach server</option>';
  }
}

function applyPrefs() {
  const style = localStorage.getItem('default_style');
  if (style) {
    const sel = document.getElementById('style-select');
    if (sel) sel.value = style;
  }
}

// ─── Tab Switching ────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-text').classList.toggle('active', tab === 'text');
  document.getElementById('tab-file').classList.toggle('active', tab === 'file');
  document.getElementById('tab-text-btn').classList.toggle('active', tab === 'text');
  document.getElementById('tab-file-btn').classList.toggle('active', tab === 'file');
}

// ─── File Handling ────────────────────────────────────
function setupDrop() {
  const zone = document.getElementById('upload-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
}

function handleFile(file) {
  selectedFile  = file;
  extractedText = '';
  const ext  = file.name.split('.').pop().toUpperCase();
  const icons = { PDF:'📄', DOCX:'📝', DOC:'📝', TXT:'📃', MD:'📑', HTML:'🌐', CSV:'📊', JSON:'🗂' };
  const size  = file.size > 1024*1024
    ? (file.size / (1024*1024)).toFixed(1) + ' MB'
    : (file.size / 1024).toFixed(0) + ' KB';

  document.getElementById('upload-zone').style.display = 'none';
  const info = document.getElementById('file-info');
  info.style.display = 'block';
  info.innerHTML = `
    <div class="file-card">
      <span class="file-card-icon">${icons[ext] || '📄'}</span>
      <div class="file-card-meta">
        <div class="file-card-name">${file.name}</div>
        <div class="file-card-size">${size} · ${ext}</div>
      </div>
      <button class="file-card-remove" onclick="removeFile()">✕</button>
    </div>`;
}

function removeFile() {
  selectedFile  = null;
  extractedText = '';
  document.getElementById('upload-zone').style.display = 'block';
  document.getElementById('file-info').style.display   = 'none';
  document.getElementById('file-info').innerHTML       = '';
  document.getElementById('file-input').value          = '';
}

// ─── Generate ─────────────────────────────────────────
async function startGenerate() {
  if (generating) return;
  clearError();

  const model = document.getElementById('model-select').value;
  const style = document.getElementById('style-select').value;

  if (!model) { showError('Please select a model. Make sure Ollama is running.'); return; }

  let content = '';

  if (currentTab === 'text') {
    content = document.getElementById('text-input').value.trim();
    if (!content) { showError('Please paste some text to convert.'); return; }
  } else {
    if (!selectedFile) { showError('Please upload a file first.'); return; }
    setProgress(true, 'Extracting text from file...');
    try {
      content = await uploadAndExtract(selectedFile);
    } catch (e) {
      showError('File extraction failed: ' + e.message);
      setProgress(false);
      return;
    }
    if (!content) { showError('Could not extract text from this file. Try copying the text manually.'); return; }
  }

  generating = true;
  setBusy(true);
  setProgress(true, 'Sending to Ollama...');
  setProgressPct(10);

  generatedHTML = '';
  hideOutput();

  try {
    await streamGenerate(content, model, style);
    if (generatedHTML) {
      showOutput(generatedHTML);
      saveToHistory(generatedHTML, model, style);
    }
    setProgressPct(100);
    setProgressLabel('Done ✓');
    setTimeout(() => setProgress(false), 1500);
  } catch (e) {
    showError('Generation failed: ' + e.message);
    setProgress(false);
  }

  generating = false;
  setBusy(false);
}

async function uploadAndExtract(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r    = await fetch('/api/extract', { method: 'POST', body: fd });
  const data = await r.json();
  if (!data.ok) throw new Error(data.error);
  return data.text;
}

async function streamGenerate(content, model, style) {
  const resp = await fetch('/api/generate', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ content, model, style })
  });

  if (!resp.ok) throw new Error(`Server error: ${resp.status}`);

  const reader  = resp.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';
  let   chars   = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const obj = JSON.parse(line.slice(6));
        if (obj.error) throw new Error(obj.error);
        if (obj.token) {
          generatedHTML += obj.token;
          chars++;
          if (chars % 30 === 0) {
            setProgressLabel(`Generating... ${generatedHTML.length} chars`);
            setProgressPct(Math.min(90, 15 + generatedHTML.length / 80));
          }
        }
        if (obj.done) break;
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e;
      }
    }
  }

  // Extract clean HTML block
  const match = generatedHTML.match(/<!DOCTYPE html[\s\S]*/i)
             || generatedHTML.match(/<html[\s\S]*/i);
  if (match) generatedHTML = match[0];
}

// ─── Output ───────────────────────────────────────────
function showOutput(html) {
  const panel = document.getElementById('output-panel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const iframe = document.getElementById('preview-frame');
  const blob   = new Blob([html], { type: 'text/html' });
  iframe.src   = URL.createObjectURL(blob);
  iframe.onload = () => {
    try {
      const h = iframe.contentDocument.body.scrollHeight;
      iframe.style.height = Math.max(400, h + 40) + 'px';
    } catch {}
  };

  document.getElementById('source-view').textContent = html;
  switchOutput('preview');
}

function hideOutput() {
  document.getElementById('output-panel').style.display = 'none';
}

function switchOutput(mode) {
  document.getElementById('preview-frame').style.display = mode === 'preview' ? 'block' : 'none';
  document.getElementById('source-view').style.display   = mode === 'source'  ? 'block' : 'none';
}

function copyHTML() {
  navigator.clipboard.writeText(generatedHTML).then(() => {
    const btns = document.querySelectorAll('.btn-sm.accent');
    btns.forEach(b => { if (b.textContent.includes('Copy')) { b.textContent = '✓ Copied!'; setTimeout(() => b.textContent = '⎘ Copy', 2000); } });
  });
}

function downloadHTML() {
  const a = document.createElement('a');
  a.href  = URL.createObjectURL(new Blob([generatedHTML], { type: 'text/html' }));
  a.download = 'docmind-output.html';
  a.click();
}

function openTab() {
  window.open(URL.createObjectURL(new Blob([generatedHTML], { type: 'text/html' })), '_blank');
}

// ─── History ──────────────────────────────────────────
function saveToHistory(html, model, style) {
  const key     = 'docmind_history';
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  const title   = extractTitle(html) || 'Untitled Document';
  history.unshift({
    id:    Date.now(),
    title,
    model,
    style,
    html,
    date:  new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

// ─── UI Helpers ───────────────────────────────────────
function setBusy(busy) {
  const btn  = document.getElementById('gen-btn');
  const text = document.getElementById('gen-btn-text');
  btn.disabled = busy;
  text.innerHTML = busy ? '<span class="spinner"></span> Generating...' : '✦ Generate';
}

function setProgress(show, label = '') {
  document.getElementById('progress-wrap').style.display = show ? 'block' : 'none';
  if (label) setProgressLabel(label);
  if (!show) setProgressPct(0);
}

function setProgressPct(pct) {
  document.getElementById('progress-fill').style.width = pct + '%';
}

function setProgressLabel(msg) {
  document.getElementById('progress-label').textContent = msg;
}

function showError(msg) {
  const el = document.getElementById('error-banner');
  el.innerHTML = '⚠ ' + msg;
  el.style.display = 'block';
}

function clearError() {
  document.getElementById('error-banner').style.display = 'none';
}
