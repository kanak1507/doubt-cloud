import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { getSession } from '../services/session.js';

export async function renderTeacherView(sessionId) {
  const app = document.querySelector('#app');
  app.innerHTML = `<main class="page"><section class="card center"><p>Loading doubt cloud…</p></section></main>`;

  try {
    const session = await getSession(sessionId);
    if (!session) throw new Error('Session not found');

    app.innerHTML = `
      <main class="page">
        <header class="topbar">
          <div>
            <div class="brand">DOUBT CLOUD</div>
            <h1>${escapeHtml(session.topic)}</h1>
          </div>
          <a class="button secondary" href="/?teacher=create">New session</a>
        </header>
        <section class="cloud-wrap">
          <div class="live-label"><span class="live-dot"></span> LIVE · ${escapeHtml(session.keywords.join(' · '))}</div>
          <div id="cloud" class="cloud"></div>
        </section>
      </main>
    `;

    const clustersQuery = query(
      collection(db, 'sessions', sessionId, 'clusters'),
      orderBy('count', 'desc'),
    );

    onSnapshot(clustersQuery, (snapshot) => {
      const clusters = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      renderCloud(clusters);
    }, (error) => {
      console.error(error);
      document.querySelector('#cloud').innerHTML = '<p class="error">Could not listen for live updates.</p>';
    });
  } catch (err) {
    console.error(err);
    app.innerHTML = `<main class="page narrow"><section class="card center"><h1>Session unavailable</h1><p class="muted">Check the session link.</p></section></main>`;
  }
}

function renderCloud(clusters) {
  const cloud = document.querySelector('#cloud');
  if (!clusters.length) {
    cloud.innerHTML = `
      <div class="empty-cloud">
        <div class="empty-icon">?</div>
        <h2>Waiting for doubts…</h2>
        <p>Share the student QR code and the cloud will grow here.</p>
      </div>
    `;
    return;
  }

  const max = Math.max(...clusters.map((cluster) => cluster.count || 1));
  cloud.innerHTML = clusters.map((cluster) => {
    const size = 100 + ((cluster.count || 1) / max) * 140;
    return `
      <button class="bubble" style="--size:${size}px" title="${escapeAttr(cluster.representativeText || '')}">
        <span class="bubble-count">${cluster.count || 0}</span>
        <span class="bubble-text">${escapeHtml(cluster.representativeText || 'Untitled doubt')}</span>
      </button>
    `;
  }).join('');

  cloud.querySelectorAll('.bubble').forEach((bubble, index) => {
    bubble.addEventListener('click', () => {
      const cluster = clusters[index];
      alert(`Cluster (${cluster.count} doubts)\n\n${cluster.representativeText}`);
    });
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
