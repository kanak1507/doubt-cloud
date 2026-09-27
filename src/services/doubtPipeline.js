/**
 * These are intentionally tiny seams for the hackathon implementation.
 * Replace the TODO bodies with bad-words + relevancy + natural similarity logic.
 */

/** Return true when the doubt should be blocked. */
export function checkProfanity(_text) {
  // TODO: use bad-words here.
  return false;
}

/** Return true when the doubt is relevant to the session topic/keywords. */
export function checkRelevancy(_text, _topic, _keywords) {
  // TODO: implement a lightweight keyword/TF-IDF relevancy check.
  return true;
}

/**
 * Return a matching cluster ID, or null when a new cluster should be created.
 * `existingClusters` is an array of Firestore cluster documents.
 */
export function findMatchingCluster(_text, _existingClusters) {
  // TODO: use natural TF-IDF/cosine similarity here.
  return null;
}

/**
 * Single entry point used by the student submit screen.
 * Keeping the orchestration here makes it easy to replace the three stubs
 * without changing the UI or Firestore code.
 */
export function runDoubtPipeline({ text, topic, keywords, existingClusters }) {
  if (checkProfanity(text)) {
    return { accepted: false, reason: 'Please remove inappropriate language.' };
  }

  if (!checkRelevancy(text, topic, keywords)) {
    return { accepted: false, reason: 'That doubt does not appear related to this session topic.' };
  }

  return {
    accepted: true,
    clusterId: findMatchingCluster(text, existingClusters),
  };
}
