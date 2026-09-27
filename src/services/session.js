import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export function makeSessionId() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 10);
}

export async function createSession({ topic, keywords }) {
  const sessionId = makeSessionId();

  await setDoc(doc(db, 'sessions', sessionId), {
    topic,
    keywords,
    createdAt: serverTimestamp(),
    active: true,
  });

  return sessionId;
}

export async function getSession(sessionId) {
  const snapshot = await getDoc(doc(db, 'sessions', sessionId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function addDoubt(sessionId, data) {
  const doubtsRef = collection(db, 'sessions', sessionId, 'doubts');
  const result = await addDoc(doubtsRef, data);
  return result.id;
}

export async function saveCluster(sessionId, clusterId, cluster) {
  await setDoc(doc(db, 'sessions', sessionId, 'clusters', clusterId), cluster, { merge: true });
}

export function timestamp() {
  return serverTimestamp();
}
