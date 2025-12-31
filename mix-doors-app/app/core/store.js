const defaultState = (doorMeta, runId = 'global') => ({
  schemaVersion: 1,
  doorId: doorMeta?.id || 'unknown',
  runId,
  status: 'ACTIVE',
  toggles: { sigOff: false, ctrlOff: false },
  state: { riskBadge: '' },
  path: { trials: [], commit: null, croix: '', riskFocus: '' },
  targets: { primary: 'RETURNS', secondary: [] },
  core: {
    pathCommit: '',
    croix: '',
    riskFocus: '',
    targetPrimary: '',
    targetSecondary: '',
    constats: ''
  },
  handoff: { riskBadge: '', nextDoor: 'P14' },
  notes: { trials: ['', ''], constats: '', oreilleNeuve: '' },
  journalDraft: { date: '', action: '', result: '', needsRetest: '', riskBadge: '' },
  tests: {}
});

function mergeDeep(target, source) {
  if (typeof source !== 'object' || source === null) return target;
  Object.keys(source).forEach((key) => {
    const sourceVal = source[key];
    if (Array.isArray(sourceVal)) {
      target[key] = Array.isArray(sourceVal) ? [...sourceVal] : [];
    } else if (typeof sourceVal === 'object' && sourceVal !== null) {
      target[key] = mergeDeep(target[key] || {}, sourceVal);
    } else {
      target[key] = sourceVal;
    }
  });
  return target;
}

export class Store {
  constructor(doorMeta, runId = 'global') {
    this.state = defaultState(doorMeta, runId);
    this.listeners = new Set();
  }

  hydrate(data) {
    if (!data) return;
    const base = defaultState({ id: data.doorId || 'unknown' }, data.runId);
    this.state = mergeDeep(base, data);
    this.notify();
  }

  get(path) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), this.state);
  }

  set(path, value) {
    const keys = path.split('.');
    let target = this.state;
    while (keys.length > 1) {
      const key = keys.shift();
      target[key] = target[key] || {};
      target = target[key];
    }
    const leaf = keys[0];
    if (target[leaf] === value) return;
    target[leaf] = value;
    this.notify();
  }

  updateTest(id, verdict, reason = '') {
    const prev = this.state.tests[id] || {};
    if (prev.verdict === verdict && prev.reason === reason) return;
    this.state.tests[id] = { verdict, reason };
    this.notify();
  }

  batch(mutator) {
    mutator(this.state);
    this.notify();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }
}

export const createDefaultState = defaultState;
