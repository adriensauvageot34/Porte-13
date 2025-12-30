const defaultState = (doorMeta, runId = 'global') => ({
  schemaVersion: 1,
  doorId: doorMeta?.id || 'unknown',
  runId,
  status: 'ACTIVE',
  toggles: { SIG_OFF: false, CTRL_OFF: false },
  path: { trials: [], commit: null, croix: '', riskFocus: '' },
  targets: { primary: '', secondary: [] },
  core: { constats: '', riskBadge: '' },
  tests: {},
  notes: {},
  journal: { entries: [] }
});

export class Store {
  constructor(doorMeta, runId = 'global') {
    this.state = defaultState(doorMeta, runId);
    this.listeners = new Set();
  }

  hydrate(data) {
    if (!data) return;
    this.state = { ...defaultState({ id: data.doorId || 'unknown' }, data.runId), ...data };
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
    target[keys[0]] = value;
    this.notify();
  }

  updateTest(id, verdict, reason = '') {
    this.state.tests[id] = { verdict, reason };
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
