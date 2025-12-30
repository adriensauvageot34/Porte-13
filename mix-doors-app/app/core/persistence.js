const memoryStore = new Map();
const prefix = 'MIX_DOORS::';

export function saveState(doorId, runId, state) {
  const key = `${prefix}${doorId}::${runId}`;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    memoryStore.set(key, JSON.stringify(state));
  }
}

export function loadState(doorId, runId) {
  const key = `${prefix}${doorId}::${runId}`;
  try {
    const value = localStorage.getItem(key);
    if (value) return JSON.parse(value);
  } catch (err) {
    const mem = memoryStore.get(key);
    return mem ? JSON.parse(mem) : null;
  }
  return null;
}
