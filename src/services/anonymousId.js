const STORAGE_KEY = 'doubt-cloud-anonymous-id';

function randomNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

export function getAnonymousId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `Student#${randomNumber()}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
