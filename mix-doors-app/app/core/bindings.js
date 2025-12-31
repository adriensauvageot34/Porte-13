import { saveState } from './persistence.js';

function valueFromState(store, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), store.state);
}

function setValue(store, path, newValue) {
  const parts = path.split('.');
  if (parts[0] === 'tests' && parts.length >= 3) {
    const testId = parts[1];
    const field = parts[2];
    const current = store.state.tests[testId] || {};
    const verdict = field === 'verdict' ? newValue : current.verdict || '';
    const reason = field === 'reason' ? newValue : current.reason || '';
    store.updateTest(testId, verdict, reason);
    return;
  }
  store.set(path, newValue);
}

function updateBinding(el, store) {
  const path = el.getAttribute('data-bind');
  const value = valueFromState(store, path);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    if (el.type === 'checkbox') {
      if (el.dataset.value !== undefined) {
        const arr = Array.isArray(value) ? value : [];
        el.checked = arr.includes(el.dataset.value);
      } else {
        el.checked = Boolean(value);
      }
    } else if (el.type === 'radio') {
      el.checked = el.value === value;
    } else {
      el.value = value ?? '';
    }
  } else {
    el.textContent = value ?? '';
  }
}

function handleChange(event, store) {
  const el = event.target;
  const path = el.getAttribute('data-bind');
  if (!path) return;
  const baseValue = valueFromState(store, path);

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    if (el.type === 'checkbox') {
      if (el.dataset.value !== undefined) {
        const val = el.dataset.value;
        const arr = Array.isArray(baseValue) ? [...baseValue] : [];
        if (el.checked && !arr.includes(val)) arr.push(val);
        if (!el.checked) {
          const idx = arr.indexOf(val);
          if (idx >= 0) arr.splice(idx, 1);
        }
        setValue(store, path, arr);
      } else {
        setValue(store, path, el.checked);
      }
      return;
    }
    if (el.type === 'radio') {
      if (!el.checked) return;
      setValue(store, path, el.value);
      return;
    }
    setValue(store, path, el.value);
  }
}

export function setupBindings(store) {
  const bound = Array.from(document.querySelectorAll('[data-bind]'));
  const updateAll = () => bound.forEach((el) => updateBinding(el, store));
  updateAll();
  const onChange = (event) => {
    handleChange(event, store);
    saveState(store.state.doorId, store.state.runId, store.state);
  };
  bound.forEach((el) => el.addEventListener('change', onChange));
  const unsubscribe = store.subscribe(() => {
    updateAll();
    saveState(store.state.doorId, store.state.runId, store.state);
  });
  return () => {
    bound.forEach((el) => el.removeEventListener('change', onChange));
    unsubscribe();
  };
}
