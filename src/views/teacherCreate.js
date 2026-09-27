import QRCode from 'qrcode';
import { createSession } from '../services/session.js';

export function renderTeacherCreate() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <main class="page narrow">
      <a class="back" href="/">← Home</a>
      <div class="brand">DOUBT CLOUD</div>
      <section class="card">
        <span class="eyebrow">Teacher</span>
        <h1>Create a session</h1>
        <form id="create-form">
          <label>
            Topic
            <input id="topic" required maxlength="120" placeholder="e.g. Normalization in DBMS" />
          </label>
          <label>
            Keywords <span class="muted">(comma separated)</span>
            <input id="keywords" required placeholder="1NF, 2NF, functional dependency" />
          </label>
          <button class="button primary" type="submit">Create QR session</button>
        </form>
        <p id="create-error" class="error" role="alert"></p>
      </section>
      <section id="qr-result" class="card hidden"></section>
    </main>
  `;

  document.querySelector('#create-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    const error = document.querySelector('#create-error');
    button.disabled = true;
    error.textContent = '';

    try {
      const topic = document.querySelector('#topic').value.trim();
      const keywords = document.querySelector('#keywords').value
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean);
      const sessionId = await createSession({ topic, keywords });
      const studentUrl = `${window.location.origin}/?session=${encodeURIComponent(sessionId)}`;
      const qrDataUrl = await QRCode.toDataURL(studentUrl, { width: 280, margin: 2 });

      document.querySelector('#qr-result').classList.remove('hidden');
      document.querySelector('#qr-result').innerHTML = `
        <div class="result-head">
          <div>
            <span class="eyebrow">Session ready</span>
            <h2>${escapeHtml(topic)}</h2>
            <p class="muted">Ask students to scan this QR code.</p>
          </div>
          <img class="qr" src="${qrDataUrl}" alt="QR code for student doubts" />
        </div>
        <div class="session-link">${escapeHtml(studentUrl)}</div>
        <a class="button primary full" href="/?teacher=view&session=${encodeURIComponent(sessionId)}">Open live doubt cloud</a>
      `;
    } catch (err) {
      console.error(err);
      error.textContent = 'Could not create the session. Check your Firebase config.';
      button.disabled = false;
    }
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
