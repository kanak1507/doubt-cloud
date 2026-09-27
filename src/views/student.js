import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { addDoubt, getSession, saveCluster, timestamp } from '../services/session.js';
import { getAnonymousId } from '../services/anonymousId.js';
import { runDoubtPipeline } from '../services/doubtPipeline.js';

export async function renderStudent(sessionId) {
  const app = document.querySelector('#app');
  app.innerHTML = `<main class="page narrow"><section class="card center"><p>Loading session…</p></section></main>`;

  try {
    const session = await getSession(sessionId);
    if (!session || session.active === false) throw new Error('Session not found or inactive');

    const anonymousId = getAnonymousId();
    app.innerHTML = `
      <main class="page narrow">
        <div class="brand">DOUBT CLOUD</div>
        <section class="card">
          <span class="eyebrow">Anonymous doubt</span>
          <h1>${escapeHtml(session.topic)}</h1>
          <p class="muted">You are <strong>${anonymousId}</strong>. Your name is not collected.</p>
          <form id="doubt-form">
            <label>
              What are you confused about?
              <textarea id="doubt-text" required maxlength="500" rows="6" placeholder="Type your question here…"></textarea>
            </label>
            <button class="button primary" type="submit">Send anonymously</button>
          </form>
          <p id="student-status" class="status" aria-live="polite"></p>
        </section>
      </main>
    `;

    document.querySelector('#doubt-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = event.currentTarget.querySelector('button');
      const status = document.querySelector('#student-status');
      const text = document.querySelector('#doubt-text').value.trim();
      if (!text) return;

      button.disabled = true;
      status.textContent = 'Checking your doubt…';

      try {
        const clustersSnapshot = await getDocs(query(
          collection(db, 'sessions', sessionId, 'clusters'),
          orderBy('count', 'desc'),
          limit(100),
        ));
        const existingClusters = clustersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const pipeline = runDoubtPipeline({
          text,
          topic: session.topic,
          keywords: session.keywords,
          existingClusters,
        });

        if (!pipeline.accepted) {
          status.textContent = pipeline.reason;
          button.disabled = false;
          return;
        }

        const clusterId = pipeline.clusterId || crypto.randomUUID();
        const doubtId = await addDoubt(sessionId, {
          text,
          clusterId,
          upvotes: 0,
          timestamp: timestamp(),
          flagged: false,
          anonymousId,
        });

        const existing = existingClusters.find((cluster) => cluster.id === clusterId);
        await saveCluster(sessionId, clusterId, {
          representativeText: existing?.representativeText || text,
          count: (existing?.count || 0) + 1,
          doubtIds: [...(existing?.doubtIds || []), doubtId],
        });

        document.querySelector('#doubt-text').value = '';
        status.textContent = 'Doubt sent anonymously. Thanks!';
      } catch (err) {
        console.error(err);
        status.textContent = 'Could not send the doubt. Please try again.';
      } finally {
        button.disabled = false;
      }
    });
  } catch (err) {
    console.error(err);
    app.innerHTML = `<main class="page narrow"><section class="card center"><h1>Session unavailable</h1><p class="muted">Check the QR code and try again.</p></section></main>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
