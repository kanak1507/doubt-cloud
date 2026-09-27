# Doubt Cloud

A tiny hackathon scaffold for an anonymous, QR-based classroom doubt system. Similar doubts are intended to merge into live clusters so teachers see the class's biggest confusions instead of a flat Q&A feed.

## Stack

- Vite + plain HTML/CSS/JS
- Firebase Firestore real-time listeners
- `qrcode` for client-side QR generation
- `bad-words` and `natural` included for the moderation/relevancy/clustering implementation planned in Bob

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in the Firebase Web App config
npm run dev
```

Open the local URL printed by Vite.

## App flow

1. **Teacher** creates a session with a topic and comma-separated keywords.
2. A random session ID is generated and saved to `sessions/{sessionId}`.
3. A QR code points to `/?session={sessionId}`.
4. **Student** scans the QR, receives a client-only anonymous ID such as `Student#4821`, and submits a doubt.
5. `doubtPipeline.js` runs the filter → relevancy → clustering steps. The three functions are deliberately simple stubs for the team to replace.
6. **Teacher Live View** listens to `sessions/{sessionId}/clusters` with `onSnapshot` and renders bubble sizes from `count`.

## Firestore shape

```text
sessions/{sessionId}
  topic: string
  keywords: string[]
  createdAt: serverTimestamp()
  active: boolean

sessions/{sessionId}/doubts/{doubtId}
  text: string
  clusterId: string
  upvotes: number
  timestamp: serverTimestamp()
  flagged: boolean

sessions/{sessionId}/clusters/{clusterId}
  representativeText: string
  count: number
  doubtIds: string[]
```

## Where to implement the Bob logic

Edit **`src/services/doubtPipeline.js`**:

- `checkProfanity(text)` — plug in `bad-words`.
- `checkRelevancy(text, topic, keywords)` — check the doubt against the session context.
- `findMatchingCluster(text, existingClusters)` — use `natural` TF-IDF/cosine similarity or another lightweight similarity method.

The submit flow in `src/views/student.js` already calls them in that order. If a doubt is rejected, no Firestore doubt/cluster is written.

## Firebase setup

Create a Firebase Web App, enable Firestore, copy its config into `.env.local`, and create a Firestore database. For the fastest hackathon setup, start with Firestore test mode and tighten rules before deployment.

`firestore.rules` contains a deliberately minimal development rule set; review it before production use.

## Routes

There is no router dependency. The app uses the URL query string:

- `/` — landing / role selection
- `/?teacher=create` — teacher session creation
- `/?teacher=view&session=SESSION_ID` — live teacher view
- `/?session=SESSION_ID` — student doubt submission
