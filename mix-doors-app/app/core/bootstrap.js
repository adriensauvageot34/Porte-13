import { Store } from './store.js';
import { loadState, saveState } from './persistence.js';
import { renderLayout } from '../ui/layout.js';
import { mountRunBar } from '../ui/components/runBar.js';
import { enableTooltips } from '../ui/components/tooltips.js';
import { mountCommandPalette } from '../ui/components/commandPalette.js';
import { setupBindings } from './bindings.js';
import { mountPathPicker, mountTargetPicker, mountTestsTable } from '../ui/components/mounts.js';
import { openResource } from '../ui/viewer/drawer.js';

async function loadDoorPack(doorId) {
  const base = `./doors/${doorId}/`;
  const [meta, manifest, rules, tests, paths, targets, contentHtml, resourcesHtml] = await Promise.all([
    fetch(`${base}door.meta.json`).then((r) => r.json()),
    fetch(`${base}door.manifest.json`).then((r) => r.json()),
    fetch(`${base}door.rules.json`).then((r) => r.json()),
    fetch(`${base}door.tests.json`).then((r) => r.json()),
    fetch(`${base}door.paths.json`).then((r) => r.json()),
    fetch(`${base}door.targets.json`).then((r) => r.json()),
    fetch(`${base}door.content.html`).then((r) => r.text()),
    fetch(`${base}door.resources.html`).then((r) => r.text())
  ]);
  return {
    meta,
    manifest,
    rules,
    tests,
    paths: paths.paths || [],
    targets: targets.targets || [],
    contentHtml,
    resourcesHtml
  };
}

function mapResources(resourcesRoot) {
  const map = {};
  resourcesRoot?.querySelectorAll('[data-resource-id]')?.forEach((node) => {
    map[node.dataset.resourceId] = node;
  });
  return map;
}

function attachResourceOpeners(resourcesMap) {
  document.querySelectorAll('[data-open-resource]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-open-resource');
      openResource(resourcesMap[id]);
    });
  });
}

function syncDerivedFields(store, door) {
  const commitId = store.state.path.commit;
  const pathMeta = door.paths.find((p) => p.id === commitId);
  const desiredPathCommit = pathMeta?.label || '';
  const desiredCroix = pathMeta?.croix || '';
  const desiredRisk = pathMeta?.riskFocus || '';

  const defaultPrimary = door.rules?.targets?.primaryDefault || '';
  const primaryTarget = store.state.targets.primary || defaultPrimary;
  const secondary = store.state.targets.secondary || [];
  const secondaryLabel = secondary.length ? secondary.join(', ') : 'Aucun';
  const trialMax = door.rules?.path?.trialMax || null;

  const coreUpdates = {};
  const pathUpdates = {};
  const targetUpdates = {};
  let nextDoorUpdate;

  if (!store.state.targets.primary && primaryTarget) targetUpdates.primary = primaryTarget;

  if (store.state.core.pathCommit !== desiredPathCommit) coreUpdates.pathCommit = desiredPathCommit;
  if (store.state.core.croix !== desiredCroix) coreUpdates.croix = desiredCroix;
  if (store.state.core.riskFocus !== desiredRisk) coreUpdates.riskFocus = desiredRisk;
  if (store.state.core.targetPrimary !== primaryTarget) coreUpdates.targetPrimary = primaryTarget;
  if (store.state.core.targetSecondary !== secondaryLabel) coreUpdates.targetSecondary = secondaryLabel;

  if (store.state.path.croix !== desiredCroix) pathUpdates.croix = desiredCroix;
  if (store.state.path.riskFocus !== desiredRisk) pathUpdates.riskFocus = desiredRisk;

  const uniqueTrials = Array.isArray(store.state.path.trials)
    ? Array.from(new Set(store.state.path.trials))
    : [];
  const limitedTrials = trialMax ? uniqueTrials.slice(0, trialMax) : uniqueTrials;
  if (store.state.path.trials?.length !== limitedTrials.length || uniqueTrials.some((val, idx) => store.state.path.trials[idx] !== val)) {
    pathUpdates.trials = limitedTrials;
  }

  if (store.state.handoff.nextDoor !== door.meta?.next) {
    nextDoorUpdate = door.meta?.next || store.state.handoff.nextDoor;
  }

  if (Object.keys(coreUpdates).length || Object.keys(pathUpdates).length || Object.keys(targetUpdates).length || nextDoorUpdate) {
    store.batch((state) => {
      state.core = { ...state.core, ...coreUpdates };
      state.path = { ...state.path, ...pathUpdates };
      state.targets = { ...state.targets, ...targetUpdates };
      if (nextDoorUpdate) state.handoff.nextDoor = nextDoorUpdate;
    });
  }
}

async function bootstrap() {
  const doorId = 'P13';
  const door = await loadDoorPack(doorId);
  const store = new Store(door.meta);
  const persisted = loadState(door.meta.id, store.state.runId);
  if (persisted) store.hydrate(persisted);

  const { contentRoot, resourcesRoot } = renderLayout({
    meta: door.meta,
    manifest: door.manifest,
    contentHtml: door.contentHtml,
    resourcesHtml: door.resourcesHtml
  });

  mountPathPicker(contentRoot.querySelector('[data-mount="path-picker"]'), door.paths, door.rules?.path);
  mountTargetPicker(contentRoot.querySelector('[data-mount="target-picker"]'), door.targets, door.rules?.targets);
  mountTestsTable(contentRoot.querySelector('[data-mount="tests-table"]'), door.tests);

  setupBindings(store);
  mountRunBar(door.rules, store);
  enableTooltips();
  mountCommandPalette();

  const resourcesMap = mapResources(resourcesRoot);
  attachResourceOpeners(resourcesMap);

  syncDerivedFields(store, door);
  store.subscribe(() => syncDerivedFields(store, door));
}

document.addEventListener('DOMContentLoaded', bootstrap);
