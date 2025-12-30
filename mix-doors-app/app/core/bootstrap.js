import { Store } from './store.js';
import { loadState, saveState } from './persistence.js';
import { renderLayout } from '../ui/layout.js';
import { mountRunBar } from '../ui/components/runBar.js';
import { enableTooltips } from '../ui/components/tooltips.js';
import { mountCommandPalette } from '../ui/components/commandPalette.js';

async function loadDoorPack(doorId) {
  const base = `./doors/${doorId}/`;
  const [meta, manifest, rules, tests, contentHtml, resourcesHtml] = await Promise.all([
    fetch(`${base}door.meta.json`).then((r) => r.json()),
    fetch(`${base}door.manifest.json`).then((r) => r.json()),
    fetch(`${base}door.rules.json`).then((r) => r.json()),
    fetch(`${base}door.tests.json`).then((r) => r.json()),
    fetch(`${base}door.content.html`).then((r) => r.text()),
    fetch(`${base}door.resources.html`).then((r) => r.text())
  ]);
  return { meta, manifest, rules, tests, contentHtml, resourcesHtml };
}

async function bootstrap() {
  const doorId = 'P13';
  const door = await loadDoorPack(doorId);
  const store = new Store(door.meta);
  const persisted = loadState(door.meta.id, store.state.runId);
  if (persisted) store.hydrate(persisted);

  renderLayout({ meta: door.meta, manifest: door.manifest, contentHtml: door.contentHtml, resourcesHtml: door.resourcesHtml });
  mountRunBar(door.rules, store);
  enableTooltips();
  mountCommandPalette();

  document.querySelectorAll('[data-bind]').forEach((input) => {
    const path = input.getAttribute('data-bind');
    const type = input.type;
    const update = () => {
      const value = store.get(path);
      if (type === 'checkbox') input.checked = Boolean(value);
      else input.value = value || '';
    };
    update();
    input.addEventListener('change', (e) => {
      const val = type === 'checkbox' ? e.target.checked : e.target.value;
      if (path.startsWith('tests.')) {
        const [, testId, field] = path.split('.');
        const current = store.state.tests[testId] || {};
        store.updateTest(testId, field === 'verdict' ? val : current.verdict, field === 'reason' ? val : current.reason);
      } else {
        store.set(path, val);
      }
      saveState(store.state.doorId, store.state.runId, store.state);
    });
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
