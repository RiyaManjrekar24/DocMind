// ─── Ollama Status Check ─────────────────────────────
async function checkOllamaStatus() {
  const dot   = document.getElementById('ollama-dot');
  const label = document.getElementById('ollama-label');
  if (!dot) return;

  const url = localStorage.getItem('ollama_url') || 'http://localhost:11434';
  try {
    const r = await fetch('/api/models', { signal: AbortSignal.timeout(5000) });
    const data = await r.json();
    if (data.ok) {
      dot.className = 'status-dot online';
      label.textContent = `${data.models.length} model${data.models.length !== 1 ? 's' : ''}`;
    } else {
      dot.className = 'status-dot offline';
      label.textContent = 'Ollama offline';
    }
  } catch {
    dot.className = 'status-dot offline';
    label.textContent = 'Ollama offline';
  }
}

// ─── Mobile Nav ──────────────────────────────────────
function toggleMobileNav() {
  const nav     = document.getElementById('mobile-nav');
  const overlay = document.getElementById('mobile-overlay');
  if (!nav) return;
  nav.classList.toggle('open');
  overlay.classList.toggle('open');
}

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkOllamaStatus();
});
